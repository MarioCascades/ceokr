/*
============================================================
CascadEffects Performance Platform
Runtime Member Identity Migration
------------------------------------------------------------
Purpose:
- Add direct member identity to monthly Performance Instances.
- Backfill existing individual Runtime history from Assignments.
- Allow new member Runtime records to exist without Assignment.
- Preserve Assignment data for historical compatibility.

Target Runtime identity:

organization_id
+
member_id
+
performance_month

Assignments remain temporarily for historical compatibility
and organization-level Runtime execution.
============================================================
*/

begin;


/* ============================================================
   1. Direct Member Identity
============================================================ */

alter table public.performance_instances
  add column if not exists member_id uuid;

alter table public.performance_instances
  add constraint performance_instances_member_fkey
  foreign key (member_id)
  references public.users(id)
  on delete restrict;


/* ============================================================
   2. Assignment Becomes Optional For New Member Runtime
============================================================ */

alter table public.performance_instances
  alter column assignment_id drop not null;


/* ============================================================
   3. Backfill Existing Individual Runtime History
------------------------------------------------------------
Only individual Assignments are converted because their subjectId
is a direct application User identity.

Organization, Department, and Team Assignment records are left
unchanged and continue through the legacy compatibility path.
============================================================ */

update public.performance_instances pi
set member_id = a.subject_id
from public.assignments a
where pi.assignment_id = a.id
  and a.assignment_type = 'individual'
  and pi.member_id is null;


/* ============================================================
   4. Indexes
============================================================ */

create index if not exists
  idx_performance_instances_organization_member_month
on public.performance_instances (
  organization_id,
  member_id,
  performance_month
);


/* ============================================================
   5. One Monthly Runtime Instance Per Member
------------------------------------------------------------
NULL member_id records are intentionally excluded so legacy
organization/team/department executions can continue to coexist.
============================================================ */

create unique index if not exists
  uq_performance_instances_member_month
on public.performance_instances (
  organization_id,
  member_id,
  performance_month
)
where member_id is not null;


commit;