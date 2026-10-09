# CascadEffects Performance Platform

# Waypoint 31: Tenant-Specific Custom Tables and Organization Admin Experience

**Date:** 2026-10-10  
**Status:** IMPLEMENTATION IN PROGRESS / NEXT ACTIONS DEFINED  
**Previous Waypoint:** Waypoint 30: Runtime Operational Tabs and Custom Tables Architecture

---

# 1. Purpose

This Waypoint records the refined product rules, the current Custom Tables
implementation checkpoint, the known month-initialization defect, and the
precise implementation sequence required to resume work without losing scope.

Waypoint 30 remains a historical architecture checkpoint and is not rewritten.

---

# 2. Product Scope

The milestone includes four planned Runtime operational experiences:

- Agenda
- VA List
- Recruitment
- Client Performance

Client Performance is one Runtime tab that can contain multiple independently
named tables. These operational experiences are not a second performance
engine and do not participate in Member OKR scoring.

The existing Member OKR source of truth, Builder composition responsibilities,
Runtime performance behavior, monthly cadence, and historical Runtime records
must remain intact.

---

# 3. Tenant-Specific Provisioning Rules

The word *custom* means the table is provisioned for the individual tenant that
requests it. It does not mean every tenant receives a global catalog of all
tables by default.

- CascadEffects platform/IT personnel provision table definitions and column
  structures for the requesting Organization.
- Definitions, columns, monthly records, and rows are scoped to that
  Organization.
- An Organization may have no provisioned tables.
- Organization Admins do not create table definitions or configure columns.
- Organization Admins can enable or disable tables that have already been
  provisioned for their Organization.
- Authorized Organization members may edit operational rows according to the
  table workflow and their permissions.
- Enabling a table does not create its definition, change its schema, or
  independently grant additional access.

The Organization Admin Custom Tables page must list only provisioned tables
for the authenticated Organization context. If none exist, show a useful empty
state explaining how to request one through the CascadEffects IT Admin.

---

# 4. Custom Tables Assistance Panel

The Custom Tables experience must include a floating assistance/reminder panel
based on the established floating Custom Reporting panel design. It must also
appear when the Organization has no provisioned tables.

Suggested message:

> NEED A CUSTOM TABLE? Need a specific table, custom fields, or changes to an
> existing table? Contact your CascadEffects IT Admin for assistance.

Reuse the established panel treatment and contact details. Do not invent a new
contact or replace the established design without approval.

The panel is informational. It does not provision tables, change definitions,
enable tables, or grant permissions.

---

# 5. Organization Admin Dashboard Change

Update the Organization Admin dashboard as follows:

- Remove the Reports card from the Analytics card group only.
- Add a Custom Tables card in the appropriate configuration/navigation area.
- Preserve the Reports route, page, services, and reporting functionality.

This is a navigation-card change, not a deprecation of Reports.

---

# 6. Recruitment Workflow Requirements

Recruitment is a monthly operational list with these fields:

- Role
- Role Details
- Action Plan
- Remarks
- Future Task
- Current State

The standardized workflow status is separate from the freeform Current State
field. The workflow status values are:

- In Progress
- On Hold
- Completed

Display the statuses with distinct visual status treatment. The workflow must
support row editing, ordering, hidden listings, month selection and historical
viewing, plus carry-forward of open roles and their latest workflow status.
Carrying data forward must not alter the prior month's records.

Recruitment is operational workflow data, not Member OKR scoring data.

---

# 7. Database and Implementation Checkpoint

The following has been reported as completed in the current development
session:

- The Custom Tables foundation SQL was successfully applied in Supabase.
- The Custom Tables permissions migration was successfully applied in Supabase.

These facts confirm that the migrations ran; they do not establish that
production authorization/RLS is complete or that every UI workflow is verified.

The shared Custom Tables model includes organization-scoped definitions,
columns, month records, and rows. Production database authorization/RLS remains
outstanding until it is implemented and verified.

---

# 8. Known Defect: Duplicate Table/Month Initialization

Creating or opening a Recruitment workspace produced this error:

`Failed to create Custom Table month: duplicate key value violates unique constraint "custom_table_months_table_month_unique"`

The reported call path was:

- `createCustomTableMonth` in `src/lib/repositories/customtablerepository.ts`
- `loadCustomTableWorkspace` in `src/services/customtableservice.ts`
- `CustomTableConfigurationPage` in `src/app/organization/customtables/[tableId]/page.tsx`

The next implementation must make month initialization idempotent. If the
table/month record already exists, the operation must reuse it instead of
attempting another insert.

Do not remove the unique constraint, create duplicate month records, or
overwrite existing monthly rows as a workaround.

---

# 9. Required Organization Admin Experience

The Organization Admin Custom Tables page must:

1. List only definitions provisioned for the active Organization.
2. Provide enable/disable controls for provisioned tables.
3. Not expose a self-service create-table or configure-columns workflow.
4. Display an explanatory empty state when no tables are provisioned.
5. Display the floating assistance panel even in the empty state.
6. Preserve tenant isolation for definitions, columns, months, and rows.

Platform/IT provisioning remains the mechanism for adding a table or changing
its structure.

---

# 10. Implementation Order

