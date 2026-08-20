# CascadEffects Performance Platform

# Platform Decisions

**Document Status:** CURRENT  
**Last Updated:** 2026-08-21

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
- Confidence
- Employee comments
- Manager comments
- Runtime status
- Runtime aggregate state

Runtime does not modify Builder definitions.

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

Runtime values must not become a second source of truth inside BuilderDocument.

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

The organizational hierarchy currently being established is:

Organization
    ↓
Department
    ↓
Team
    ↓
User / Member

Organizations are the tenant boundary.

Departments belong to Organizations.

Teams belong to Departments and Organizations.

Users / Members will belong to Organizations and may be associated with
Departments and Teams.

Status

Accepted

---

# 11. Multi-Tenant Data Ownership

Core business records must contain or resolve their Organization ownership.

Relationships must use IDs rather than names.

Application services should scope data operations to the current Organization.

Database constraints should enforce important tenant relationships wherever
practical.

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
- Role
- Permission
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

Where practical, these should be represented by platform data and reusable
configuration.

Status

Accepted

---

# 15. Users and Identity

Users / Members are an Administration concern.

The User architecture must distinguish:

- Supabase authentication identity
- Application user/member profile
- Organization membership
- Department association
- Team association
- Roles
- Permissions

User identity architecture must be designed before implementing the full
Users CRUD workflow.

The Organization remains the tenant boundary.

Status

Accepted

---

# 16. Roles and Permissions

Roles and permissions are part of the Administration security model.

The platform should support:

- reusable roles
- permissions
- organization-level access
- future role assignment to Users / Members

Authorization should eventually be enforced consistently at:

- UI
- service
- database / RLS

The exact production authorization model remains a future security milestone.

Status

Accepted

---

# 17. Visual Design System

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

# 18. Runtime Historical Integrity

Runtime execution must preserve the exact published Performance Sheet
version used by an existing Performance Instance.

A Runtime execution must not silently switch to a newer published version.

This preserves historical execution integrity.

Status

Accepted

---

# 19. Deployment Configuration

The platform uses:

- Vercel
- Supabase
- PostgreSQL

Supabase deployment configuration is supplied through environment
variables rather than hardcoded credentials.

Required public configuration includes:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Production deployment verification must include:

1. Vercel environment configuration.
2. Successful production deployment.
3. Supabase client initialization.
4. Application navigation verification.
5. Supabase-backed functionality verification.

Status

Accepted

---

# 20. Current Platform Position

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
Roles / Permissions

The Builder and Runtime architectures should not be rebuilt as part of the
current Administration completion phase.

---

# 21. Current Development Priority

The current development phase is:

Administration completion.

Completed Administration foundation:

- Organization
- Departments
- Teams

Next Administration capability:

- Users / Members

After Users / Members:

- Roles / Permissions
- Performance Sheet management
- Assignment management
- Additional Administration capabilities

The exact next milestone must always be confirmed against the latest
Waypoint and Platform Backlog before implementation begins.

Status

Accepted

---

# 22. Historical Documentation Rule

Historical Waypoints are permanent engineering records.

Do not rewrite old Waypoints to make them appear current.

When the project changes direction:

- preserve the historical Waypoint
- update current Platform Decisions if necessary
- update Platform Backlog
- create a new Waypoint at the next milestone

This preserves the actual history of the platform while keeping current
development instructions accurate.