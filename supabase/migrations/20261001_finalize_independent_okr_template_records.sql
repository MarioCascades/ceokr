/*
============================================================
CascadEffects Performance Platform
Finalize Independent OKR Template Records
------------------------------------------------------------
Milestone: OKR Template Library

Purpose:
- Make Objective Templates independent reusable records
- Make Key Result Templates independent reusable records
- Remove the old Objective -> Key Result ownership model
- Remove the transitional Objective/KR association table
- Preserve Key Result Template records
- Preserve Key Result -> Initiative ownership
- Leave Member OKRs unchanged
- Leave Runtime unchanged
- Leave Builder unchanged
- Leave Assignment unchanged

Final conceptual model:

Objective Templates
    |
    +-- independent reusable Objective records


Key Result Templates
    |
    +-- independent reusable Key Result records
            |
            +-- Initiatives


Member OKRs remain the execution model:

organization_memberships
        |
        +-- member_objectives
                |
                +-- member_key_results
                        |
                        +-- member_initiatives

IMPORTANT:
Objective Templates and Key Result Templates are NOT
parent/child records.

They are independent reusable template records.

This migration is safe to run whether the previous
Objective/KR restructure migration was already applied
or not.

============================================================
*/

begin;


/* ============================================================
   1. Remove the Old Objective/KR Association Table
------------------------------------------------------------

The current product decision no longer requires:

okr_template_objective_key_results

Objective Templates and Key Result Templates are independent.

Any actual Objective -> Key Result relationship will exist
only when a template is applied to a Member OKR.

============================================================ */

drop table if exists
  public.okr_template_objective_key_results
  cascade;


/* ============================================================
   2. Remove Previous Key Result -> Objective Foreign Keys
------------------------------------------------------------

Different versions of the earlier migration used different
constraint names.

Remove both known versions safely.

============================================================ */

alter table public.okr_template_key_results
  drop constraint if exists
    okr_template_key_results_okr_template_objective_id_fkey;

alter table public.okr_template_key_results
  drop constraint if exists
    okr_template_key_results_objective_fkey;


/* ============================================================
   3. Remove Previous Key Result Objective Indexes
============================================================ */

drop index if exists
  public.idx_okr_template_key_results_objective_id;

drop index if exists
  public.idx_okr_template_key_results_objective;

drop index if exists
  public.idx_okr_template_key_results_objective_position;


/* ============================================================
   4. Remove Objective Ownership Columns From Key Results
------------------------------------------------------------

A Key Result Template must no longer contain:

okr_template_objective_id
position

Position does not belong to an independent Key Result
Template because a reusable Key Result may eventually be
used in different positions.

============================================================ */

alter table public.okr_template_key_results
  drop column if exists
    okr_template_objective_id;

alter table public.okr_template_key_results
  drop column if exists
    position;


/* ============================================================
   5. Independent Key Result Index
============================================================ */

create index if not exists
  idx_okr_template_key_results_status
on public.okr_template_key_results (
  status
);


/* ============================================================
   6. Documentation Guardrail
============================================================

FINAL TEMPLATE LIBRARY MODEL:

Objective Templates
    |
    +-- reusable Objective Template records


Key Result Templates
    |
    +-- reusable Key Result Template records
            |
            +-- Initiative Template records


There is intentionally NO:

Objective Template
        |
        +-- Key Result Template

relationship.

When a template is applied to a Member OKR, the application
layer creates the actual Member Objective and Member Key
Result relationship.

The resulting Member OKR records are independent from the
source templates.

No Member OKR ownership is introduced here.
No Runtime dependency is introduced.
No Builder dependency is introduced.
No Assignment dependency is introduced.

============================================================ */

commit;