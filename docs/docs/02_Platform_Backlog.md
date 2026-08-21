# CascadEffects Performance Platform

# Platform Backlog

**Document Status:** CURRENT

**Last Updated:** 2026-08-22

This document tracks intentionally deferred architecture, product
capabilities, and future platform work.

It is not a historical development log.

Completed work should be recorded in Waypoints.

The latest Waypoint and current Platform Decisions take precedence when
determining the current project state.

---

# 1. Current Development Phase

## Administration Completion

Status

IN PROGRESS

The platform is currently completing the Administration management layer.

Completed:

- Organization

- Departments

- Teams

- Users / Members — Invitation Foundation

- Roles & Permissions — Role Foundation

Current Administration focus:

- Complete Roles & Permissions

Following capabilities:

- Performance Sheet Management

- Assignment Management

- Additional Administration capabilities

The Builder and Runtime foundations already exist and should not be rebuilt
during this Administration phase.

---

# 2. Administration Roadmap

## Organization

Status

COMPLETE

---

## Departments

Status

COMPLETE

---

## Teams

Status

COMPLETE

---

## Users / Members

Status

INVITATION FOUNDATION COMPLETE

The Users / Members invitation foundation establishes:

- application user profile

- organization membership

- Department association

- Team association

- active / inactive state

- Supabase Auth relationship

Completed:

- User database foundation

- Organization Membership database foundation

- User domain model

- Organization Membership domain model

- User Management read model

- User service

- Users Administration page

- Invite User workflow

- Department → Team filtering

- Server-side Supabase Admin workflow

- Auth invitation

- Organization Membership creation

Remaining Users work:

- User Edit workflow

- User Deactivate workflow

- Production tenant authorization

- Production Row Level Security

---

## Roles & Permissions

Status

ROLE FOUNDATION COMPLETE

The Roles & Permissions foundation establishes:

- reusable global Permissions

- organization-scoped Roles

- Role Permissions

- Membership Roles

- organization-aware database integrity

- Role domain model

- Permission domain model

- Role Permission domain model

- Membership Role domain model

- Role service

- Permission service

- Role Permission service

- Membership Role service

- Roles Administration UI

Completed:

- Permission database foundation

- Permission catalog

- Role database foundation

- Role Permission database foundation

- Membership Role database foundation

- organization-aware integrity constraints

- Role CRUD

- TypeScript verification

- real database CRUD verification

Remaining Roles & Permissions work:

- Permission assignment

- Permission removal

- Membership Role assignment

- Membership Role removal

- User / Membership Role Administration workflow

- Production tenant authorization

- Production Row Level Security

- Full authorization enforcement across UI, services, APIs, and database/RLS

---

## Performance Sheet Management

Status

FUTURE / NEXT ADMIN PHASE

Administration should eventually provide a true Performance Sheet
management experience.

Expected capabilities include:

- Performance Sheet listing

- create Performance Sheet

- select Performance Sheet

- open Builder

- draft management

- published version management

- revision management

- archive

- duplicate

- search

- filtering

- assignment

Administration should manage the Performance Sheet lifecycle entry point.

Builder remains responsible for Performance Sheet definition and editing.

---

## Assignment Management

Status

FUTURE

Assignment management should connect published Performance Sheet versions
to runtime subjects.

Potential assignment subjects include:

- individual

- team

- department

- organization

Assignment subject validation remains an architectural requirement.

---

# 3. Builder

## Builder Definition Lifecycle

Status

ESTABLISHED

The Builder already supports the core definition lifecycle.

The Builder should not be rebuilt as part of Administration development.

The established lifecycle is:

Draft

    ↓

Validate

    ↓

Publish

    ↓

Published Version

    ↓

Create Revision

    ↓

New Draft

Published definitions remain immutable.

---

## Multiple Performance Sheet Definitions

Status

DEFERRED

Future organizations will manage multiple logical Performance Sheets.

The platform should support:

- sheet_key

- Performance Sheet Library

- multiple definitions

