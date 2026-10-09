/*
============================================================
CascadEffects Performance Platform
Member Objective Visibility
------------------------------------------------------------
Adds a separate visibility flag for persistent Member
Objectives.

is_hidden does NOT replace or modify the visibility state
of individual Member Key Results.

Hidden Objectives remain stored so their complete Objective
and Key Result configuration can be recovered later without
deleting or changing the underlying records.
============================================================
*/

begin;

alter table public.member_objectives
  add column if not exists is_hidden boolean not null default false;

create index if not exists idx_member_objectives_membership_hidden
  on public.member_objectives (
    organization_membership_id,
    is_hidden,
    position
  );

commit;