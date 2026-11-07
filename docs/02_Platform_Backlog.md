# CascadEffects Performance Platform

# Platform Backlog

**Document Status:** CURRENT

**Last Updated:** 2026-11-07

This document tracks intentionally deferred architecture, product
capabilities, migration work, and future platform work.

Completed work belongs in Waypoints.

The latest Waypoint and current Platform Decisions determine the current
project state.

---

# Current Project Position (2026-11-07)

**CURRENT APPLICATION SCOPE: COMPLETE**

The Product Owner has confirmed that the current CascadEffects Performance Platform application is done for now. The project is moving from the main application-build phase into incremental improvement and maintenance.

This document still contains future product capabilities, deferred architecture ideas, and historical planning notes. Their presence does **not** mean the current application is unfinished or that they should be treated as the next implementation tasks.

## How to interpret this backlog

1. **Completed baseline:** Work already delivered in the current application. Do not re-add it to active work.
2. **Incremental improvements:** Small refinements or usability changes captured as they are identified. These can be prioritized one at a time.
3. **Future capabilities:** Larger capabilities intentionally outside the current scope. They remain deferred until Mario explicitly chooses to pursue them.
4. **Confirmed defects:** Regressions or failures in existing behavior. Track and address these separately from enhancements.

No item in the historical backlog should be started automatically. Before any implementation, confirm with Mario that the item is still wanted and that it is the selected next improvement.

## Completed current baseline

The current baseline includes the existing platform and performance-management application, Runtime operational workspaces, administration experiences, and the completed refinements listed in the latest Platform Decisions and Waypoint 35.

Recent confirmed updates include:
- Agenda EVENTs card after Announcements and before Rocks, with event details, add/remove behavior, and persistence.
- Recruitment Updates no longer displays Future Task; existing Future Task data remains retained.
- Recruitment long text wraps and cells expand vertically; column widths for Role Details, Action Plan, and Remarks have been adjusted.
- Previously completed Overall Score calculation, Performance Summary Date Updated, VA Exits Replaced display, Indie Ortho dashboard metrics, custom-table headers, and sticky-header behavior remain complete.

Recruitment remains a monthly workflow. Agenda remains a shared current-state workspace. Client Performance remains a continuous client-specific spreadsheet workspace with monthly rows across years. Do not conflate their different persistence models.

## Active work

**No active core application-development milestone is currently open.**

The next work item will be an improvement explicitly selected by Mario. Until then, the project is in a stable completion/maintenance state.

---

# Historical Development Backlog and Deferred Capabilities

## Runtime Operational Tabs and Tenant-Specific Custom Tables

**Status**

IMPLEMENTATION IN PROGRESS / FUNCTIONAL VERIFICATION REQUIRED

The reusable Custom Tables foundation and its permission migration have been
applied in Supabase. This confirms that the foundation SQL ran successfully;
it does not mean the full user experience, production authorization/RLS, or
all operational workflows are complete.

The planned Runtime operational experiences remain:

- Agenda
- VA List
- Recruitment
- Client Performance

Client Performance is one Runtime tab that may contain multiple independently
named tables.

### Confirmed Product Rules

- Shared application code and a reusable schema support the feature.
- Table definitions are provisioned only for the Organization that requests
  them; they are not automatically available to every tenant.
- CascadEffects platform/IT personnel own table-definition and column-structure
  provisioning.
- Organization Admins may enable or disable provisioned tables, but may not
  create table definitions or configure columns.
- The Organization Admin Custom Tables page lists only that tenant's
  provisioned tables.
- An Organization with no provisioned tables sees an explanatory empty state.
- A floating Custom Tables assistance panel remains visible even when the
  tenant has no tables and directs the tenant to its CascadEffects IT Admin.
- Remove the Reports card from the Organization Admin dashboard's Analytics
  group only; preserve the Reports route and underlying feature.
