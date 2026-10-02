# CascadEffects Performance Platform

# Waypoint 29 — Member OKR Ownership, Assignment Retirement & Performance Composition Architecture

**Date:** 2026-09-24  
**Status:** ARCHITECTURE / PRODUCT MODEL RECONCILIATION CHECKPOINT  
**Previous Waypoint:** Waypoint 28 — Performance Builder Composition Direction & Member Product Model

---

# 1. Overview

Waypoint 28 established the direction that the Performance Builder should
become a composition layer rather than a second product factory.

Today that direction was reviewed against the current Platform Decisions,
Platform Backlog, Product North Star, and the previous Waypoint.

The architecture has now been clarified further:

> **Organization Membership determines performance participation. Member OKRs
> own employee performance content. The Performance Builder owns reusable
> presentation/composition. Runtime owns time-bound execution and history.**

This is a refinement of the Builder composition direction from Waypoint 28,
but it also changes an important part of the previously established
Assignment-based model.

The long-term architecture is now:

```text
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
```

and separately:

```text
Performance Sheet
        ↓
Performance Builder
        ↓
Published Presentation Configuration
        ↓
Member Performance Experience
```

The two are composed at runtime.

---

# 2. Relationship to Waypoint 28

Waypoint 28 correctly established:

- Builder as composition/orchestration layer
- reusable performance product family
- Member-oriented navigation
- Users → Create OKRs as an intended entry point
- reusable Performance Header
- no hardcoded members
- no second Builder
- no second Runtime
- no second Member performance engine

However, Waypoint 28 still preserved the older:

```text
Performance Sheet
↓
Assignment
↓
Performance Instance
```

architecture and explicitly deferred creation of a new Member OKR database
model.

The product discussion and architecture review on 2026-09-24 clarified that
this remaining Assignment dependency conflicts with the desired product model.

Therefore this Waypoint supersedes that portion of Waypoint 28.

Waypoint 28 remains a historical record and is not rewritten.

---

# 3. New Core Product Model

The authoritative employee performance relationship is now:

```text
Organization
        ↓
Organization Membership
        ↓
Member
        ↓
Member Objectives
        ↓
Member Key Results
        ↓
Member Initiatives
```

Monthly execution is separate:

```text
Member OKRs
        ↓
Monthly Performance Execution
        ↓
Historical Performance
```

Presentation is separate:

```text
Performance Sheet
        ↓
Builder
        ↓
Published Version
        ↓
Presentation / Composition
```

The member performance experience is therefore composed from:

```text
Member OKRs
+
Published Performance Sheet Configuration
+
Runtime Execution Context
```

---

# 4. Member OKRs Become the Employee Performance Source of Truth

Member-specific:

- Objectives
- Key Results
- Initiatives
- performance values

belong to the Member OKR domain.

The Member OKR domain must be the source consumed by:

- Member OKR management
- member performance pages
- Runtime
- monthly history
- dashboards
- tables
- charts
- reports
- future AI analysis

No secondary product may create a competing employee performance source of
truth.

---

# 5. Organization Membership Automatically Includes Members

An active Organization Membership establishes the member's participation in
the organization's performance environment.

There is no longer a product requirement to manually assign a member to a
Performance Sheet in order for that member to participate.

The intended relationship is:

```text
Organization Membership
        ↓
Member
        ↓
Member OKRs
```

Member navigation should therefore be generated automatically from
organization membership.

Example:

```text
Main | Mario | Mari | Emily | Jordyn
```

The actual names/contexts come from organization data.

Nothing is hardcoded.

---

# 6. Assignment Architecture Is Retiring

Assignment is no longer the long-term product mechanism for performance
participation.

The old conceptual model:

```text
Member
↓
Assignment
↓
Performance Instance
```

is being retired.

Assignments may remain temporarily for:

- historical data
- migration compatibility
- existing Runtime records
- controlled transition

New Member OKR ownership must not depend on Assignment.

The platform must migrate Runtime toward direct member identity.

Target Runtime identity:

```text
organization_id
+
member_id / membership identity
+
performance_month
```

The exact repository column names must follow the existing schema and
identity architecture.

---

# 7. Performance Builder Scope

The Performance Builder owns reusable presentation/composition.

Builder responsibilities include:

- Performance Header
- Member Navigation
- Layout
- Sections
- Fields
- Tables
- Charts
- Reports/display composition
- validation
- draft persistence
- publishing
- versioning
- revision creation

Builder does not own:

- employee Objectives
- employee Key Results
- employee Initiatives
- employee membership
- employee assignment

The Builder answers:

> How should the organization's performance experience be presented?

Member OKRs answer:

> What is this member's actual performance?

---

# 8. Performance Sheet Scope

A Performance Sheet remains a reusable organization-level presentation
definition.

It describes how the performance experience looks and behaves.

It does not determine whether a member participates.

Published versions remain immutable.

