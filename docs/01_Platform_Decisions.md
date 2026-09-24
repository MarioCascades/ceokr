# CascadEffects Performance Platform

# Platform Decisions

**Document Status:** CURRENT

**Last Updated:** 2026-09-24

This document records architectural decisions that have been intentionally
adopted for the CascadEffects Performance Platform.

These decisions are the current architectural source of truth unless
superseded by a later decision or explicitly updated after a milestone.

---

# 1. Documentation Authority

The repository documentation is the authoritative engineering record.

The documentation hierarchy is:

1. Latest Waypoint
2. Platform Decisions
3. Platform Backlog
4. Historical Waypoints and development summaries

The latest Waypoint represents the current implementation checkpoint.

Platform Decisions represent architectural rules that remain active across
milestones.

Platform Backlog represents intentionally deferred work and the current
forward-looking roadmap.

Historical Waypoints must not be rewritten merely because the platform has
advanced.

If a historical Waypoint conflicts with the current project state, the latest
Waypoint and current Platform Decisions take precedence.

---

# 2. Milestone Documentation Rule

Every completed major milestone should:

1. Compile successfully.
2. Be tested.
3. Be committed to Git.
4. Be pushed to GitHub.
5. Update relevant documentation.
6. Create a new Waypoint.

The latest Waypoint becomes the starting point for the next development
session.

Platform Decisions and Platform Backlog should be reviewed and updated when
a milestone changes the architectural state or roadmap.

---

# 3. Performance Builder Is the Composition Layer

The Performance Builder is the reusable presentation and composition engine
for CascadEffects performance experiences.

The Builder owns reusable Performance Sheet definitions and their
presentation/configuration, including:

- Performance Header
- Member Navigation
- Layout
- Sections
- Fields
- Tables
- Charts
- Reports/display composition
- Comments/display configuration
- Validation of Builder configuration
- Draft persistence
- Publishing
- Revision creation
- Published version preservation

The Builder does **not** own employee-specific:

- Objectives
- Key Results
- Initiatives
- Member performance values

Those belong to the Member OKR domain.

The Builder determines **how performance data is presented**, not which
employee performance data exists.

Status

Accepted

---

# 4. Member OKRs Are the Employee Performance Source of Truth

Each organization member has their own performance data represented through
their Member OKRs.

The Member OKR hierarchy is:

Organization Membership
↓
Member
↓
Member Objective
↓
Member Key Result
↓
Member Initiative

Member OKRs own the employee-specific:

- Objectives
- Key Results
- Initiatives
- Current performance values associated with Key Results

The same Member OKR source must ultimately be consumed by:

- Member OKR management
- Member performance page
- Runtime
- Monthly history
- Dashboards
- Tables
- Charts
- Reports
- AI-assisted performance analysis

The platform must not create competing sources of truth for an employee's
Objectives, Key Results, or Initiatives.

Status

Accepted

---

# 5. Organization Membership Determines Performance Participation

An active Organization Membership establishes that a member belongs to the
organization's performance environment.

A member does not need to be manually assigned to a Performance Sheet merely
to participate in performance management.

The relationship is:

Organization
↓
Organization Membership
↓
Member
↓
Member OKRs

Organization Membership is the authoritative organizational relationship.

Assignments must not be used as the membership mechanism.

Status

Accepted

---

# 6. Builder and Member OKR Separation

The architectural boundary is:

Organization Membership
↓
Member OKRs
↓
Employee Performance Data

and separately:

Organization
↓
Performance Sheet Definition
↓
Published Performance Sheet Version
↓
Presentation / Composition

The two are composed when the member performance experience is rendered.

Conceptually:

Member OKRs
+
Published Performance Sheet configuration
=
Member Performance Experience

The Builder does not contain employee-specific OKR content.

Status

Accepted

---

# 7. Runtime Owns Time-Bound Execution

Runtime is responsible for period-specific execution and historical state.

Runtime owns:

- Performance Instance execution state
- Period-specific Key Result Progress
- Period-specific Current Value
- Period-specific Score
- Employee comments
- Manager comments
- Runtime status
- Runtime aggregate state
- Historical execution context

Runtime does not modify the reusable Performance Sheet definition.

Runtime also must not become the permanent source of an employee's OKRs.

Member OKRs are the source data.

Monthly Runtime records are execution/history derived from that source.

Status

Accepted