- Add a Custom Tables card to the Organization Admin dashboard.
- Preserve existing Member Runtime navigation, Member OKRs, Builder
  composition, monthly execution, and historical records.

### Current Implementation Notes

- The reusable Custom Tables foundation SQL and permission migration were
  reported as successfully applied.
- The Organization Admin Custom Tables experience still needs to be aligned
  with platform-provisioned definitions rather than self-service table
  creation.
- The Organization Admin dashboard card change remains to be implemented.
- The floating assistance panel and empty state need verification against the
  established Custom Reporting panel design and contact details.
- A Recruitment workspace currently encounters a duplicate-key error when
  initializing a table/month record. Make month initialization idempotent by
  reusing the existing unique table/month record; preserve the uniqueness
  constraint and existing data.
- Production authorization/RLS remains outstanding and must not be described
  as complete merely because application permission records exist.

This milestone does not create a second performance engine. Member OKRs remain
the employee performance source of truth, Runtime remains the time-bound
execution/history layer, and Builder remains the reusable presentation and
composition layer.

The OKR Template Library remains planned and is not the immediate milestone.

---

## Member OKR Performance Architecture

**Status**

FOUNDATION ESTABLISHED / VERIFIED

The platform has established the Member-owned OKR source-of-truth model.

The source-of-truth model is:

Organization
↓
Organization Membership
↓
Member
↓
Member OKRs
↓
Monthly Performance Execution
↓
Historical Performance

The Performance Builder is the composition/presentation layer.

It does not own employee-specific Objectives, Key Results, or Initiatives.

---

# Completed / Established Foundations

- Organization
- Departments
- Teams
- Users / Members
- Roles & Permissions foundation
- Platform Memberships
- Platform Super Admin foundation
- Performance Sheet Management
- Builder foundation
- Runtime foundation
- Member Workspace foundation
- Administration context
- Organization Admin workspace
- Authentication + Role-Based Entry foundation
- CascadEffects visual direction
- Settings presentation
- AI presentation mock-ups

These foundations remain in place unless explicitly superseded by a new
Waypoint.

---

# Member OKR Architecture

## Member OKR Persistence

**Status**

NEXT

Create the persistent Member OKR source of truth.

Target relationship:

organization_memberships
↓
member_objectives
↓
member_key_results
↓
member_initiatives

Requirements:

- organization membership ownership
- normalized relationships
- IDs rather than names
- organization integrity
- ordering/position
- objective weights where applicable
- KR measurement configuration
- KR current performance value
- initiative management

Do not create a duplicate Member OKR parent model unless a future product
requirement demonstrates the need.

Priority

Critical

---

## Member OKR Repository

**Status**

NEXT

Create repositories/services for:

- load member objectives
- create objective
- update objective
- delete objective
- load key results
- create key result
- update key result
- delete key result
- load initiatives
- create initiative
- update initiative
- delete initiative

All operations must be scoped through Organization Membership.

Priority

Critical

---

## Users → Member OKRs

**Status**

NEXT

The Users / Members experience should provide:

Performance
OKRs
Edit
Deactivate

The OKRs action opens the selected member's actual persistent OKR data.

No Assignment lookup should be required.

Priority

Critical

---

## Member Navigation

**Status**

NEXT

Member navigation must be generated automatically from Organization
Membership.

Example:

Main | Mario | Mari | Emily | Jordyn

Selecting a member loads that member's OKRs.

Member navigation must never be hardcoded.

Priority

High

---

# Performance Builder

## Remove Employee OKR Ownership from Builder

**Status**

NEXT

Refactor BuilderDocument so it no longer owns:

- employee Objectives
- employee Key Results
- employee Initiatives

Builder remains responsible for:

- Header
- Navigation
- Layout
- Sections
- Fields
- Tables
- Charts
- Reports/display composition
- Publishing
- Versioning

Priority

Critical

---

## Builder Performance Composition

**Status**

NEXT

Builder must compose the member performance experience from:

