/*
============================================================
CascadEffects Performance Platform
Member OKR Domain Foundation
------------------------------------------------------------
Milestone 29

Member OKRs are the authoritative source of employee-specific
performance data.

Organization membership determines participation.

Performance Builder remains a presentation/composition layer.

Existing performance_instance_* tables remain Runtime-owned
historical snapshots and are NOT removed by this migration.

Assignments are NOT removed by this migration. Their removal
is a later migration after Runtime has been migrated.

This migration intentionally creates the persistent Member OKR
domain only. Application/runtime migration is a separate step.
============================================================
*/

begin;


/* ============================================================
   1. Member Objectives
------------------------------------------------------------
An Objective belongs to one organization membership.

organization_memberships already enforces:

  user_id + organization_id = unique membership

Therefore membership_id is the authoritative member/org
relationship for Member OKRs.
============================================================ */

create table if not exists public.member_objectives (
  id uuid primary key default gen_random_uuid(),

  organization_membership_id uuid not null
    references public.organization_memberships(id)
    on delete restrict,

  title text not null,

  description text,

  weight numeric,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint member_objectives_weight_check
    check (
      weight is null
      or weight >= 0
    )
);

create index if not exists idx_member_objectives_membership
  on public.member_objectives (
    organization_membership_id
  );

create index if not exists idx_member_objectives_membership_position
  on public.member_objectives (
    organization_membership_id,
    position
  );


/* ============================================================
   2. Member Key Results
------------------------------------------------------------
A Key Result belongs to exactly one Member Objective.

current_value is the member's current performance value.

The historical KPI/update model remains separate and can be
introduced/connected during the Runtime migration.
============================================================ */

create table if not exists public.member_key_results (
  id uuid primary key default gen_random_uuid(),

  member_objective_id uuid not null
    references public.member_objectives(id)
    on delete cascade,

  title text not null,

  target jsonb,

  current_value jsonb,

  weight numeric,

  measurement_type text,

  scoring_method text,

  status text not null default 'active',

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint member_key_results_weight_check
    check (
      weight is null
      or weight >= 0
    ),

  constraint member_key_results_measurement_type
    check (
      measurement_type is null
      or measurement_type in (
        'percentage',
        'numeric',
        'financial'
      )
    ),

  constraint member_key_results_scoring_method
    check (
      scoring_method is null
      or scoring_method in (
        'percent_into_period',
        'percentage_of_target'
      )
    ),

  constraint member_key_results_status_check
    check (
      status in (
        'active',
        'completed',
        'cancelled'
      )
    )
);

create index if not exists idx_member_key_results_objective
  on public.member_key_results (
    member_objective_id
  );

create index if not exists idx_member_key_results_objective_position
  on public.member_key_results (
    member_objective_id,
    position
  );


/* ============================================================
   3. Member Initiatives
------------------------------------------------------------
An Initiative belongs to exactly one Member Key Result.
============================================================ */

create table if not exists public.member_initiatives (
  id uuid primary key default gen_random_uuid(),

  member_key_result_id uuid not null
    references public.member_key_results(id)
    on delete cascade,

  text text not null,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index if not exists idx_member_initiatives_key_result
  on public.member_initiatives (
    member_key_result_id
  );

create index if not exists idx_member_initiatives_key_result_position
  on public.member_initiatives (
    member_key_result_id,
    position
  );


/* ============================================================
   4. Documentation
------------------------------------------------------------

Source of truth:

organization_memberships
        ↓
member_objectives
        ↓
member_key_results
        ↓
member_initiatives

Runtime snapshot:

member OKRs
        ↓
performance_instances
        ↓
performance_instance_objectives
performance_instance_key_results
performance_instance_initiatives

The Runtime snapshot layer remains independent so historical
execution can preserve the state used for a particular month.

No Assignment relationship is introduced here.
No Builder relationship is introduced here.
============================================================ */

commit;