---

# 8. Monthly Performance Execution Identity

The target Runtime identity for an individual member is:

organization_id
+
member_id
+
performance_month

rather than:

organization_id
+
assignment_id
+
performance_month

The exact database column names may vary according to the existing schema,
but Runtime must ultimately resolve a member directly through the
organization membership relationship.

Existing Assignment-based Runtime persistence may remain temporarily during
migration.

Status

Accepted

---

# 9. Historical Runtime Integrity

Historical monthly execution must preserve the exact published Performance
Sheet version used for that month's performance experience.

A historical Runtime record must not silently switch to a newer Builder
version.

The Performance Sheet version remains a presentation/configuration snapshot
for historical rendering.

The employee's actual performance data remains connected to the Member OKR
domain.

Status

Accepted

---

# 10. Performance Sheet Versioning

Performance Sheets support:

- Draft
- Published
- Archived

Published versions are immutable.

Changes to a published Performance Sheet create a new draft revision.

Published versions remain reusable presentation definitions.

The Runtime must retain the exact published Performance Sheet version used
for an existing historical execution record.

Status

Accepted

---

# 11. Administration Owns Organizational Management

Administration is the organization's management entry point.

Administration is responsible for capabilities such as:

- Organization
- Departments
- Teams
- Users / Members
- Roles and Permissions
- Performance Sheet management
- Member OKR management
- Dashboards
- Reports
- Settings
- AI configuration

Administration does not create separate performance engines.

Administration provides management and navigation entry points into the
appropriate domain models.

For Member OKRs, Administration manages the member's actual OKR data.

For Performance Sheets, Administration manages the reusable presentation
definition and opens the shared Builder.

Status

Accepted

---

# 12. One Builder, Two Administrative Entry Contexts

CascadEffects has one Builder engine.

Platform Super Admin:

Platform Administration
↓
Select Organization
↓
Performance Sheets
↓
Builder

Organization Admin:

Organization Workspace
↓
Authorized Organization
↓
Performance Sheets
↓
Builder

Both paths use the same Builder definitions, services, validation,
publishing, versioning, and composition engine.

The difference is administrative context and authorization scope.

Status

Accepted

---

# 13. Organization Hierarchy

The organizational structure is:

Organization
↓
Department
↓
Team
↓
User / Member
↓
Organization Membership
↓
Role

The Organization remains the tenant boundary.

Departments belong to Organizations.

Teams belong to Departments and Organizations.

Organization Membership represents the User's organizational context.

Department and Team associations are stored through Organization
Membership.

Roles are assigned to Organization Memberships rather than directly to the
User profile.

Status

Accepted

---

# 14. Multi-Tenant Data Ownership

Core business records must contain or resolve their Organization ownership.

Relationships must use IDs rather than names.

Application services should scope data operations to the current Organization.

Database constraints should enforce important tenant relationships wherever
practical.

Status

Accepted

---

# 15. Database Integrity

The database remains the final integrity authority.

PostgreSQL should enforce important rules such as:

- primary keys
- foreign keys
- tenant relationships
- uniqueness
- required values
- relationship integrity

Application validation exists primarily for user experience.

Status

Accepted

---

# 16. One Business Concept = One Domain Model

Every core business concept should have one authoritative domain model.

Current core concepts include:

- Organization
- Department
- Team
- User
- OrganizationMembership
- Role
- Permission
- RolePermission
- MembershipRole
- PerformanceSheet
- MemberObjective
- MemberKeyResult
- MemberInitiative
- PerformanceInstance
- KeyResultProgress
- KPIUpdate

Persistence row types may exist separately from domain models when that
separation provides architectural value.

Status

Accepted

---

# 17. Member OKR Database Direction

The persistent Member OKR foundation is represented conceptually as:

organization_memberships
↓
member_objectives
↓
member_key_results
↓
member_initiatives

The organization membership is the authoritative organization/member
relationship.

A separate Member OKR parent entity is not required at the current stage.

The database design must avoid duplicate employee OKR ownership.

The existing Runtime snapshot tables remain separate:

member OKRs
↓
monthly execution
↓
performance instance snapshots

The exact migration and repository implementation is a separate milestone.

Status

Accepted

---

# 18. Assignment Architecture — Transitional Only

Assignments are no longer the product mechanism for determining whether an
organization member participates in performance management.

The previous model:

