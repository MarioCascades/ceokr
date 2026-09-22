# CascadEffects Performance Platform

# Waypoint 24 — Runtime Product Experience Direction

**Date:** 2026-09-09

**Milestone:** Runtime / Member Workspace Foundation → Runtime Product Experience

**Status:** FOUNDATION COMPLETE — NEXT MILESTONE ESTABLISHED

**Previous Waypoint:** Waypoint 23 — Organization Admin Completion and Member Workspace Direction

---

# 1. Overview

This Waypoint establishes the current operational checkpoint for the CascadEffects Performance Platform.

The platform has progressed beyond the initial Administration and Member Workspace foundation work.

The major product foundations are now established:

- Administration
- Organization Management
- Organization Admin Workspace Foundation
- Builder
- Runtime Execution Foundation
- Monthly Performance Cadence
- Member Workspace Foundation
- Member Performance Navigation
- Runtime Objective / Key Result / Initiative editing foundation

The next milestone is:

> Runtime Product Experience

The purpose of the next milestone is not to create another performance engine.

The purpose is to turn the established Runtime architecture into the coherent day-to-day performance-management experience that members, managers, Organization Admins, and Platform Super Admins will use.

The platform continues to follow the permanent architecture:

```text
Administration
    ↓
Builder
    ↓
Published Performance Sheet Version
    ↓
Assignment
    ↓
Monthly Performance Instance
    ↓
Runtime Execution
    ↓
Member / Manager Performance Experience
    ↓
Historical Performance Data / Reporting
```

Mint remains a Version 1 operational and UX reference.

CascadEffects is not being rebuilt as Mint.

The platform must instead be capable of dynamically generating performance systems like Mint for many organizations.

---

# 2. Completed Work

## Administration Foundation

The Administration foundation is established for the current product scope.

Established areas include:

- Organization
- Departments
- Teams
- Users / Members
- Roles & Permissions foundation
- Platform Memberships
- Platform Super Admin authority foundation
- Performance Sheet Management
- Assignment Management
- Administration page structure
- shared Administration navigation
- Super Admin Organization context
- Organization → Department → Team cascading context
- Organization Admin fixed Organization context

The Organization Admin workspace is organization-scoped.

The Platform Super Admin may select an Organization context when operating on organization-owned resources.

The selected Organization is UI/query context and is not itself authorization.

Production authorization and RLS remain a dedicated future security milestone.

---

## Builder Foundation

Builder is established as the single reusable definition engine.

The Builder owns:

- Performance Sheets
- Performance Sheet Versions
- Objectives
- Key Results
- Initiatives
- validation
- draft editing
- publishing
- published version immutability
- Key Result measurement configuration
- Key Result scoring configuration

The Builder composition remains:

```text
Performance Sheet
    ↓
Performance Sheet Version
    ↓
Objective
    ↓
Key Result
    ↓
Initiative
```

Initiatives belong to exactly one Key Result.

The Runtime must not become a second Builder.

---

## Runtime Execution Foundation

Runtime is established as the authoritative execution layer for period-specific performance state.

The Runtime foundation includes:

- Assignment resolution
- published Performance Sheet resolution
- monthly Performance Instance resolution
- Runtime subject resolution
- Runtime Objectives
- Runtime Key Results
- Runtime Initiatives
- Key Result Progress
- current values
- scores
- employee comments
- manager comments
- lifecycle state
- Runtime Objective editing
- Runtime Key Result editing
- Runtime Initiative editing

Runtime editing operates on the working Performance Instance.

The Builder definition remains the reusable definition source.

---

## Monthly Performance Cadence

Monthly performance is an established product rule.

The platform does not require an administrator-managed arbitrary Reporting Period entity to make monthly performance work.

Performance Instances use their monthly execution timeframe.

Historical performance is expected to derive from dated Performance Instances and Runtime records.

A legacy `reporting_period_id` may remain temporarily in the existing database as migration / cleanup work.

That legacy persistence does not make Reporting Period a current product concept.

No new Assignment, Performance Instance, Runtime, Member Workspace, or Administration workflow should introduce Reporting Period selection or management.

---

## Member Workspace Foundation

The Member Workspace is established as a presentation, navigation, and workflow layer over Runtime.

The architecture is:

```text
Builder Definition
    ↓
Published Performance Sheet
    ↓
Assignment
    ↓
Performance Instance
    ↓
Runtime Execution
    ↓
Member Workspace
```

The Member Workspace does not create:

- a second performance engine
- a second Performance Instance model
- duplicate Objective definitions
- duplicate Key Result definitions
- duplicate Initiative definitions
- duplicate KPI calculation logic
- duplicate Assignment logic
- member-specific Performance Sheet definitions

The Member Workspace operates on the member's authorized Runtime state.

Members can work with their own performance state.

Production authorization will eventually enforce the member boundary server-side and through RLS where appropriate.

---

# 3. Member Performance Navigation

The Organization Admin navigation model is established as:

```text
Organization Workspace
    ↓
Users / Members
    ↓
Select Member
    ↓
Performance
    ↓
Month
    ↓
Member Runtime Performance
```