A change to a published Performance Sheet creates a new draft revision.

Historical Runtime records must preserve the exact published version used for
that historical execution.

---

# 9. Member OKR Persistence Direction

The target persistent model is:

```text
organization_memberships
        ↓
member_objectives
        ↓
member_key_results
        ↓
member_initiatives
```

The organization membership is the authoritative organization/member
relationship.

The initial implementation should avoid creating an unnecessary separate
Member OKR parent entity.

The model must use normalized IDs and preserve organization integrity.

The exact migration must be reviewed against the current Supabase schema
before application.

---

# 10. Runtime Direction

Runtime remains the time-bound execution layer.

Runtime owns:

- monthly execution state
- period-specific values
- scores
- comments
- lifecycle state
- aggregate state
- historical execution context

Runtime must not become the permanent source of employee OKRs.

The intended flow is:

```text
Member OKRs
        ↓
Monthly Snapshot / Execution
        ↓
Performance Instance
        ↓
Historical Performance
```

Existing snapshot tables may remain as historical Runtime records.

---

# 11. Historical Data Requirement

Existing Runtime history must not be destroyed merely because the Assignment
model is being retired.

The migration must preserve historical:

- Performance Instances
- Runtime Objectives
- Runtime Key Results
- Runtime Initiatives
- Key Result Progress
- KPI Updates
- comments
- scores
- performance month
- published Performance Sheet version

Historical records must remain readable after migration.

---

# 12. Builder Validation Direction

Waypoint 28 identified two Builder implementation issues that remain relevant:

## Duplicate Dashboard Navigation Key

The current Builder navigation must be inspected for duplicate `dashboard`
entries.

The issue must be fixed in the underlying navigation/document state.

React array indexes must not be used merely to hide duplicate logical keys.

Relevant file identified by Waypoint 28:

```text
src/components/builder/navigation/navigationtabsmanager.tsx
```

## Organization Validation Redundancy

The Builder is opened within an already-known Organization context.

Organization identity should not be duplicated as a competing source of
truth merely to satisfy Builder validation.

The current Builder document and validation implementation must be inspected
before modifying the contract.

Relevant validation file identified by Waypoint 28:

```text
src/lib/builder/buildervalidation.ts
```

---

# 13. Display-Only Weight Rule

The product rule from Waypoint 28 remains active:

```text
Weight > 0%
    = scoring / weighted item

Weight = 0%
    = display-only item
    = does not contribute to scoring
```

This applies to Key Results.

An Objective with 0% may also be display-only where consistent with final
validation rules.

Weighted scoring items must continue to satisfy appropriate aggregation
rules.

Example:

```text
KR A     50%
KR B     50%
KR C      0%   ← Display Only
----------------
          100%
```

This rule must be explicit in both Builder validation and UI language.

---

# 14. Administration Direction

Organization Administration remains the management layer for:

- organization
- departments
- teams
- users/members
- roles/permissions
- Performance Sheets
- Member OKRs
- dashboards
- reports
- settings
- AI configuration

Administration does not create a second performance engine.

The Users/Members experience should become the entry point for a member's
actual OKRs.

Intended journey:

```text
Organization Admin
        ↓
Users
        ↓
Select Member
        ↓
Create OKRs
        ↓
Member OKR Sheet
```

The exact UI implementation is the next product milestone.

---

# 15. Product Family

The performance product family remains:

1. Member OKR Sheets
2. Dashboards
3. Tables
4. Charts
5. Reports

The first product to operationalize through the new composition model is:

**Member OKR Sheets**

The Builder remains the common composition surface.

Other products should be developed as reusable product capabilities rather
than independent Builder implementations.

---

# 16. Architecture Guardrails

The following rules are now reinforced:

- Do not hardcode users.
- Do not hardcode member tabs.
- Do not hardcode organizations.
- Do not hardcode Objectives.
- Do not hardcode Key Results.
- Do not hardcode Initiatives.
- Do not create a second Builder.
- Do not create a second Runtime.
- Do not create a second Member performance engine.
- Do not duplicate Organization Membership.
- Do not create a second role system.
- Do not use Assignment as the long-term participation mechanism.
- Do not duplicate organization identity.
- Do not turn Builder into separate product engines.
- Preserve multi-tenant organization context.
- Preserve monthly performance cadence.
- Preserve published Performance Sheet versioning.
- Preserve historical Runtime records.
- Production authorization/RLS remains a separate security milestone.
- Live AI remains future/business approval required.

---

# 17. Database Migration Guardrail

No existing Assignment table or Runtime relationship should be deleted
immediately.

Migration order must be:

```text
1. Verify current schema
        ↓
2. Establish Member OKR persistence
        ↓
3. Build Member OKR services/repositories
        ↓
4. Connect Users → Member OKRs
        ↓
5. Connect Member Performance experience
        ↓
6. Migrate Runtime member identity
        ↓
7. Verify historical Runtime
        ↓
8. Remove active Assignment dependencies
        ↓
9. Remove obsolete Assignment UI
        ↓
10. Remove database Assignment structures only after verification
```