Member
↓
Assignment
↓
Performance Instance

is being retired.

Assignments may remain temporarily in the database and codebase for:

- migration compatibility
- historical data
- controlled transition
- existing Runtime records

New architecture must not introduce new Member OKR ownership through
Assignments.

Assignment removal is a staged migration and cleanup milestone.

Status

Transitional / Retiring

---

# 19. Performance Instance as Historical Runtime Anchor

Performance Instances remain useful as time-bound Runtime records.

They may contain:

- Organization
- Member/subject identity
- Performance Sheet version
- Performance month
- Runtime aggregate state
- Runtime lifecycle state

The final schema will remove the Runtime's dependency on Assignment as the
member ownership mechanism.

Existing Performance Instance records must be preserved during migration.

Status

Accepted / Migration Required

---

# 20. Data-Driven Architecture

The platform must favor data-driven configuration over hardcoded business
structures.

Avoid hardcoding:

- Users
- Departments
- Teams
- Objectives
- Key Results
- Initiatives
- Dashboards
- Reporting structures
- KPI calculations
- Roles
- Permission assignments
- Member navigation

Prefer:

- database records
- IDs
- relationships
- configuration
- reusable definitions
- published versions
- membership
- permissions
- data-driven rendering

Status

Accepted

---

# 21. Visual Design System

The CascadEffects Brand Guide remains the visual source of truth.

The official palette is:

- Deep Navy: #082550
- Grayish Blue: #B4C2D1
- Light Blue: #E9F4F8
- Dark Charcoal: #272D2C
- White: #FFFFFF
- Coral: #E26D5C

The four signature colors remain:

- Deep Navy
- Grayish Blue
- Light Blue
- Coral

Coral is used selectively for actions and emphasis.

The design system should centralize reusable tokens for:

- brand colors
- backgrounds
- surfaces
- borders
- text
- typography
- buttons
- forms
- dialogs
- tables
- navigation
- status indicators
- spacing
- radius
- shadows
- iconography

Status

Accepted

---

# 22. Deployment Configuration

The platform uses:

- Vercel
- Supabase
- PostgreSQL

Supabase deployment configuration is supplied through environment variables.

Required public configuration includes:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Privileged Supabase service-role credentials remain server-side.

Status

Accepted

---

# 23. Authorization and Security Boundary

The authorization hierarchy remains:

Supabase Auth
↓
Application User
↓
Platform Membership
↓
Platform Super Admin

OR

Organization Membership
↓
Membership Roles
↓
Organization Roles
↓
Role Permissions
↓
Global Permission

Platform Super Admins exist above the Organization role hierarchy.

Organization Admins operate within their authorized Organization.

Production authorization and RLS remain separate security milestones.

Status

Accepted

---

# 24. Platform Membership and Super Admin Authority

Platform Memberships represent CascadEffects platform-level authority.

Platform Super Admins are not Organization Roles.

A Platform Super Admin does not require Organization Membership merely to
administer an Organization.

Status

Accepted

---

# 25. Organization Context

Platform Super Admin:

Platform authority
↓
Select Organization
↓
Administer selected Organization

Organization Admin:

Organization authority
↓
Authorized Organization
↓
Administer that Organization

The selected Organization is context only.

It is never the authorization boundary.

Status

Accepted

---

# 26. Reporting Cadence Is Product Behavior

Monthly performance is a product cadence.

The platform does not require an administrator-managed arbitrary
ReportingPeriod entity to make monthly performance work.

Historical reporting derives from dated Runtime records and Member
performance data.

Status

Accepted

---

# 27. Current Architecture

The current target platform architecture is:

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

Separately:

Organization
↓
Performance Sheet
↓
Builder
↓
Published Presentation Configuration

Together:

Member OKRs
+
Published Performance Sheet configuration
↓
Member Performance Experience

The Builder is the composition layer.

Member OKRs are the employee performance source of truth.

Runtime is the time-bound execution/history layer.

Assignments are transitional and are being retired.

Status

Accepted

---

# 28. Documentation Continuity

Historical Waypoints are permanent engineering records.

Do not rewrite historical Waypoints to make them current.

When architecture changes:

- preserve historical Waypoints
- update current Platform Decisions
- update Platform Backlog
- update Product North Star when product direction changes
- create a new Waypoint

The repository documentation remains the authoritative engineering record.

Status

Accepted