- version selection

- organization-scoped definitions

Runtime assignments should continue referencing the exact published version.

---

# 4. Runtime

## Runtime Execution Foundation

Status

ESTABLISHED

The Runtime architecture has already established:

- Performance Instance resolution

- Assignment resolution

- exact published Performance Sheet resolution

- Key Result Progress

- Current Value

- Confidence

- employee comments

- manager comments

- aggregate recalculation

- Runtime lifecycle state

Builder and Runtime remain separate architectural layers.

---

## Runtime Workspace Enhancements

Status

FUTURE

The Runtime execution foundation is established.

Future enhancements may include:

- richer Runtime workspace presentation

- weighted aggregation

- additional KPI visualization

- historical updates

- expanded workflow controls

- additional reporting context

- improved member experience

Runtime Workspace is NOT the current milestone.

Administration completion takes priority.

---

# 5. Architecture

## Organization Table Naming

Current

organization

Future

organizations

Reason

Standardize naming across database tables.

Priority

Medium

Status

Deferred

---

## Organization Domain Model

Current

src/lib/types/organization.ts

Future

src/lib/domain/organization.ts

Introduce persistence row types separately where appropriate.

Reason

Separate persistence models from domain models.

Priority

Medium

Status

Deferred

---

## Repository Row Naming

Rename:

PerformanceSheetRecord

to:

PerformanceSheetRow

Reason

Improve naming consistency.

Priority

Low

Status

Deferred

---

## Repository Mappers

Create:

src/lib/supabase/mappers/

Reason

Separate persistence mapping from repository logic.

Priority

Medium

Status

Deferred

---

# 6. Security

## Tenant Authorization Hardening

Status

DEFERRED

Production authorization must enforce Organization boundaries across
repositories and services.

Priority

High

---

## Production Row Level Security

Status

DEFERRED

Implement and validate production-ready Supabase RLS policies.

Priority

High

---

## Runtime Security Boundaries

Status

DEFERRED

Establish appropriate server-side service boundaries and authorization
checks for production Runtime operations.

Priority

High

---

## User / Role Authorization

Status

DEFERRED

After Users / Members and Roles / Permissions are established, implement
consistent authorization across:

- UI

- server services

- database / RLS

Priority

High

---

# 7. Runtime Data Architecture

## Assignment Subject Validation

Status

DEFERRED

Validate that subjectId belongs to the entity represented by assignmentType.

Reason

Prevent invalid polymorphic assignment references.

Priority

Medium

---

## Performance Instance Relationship Integrity

Status

DEFERRED

Enforce consistency between Performance Instance and Assignment.

Reason

Prevent duplicated Runtime references from becoming inconsistent.

Priority

Medium

---

## Historical KPI Updates

Status

DEFERRED

Create a durable time-series KPI Update model.

The model should preserve:

- Performance Instance

- Key Result

- measured value

- calculated score

- timestamp

- reporting context

- update source where appropriate

Reason

Support historical reporting, trend analysis, auditability, and future
predictive analytics.

Priority

High

---

## KPI Calculation Engine

Status

DEFERRED

Create a generalized KPI calculation engine supporting future KPI types such
as:

- numeric

- currency

- percentage

- time-bound

- reverse scoring

- shared/team metrics

- department metrics

- organization metrics

Reason

Separate reusable KPI definitions from Runtime calculations.

Priority

High

---

## Weighted Aggregation

Status

DEFERRED

Formalize weighted aggregation at:

- Key Result level

- Objective level

- Performance Instance level

Reason

Runtime aggregation should eventually honor Performance Sheet weights.

Priority

High

---

# 8. Runtime Workflow

## Runtime Lifecycle

Status

ESTABLISHED / FUTURE ENHANCEMENTS

The core Runtime lifecycle has already been implemented and verified.

Future work may refine transition rules and authorization.

Potential lifecycle:

In Progress

    ↓

Submitted

    ↓

Approved

    ↓

Completed

---

# 9. Historical Reporting

