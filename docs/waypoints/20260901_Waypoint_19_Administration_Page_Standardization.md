CascadEffects Performance Platform

Waypoint 19 — Administration Page Architecture Standardization

Date: 2026-09-01

Milestone Status: COMPLETE — Administration Page Structure / Navigation Standardization

Overview

This milestone continued Administration completion by standardizing the route/component
structure and shared page-header behavior for Organization and Objectives.

The implementation preserves the existing Administration functionality and keeps
Administration separate from Builder definition editing.

Organization and Objectives now follow the thin-route-wrapper pattern where the
route delegates to a component under src/components/admin/.

Objectives was also reviewed against the current product and architecture documents.
It is intentionally an Administration visibility/entry page for Performance Sheet
Objectives. Objective definition and editing remain owned by Builder.

Completed Work

1. Organization Page Structure

Organization page implementation was moved into:

src/components/admin/organization/organizationpage.tsx

The route:

src/app/admin/organization/page.tsx

was reduced to a thin wrapper.

The existing Organization functionality was preserved.

2. Organization Shared Header

Organization now uses the shared:

AdminPageHeader

The existing Back to Administration action remains available through the shared
header.

Existing Organization controls and save functionality were preserved.

3. Objectives Component Structure

Created:

src/components/admin/objectives/objectivespage.tsx

The existing Objectives page implementation was moved into the new component
location.

The route is intended to delegate to this component through:

src/app/admin/objectives/page.tsx

4. Objectives Shared Header

Objectives now uses the shared:

AdminPageHeader

The existing Builder navigation actions remain part of the page.

No separate Objective CRUD system was introduced.

5. Objectives Product / Architecture Clarification

Objectives Administration is intentionally a visibility and navigation layer.

Builder remains the authoritative definition engine for:

Objectives

Key Results

Initiatives

Administration must not create a second source of truth or duplicate Builder
editing functionality.

Performance Sheets and their Objectives are therefore viewed from Administration
and opened in Builder when editing is required.

6. Authorization Model Clarification

The platform authority model was explicitly reaffirmed:

Organization Admin:

administers resources belonging to their own Organization

cannot administer resources belonging to another Organization

Platform Super Admin:

operates at platform level

can administer organizations on their behalf

can administer resources across organizations

does not require Organization Membership in every Organization being administered

This distinction must be enforced through the authorization architecture and not
merely through UI visibility.

Architecture Decisions

Thin Route Wrapper

Administration routes should delegate to reusable page components under
src/components/admin/.

Shared Administration Header

Administration pages should use the shared AdminPageHeader for consistent page
titles, descriptions, and navigation while preserving page-specific actions.

Builder Owns Definitions

Objectives, Key Results, and Initiatives remain Builder-owned definitions.

Administration provides visibility and entry points rather than duplicating Builder
editing functionality.

Platform vs Organization Authority

Platform Super Admin authority remains separate from Organization Roles.

Organization Admin authority remains organization-scoped.

Super Admin authority may operate across organization boundaries.

Tenant Isolation

Organization-owned resources must remain tenant-scoped for Organization Admins.

Production authorization and RLS remain required to enforce this boundary
comprehensively.

Files Added

src/components/admin/objectives/objectivespage.tsx

Files Modified

src/app/admin/organization/page.tsx

src/components/admin/organization/organizationpage.tsx

src/app/admin/objectives/page.tsx

Files Removed

None.

Database Changes

None.

This milestone contains no database schema or migration changes.

Documentation Updated

This Waypoint records the current Administration page-structure checkpoint.

No historical Waypoints are modified.

Current Platform Decisions and Platform Backlog remain authoritative for the next
milestone.

Verification

TypeScript

Command:

npx tsc --noEmit --pretty false

Result:

PASS

Browser Verification

Organization page was manually verified after the structural change.

Verified:

Organization title and description

Back to Administration

Existing Organization sections

Existing Save Changes workflow

Result:

PASS

Objectives architecture was reviewed and confirmed against the current product and
platform documentation.

Technical Debt / Outstanding Work

Production authorization remains outstanding.

Production Row Level Security remains outstanding.

Complete authorization enforcement remains outstanding across:

UI

server services

API routes

database / RLS

Platform Administration / Super Admin management UI remains future work.

Runtime security boundaries remain outstanding.

Assignment Subject Validation remains outstanding.

Performance Instance Relationship Integrity remains outstanding.

Next Session

Resume from Waypoint 19.

Before implementation:

Review this Waypoint.

Review docs/03_Product_North_Star.md.

Review docs/01_Platform_Decisions.md.

Review docs/02_Platform_Backlog.md.

Confirm the next Administration or security milestone.

Verify Git working-tree state.

The next larger architectural focus should be selected from the current documented
roadmap.

Production tenant authorization and production RLS remain high-priority security
work.

Do not rebuild Builder or Runtime foundations.

Milestone Status

Administration:

IN PROGRESS

Organization:

COMPLETE

Objectives:

ADMINISTRATION VISIBILITY / BUILDER ENTRY ESTABLISHED

Departments:

COMPLETE

Teams:

COMPLETE

Users / Members:

COMPLETE

Roles & Permissions:

FUNCTIONAL FOUNDATION COMPLETE

Platform Authority:

FOUNDATION COMPLETE

Performance Sheet Management:

COMPLETE

Assignment Management:

COMPLETE

Production Authorization / RLS:

OUTSTANDING

Builder:

ESTABLISHED

Runtime:

ESTABLISHED