Waypoint 22 — Organization Admin Workspace Foundation

Date: 2026-09-05
Milestone: Organization Admin Workspace Foundation
Status: COMPLETE
Previous Waypoint: Waypoint 21 — Organization Management Create, Edit & Delete Verification

1. Overview

This waypoint records completion of the Organization Admin Workspace Foundation.

The platform now provides a distinct organization-scoped administrative workspace separate from the Platform Super Admin Administration experience.

The Organization Admin workspace establishes the intended second administrative entry context without creating a second Builder or Runtime system.

The intended flows are:

Platform Super Admin → Administration → Selected Organization → Organization Workspace

and:

Organization Admin → Organization Workspace → Authorized Organization

The current implementation establishes the Organization Admin workspace navigation and organization-scoped administrative page foundation.

Production authorization and Row Level Security remain separate future security milestones.

2. Completed Work

Organization Admin Workspace

Created the /organization workspace route with organization-scoped navigation for:

Overview

Organization

Setup

Performance Sheets

Assignments

Departments

Teams

Users

Roles & Permissions

Dashboards

Reports

Settings

AI

Areas without complete underlying platform functionality remain explicitly presented as coming-soon or placeholder experiences.

Organization Context

Organization Admin pages operate using the selected organization context currently supplied to the workspace.

The Organization Admin workspace does not provide a tenant-switching Organization selector.

This preserves the architectural distinction between Platform Super Admin and Organization Admin.

The current client/query organization context is a navigation context and is not proof of authorization.

Production authorization will enforce the actual organization boundary in a future security milestone.

Organization Management

Added the Organization Admin organization page for organization-scoped organization configuration.

It does not expose Platform Super Admin operations such as:

Create Organization

Delete Organization

Cross-organization selection

Departments

Added the Organization Admin Departments page using the existing Department service and domain model.

No new Department source of truth was introduced.

Teams

Added the Organization Admin Teams page using the existing Team service and domain model.

Department selection remains organization-aware.

No duplicate Team model or service was introduced.

Users / Members

Added the Organization Admin Users page using the existing user and membership architecture.

Existing workflows remain responsible for:

User profile information

Department association

Team association

Active / inactive state

Organization membership

Membership roles

No duplicate User or Membership source of truth was introduced.

Roles & Permissions

Added the Organization Admin Roles & Permissions workspace entry.

The current implementation intentionally establishes the workspace and planned authorization model without claiming that production authorization enforcement is complete.

Performance Sheets

Added the Organization Admin Performance Sheets page.

It uses the existing Performance Sheet repository and shared Builder entry point.

The Organization Admin workspace does not create a second Performance Sheet definition engine.

The Builder remains the single authoritative Performance Sheet construction engine.

Shared Administration Header

Standardized the shared administration page header so that:

