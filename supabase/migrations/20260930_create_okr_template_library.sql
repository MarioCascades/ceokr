/*
============================================================
CascadEffects Performance Platform
Restructure OKR Template Library
------------------------------------------------------------
Milestone: OKR Template Library

Purpose:
- keep Objective Templates reusable
- make Key Result Templates independently reusable
- allow one Key Result Template to be associated with
  multiple Objective Templates
- move Key Result ordering to the Objective/KR association
- preserve existing template data where possible
- preserve Global / Organization template scope
- preserve Initiative -> Key Result ownership

New conceptual relationship:

okr_templates
    |
    +-- okr_template_objectives
    |         |
    |         +-- okr_template_objective_key_results
    |                    |
    |                    +-- okr_template_key_results
    |                               |
    |                               +-- okr_template_initiatives
    |
    +-- okr_template_key_results

Important:
- A Key Result Template is NOT owned by one Objective Template.
- Objective/KR is a many-to-many relationship.
- Initiatives remain owned by a Key Result Template.
- Position belongs to the Objective/KR association.
- This migration does not modify Member OKRs.
- This migration does not modify Runtime, Builder, or Assignment.
- RLS is intentionally not introduced here.

This migration follows the existing:
20260930_create_okr_template_library.sql
============================================================
*/

begin;


/* ============================================================
   1. Create Objective / Key Result Association Table
------------------------------------------------------------
The association is now the place where an Objective Template
uses a Key Result Template.

A Key Result Template may therefore be reused by multiple
Objective Templates.

Position belongs to the association because the same KR may
appear in different positions under different Objectives.
============================================================ */

create table if not exists public.okr_template_objective_key_results (
  id uuid primary key default gen_random_uuid(),

  okr_template_objective_id uuid not null
    references public.okr_template_objectives(id)
    on delete cascade,

  okr_template_key_result_id uuid not null
    references public.okr_template_key_results(id)
    on delete cascade,

  position integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint okr_template_objective_key_results_position_check
    check (
      position >= 0
    ),

  constraint okr_template_objective_key_results_unique
    unique (
      okr_template_objective_id,
      okr_template_key_result_id
    )
);


/* ============================================================
   2. Index Association Lookups
============================================================ */

create index if not exists
  idx_okr_template_objective_key_results_objective_id
on public.okr_template_objective_key_results (
  okr_template_objective_id
);


create index if not exists
  idx_okr_template_objective_key_results_key_result_id
on public.okr_template_objective_key_results (
  okr_template_key_result_id
);


/* ============================================================
   3. Preserve Existing Objective -> Key Result Relationships
------------------------------------------------------------
The original schema required every template KR to belong to
one Objective.

Before removing that ownership relationship, copy the existing
relationships into the new association table.

Existing KR position becomes the initial association position.
============================================================ */

insert into public.okr_template_objective_key_results (
  okr_template_objective_id,
  okr_template_key_result_id,
  position
)
select
  kr.okr_template_objective_id,
  kr.id,
  kr.position
from public.okr_template_key_results kr
where kr.okr_template_objective_id is not null
on conflict (
  okr_template_objective_id,
  okr_template_key_result_id
)
do nothing;


/* ============================================================
   4. Remove the Old KR -> Objective Ownership Relationship
------------------------------------------------------------
The Key Result Template is now independent.

The relationship is represented only by:
okr_template_objective_key_results

The original migration explicitly named the FK:
okr_template_key_results_objective_fkey
============================================================ */

alter table public.okr_template_key_results
  drop constraint if exists
    okr_template_key_results_objective_fkey;


drop index if exists
  idx_okr_template_key_results_objective;


drop index if exists
  idx_okr_template_key_results_objective_position;


alter table public.okr_template_key_results
  drop column if exists okr_template_objective_id;


alter table public.okr_template_key_results
  drop column if exists position;


/* ============================================================
   5. Explicit Index for Independent Key Result Templates
============================================================ */

create index if not exists
  idx_okr_template_key_results_status
on public.okr_template_key_results (
  status
);


/* ============================================================
   6. Domain Documentation Guardrail
------------------------------------------------------------

New Template Library model:

OKR Template
|
+-- Objective Templates
|       |
|       +-- Objective/KR Associations
|                  |
|                  +-- Key Result Templates
|
+-- Key Result Templates
|       |
|       +-- Initiatives
|
The same Key Result Template may be associated with multiple
Objective Templates.

Member OKR model remains:

organization_memberships
        |
        +-- member_objectives
                |
                +-- member_key_results
                        |
                        +-- member_initiatives

No Member OKR ownership is introduced here.
No Runtime dependency is introduced.
No Assignment dependency is introduced.

This migration does not change:
- okr_templates
- okr_template_objectives
- okr_template_initiatives
- Member OKR tables
- Performance Builder
- Runtime
- Assignments
============================================================ */

commit;