The Platform Super Admin model is:

```text
Administration
    ↓
Select Organization
    ↓
Organization Workspace
    ↓
Users / Members
    ↓
Select Member
    ↓
Performance
    ↓
Month
    ↓
Member Runtime Performance
```

The system uses the same Runtime implementation.

The actor and authorized subject determine access.

This is not impersonation.

The same performance execution architecture is reused for:

- member self-service
- Organization Admin operation
- Platform Super Admin operation
- future manager review

---

# 4. Runtime Monthly Navigation

The Member Workspace supports month-based navigation over available Performance Instances.

The month is an execution context, not an administrator-created Reporting Period.

The Runtime and Member Workspace must continue to use:

- Organization ID
- Subject / User ID
- Assignment
- Performance Instance
- `performance_month`

The database now enforces one Performance Instance per Assignment per month through the unique constraint:

`performance_instances_assignment_month_unique`

This prevents duplicate monthly Performance Instances for the same Assignment.

---

# 5. Runtime Editing Foundation

Runtime editing now supports the working Performance Instance rather than modifying Builder definitions.

The current runtime editing foundation includes:

## Objectives

Members / authorized actors can work with Runtime Objectives.

Runtime Objective persistence uses:

- Performance Instance
- source Objective ID when available
- runtime title
- runtime description
- runtime weight
- position

## Key Results

Members / authorized actors can work with Runtime Key Results.

Runtime Key Result persistence uses:

- Performance Instance
- Runtime Objective
- source Key Result ID when available
- title
- target
- weight
- measurement type
- scoring method
- position

## Initiatives

Each Runtime Initiative belongs to exactly one Runtime Key Result.

The current product rule remains:

> A Key Result may contain zero to three Initiatives.

Initiatives are normally collapsed and are revealed through the Runtime Initiative control.

---

# 6. Runtime Scoring Foundation

The current Runtime scoring model intentionally remains small.

Supported scoring methods include:

## Percentage of Target

```text
current value ÷ target value × 100
```

Scores are stored internally on a 0–100 scale.

## Percent Into Period

Expected progress is derived from the actual calendar day within the month.

For example:

```text
Target = 100

30-day month

Day 15

Expected progress ≈ 50%
```

If actual progress is 55:

```text
55 ÷ 50 × 100 = 110%
```

The generalized KPI Calculation Engine remains future platform work.

The platform should eventually support broader KPI types and calculation strategies through validated reusable configuration.

Arbitrary JavaScript or SQL formula execution must not be introduced as a shortcut.

---

# 7. Architecture Decisions

## One Runtime

There is one Runtime execution architecture.

The Member Workspace does not create a separate member performance engine.

## Builder / Runtime Boundary

Builder owns reusable definitions.

Runtime owns period-specific execution state.

Members edit their working Runtime Performance Instance rather than the reusable Builder definition.

## Monthly Cadence

Monthly performance is product behavior.

The platform must not reintroduce an administrator-managed Reporting Period entity solely to represent the monthly cadence.

## Actor vs Subject

The actor performing an operation and the subject whose performance is being viewed are separate concepts.

The same Runtime implementation may serve:

- Member
- Organization Admin
- Platform Super Admin
- future Manager

Authorization will determine which operations are allowed.

## Organization Context

Platform Super Admin:

```text
Platform
    ↓
Select Organization
    ↓
Operate on organization-owned resources
```

Organization Admin:

```text
Authorized Organization
    ↓
Operate within that organization
```

Member:

```text
Authorized Member
    ↓
Operate on own performance
```

UI context must never be treated as the authorization boundary.

---

# 8. Files Added

The Runtime / Member Workspace foundation introduced and modified Runtime and Member Workspace files during this development phase.

The exact working-tree file list must be confirmed from Git status before this Waypoint is committed.

This Waypoint therefore intentionally does not claim an exhaustive added-file list.

---

# 9. Files Modified

The Runtime / Member Workspace foundation includes changes across:

- Runtime route and server actions
- Runtime execution loading
- Runtime performance models
- Runtime Performance Sheet components
- Runtime Objective components
- Runtime Key Result components
- Runtime Initiative components
- Runtime persistence repositories
- Performance Instance initialization
- Assignment monthly execution services
- Member Workspace route
- Member Workspace loading
- Organization Users / Members navigation
- development workspace navigation

The exact final Git file list should be recorded from the working tree before commit.

---

# 10. Files Removed

No deliberate deletion of the Runtime or Builder architecture was part of this milestone.

No second performance engine was introduced.

No duplicate Builder definition system was introduced.

No new Reporting Period product layer was introduced.

---

# 11. Database Changes

The Runtime / Member Workspace foundation uses existing Runtime persistence structures.

A database constraint was added to enforce monthly uniqueness:

```text
performance_instances_assignment_month_unique
```

Constraint:

```text
UNIQUE (assignment_id, performance_month)
```

This establishes the database invariant:

> One Performance Instance per Assignment per month.

No new Reporting Period entity was introduced.

Legacy Reporting Period persistence may remain temporarily for migration / cleanup.

---

