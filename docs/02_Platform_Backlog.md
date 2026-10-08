# CascadEffects Performance Platform

# Platform Backlog

**Document Status:** CURRENT

**Last Updated:** 2026-09-30

This document tracks intentionally deferred architecture, product
capabilities, migration work, and future platform work.

Completed work belongs in Waypoints.

The latest Waypoint and current Platform Decisions determine the current
project state.

---

# Current Development Phase

## Runtime Operational Tabs and Custom Tables

**Status**

NEXT IMPLEMENTATION MILESTONE

The Member OKR foundation and Runtime performance foundation are established
and verified.

The next implementation milestone is to extend Runtime with configurable
organization-specific operational tabs powered by a reusable Custom Tables
capability.

Initial operational tabs:

- Agenda
- VA List
- Recruitment
- Client Performance

Custom Tables will be managed from the Performance area and will provide the
configuration mechanism for these Runtime operational experiences.

This milestone does not create a second performance engine.

The platform continues to preserve:

- Member OKRs as the employee performance source of truth
- Runtime as the time-bound execution and history layer
- Builder as the reusable presentation/composition layer
- monthly performance as the product cadence
- organization-scoped data ownership

The OKR Template Library remains a planned product capability and is not
removed from the roadmap. It is simply not the immediate implementation
milestone.

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

# Current Project Position

Builder

ESTABLISHED

Runtime Execution Foundation

ESTABLISHED / VERIFIED

Runtime Operational Tabs and Custom Tables

NEXT IMPLEMENTATION MILESTONE

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

Production Authorization / RLS

OUTSTANDING

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

# Next Development Session

Start from the latest Waypoint.

Review:

- latest Waypoint
- Platform Decisions
- Platform Backlog
- Product North Star

Confirm the Runtime Operational Tabs and Custom Tables milestone.

Then:

1. Review the approved Runtime operational tab architecture.
2. Review the Custom Tables data model and organization ownership.
3. Identify the minimum reusable database structure.
4. Implement Custom Tables configuration in the Performance area.
5. Implement Runtime operational tab navigation.
6. Implement Agenda monthly persistence.
7. Implement VA List monthly editing and persistence.
8. Implement Recruitment monthly editing and persistence.
9. Implement Client Performance with independently named tables.
10. Verify monthly historical retrieval.
11. Confirm existing member Runtime tabs remain unchanged.
12. Compile.
13. Browser / functional test.
14. Commit.
15. Update documentation.
16. Create the next Waypoint.

Do not begin the next feature until the current milestone is documented and
verified.