/admin/* represents the Platform Super Admin Administration experience.

/organization/* represents the Organization Admin workspace.

Organization Admin pages no longer display the cross-organization selector or “Back to Administration” navigation.

Super Admin → Organization Workspace Entry

Added an explicit Open Organization Workspace action to the Super Admin Organization Administration page.

The intended Super Admin flow is:

Administration → Organization → Select Organization → Open Organization Workspace

The selected organization context is preserved when entering the workspace.

3. Architecture Decisions

One Builder, Two Administrative Entry Contexts

The platform continues to use one shared Builder.

The Organization Admin workspace does not introduce a second Builder.

The two entry contexts are:

Platform Super Admin → Administration → Selected Organization → Performance Sheets → Builder

and:

Organization Admin → Organization Workspace → Authorized Organization → Performance Sheets → Builder

This preserves the Builder / Runtime boundary.

Organization Admin Tenant Context

Organization Admin users operate within one authorized Organization.

They do not receive a tenant-switching Organization selector.

The current implementation establishes this as the UX contract.

Production authorization remains responsible for enforcing the actual tenant boundary.

Administration vs Organization Workspace

Platform Super Admin Administration remains the platform-level management surface.

Organization Workspace is the organization-scoped administrative surface.

The two experiences share reusable components and services where appropriate but do not represent the same authorization role.

No Duplicate Sources of Truth

The Organization Admin workspace does not introduce duplicate models for:

Users

Departments

Teams

Roles

Permissions

Performance Sheets

Objectives

Key Results

Initiatives

Existing domain models, services, repositories, Builder definitions, and Runtime structures remain authoritative.

4. Files Added

src/app/organization/layout.tsx
src/app/organization/page.tsx
src/app/organization/departments/page.tsx
src/app/organization/organization/page.tsx
src/app/organization/performancesheets/page.tsx
src/app/organization/roles/page.tsx
src/app/organization/teams/page.tsx
src/app/organization/users/page.tsx

5. Files Modified

src/app/page.tsx
src/components/admin/organization/organizationpage.tsx
src/components/admin/shared/adminpageheader.tsx

6. Files Removed

None.

7. Database Changes

No database migrations were created for this milestone.

The Organization Admin Workspace Foundation reuses the existing organization, department, team, user, membership, role, permission, and Performance Sheet architecture.

No duplicate database source of truth was introduced.

8. Documentation Updated

This waypoint establishes the completed Organization Admin Workspace Foundation checkpoint.

The Platform Backlog should reflect that:

Administration Organization Context / Cascading Selection is established.

Organization Admin Workspace Foundation is established.

Shared Administration header standardization is complete.

Super Admin → Organization Workspace entry is established.

Historical Waypoints remain unchanged.

9. Technical Debt / Deferred Work

Production Authorization

The current Organization Admin workspace must not be considered a production authorization boundary.

Future authorization work must enforce:

Authenticated identity

Organization membership

Organization role

Permissions

Requested Organization context

Resource ownership

Server-side authorization

PostgreSQL Row Level Security where appropriate

Organization Admin Context

The current workspace uses organization context for navigation and data loading.

Future production authorization must derive and validate Organization Admin scope from authenticated membership rather than trusting a client-supplied organization identifier.

Placeholder Administration Areas

Dashboards, Reports, Settings, AI, and other areas without complete underlying platform capabilities remain intentionally limited.

They should not be expanded into independent business engines before the underlying platform architecture is established.

10. Verification

Git

Commit:

9407ec7

Commit message:

Complete organization workspace foundation

Working tree after commit:

clean

Compilation

Command:

npm run build

Result:

PASSED

Staged Change Verification

Command:

git diff --cached --check

Result:

PASSED

No trailing whitespace errors remained before commit.

Browser / Functional Verification

The Organization Admin workspace was functionally verified for the implemented areas, including:

Organization workspace navigation

Organization context

Organization page

Departments

Teams

Users

Roles & Permissions foundation

Performance Sheets

Shared workspace header behavior

Super Admin → Organization Workspace navigation

The Super Admin Organization page successfully exposes Open Organization Workspace and preserves the selected organization context.

11. Milestone Status

Organization Admin Workspace Foundation

COMPLETE

The organization-scoped administrative workspace foundation is established.

Administration

ACTIVE DEVELOPMENT

The core Administration management and Organization Workspace foundations are established.

Remaining platform hardening includes:

Production tenant authorization

Production Row Level Security

Runtime security boundaries

Assignment subject validation

Performance Instance relationship integrity

Historical KPI updates

Generalized KPI calculation engine

Weighted aggregation

Historical performance reporting

Future Dashboard / Report / AI capabilities

12. Next Session

Resume from this Waypoint.

First:

Review this Waypoint.

Review docs/01_Platform_Decisions.md.

Review docs/02_Platform_Backlog.md.

Confirm the next milestone.

Inspect the existing Performance Sheet / Assignment / Runtime architecture before implementing new functionality.

Do not rebuild Builder.

Do not rebuild Runtime.

Do not introduce duplicate Objective, Key Result, Initiative, Performance Sheet, or Runtime sources of truth.

The next feature should be selected based on platform value, architectural dependency, scalability, and the Product North Star.

13. Checkpoint Summary

Area

Status

Organization Admin Workspace Foundation

COMPLETE

Administration Organization Context

ESTABLISHED

Organization Admin Fixed Organization Context

ESTABLISHED

One Builder / Two Administrative Entry Contexts

ESTABLISHED

Super Admin → Organization Workspace Entry

ESTABLISHED

Production Authorization / RLS

DEFERRED

Historical KPI Updates

DEFERRED

Generalized KPI Calculation Engine

DEFERRED

Historical Reporting

DEFERRED