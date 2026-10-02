-- ==========================================================
-- CascadEffects Performance Platform
-- Global OKR Template Library
-- Migration: 20261001
--
-- Final model:
--   objective_templates
--   key_result_templates
--   key_result_template_initiatives
--
-- Objective Templates and Key Result Templates are independent
-- global reusable records.
--
-- Applying a template to a Member OKR is a COPY operation.
-- Template deletion must never delete Member OKR records.
--
-- Existing template records are migrated where possible before
-- the legacy template-library tables are removed.
--
-- This migration does NOT modify:
--   organization_memberships
--   member_objectives
--   member_key_results
--   member_initiatives
--   Builder
--   Runtime
--   Assignment
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- 1. Global Objective Templates
-- ----------------------------------------------------------

create table if not exists public.objective_templates (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  weight numeric,

  position integer not null default 0,

  created_by uuid references public.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint objective_templates_title_not_blank
    check (length(trim(title)) > 0),

  constraint objective_templates_weight_valid
    check (weight is null or (weight >= 0 and weight <= 100)),

  constraint objective_templates_position_valid
    check (position >= 0)
);

create index if not exists idx_objective_templates_position
  on public.objective_templates(position);

create index if not exists idx_objective_templates_created_at
  on public.objective_templates(created_at);


-- ----------------------------------------------------------
-- 2. Global Key Result Templates
-- ----------------------------------------------------------

create table if not exists public.key_result_templates (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  target jsonb,

  weight numeric,

  measurement_type text,

  scoring_method text,

  status text not null default 'active',

  created_by uuid references public.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint key_result_templates_title_not_blank
    check (length(trim(title)) > 0),

  constraint key_result_templates_weight_valid
    check (weight is null or (weight >= 0 and weight <= 100)),

  constraint key_result_templates_measurement_type_valid
    check (
      measurement_type is null
      or measurement_type in (
        'percentage',
        'numeric',
        'financial'
      )
    ),

  constraint key_result_templates_scoring_method_valid
    check (
      scoring_method is null
      or scoring_method in (
        'percent_into_period',
        'percentage_of_target',
        'display_only'
      )
    ),

  constraint key_result_templates_status_valid
    check (
      status in (
        'active',
        'completed',
        'cancelled'
      )
    )
);

create index if not exists idx_key_result_templates_status
  on public.key_result_templates(status);

create index if not exists idx_key_result_templates_created_at
  on public.key_result_templates(created_at);


-- ----------------------------------------------------------
-- 3. Key Result Template Initiatives
-- ----------------------------------------------------------

create table if not exists public.key_result_template_initiatives (
  id uuid primary key default gen_random_uuid(),

  key_result_template_id uuid not null
    references public.key_result_templates(id)
    on delete cascade,

  text text not null,

  position integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint key_result_template_initiatives_text_not_blank
    check (length(trim(text)) > 0),

  constraint key_result_template_initiatives_position_valid
    check (position >= 0)
);

create index if not exists idx_key_result_template_initiatives_kr
  on public.key_result_template_initiatives(key_result_template_id);

create index if not exists idx_key_result_template_initiatives_position
  on public.key_result_template_initiatives(
    key_result_template_id,
    position
  );


-- ----------------------------------------------------------
-- 4. Migrate existing Objective Template records
--
-- The old Objective Template ID is retained so any existing
-- references can be reconciled without generating a new ID.
--
-- Organization ownership/scope is intentionally discarded
-- because the finalized model is global-only.
-- ----------------------------------------------------------

insert into public.objective_templates (
  id,
  title,
  description,
  weight,
  position,
  created_at,
  updated_at
)
select
  id,
  title,
  description,
  weight,
  position,
  created_at,
  updated_at
from public.okr_template_objectives
on conflict (id) do nothing;


-- ----------------------------------------------------------
-- 5. Migrate existing Key Result Template records
--
-- The old Key Result Template ID is retained.
--
-- The obsolete Objective relationship and template ownership
-- are intentionally not migrated because Key Result Templates
-- are now independent reusable records.
-- ----------------------------------------------------------

insert into public.key_result_templates (
  id,
  title,
  target,
  weight,
  measurement_type,
  scoring_method,
  status,
  created_at,
  updated_at
)
select
  id,
  title,
  target,
  weight,
  measurement_type,
  scoring_method,
  status,
  created_at,
  updated_at
from public.okr_template_key_results
on conflict (id) do nothing;


-- ----------------------------------------------------------
-- 6. Migrate existing Key Result Template Initiatives
--
-- Existing Key Result IDs are retained above, so initiative
-- ownership can be migrated directly.
-- ----------------------------------------------------------

insert into public.key_result_template_initiatives (
  id,
  key_result_template_id,
  text,
  position,
  created_at,
  updated_at
)
select
  id,
  okr_template_key_result_id,
  text,
  position,
  created_at,
  updated_at
from public.okr_template_initiatives
on conflict (id) do nothing;


-- ----------------------------------------------------------
-- 7. Remove the obsolete Objective -> Key Result association
-- ----------------------------------------------------------
--
-- This table is intentionally not recreated.
--
-- Objective Templates and Key Result Templates are completely
-- independent reusable records.
--
-- Actual Objective -> Key Result relationships are created
-- only inside Member OKRs when templates are applied.
-- ----------------------------------------------------------

drop table if exists public.okr_template_objective_key_results cascade;


-- ----------------------------------------------------------
-- 8. Remove the obsolete template-library tables
--
-- These tables are no longer part of the final architecture.
--
-- CASCADE is intentionally limited to these legacy template
-- tables. It does not touch Member OKR tables.
-- ----------------------------------------------------------

drop table if exists public.okr_template_initiatives cascade;
drop table if exists public.okr_template_key_results cascade;
drop table if exists public.okr_template_objectives cascade;
drop table if exists public.okr_templates cascade;


-- ----------------------------------------------------------
-- 9. UUID primary keys require no sequence synchronization.
-- ----------------------------------------------------------

commit;