This prevents a premature schema deletion from damaging historical
performance data.

---

# 18. Current Milestone

**Milestone: Member OKR Performance Architecture**

Status:

**ARCHITECTURE DEFINED / IMPLEMENTATION NEXT**

The architecture documentation has been reconciled to establish:

- Member OKR ownership
- automatic participation through membership
- Assignment retirement
- Builder composition boundary
- Runtime execution boundary
- historical preservation requirements

No application implementation should be considered complete merely because
the documentation has been updated.

---

# 19. Next Session

The next development session should begin by reviewing:

1. Latest Waypoint
2. `docs/01_Platform_Decisions.md`
3. `docs/02_Platform_Backlog.md`
4. `docs/03_Product_North_Star.md`
5. Current Supabase migrations/schema
6. Current Member/User implementation
7. Current Builder implementation
8. Current Runtime/Assignment implementation

Then confirm the Member OKR Performance Architecture milestone.

First implementation sequence:

### A. Database

Audit the current schema and verify the proposed Member OKR tables and
relationships before applying migrations.

### B. Member OKR Domain

Implement:

- Member Objective persistence
- Member Key Result persistence
- Member Initiative persistence
- organization/member integrity

### C. Users → OKRs

Add the member OKR entry point from the Users/Members experience.

### D. Member Performance

Load the selected member's OKRs from the authoritative Member OKR source.

### E. Builder

Refine the Builder toward:

```text
Header
Member Navigation
Product Composition
```

without prematurely deleting required working functionality.

### F. Runtime

Migrate Runtime away from Assignment-based member resolution.

### G. Assignment Retirement

Remove Assignment dependencies only after Runtime and historical data have
been verified.

---

# 20. Verification Required

Before this milestone can be marked complete:

- compile successfully
- test real Organization Admin workflow
- create a real member OKR
- edit the member OKR
- load the member OKR from the member performance experience
- verify member navigation is data-driven
- verify no hardcoded prototype members remain
- verify 0% display-only behavior
- verify no duplicate `dashboard` navigation key
- verify Builder organization context is correct
- verify Performance Sheet publishing/versioning remains intact
- verify Runtime can preserve historical records
- verify Assignment is no longer required for new member participation
- review Git diff
- commit completed implementation
- update documentation
- create the next Waypoint

---

# 21. Files / Documentation

This architecture reconciliation produced proposed replacement documentation
files using the project's requested `_new` naming convention:

```text
docs/01_Platform_Decisions_new.md
docs/02_Platform_Backlog_new.md
docs/03_Product_North_Star_new.md
```

The original documentation files remain preserved until explicitly replaced
in the repository.

This Waypoint is the corresponding architecture checkpoint for the proposed
documentation changes.

---

# 22. Technical Debt

Known technical debt after this architecture decision includes:

- Assignment-based Runtime dependency
- existing Assignment UI
- existing Assignment database relationships
- Builder employee OKR ownership that must be relocated
- Builder navigation duplicate dashboard state
- Builder organization validation redundancy
- Member OKR persistence implementation
- Runtime migration
- production authorization/RLS
- historical KPI architecture
- generalized KPI calculation
- historical reporting

These items should be addressed incrementally rather than through a broad
rewrite.

---

# 23. Milestone Status

```text
Platform Foundation
    COMPLETE

Persistence Foundation
    COMPLETE

Administration Foundation
    COMPLETE

Organization Management
    COMPLETE

Users / Members
    COMPLETE

Roles & Permissions Foundation
    COMPLETE

Performance Sheet Management
    COMPLETE

Authentication + Role-Based Entry Foundation
    COMPLETE

Performance Builder Composition Direction
    ESTABLISHED

Member OKR Ownership Architecture
    ESTABLISHED TODAY

Assignment Retirement Direction
    ESTABLISHED TODAY

Member OKR Implementation
    NEXT

Runtime Assignment Migration
    NEXT / AFTER MEMBER OKR FOUNDATION

Production Authorization / RLS
    OUTSTANDING

Historical KPI Updates
    DEFERRED

Generalized KPI Calculation
    DEFERRED

Historical Reporting
    DEFERRED

Dynamic Dashboards
    FUTURE

Tables
    FUTURE

Charts
    FUTURE

Reports
    FUTURE

Live AI
    FUTURE / BUSINESS APPROVAL REQUIRED
```

---

# 24. Final Handoff

The architectural sentence for the next session is:

> **Organization membership makes a member part of the performance
> environment. Member OKRs own the employee's performance content. The
> Performance Builder composes how that content is presented. Runtime
> executes it monthly and preserves history.**

The next engineering work should implement this model incrementally without
destroying existing historical Runtime data.

The repository remains the authoritative engineering record.
