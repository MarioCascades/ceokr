/*
============================================================
CascadEffects Performance Platform
Member Key Result Visibility
------------------------------------------------------------
Adds a separate visibility flag for persistent Member Key
Results.

is_hidden does NOT replace Member Key Result status.

Hidden Key Results remain stored so historical Runtime
snapshots and existing monthly performance records are not
removed or changed.
============================================================
*/

begin;

alter table public.member_key_results
  add column if not exists is_hidden boolean not null default false;

create index if not exists idx_member_key_results_objective_hidden
  on public.member_key_results (
    member_objective_id,
    is_hidden,
    position
  );

commit;