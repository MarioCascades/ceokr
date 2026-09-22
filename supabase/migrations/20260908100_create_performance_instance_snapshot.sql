-- ============================================================
-- Migration 2
-- Runtime-owned Performance Instance definition snapshot
--
-- Builder remains the reusable definition source.
-- Runtime receives a snapshot when a Performance Instance
-- is created so historical execution can be edited independently
-- of future Builder revisions.
--
-- Reporting Period remains temporarily for migration
-- compatibility and is NOT used as a product concept here.
-- ============================================================


-- ============================================================
-- 1. Performance Instance Objectives
-- ============================================================

create table if not exists public.performance_instance_objectives (
  id uuid primary key default gen_random_uuid(),

  performance_instance_id uuid not null
    references public.performance_instances(id)
    on delete cascade,

  source_objective_id text not null,

  title text not null,

  description text,

  weight numeric,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint performance_instance_objectives_unique_source
    unique (
      performance_instance_id,
      source_objective_id
    )
);


create index if not exists idx_instance_objectives_instance
  on public.performance_instance_objectives (
    performance_instance_id
  );


-- ============================================================
-- 2. Performance Instance Key Results
-- ============================================================

create table if not exists public.performance_instance_key_results (
  id uuid primary key default gen_random_uuid(),

  performance_instance_id uuid not null
    references public.performance_instances(id)
    on delete cascade,

  performance_instance_objective_id uuid not null
    references public.performance_instance_objectives(id)
    on delete cascade,

  source_key_result_id text not null,

  title text not null,

  target jsonb,

  weight numeric,

  measurement_type text,

  scoring_method text,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint performance_instance_key_results_unique_source
    unique (
      performance_instance_id,
      source_key_result_id
    ),

  constraint performance_instance_key_results_measurement_type
    check (
      measurement_type is null
      or measurement_type in (
        'percentage',
        'numeric',
        'financial'
      )
    ),

  constraint performance_instance_key_results_scoring_method
    check (
      scoring_method is null
      or scoring_method in (
        'percent_into_period',
        'percentage_of_target'
      )
    )
);


create index if not exists idx_instance_key_results_instance
  on public.performance_instance_key_results (
    performance_instance_id
  );


create index if not exists idx_instance_key_results_objective
  on public.performance_instance_key_results (
    performance_instance_objective_id
  );


-- ============================================================
-- 3. Performance Instance Initiatives
-- ============================================================

create table if not exists public.performance_instance_initiatives (
  id uuid primary key default gen_random_uuid(),

  performance_instance_key_result_id uuid not null
    references public.performance_instance_key_results(id)
    on delete cascade,

  source_initiative_id text not null,

  text text not null,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint performance_instance_initiatives_unique_source
    unique (
      performance_instance_key_result_id,
      source_initiative_id
    )
);


create index if not exists idx_instance_initiatives_key_result
  on public.performance_instance_initiatives (
    performance_instance_key_result_id
  );


-- ============================================================
-- 4. Connect existing Key Result Progress to the
--    Runtime-owned Key Result snapshot.
--
-- Keep the legacy objective_id / key_result_id columns
-- temporarily. They will be removed only after the new
-- relationship has been verified.
-- ============================================================

alter table public.key_result_progress
  add column if not exists performance_instance_key_result_id uuid;


alter table public.key_result_progress
  drop constraint if exists key_result_progress_instance_key_result_fkey;


alter table public.key_result_progress
  add constraint key_result_progress_instance_key_result_fkey
  foreign key (
    performance_instance_key_result_id
  )
  references public.performance_instance_key_results(id)
  on delete cascade;


create index if not exists idx_key_result_progress_instance_key_result
  on public.key_result_progress (
    performance_instance_key_result_id
  );


-- ============================================================
-- 5. Backfill Runtime Objectives
--
-- Snapshot the definition currently stored in each
-- Performance Instance's exact Performance Sheet document.
-- ============================================================

insert into public.performance_instance_objectives (
  performance_instance_id,
  source_objective_id,
  title,
  description,
  weight,
  position
)
select
  pi.id,
  objective->>'id',
  coalesce(objective->>'title', ''),
  nullif(objective->>'description', ''),
  case
    when nullif(objective->>'weight', '') is null
      then null
    else (objective->>'weight')::numeric
  end,
  objective_position
from public.performance_instances pi
join public.performance_sheets ps
  on ps.id = pi.performance_sheet_id
cross join lateral jsonb_array_elements(
  coalesce(ps.document->'objectives', '[]'::jsonb)
) with ordinality as objectives(objective, objective_position)
on conflict (
  performance_instance_id,
  source_objective_id
)
do nothing;


-- ============================================================
-- 6. Backfill Runtime Key Results
-- ============================================================

insert into public.performance_instance_key_results (
  performance_instance_id,
  performance_instance_objective_id,
  source_key_result_id,
  title,
  target,
  weight,
  measurement_type,
  scoring_method,
  position
)
select
  pi.id,

  pio.id,

  key_result->>'id',

  coalesce(key_result->>'title', ''),

  key_result->'target',

  case
    when nullif(key_result->>'weight', '') is null
      then null
    else (key_result->>'weight')::numeric
  end,

  nullif(key_result->>'measurementType', ''),

  nullif(key_result->>'scoringMethod', ''),

  key_result_position

from public.performance_instances pi

join public.performance_sheets ps
  on ps.id = pi.performance_sheet_id

cross join lateral jsonb_array_elements(
  coalesce(ps.document->'objectives', '[]'::jsonb)
) as objectives(objective)

cross join lateral jsonb_array_elements(
  coalesce(objectives.objective->'keyResults', '[]'::jsonb)
) with ordinality as key_results(key_result, key_result_position)

join public.performance_instance_objectives pio
  on pio.performance_instance_id = pi.id
 and pio.source_objective_id =
      objectives.objective->>'id'

on conflict (
  performance_instance_id,
  source_key_result_id
)
do nothing;


-- ============================================================
-- 7. Backfill Runtime Initiatives
-- ============================================================

insert into public.performance_instance_initiatives (
  performance_instance_key_result_id,
  source_initiative_id,
  text,
  position
)
select
  pikr.id,

  initiative->>'id',

  coalesce(initiative->>'text', ''),

  initiative_position

from public.performance_instances pi

join public.performance_sheets ps
  on ps.id = pi.performance_sheet_id

cross join lateral jsonb_array_elements(
  coalesce(ps.document->'objectives', '[]'::jsonb)
) as objectives(objective)

cross join lateral jsonb_array_elements(
  coalesce(objectives.objective->'keyResults', '[]'::jsonb)
) as key_results(key_result)

cross join lateral jsonb_array_elements(
  coalesce(key_results.key_result->'initiatives', '[]'::jsonb)
) with ordinality as initiatives(
  initiative,
  initiative_position
)

join public.performance_instance_key_results pikr
  on pikr.performance_instance_id = pi.id
 and pikr.source_key_result_id =
      key_results.key_result->>'id'

on conflict (
  performance_instance_key_result_id,
  source_initiative_id
)
do nothing;


-- ============================================================
-- 8. Connect existing Key Result Progress records
--    to their Runtime-owned Key Results.
-- ============================================================

update public.key_result_progress krp
set performance_instance_key_result_id = pikr.id
from public.performance_instance_key_results pikr
where pikr.performance_instance_id =
        krp.performance_instance_id
  and pikr.source_key_result_id =
        krp.key_result_id
  and krp.performance_instance_key_result_id is null;