# CascadEffects Performance Platform

# Platform Decisions

**Document Status:** CURRENT

**Last Updated:** 2026-08-28

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

This prevents old roadmap statements from being mistaken for current
instructions.

---

# 3. Builder Owns Definitions

The Builder is responsible for defining reusable Performance Sheet
definitions.

The Builder owns:

- Performance Sheet structure
- Organization presentation within the sheet
- Navigation
- Performance Header
- Objectives
- Key Results
- Initiatives
- Comments
- Builder validation
- Draft persistence
- Publishing
- Revision creation
- Published version preservation

The Builder is the reusable definition and construction engine.

Status

Accepted

---

# 4. Runtime Owns Execution

Runtime is responsible for operational performance execution.

Runtime owns:

- Performance Instance execution state
- Key Result Progress
- Current Value
- Score
- Employee comments
- Manager comments
- Runtime status
- Runtime aggregate state

Runtime does not modify Builder definitions.

Confidence is not part of the current Runtime Key Result update workflow.

A future confidence or certainty model may be introduced only if a defined
product requirement establishes measurable value for it.

Status

Accepted

---

# 5. Builder and Runtime Separation

The architectural boundary is:

Builder Definition

↓

Published Performance Sheet

↓

Assignment

↓

Performance Instance

↓

Runtime Execution

Builder definitions remain separate from period-specific Runtime state.

Runtime values must not become a second source of truth inside
BuilderDocument.

The Assignment identifies the subject and execution context.

The Performance Instance becomes the Runtime execution anchor.

Status

Accepted

---

# 6. BuilderDocument is Stored as JSONB

BuilderDocument is persisted as JSONB.

This supports:

- flexible Builder evolution
- reusable Performance Sheet definitions
- published version preservation
- future Builder enhancements

Published versions remain immutable.

Status

Accepted

---

# 7. Performance Sheet Versioning

Performance Sheets support:

- Draft
- Published
- Archived

Published versions are immutable.

Changes to a published Performance Sheet create a new draft revision.

The Runtime must reference the exact published Performance Sheet version
associated with an Assignment.

Runtime must never silently replace the Performance Sheet version used by an
existing Performance Instance with a newer published version.

Status

Accepted

---

# 8. Administration Owns Organizational Management

Administration is the organization's management entry point.

Administration is responsible for organizational configuration and
management capabilities such as:

- Organization
- Departments
- Teams
- Users / Members
- Roles and Permissions
- Performance management configuration
- Dashboards
- Reports
- Settings
- AI configuration

Administration does not replace the Builder.

Administration provides management and navigation entry points into the
Builder where appropriate.

Status

Accepted

---

# 9. Administration → Builder Boundary

The intended relationship is:

Administration

↓

Performance Sheets

↓

Builder

↓

Published Performance Sheet

↓

Assignment

↓

Performance Instance

↓

Runtime

Administration should not duplicate Builder editing functionality.

The existing `/builder` experience remains the Builder implementation.

Status

Accepted

---

# 10. Organization Hierarchy

The organizational structure currently established is:

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

Users / Members are represented by application User records.

Organization Membership represents the User's organizational context.

Department and Team associations are stored through Organization Membership.

Roles are assigned to Organization Memberships rather than directly to the
User profile.

Status

Accepted

---

# 11. Multi-Tenant Data Ownership

Core business records must contain or resolve their Organization ownership.

Relationships must use IDs rather than names.

Application services should scope data operations to the current Organization.

Database constraints should enforce important tenant relationships wherever
practical.

Organization-owned Roles must be scoped to their Organization.

Membership Role relationships must not permit a Role belonging to one
Organization to be assigned to a Membership belonging to another
Organization.

Status

Accepted

---

# 12. Database Integrity

The database remains the final integrity authority.

Application validation exists primarily for user experience.

PostgreSQL should enforce important rules such as:

- primary keys
- foreign keys
- tenant relationships
- uniqueness
- required values
- relationship integrity

The Roles and Membership Roles foundation uses organization-aware database
constraints to protect tenant relationships.

Status

Accepted

---

# 13. One Business Concept = One Domain Model

Every core business concept should have one authoritative domain model.

Examples include:

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
- Assignment
- ReportingPeriod
- PerformanceInstance
- KeyResultProgress
- KPIUpdate

Persistence row types may exist separately from domain models when that
separation provides architectural value.

Status

Accepted

---

# 14. Data-Driven Architecture

The platform must favor data-driven configuration over hardcoded business
structures.

Avoid hardcoding:

- Users
- Departments
- Teams
- Objectives
- Key Results
- Dashboards
- Reporting structures
- KPI calculations
- Roles
- Permission assignments