Published Performance Sheet configuration
+
Organization Membership
+
Member OKRs

Builder does not create or assign members.

Priority

Critical

---

# Member Page

## Rebuild Member Performance Loading

**Status**

NEXT

Remove the current dependency:

Member
↓
Assignment
↓
Performance Instance

Replace with:

Member
↓
Organization Membership
↓
Member OKRs
↓
Performance configuration
↓
Monthly execution where required

Priority

Critical

---

## Member Performance Workspace

**Status**

NEXT

The Member Workspace should render:

- member identity
- role/context
- month
- Objectives
- Key Results
- Initiatives
- target
- current value
- score
- comments
- historical context

The workspace must use the same Member OKR source as the Users → OKRs
experience.

Do not create a second Member performance data model.

Priority

High

---

# Runtime Migration

## Runtime Member Identity

**Status**

NEXT

Move Runtime ownership away from Assignment.

Target identity:

organization_id
+
member_id
+
performance_month

The exact schema should use the existing application identity/membership
architecture consistently.

Priority

Critical

---

## Runtime Initialization

**Status**

NEXT

Replace:

Builder Objectives
↓
Performance Instance Objectives

with:

Member OKRs
↓
Monthly Performance Snapshot

The Performance Sheet contributes presentation configuration, not the
employee's Objectives/KRs/Initiatives.

Priority

Critical

---

## Historical Runtime Preservation

**Status**

NEXT

Preserve existing:

- Performance Instances
- Runtime Objectives
- Runtime Key Results
- Runtime Initiatives
- Key Result Progress
- KPI Updates

where they represent historical execution.

Existing historical records must remain readable after the migration.

Priority

Critical

---

# Assignment Retirement

## Assignment Usage Audit

**Status**

NEXT

Identify every remaining application dependency on:

- assignments table
- assignment repository
- active assignment resolution
- assignment-based Runtime loading
- assignment-based Performance Instance creation
- assignment Administration UI

Priority

Critical

---

## Assignment Migration

**Status**

DEFERRED UNTIL MEMBER OKR FOUNDATION IS VERIFIED

Migrate Runtime consumers away from Assignment.

Do not delete Assignment records before historical Runtime dependencies are
safe.

Priority

Critical

---

## Assignment Removal

**Status**

FUTURE / CLEANUP

After migration:

- remove Assignment UI
- remove active Assignment resolution
- remove obsolete Assignment repository usage
- remove obsolete service dependencies
- remove obsolete database relationships
- remove Assignment table only after production data migration is verified

Priority

High

---

# Performance Sheets

## Performance Sheet Composition

**Status**

NEXT

Performance Sheet definitions should contain presentation/composition
configuration rather than employee-specific OKRs.

Published versions remain immutable.

Performance Sheet versioning remains reusable across members.

Priority

High

---

## Multiple Performance Sheet Definitions

**Status**

DEFERRED

Future organizations may manage multiple logical Performance Sheet
definitions.

The platform should continue supporting:

- sheet_key
- Performance Sheet Library
- versions
- organization-scoped definitions
- published versions

The selected Performance Sheet configuration must not determine whether a
member participates in performance management.

Priority

Medium

---


# OKR Template Library

## OKR Template Domain

**Status**

PLANNED / NEW PRODUCT CAPABILITY

Create a reusable OKR Template domain separate from Member OKR ownership.

Target relationship:

```text
okr_templates
↓
okr_template_objectives
↓
okr_template_key_results
↓
okr_template_initiatives
```

Requirements:

- global template scope
- organization template scope
- organization ownership for organization templates
- active / archived lifecycle
- normalized relationships
- ordering / position
- objective weights
- Key Result measurement configuration
- Key Result scoring configuration
- initiative management
- creator / ownership metadata

Templates must not become a second source of truth for employee OKRs.

Priority

High

---

## Global OKR Templates

**Status**

PLANNED

Provide Platform Super Admins with a Global OKR Template Library.

