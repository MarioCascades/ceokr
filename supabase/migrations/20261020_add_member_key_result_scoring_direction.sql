
/*
============================================================
CascadEffects Performance Platform
Member Key Result Scoring Direction
------------------------------------------------------------
Adds per-Key Result scoring direction to persistent Member
OKRs.

Existing Key Results default to higher_is_better so their
current behavior remains unchanged.

Allowed values:
- higher_is_better
- lower_is_better

This migration does not modify Runtime snapshots, historical
progress records, or existing scores.
============================================================
*/

begin;

alter table public.member_key_results
  add column if not exists scoring_direction text
  not null default 'higher_is_better';

alter table public.member_key_results
  drop constraint if exists member_key_results_scoring_direction_check;

alter table public.member_key_results
  add constraint member_key_results_scoring_direction_check
  check (
    scoring_direction in (
      'higher_is_better',
      'lower_is_better'
    )
  );

commit;