Where practical, these should be represented by platform data and reusable
configuration.

Status

Accepted

---

# 15. Users and Identity

Users / Members are an Administration concern.

The User architecture distinguishes:

- Supabase authentication identity
- Application user/member profile
- Organization membership
- Department association
- Team association
- Roles
- Permissions

The implemented Users foundation establishes the relationship:

Supabase Auth identity

↓

Application User profile

↓

Organization Membership

↓

Department / Team association

The application User profile stores business-user information separately
from the Supabase authentication identity.

Organization Membership stores organizational context.

A User may not have duplicate membership records for the same Organization.

The Organization remains the tenant boundary.

User Edit and User Deactivate remain separate Administration capabilities.

Production tenant authorization and production Row Level Security remain
separate security milestones.

Status

Accepted

---

# 16. Roles and Permissions

Roles and Permissions are part of the Administration security model.

The implemented Roles Foundation establishes the following architecture:

Organization

↓

Organization Membership

↓

Membership Role

↓

Organization Role

↓

Role Permission

↓

Global Permission

Permissions are reusable global platform capability definitions.

Permissions are not organization-owned records.

Roles are organization-scoped configurations.

A Role belongs to exactly one Organization.

Role names are unique within an Organization.

Role Permissions connect organization-scoped Roles to global Permissions.

Membership Roles connect Organization Memberships to organization-scoped
Roles.

Roles are assigned to Organization Memberships rather than directly to User
profiles.

The database must prevent cross-organization Role assignment.

The implemented foundation includes:

- global Permission catalog
- organization-scoped Roles
- Role Permissions
- Membership Roles
- organization-aware database integrity
- organization-scoped Role service operations
- Permission service
- Role Permission service
- Membership Role service
- Roles Administration UI

The Roles Foundation does not yet constitute production authorization.

The following remain future authorization capabilities:

- Permission assignment UI
- Permission removal UI
- Membership Role assignment UI
- Membership Role removal UI
- authenticated tenant authorization
- production Row Level Security
- authorization enforcement across UI
- authorization enforcement across services
- authorization enforcement across APIs
- authorization enforcement at the database / RLS layer

The exact production authorization model remains a future security
milestone.

Status

Accepted

---

# 17. Assignment Architecture

Assignments connect published Performance Sheet versions to Runtime subjects.

The Assignment model establishes:

Assignment

↓

Published Performance Sheet Version

↓

Reporting Period

↓

Assignment Subject

↓

Performance Instance

↓

Runtime Execution

An Assignment contains:

- organization ownership
- performanceSheetId
- reportingPeriodId
- assignmentType
- subjectId
- lifecycle status
- assignment metadata

Supported assignment types currently include:

- individual
- team
- department
- organization

Assignment relationships use IDs rather than display names.

The Assignment is the Administration-level connection between a reusable
published Performance Sheet definition and an operational Runtime subject.

Assignments do not modify Builder definitions.

Assignments do not duplicate Runtime execution logic.

Status

Accepted

---

# 18. Assignment Subject Resolution

The Assignment identifies the entity that receives or executes the
Performance Sheet through:

assignmentType

subjectId

For an individual Assignment:

Assignment

↓

subjectId

↓

Application User

↓

Runtime Subject

The Runtime resolves the actual subject from the Assignment rather than
using an employee identity embedded in the reusable Builder definition.

This allows the same Performance Sheet definition to be assigned to
different Users without modifying the Builder document.

Team, Department, and Organization assignments use their respective entity
IDs.

The current Runtime subject presentation has been verified for Individual
assignments.

More advanced Team, Department, and Organization Runtime presentation
remains a future UX and execution-model decision.

Status

Accepted

---

# 19. Performance Instance as Runtime Anchor

A Performance Instance represents one operational execution of an
Assignment.

The Performance Instance references:

- Organization
- Assignment
- exact published Performance Sheet version
- Reporting Period
- Runtime aggregate state
- Runtime lifecycle state

The Runtime execution loader resolves the execution context through the
Performance Instance.

The Performance Instance is the authoritative Runtime execution anchor.

The Runtime must not resolve execution by simply selecting the latest
published Performance Sheet.

Status

Accepted

---

# 20. Runtime Historical Integrity

Runtime execution must preserve the exact published Performance Sheet
version used by an existing Performance Instance.

A Runtime execution must not silently switch to a newer published version.

The Assignment and Performance Instance together preserve the historical
execution context.

This preserves historical execution integrity.

Status

Accepted

---

# 21. Runtime Scoring

Runtime currently uses a small scoring utility for numeric
Percentage-of-Target scoring.