Global templates must be reusable by authorized Organizations but editable only
through the platform-level template management context.

Capabilities:

- create global template
- edit global template
- add / edit / remove Objectives
- add / edit / remove Key Results
- add / edit / remove Initiatives
- archive template
- view template

Priority

High

---

## Organization OKR Templates

**Status**

PLANNED

Provide Organization Admins with an Organization-scoped Template Library.

Organization Admins may:

- view available Global Templates
- use Global Templates
- create Organization Templates
- edit their Organization Templates
- archive their Organization Templates
- use Organization Templates

Organization Admins must not modify Global Templates.

Priority

High

---

## Apply Template to Member

**Status**

PLANNED

Allow an authorized Organization Admin to apply an OKR Template when creating
or configuring a Member OKR Sheet.

The operation must copy:

- Objectives
- Key Results
- Initiatives
- applicable weights
- measurement configuration
- scoring configuration
- ordering / position

into the existing Member OKR domain.

The resulting Member OKR records are independent of the source template.

Changing a template later must not silently change existing Member OKRs.

Priority

High

---

## OKR Template Repository

**Status**

PLANNED

Create a dedicated repository/service layer for OKR Templates.

The repository should provide operations for:

- load templates
- load template
- create template
- update template
- archive template
- create / update / delete template Objectives
- create / update / delete template Key Results
- create / update / delete template Initiatives
- apply template to Member OKRs

All Organization-scoped operations must resolve through the Organization
context and authorization model.

Priority

High

---

## OKR Template Authorization

**Status**

PLANNED

Enforce the distinction between platform-level Global Template authority and
Organization-level Template authority.

Target model:

```text
Platform Super Admin
↓
Global Templates

Organization Admin
↓
Organization Templates
↓
Authorized Organization
```

Global Templates are readable / usable by authorized Organizations but are not
editable through the Organization Admin context.

Organization Templates must never be visible or editable outside their owning
Organization.

Priority

Critical

---

## OKR Template Functional Verification

**Status**

PLANNED

Verify the complete lifecycle:

1. Super Admin creates a Global Template.
2. Multiple Organizations can see and use the Global Template.
3. Organization Admin cannot modify the Global Template.
4. Organization Admin creates an Organization Template.
5. Other Organizations cannot see that Organization Template.
6. Organization Admin applies a template to a member.
7. Member receives independent Objectives, Key Results, and Initiatives.
8. Editing the source template does not alter existing Member OKRs.
9. Archived templates cannot be selected for new applications unless explicitly
   restored.
10. Existing Member OKRs remain intact throughout the lifecycle.

Priority

High

---

# Runtime

## Runtime Product Experience

**Status**

FOUNDATION COMPLETE / CONTINUING

Continue improving:

- monthly navigation
- previous/current/target performance
- measurement-type-aware value entry
- score visibility
- Objective / Key Result / Initiative presentation
- employee comments
- manager comments
- lifecycle presentation
- manager review
- historical navigation

All improvements must consume Member OKRs and the Runtime execution layer.

Do not create a second performance engine.

Priority

High

---

## Runtime Security

**Status**

DEFERRED

Production Runtime operations require:

- authenticated actor
- authorized Organization
- authorized member/resource
- server-side enforcement
- eventual production RLS

Priority

High

---

# Historical Performance

## Historical KPI Updates

**Status**

DEFERRED

Create durable time-series KPI update records supporting:

- member
- Key Result
- measured value
- calculated score
- timestamp
- performance month
- update source where appropriate

Priority

High

---

## KPI Calculation Engine

**Status**

DEFERRED

Create generalized KPI calculation capabilities for:

- numeric
- currency
- percentage
- time-bound
- reverse scoring
- shared metrics
- team metrics
- department metrics
- organization metrics

Priority

High

---

## Weighted Aggregation

**Status**

DEFERRED

Formalize weighted aggregation at:

- Key Result
- Objective
- Member Performance
- organizational levels

Priority