Proceed incrementally and inspect each current file before changing it.

1. Fix idempotent table/month initialization.
2. Refactor the Organization Admin Custom Tables experience to remove
   self-service definition creation and list only tenant-provisioned tables.
3. Add enable/disable controls and the empty state.
4. Add the floating assistance panel using the established design and contact
   details.
5. Update the Organization Admin dashboard cards: remove Reports from Analytics
   and add Custom Tables, without removing the Reports route.
6. Verify Recruitment's fields, status behavior, row editing, ordering, hidden
   listings, monthly history, and carry-forward.
7. Verify Agenda, VA List, and Client Performance behavior, including
   persistence and historical-month retrieval.
8. Verify tenant isolation and production authorization/RLS.
9. Verify existing Member Runtime tabs, Member OKRs, and Builder behavior are
   unchanged.
10. Compile and perform focused browser/database tests.
11. Commit the coherent implementation milestone.
12. Update documentation and create the next implementation-completion
    Waypoint after verification.

Follow the existing collaboration workflow: one file at a time, inspect the
current full file first, then return the exact path and complete replacement
file. Avoid speculative snippets, unrelated refactoring, or replacing source
files without reviewing their current contents.

---

# 11. Files and Routes to Inspect During Implementation

Inspect the current repository versions before editing, including:

- `src/app/organization/page.tsx`
- `src/app/organization/customtables/page.tsx`
- `src/components/organization/customtablecreateform.tsx`
- `src/components/organization/customtablesworkspace.tsx`
- `src/app/organization/customtables/[tableId]/page.tsx`
- `src/lib/repositories/customtablerepository.ts`
- `src/services/customtableservice.ts`
- `src/lib/types/domain/customtable.ts`
- `src/app/runtime/page.tsx`
- `src/components/runtime/shared/runtimenavigation.tsx`
- `src/components/runtime/performancesheet/performancesheet.tsx`

This list identifies likely implementation touchpoints, not permission to
rewrite all of them. Start with the month-initialization defect and proceed
only as each next change becomes necessary.

---

# 12. Security and Data Integrity

Organization scope must be enforced in application queries and mutations and
at the database authorization layer. A client-selected Organization ID is not
proof of authorization.

The applied permission migration is not proof that Row Level Security (RLS)
policies are correctly configured. Verify that one Organization cannot read,
change, enable, or otherwise access another Organization's table definitions,
columns, monthly records, or operational rows.

Preserve unique table/month integrity and historical monthly values.

---

# 13. Files Added, Modified, and Removed

This Waypoint documents the implementation checkpoint and next actions. It does
not claim that the pending UI changes have already been implemented.

**Application source files added:** None recorded by this documentation update.

**Application source files modified:** None recorded by this documentation update.

**Application source files removed:** None.

**Database changes:** The user confirmed that the Custom Tables foundation SQL
and permissions migration were successfully applied in Supabase. Production
authorization/RLS verification remains outstanding.

**Documentation updated for this checkpoint:**

- `docs/01_Platform_Decisions.md`
- `docs/02_Platform_Backlog.md`
- `docs/waypoints/20261010_Waypoint_31_Tenant_Specific_Custom_Tables_and_Admin_Experience.md`

Waypoint 30 remains unchanged as a historical checkpoint. The Product North
Star and Engineering Process do not require changes for this checkpoint.

---

# 14. Current Milestone Status

```text
Member OKR Performance Architecture
    FOUNDATION COMPLETE / VERIFIED

Runtime Performance Experience
    FOUNDATION COMPLETE / VERIFIED

Custom Tables Foundation SQL
    APPLIED

Custom Tables Permission Migration
    APPLIED / PRODUCTION RLS VERIFICATION OUTSTANDING

Runtime Operational Tabs and Custom Tables
    IMPLEMENTATION IN PROGRESS

Organization Admin Provisioning and Enable/Disable UX
    REQUIRES IMPLEMENTATION / VERIFICATION

Organization Admin Dashboard Navigation
    NEXT

Monthly Workspace Initialization
    FIX REQUIRED

Monthly History and Carry-Forward
    FUNCTIONAL VERIFICATION REQUIRED

Production Authorization / RLS
    OUTSTANDING

OKR Template Library
    PLANNED / NEW PRODUCT CAPABILITY
```

---

# 15. Next Session: Exact Starting Point

Start by reviewing:

1. `docs/03_Product_North_Star.md`
2. This Waypoint 31
3. `docs/01_Platform_Decisions.md`
4. `docs/02_Platform_Backlog.md`

Then request and inspect the current full source for
`src/lib/repositories/customtablerepository.ts` if it is not already available
in the active session.

The first coding task is to make Custom Table month initialization idempotent
and resolve the duplicate `custom_table_months_table_month_unique` error while
preserving existing data and the uniqueness constraint.

After that, proceed one file at a time through the implementation order in
Section 10. Do not start unrelated work.

The governing rule is:

> **Custom Tables are provisioned per requesting Organization by CascadEffects
> platform/IT personnel. Organization Admins may enable or disable provisioned
> tables, but do not create table definitions or configure columns. Operational
> data remains tenant-scoped and monthly history must remain intact.**

The repository documentation, not conversation memory, is the authoritative
engineering record.