# 12. Documentation Updated

The current documentation direction is being updated to reflect the established product state.

The relevant current documents are:

```text
docs/00_Engineering_Process.md
docs/01_Platform_Decisions.md
docs/02_Platform_Backlog.md
docs/03_Product_North_Star.md
docs/waypoints/
```

Historical Waypoints remain historical and must not be rewritten merely to make them current.

---

# 13. Technical Debt / Deferred Work

The following remain intentionally deferred:

- production tenant authorization
- production Row Level Security
- complete server/API authorization enforcement
- Runtime security boundaries
- Assignment Subject Validation
- Performance Instance Relationship Integrity hardening
- Historical KPI Updates
- generalized KPI Calculation Engine
- weighted aggregation
- historical performance reporting
- advanced reporting
- dynamic dashboard generation
- AI-assisted planning
- predictive analytics
- organization-specific design system configuration

These are future architecture/product milestones.

They should not cause the Builder or Runtime foundation to be rebuilt.

---

# 14. Immediate Product Correctness Issue

The existing Organization Administration implementation contains historical Organization Profile support for Reporting Frequency.

Monthly performance is now the established product rule.

Therefore:

- Weekly is not a supported product cadence.
- Quarterly is not a supported product cadence.
- Reporting Frequency should not remain a configurable Organization setting if it controls performance cadence.
- The Organization Administration UI must be reconciled so it does not contradict the monthly-only product model.

This is a product correctness issue, not cosmetic technical debt.

It should be resolved in a targeted Administration cleanup rather than carried forward as an architectural exception.

Historical Waypoints that describe the earlier Reporting Frequency implementation remain unchanged.

---

# 15. Current Platform Position

The platform is now positioned as:

```text
Administration
    COMPLETE / ESTABLISHED

Organization Admin Workspace
    COMPLETE / ESTABLISHED

Builder
    COMPLETE / ESTABLISHED

Runtime Execution Foundation
    COMPLETE / ESTABLISHED

Member Workspace Foundation
    COMPLETE / ESTABLISHED

Monthly Performance Cadence
    ESTABLISHED PRODUCT RULE

Member Performance Navigation
    ESTABLISHED

Runtime Product Experience
    NEXT MILESTONE
```

The next milestone is not another foundation rebuild.

The next milestone is product experience completion.

---

# 16. Next Session

The next development session should begin with:

> Milestone: Runtime Product Experience

Startup sequence:

```text
Review this Waypoint
↓
Review Product North Star
↓
Review Platform Decisions
↓
Review Platform Backlog
↓
Confirm Runtime Product Experience milestone
↓
Inspect existing Runtime architecture
↓
Inspect existing Member Workspace architecture
↓
Inspect current Git working tree
↓
Build targeted product-experience increment
↓
Compile
↓
Browser / Functional Verification
↓
Review Diff
↓
Commit
↓
Update Documentation
↓
Create next Waypoint when the milestone is complete
```

The first implementation work should improve the existing Runtime / Member Workspace experience rather than introduce another architecture layer.

---

# 17. Resume Principle

When development resumes, remember:

> CascadEffects is building the engine that can generate performance-management systems like Mint.

The product architecture is:

```text
Configure
    ↓
Build
    ↓
Publish
    ↓
Assign
    ↓
Generate Monthly Performance Instance
    ↓
Execute in Runtime
    ↓
Members Update Performance
    ↓
Managers Review
    ↓
Historical Performance
```

The Runtime Product Experience is the next step toward making that architecture feel like a complete product.

Do not rebuild what is already established.

Do not create duplicate sources of truth.

Do not reintroduce Reporting Period administration.

Do not hardcode organization-specific performance systems.

Build the reusable product experience.

---

# 18. Milestone Status

Administration Foundation:

**COMPLETE / ESTABLISHED**

Organization Admin Workspace Foundation:

**COMPLETE / ESTABLISHED**

Builder:

**COMPLETE / ESTABLISHED**

Runtime Execution Foundation:

**COMPLETE / ESTABLISHED**

Member Workspace Foundation:

**COMPLETE / ESTABLISHED**

Monthly Performance Cadence:

**ESTABLISHED PRODUCT RULE**

Member Performance Navigation:

**ESTABLISHED**

Runtime Product Experience:

**NEXT MILESTONE**

Production Authorization / RLS:

**OUTSTANDING**

Runtime Security:

**DEFERRED**

Historical KPI Updates:

**DEFERRED**

KPI Calculation Engine:

**DEFERRED**

Weighted Aggregation:

**DEFERRED**

Historical Performance Reporting:

**DEFERRED**

AI:

**FUTURE**

---

# 19. Final Direction

The platform has moved from:

> building the foundations

to:

> making the Runtime experience a complete product.

The next milestone should demonstrate the central CascadEffects promise:

> Configure once. Publish once. Assign. Generate and operate monthly performance repeatedly across organizations.

The Builder defines the system.

The Assignment determines who receives it.

The Monthly Performance Instance creates the execution context.

Runtime owns the performance state.

The Member Workspace makes that Runtime experience usable.

That is the path forward.