High

---

## Historical Reporting

**Status**

FUTURE

Support:

- previous months
- performance trends
- team comparisons
- department comparisons
- organization comparisons
- historical performance records

Priority

High

---

# Dashboards

## Dynamic Dashboard System

**Status**

FUTURE

Dashboards must be generated from platform data and configuration.

Potential levels:

- individual
- team
- department
- executive
- organization

Priority

High

---

# Reports

## Dynamic Reports

**Status**

FUTURE

Reports should consume the same Member OKR and historical performance
sources.

Reports must not create a second KPI/performance data model.

Priority

Medium

---

# AI

## AI-Assisted Planning

**Status**

FUTURE

Potential capabilities:

- objective generation
- Key Result recommendations
- KPI suggestions
- goal quality analysis
- initiative recommendations
- performance insights
- planning assistance
- reporting summaries

AI must consume authorized platform data only.

Priority

Medium

---

## AI Data-Aware Expansion

**Status**

FUTURE

Future phases may add:

- performance analysis
- KPI insights
- planning
- reporting summaries
- recommendations
- predictive analytics

Authentication and authorization must be complete before private
performance data is exposed to AI.

Priority

Medium

---

# Authentication and Organization Entry

## Multi-Organization Entry Selection

**Status**

DEFERRED / RE-EVALUATE AFTER MEMBER OKR ARCHITECTURE FOUNDATION

The previous roadmap identified explicit Organization selection as the next
entry-routing milestone.

That work remains valid but must not interrupt the more fundamental Member
OKR architecture migration.

When resumed:

- one applicable Organization should not require unnecessary selection
- multiple Organizations should provide explicit selection
- selected Organization is context only
- server-side authorization must re-resolve the Organization
- client selection must never be treated as authorization

Priority

High

---

# Security

## Tenant Authorization Hardening

**Status**

DEFERRED

Production authorization must enforce Organization boundaries across:

- UI
- services
- API routes
- database / RLS

Priority

Critical

---

## Production Row Level Security

**Status**

DEFERRED

Implement and validate production Supabase RLS policies.

Priority

Critical

---

## Platform Authorization

**Status**

DEFERRED

Complete enforcement of Platform Super Admin authority separately from
Organization Roles.

Priority

High

---

# Architecture Cleanup

## Domain / Persistence Separation

**Status**

DEFERRED

Future architecture work may introduce:

src/lib/domain/

and:

src/lib/supabase/mappers/

Do not perform broad refactoring during the Member OKR migration unless
required.

Priority

Medium

---

# Documentation

## Runtime Operational Tabs and Custom Tables Documentation

**Status**

CURRENT MILESTONE

Update:

- Platform Decisions
- Platform Backlog
- Waypoint

when the Runtime Operational Tabs and Custom Tables milestone is completed.

Product North Star does not require an architectural update for this milestone
because the feature remains within the existing Administration, Member OKR,
Runtime, Performance Data / Reporting, and Builder composition model.

Do not rewrite historical Waypoints.

Priority

Critical

---

# Tenant-Specific Custom Tables Provisioning and Admin Experience

## Provisioned Tables Only

**Status**

IN PROGRESS

Refactor the Organization Admin Custom Tables experience to show only
definitions provisioned for the active Organization. Remove self-service
definition/column creation from the Organization Admin workflow. Platform/IT
provisioning remains responsible for definitions and structures.

Priority

Critical

---

## Organization Admin Table Controls and Empty State

**Status**

NEXT

Allow Organization Admins to enable or disable provisioned tables for Runtime.
If no tables are provisioned, show an explanatory empty state directing the
Organization to contact its CascadEffects IT Admin.

Priority

Critical

---

## Floating Custom Tables Assistance Panel

**Status**

NEXT

Implement or reuse the established floating Custom Reporting assistance-panel
design in the Custom Tables experience. It must remain visible when no tables
are provisioned and must use the established contact details. The panel is
informational; it does not provision tables or grant permissions.

