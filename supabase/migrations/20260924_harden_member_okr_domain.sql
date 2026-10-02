/*
============================================================
CascadEffects Performance Platform
Harden Member OKR Domain
------------------------------------------------------------
Milestone 29

This migration follows:
20260924_create_member_okr_domain.sql

Purpose:
- strengthen Member OKR database integrity
- keep Organization Membership as the authoritative
  organization/member relationship
- prevent invalid negative positions/weights
- preserve the separation between persistent Member OKRs
  and Runtime snapshots
- introduce no Assignment dependency
- introduce no Builder dependency

This migration does NOT:
- migrate Runtime
- modify Performance Instances
- remove Assignments
- introduce RLS
- create a second Member identity
============================================================
*/

begin;


/* ============================================================
   1. Objective Position Integrity
============================================================ */

alter table public.member_objectives
  drop constraint if exists member_objectives_position_check;

alter table public.member_objectives
  add constraint member_objectives_position_check
  check (position >= 0);


/* ============================================================
   2. Objective Weight Integrity
------------------------------------------------------------
0 is intentionally valid.

0% means the item can be display-only and must not contribute
to weighted scoring. Scoring behavior remains an application/
calculation concern and is not implemented in this migration.
============================================================ */

alter table public.member_objectives
  drop constraint if exists member_objectives_weight_range_check;

alter table public.member_objectives
  add constraint member_objectives_weight_range_check
  check (
    weight is null
    or (
      weight >= 0
      and weight <= 100
    )
  );


/* ============================================================
   3. Key Result Position Integrity
============================================================ */

alter table public.member_key_results
  drop constraint if exists member_key_results_position_check;

alter table public.member_key_results
  add constraint member_key_results_position_check
  check (position >= 0);


/* ============================================================
   4. Key Result Weight Integrity
------------------------------------------------------------
0 is intentionally valid for display-only Key Results.
============================================================ */

alter table public.member_key_results
  drop constraint if exists member_key_results_weight_range_check;

alter table public.member_key_results
  add constraint member_key_results_weight_range_check
  check (
    weight is null
    or (
      weight >= 0
      and weight <= 100
    )
  );


/* ============================================================
   5. Initiative Position Integrity
============================================================ */

alter table public.member_initiatives
  drop constraint if exists member_initiatives_position_check;

alter table public.member_initiatives
  add constraint member_initiatives_position_check
  check (position >= 0);


/* ============================================================
   6. Explicit Membership Lookup Index
------------------------------------------------------------
The existing objective index is sufficient for most joins.

This index makes the primary Member OKR loading path explicit:

organization membership
        ↓
member objectives
        ↓
member key results
        ↓
member initiatives
============================================================ */

create index if not exists idx_member_objectives_membership_id
  on public.member_objectives (
    organization_membership_id
  );


/* ============================================================
   7. Documentation Guardrail
------------------------------------------------------------
No Assignment, Performance Sheet, or Runtime foreign key is
introduced here.

Member OKR ownership remains:

organization_memberships
        ↓
member_objectives
        ↓
member_key_results
        ↓
member_initiatives

Runtime remains:

member OKRs
        ↓
performance_instances
        ↓
performance_instance_* snapshots

This keeps persistent employee performance data separate from
time-bound historical execution.
============================================================ */

commit;