The current calculation is:

current value ÷ target value × 100

Runtime scores are represented on a 0–100 scale.

The Runtime UI may display the score as a percentage.

The current scoring utility is intentionally small and does not constitute
the future generalized KPI Calculation Engine.

The generalized KPI Calculation Engine remains a future platform capability.

Weighted aggregation also remains future platform work.

Status

Accepted

---

# 22. Runtime Aggregate State

The Performance Instance owns Runtime aggregate state.

Current aggregate behavior includes:

- overall score
- completion progress
- lifecycle status

Current overall score calculation averages Runtime Key Result scores.

Current progress calculation is based on completed Runtime Key Result
Progress records.

Formal weighted aggregation across Key Results, Objectives, and Performance
Instances remains future architecture work.

Runtime aggregate calculations must continue to operate on Runtime records
rather than mutating Builder definitions.

Status

Accepted

---

# 23. Runtime Key Result State

Runtime Key Result Progress owns period-specific execution values.

Current Runtime Key Result state includes:

- currentValue
- score
- employeeComment
- managerComment
- status

These values belong to the Performance Instance execution layer.

They do not belong to the reusable published Builder definition.

Historical KPI update storage remains a future architecture capability.

Status

Accepted

---

# 24. Visual Design System

CascadEffects will use a centralized design system rather than independently
hardcoded page styling.

The design system will eventually define:

- brand colors
- typography
- buttons
- inputs
- cards
- dialogs
- tables
- navigation
- status indicators
- Admin components

The intended CascadEffects visual direction includes:

- Deep Navy
- Coral
- White
- light gray surfaces
- modern SaaS styling
- generous spacing
- clean typography

Brand configuration should eventually be manageable through Administration.

Status

Accepted

---

# 25. Deployment Configuration

The platform uses:

- Vercel
- Supabase
- PostgreSQL

Supabase deployment configuration is supplied through environment
variables rather than hardcoded credentials.

Required public configuration includes:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Server-only privileged configuration must remain server-side.

The Supabase service-role credential must not be exposed through:

NEXT_PUBLIC_*

Privileged Supabase Auth operations must use a server-side boundary.

Production deployment verification must include:

1. Vercel environment configuration.
2. Successful production deployment.
3. Supabase client initialization.
4. Application navigation verification.
5. Supabase-backed functionality verification.

Status

Accepted

---

# 26. Current Platform Position

The major architectural layers currently established are:

Builder

Established

Runtime

Established

Administration

In active development

Current Administration hierarchy:

Organization

↓

Departments

↓

Teams

↓

Users / Members

↓

Organization Membership

↓

Roles / Permissions

↓

Performance Sheets

↓

Assignments

The Builder and Runtime architectures should not be rebuilt as part of the
current Administration completion phase.

Current Administration foundations include:

- Organization
- Departments
- Teams
- Users / Members
- Roles & Permissions
- Performance Sheet Management
- Assignment Management

Status

Accepted

---

# 27. Current Development Priority

The current development phase is:

Administration completion and platform hardening.

Completed Administration capabilities include:

- Organization
- Departments
- Teams
- Users / Members
- Roles & Permissions
- Performance Sheet Management
- Assignment Management

The next milestone must always be confirmed against the latest Waypoint and
Platform Backlog before implementation.

Production authorization and security remain separate architecture
milestones.

High-priority future architecture includes:

- production tenant authorization
- production Row Level Security
- Runtime security boundaries
- Assignment Subject Validation
- Performance Instance Relationship Integrity
- Historical KPI Updates
- generalized KPI Calculation Engine
- weighted aggregation

The Builder and Runtime foundations should not be rebuilt.

Status

Accepted

---

# 28. Historical Documentation Rule

Historical Waypoints are permanent engineering records.

Do not rewrite old Waypoints to make them appear current.

When the project changes direction:

- preserve the historical Waypoint
- update current Platform Decisions if necessary
- update Platform Backlog
- create a new Waypoint at the next milestone

This preserves the actual history of the platform while keeping current
development instructions accurate.

Status

Accepted

---

# 29. Authorization and Security Boundary

Roles and Permissions provide the platform's authorization foundation but
do not by themselves provide production authorization enforcement.

Production authorization must eventually verify:

- authenticated identity
- Organization membership
- Role assignment
- Permission assignment
- requested Organization context
- requested resource ownership

Authorization must eventually be enforced consistently across:

- UI
- server services
- API routes
- database / RLS

The Supabase service-role client must remain restricted to trusted
server-side operations.

Production Row Level Security remains an outstanding security milestone.

Status

Accepted