Priority

High

---

## Organization Admin Dashboard Navigation

**Status**

NEXT

Remove only the Reports card from the Analytics group and add a Custom Tables
card. Preserve the Reports route, feature, and supporting services.

Priority

High

---

## Idempotent Monthly Workspace Initialization

**Status**

FIX REQUIRED

When a Custom Table month already exists, workspace initialization must reuse
it instead of attempting a duplicate insert. Preserve the unique
table/month constraint and existing rows.

Priority

Critical

---

## Recruitment Operational Workflow

**Status**

IN PROGRESS / FUNCTIONAL VERIFICATION REQUIRED

Verify the six agreed operational fields, separate standardized workflow
status, status colors, row editing, ordering, hidden listings, month selection,
historical retrieval, and carry-forward of open roles/latest status without
altering the prior month. Recruitment must not affect Member OKR scoring.

Priority

High

---

## Production Authorization and RLS for Custom Tables

**Status**

OUTSTANDING

Verify organization isolation and least-privilege access across definitions,
columns, monthly records, and rows. SQL permission records and application
checks do not substitute for verified database RLS and production authorization.

Priority

Critical

---

# Current Project Position

Builder

ESTABLISHED

Runtime Execution Foundation

ESTABLISHED / VERIFIED

Runtime Operational Tabs and Tenant-Specific Custom Tables

IMPLEMENTATION IN PROGRESS / FUNCTIONAL VERIFICATION REQUIRED

Custom Tables Foundation SQL and Permission Migration

APPLIED / RLS VERIFICATION OUTSTANDING

Organization Admin Custom Tables Provisioning UX

REQUIRES ALIGNMENT TO PLATFORM-PROVISIONED TABLES

Organization Admin Dashboard Navigation Update

NEXT

Monthly Operational History and Carry-Forward

FUNCTIONAL VERIFICATION REQUIRED

Production Authorization / RLS

OUTSTANDING

Administration Foundation

ESTABLISHED

Users / Members

COMPLETE

Roles & Permissions

FUNCTIONAL FOUNDATION COMPLETE

Platform Authority

FOUNDATION COMPLETE

Performance Sheet Management

COMPLETE

Assignment Management

LEGACY / TRANSITIONAL

Member Workspace

FOUNDATION COMPLETE

Authentication + Role-Based Entry

FOUNDATION COMPLETE / VERIFIED

Member OKR Domain

FOUNDATION COMPLETE / VERIFIED

OKR Template Library

PLANNED / NEW PRODUCT CAPABILITY

Historical KPI Updates

DEFERRED

KPI Calculation Engine

DEFERRED

Weighted Aggregation

DEFERRED

Historical Performance Reporting

DEFERRED

Dashboards

V1 ESTABLISHED / DYNAMIC FUTURE

AI

PRESENTATION MOCK-UPS / LIVE FUTURE

---

# Historical Next-Session Instructions (Superseded 2026-11-07)

This October 2026 instruction is retained for historical context only and is superseded by Waypoint 35 and the Current Project Position at the beginning of this document.

Do not resume from Waypoint 33 or Waypoint 34 as the current work checkpoint. Do not automatically restart the old Runtime Operational Tabs / Custom Tables implementation sequence. The current application scope is complete; select a specific improvement with Mario before implementation.

---

# 2026-10-13 Update: VA Roster, Agenda, and Client Performance

This section records newer decisions and supersedes any earlier backlog wording that implies all three of these operational experiences require monthly history.

## Confirmed Current-State Behavior

### VA Roster (formerly VA List)

**Status: DESIGN AGREED / IMPLEMENTATION NOT STARTED OR VERIFIED**