## Historical Performance Reporting

Status

FUTURE

Support:

- previous reporting periods

- performance trends

- team comparisons

- department comparisons

- organizational comparisons

- historical performance records

Priority

High

---

# 10. Dashboards

## Dynamic Dashboard System

Status

FUTURE

Dashboards should be generated from platform data rather than custom-built
for individual organizations.

Potential dashboard levels:

- individual

- team

- department

- executive

- organization

---

# 11. AI

## AI-Assisted Planning

Status

FUTURE

Potential capabilities:

- objective generation

- Key Result recommendations

- KPI suggestions

- goal quality analysis

- initiative recommendations

- performance insights

- strategic planning assistance

- automated reporting summaries

---

## Predictive Analytics

Status

FUTURE

Potential capabilities:

- performance trend analysis

- risk detection

- forecasting

- organizational performance insights

---

# 12. Visual Design System

## CascadEffects Design System

Status

FUTURE

Create centralized design tokens for:

- Deep Navy

- Coral

- White

- light gray surfaces

- typography

- buttons

- forms

- cards

- dialogs

- tables

- navigation

- status indicators

The design system should be reusable across:

- Administration

- Builder

- Runtime

- Dashboards

- Reports

Organization-specific branding should eventually be configurable through
Administration.

---

# 13. Deployment / Environment Configuration

## Environment Validation

Status

FUTURE

Future deployment hardening should include:

- environment variable validation

- missing environment detection

- production health checks

- Supabase connectivity verification

- clear deployment diagnostics

- separation of public configuration from server-only secrets

---

# 14. Current Milestone Rule

The current milestone must always be determined from:

1. Latest Waypoint

2. Platform Decisions

3. Platform Backlog

Historical Waypoints must not be treated as current task lists.

If an older document says something is "Next Milestone" but a newer Waypoint
shows that work has already progressed beyond it, the older statement is
historical and must not redirect development.

---

# 15. Documentation Maintenance

When a major milestone is completed:

1. Update the relevant Platform Decisions if architecture changed.

2. Update this Platform Backlog if roadmap status changed.

3. Commit the implementation.

4. Push to GitHub.

5. Create a new Waypoint.

6. Confirm the new Waypoint is the current project checkpoint.

Do not modify historical Waypoints merely to make them current.

---

# 16. Current Project Position

Builder

COMPLETE / ESTABLISHED

Runtime Execution Foundation

COMPLETE / ESTABLISHED

Administration

IN PROGRESS

Organization

COMPLETE

Departments

COMPLETE

Teams

COMPLETE

Users / Members

INVITATION FOUNDATION COMPLETE

Roles & Permissions

ROLE FOUNDATION COMPLETE

Performance Sheet Management

FUTURE ADMIN PHASE

Assignment Management

FUTURE

Dashboards

FUTURE

Reports

FUTURE

AI

FUTURE

Production Authorization / RLS

OUTSTANDING

---

# 17. Next Development Session

Start from the latest Waypoint.

Review:

1. Latest Waypoint

2. Platform Decisions

3. Platform Backlog

Confirm:

Roles & Permissions

as the current Administration milestone.

The Roles Foundation is complete.

The next implementation should continue incrementally with:

- Permission assignment

- Permission removal

- Membership Role assignment

- Membership Role removal

- Roles & Permissions verification

Then evaluate the remaining Users / Members work:

- User Edit

- User Deactivate

The exact ordering of remaining Administration capabilities must be confirmed
from the latest Waypoint, Platform Decisions, and Platform Backlog before
implementation.

Production tenant authorization and Row Level Security remain separate
security milestones and should not be treated as complete merely because the
Roles and Permissions data foundation exists.

Continue using the engineering workflow:

Review Waypoint

    ↓

Review Decisions

    ↓

Review Backlog

    ↓

Confirm Milestone

    ↓

Build

    ↓

Compile

    ↓

Commit

    ↓

Update Documentation

    ↓

Create Waypoint

The repository remains the authoritative engineering record.