- Rename the Runtime tab and page heading to **VA Roster**.
- Keep Total Hours / Week, Adjusted VA Number, Actual VA Number, and Last Updated at the top.
- Use a simple persistent table with VA Name, Client / Account, and Pre-Defined Hours / Week.
- Support adding, editing, saving, and reordering rows.
- Support sorting/filtering by name, client/account, and weekly hours.
- Support hiding individual VA rows and a Show Hidden Rows control to view and restore them.
- Never delete or deactivate a VA merely to remove it from the current visible roster. Hidden rows are retained as historical roster records.
- Keep the roster persistent as current-state data. No monthly selector, monthly snapshots, or copy-forward.
- Summary metrics must be independent of the current sort/filter and use visible roster rows. Confirm the original spreadsheet formula before hard-coding the adjusted VA calculation (the screenshot suggests weekly hours divided by 40).
- The table's Runtime visibility/enablement is separate from individual row visibility.

### Agenda

**Status: DETAILED DESIGN CONFIRMED / IMPLEMENTATION NOT VERIFIED**

Agenda is a shared organization-level agenda/blackboard using the agreed simple, spreadsheet-style layout (clear section headings, table headers, editable cells/fields, and add-row controls where specified), not a generic blank notepad. It has five sections, in this order:

1. **Wins** — two columns; 12 rows by default; users can add rows. The exact column headings must be taken from the agreed source/reference if available; do not invent labels.
2. **Announcements** — persistent, freely editable text/whiteboard area.
3. **Rocks** — columns `Rocks`, `Target`, `Current`, `Date`; users can add rows.
4. **Where I Need Help** — columns `Name`, `Where I Need Help`, `Remarks`; users can add rows.
5. **Items Carried Over from Last Week** — columns `Item`, `Remarks`; users can add rows.

Required behavior:

- Organization-scoped shared state, persisted in Supabase.
- All five sections, including announcement text and added rows, reload after refresh, reopening, and sign-in.
- No month selector, monthly snapshots/history, or copy-forward.
- Display **Last Updated** using the timestamp of the last successful persisted save. Do not advance it on typing or a failed save; reload the saved timestamp on return.
- Autosave all changes. Never report a failed save as successful.
- Use CascadEffects colors: navy `#082550`, blue-gray `#B4C2D1`, light blue `#E9F4F8`, charcoal `#272D2C`, white `#FFFFFF`, coral `#E26D5C` sparingly.
- Typography direction: Roboto Black, Martel Sans, and Khula, following the existing brand guide/design-system roles.
- Preserve organization isolation.

### Client Performance

**Status: DESIGN CONFIRMED / ARCHITECTURE VERIFICATION PENDING / IMPLEMENTATION NOT STARTED**

The requirements in Waypoint 34 supersede the older Client Performance direction recorded in Waypoint 33 and earlier backlog text. Client Performance is a persistent spreadsheet-style workspace, not a monthly snapshot selector.

- One Client Performance Runtime entry, available only in the CascadEffects tenant.
- A client selector switches the complete workspace, including the current performance snapshot, monthly metrics, and Key Initiatives Tracker.
- Each client has independent saved data and a client-specific column configuration. The screenshots show Kirkland & Richmond with additional monthly metrics columns, including Days Worked and Avg Prod per Day; other clients use a simpler layout. Do not force identical columns on every client.
- The workspace preserves monthly rows continuously across years. It does not use a month selector, per-month snapshots, or copy-forward.
- Initially show two years: 2025 and 2026. Provide controls to hide a year, restore a hidden year, and add another year. Hiding a year affects visibility only and must not delete or alter its records. Adding a year appends January through December for the next year without overwriting prior years.
- Each client has a current performance snapshot and a Key Initiatives Tracker. Preserve existing values, notes, and initiative records when other fields are edited.
- Add, enable, and disable clients through an Organization Admin management experience (dedicated card/page or appropriate Custom Tables settings, based on the source review). Disabled clients are hidden from the normal Runtime client selector but retain all data.
- Adding a client creates the standard workspace structure and default columns, while allowing a client-specific column configuration. Do not create a separate database table per client.
- Only Organization Admins and Superadmins may edit/save performance data and manage clients. Enforce authorization server-side and at the database/RLS boundary, not only by hiding controls.
- Last Updated is maintained per client and changes only after a successful save. Failed saves must not advance the timestamp.
- Integrate with the existing Custom Tables registration/Runtime navigation where appropriate; do not build a separate application or disrupt other tenants or Custom Tables workflows.
- Exact snapshot columns, monthly columns, initiative columns, and per-client differences must be verified against the supplied source spreadsheets/screenshots and current implementation before finalizing the schema. Do not invent fields where the source is unclear.

## Shared Implementation Guardrails

- Reuse existing Custom Tables infrastructure when it fits; do not create an unnecessary parallel persistence system.
- Keep tenant scoping and authorization checks intact.
- Runtime tab enable/hide controls are distinct from row-level hide/restore controls.
- Do not mark any of these experiences implemented until the current code is inspected, build passes, and focused browser/database tests confirm the behavior.
- Continue one file at a time: request the current full file, review it, return the complete replacement with its exact path, then continue to the next file.

## Next Work Sequence

Use Waypoint 34 as the current Client Performance design checkpoint. Agenda requirements remain in Waypoint 33 and prior documentation; verify the current implementation status from source and tests rather than assuming completion from documentation alone.

1. Review the Product North Star, Waypoint 34, Platform Decisions, this Backlog, and Engineering Process.
2. Inspect the current Runtime navigation/registration and Custom Tables definitions, persistence services/repositories, migrations, and authorization/RLS patterns. Inspect the supplied current source rather than reconstructing files from memory.
3. Confirm how CascadEffects tenant identity is established and how the existing Runtime Custom Tables entry is provisioned. Determine the safest way to register Client Performance without exposing it to other tenants.
4. Finalize the data model for client records, per-client column configuration, current snapshot, persistent monthly rows, initiatives, year visibility, client enabled/disabled state, and per-client Last Updated. Reuse existing infrastructure where appropriate; only introduce narrowly scoped persistence structures where the generic model does not safely meet requirements.
5. Present the architecture, affected files, migration plan, authorization/RLS approach, and implementation sequence for approval before changing code.
6. After approval, implement one file at a time: inspect the current full file, return the complete replacement and exact path, and wait for the user to apply/test it before proceeding.
7. Verify add/enable/disable client workflows, client-specific columns, cell/row persistence, adding/hiding/restoring years, and preservation of all historical data.
8. Verify per-client Last Updated changes only after successful saves, and test permissions for Org Admin, Superadmin, and unauthorized users at both server and database/RLS boundaries.
9. Run build and focused functional/database tests. Regression-test existing Custom Tables, Agenda, VA Roster, and Recruitment behavior, including Recruitment's monthly history/carry-forward and Cancelled status.
10. Commit only after the coherent milestone is verified, then update the documentation and create the next completion Waypoint.

Keep the one-file-at-a-time workflow. Recruitment remains a monthly workflow. Client Performance is a continuous persistent spreadsheet containing monthly rows across years; it does not switch between monthly snapshots. Agenda remains governed by its separate current-state requirements.

Keep the established one-file-at-a-time workflow: inspect the current full file, return the exact path and complete replacement, and only then move to the next file. Recruitment remains monthly; Agenda and Client Performance are current-state experiences.


---

# 2026-11-07 Improvement Intake Rule

When Mario identifies a refinement:
1. Record the requested behavior and the affected area in this backlog.
2. Classify it as an improvement or a confirmed defect.
3. Preserve the existing working behavior and data unless Mario explicitly approves a change.
4. Implement only the selected improvement, using the current full source file and the established one-file-at-a-time workflow.
5. After the change, update the relevant status and Waypoint if the change materially alters the application baseline.

Do not treat every improvement idea as a prerequisite to application completion. Do not reopen completed items simply because an older section below contains stale status wording. The current baseline and latest Waypoint take precedence over historical planning snapshots.
