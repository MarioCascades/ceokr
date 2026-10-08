# CascadEffects Performance Platform

# Waypoint 30: Runtime Operational Tabs and Custom Tables Architecture

**Date:** 2026-10-09  
**Status:** ARCHITECTURE / NEXT IMPLEMENTATION MILESTONE  
**Previous Waypoint:** Waypoint 29: Member OKR Ownership, Assignment Retirement & Performance Composition Architecture

---

# 1. Overview

Waypoint 29 established the Member OKR ownership model and confirmed the
separation between Member OKRs, Builder composition, and Runtime execution.

The next product requirement is to extend the Runtime experience with
organization-specific operational tabs without creating additional performance
engines or competing sources of truth.

The approved direction is:

```text
Performance
↓
Custom Tables
↓
Runtime Operational Tabs
```

The initial Runtime operational tabs are:

- Agenda
- VA List
- Recruitment
- Client Performance

These capabilities are operational data experiences that operate alongside the
existing member performance Runtime experience.

---

# 2. Relationship to Waypoint 29

Waypoint 29 established:

- Member OKRs as the employee performance source of truth
- Runtime as the time-bound execution and history layer
- Builder as the reusable presentation/composition layer
- organization membership as the member participation relationship
- monthly performance as the product cadence
- historical Runtime preservation
- no second Builder
- no second Runtime
- no duplicate Member performance source

Waypoint 30 extends the Runtime product experience without changing those
architectural decisions.

The new operational capability is therefore additive rather than a replacement
for the existing architecture.

---

# 3. Runtime Operational Tabs

The Runtime experience will support additional organization-specific operational
tabs.

Initial tabs:

```text
Runtime
├── Existing Member Performance Tabs
├── Agenda
├── VA List
├── Recruitment
└── Client Performance
```

The existing member performance tabs remain unchanged unless a later milestone
explicitly requires a modification.

The new operational tabs are not additional scoring or performance engines.

---

# 4. Custom Tables

Custom Tables are the reusable configuration mechanism for organization-specific
operational data structures.

Custom Tables are managed from the Performance area.

The intended relationship is:

```text
Performance
↓
Custom Tables
↓
Runtime Operational Experience
```

Anything configured through Custom Tables becomes available to the appropriate
Runtime operational experience.

Custom Tables must be:

- organization-scoped
- data-driven
- reusable
- persistable
- compatible with monthly Runtime history
- independent of Member OKR ownership

The implementation should favor a reusable Custom Tables model rather than
creating separate feature-specific database structures for each operational
tab where a common model is practical.

---

# 5. Agenda

Agenda is a monthly Runtime operational notepad.

Requirements:

- content is associated with the applicable performance month
- content can be edited during that month
- prior months remain retrievable
- current-month content does not overwrite historical month content
- Agenda does not participate in performance scoring

Conceptually:

```text
Agenda
↓
Performance Month
↓
Monthly Operational Content
```

---

# 6. VA List

VA List is a monthly editable operational list.

The intended experience is similar to an Excel-like list while remaining a
data-driven Runtime experience.

Requirements:

- editable rows
- month-specific persistence
- organization-specific data
- historical month retrieval
- no impact on Member OKR scoring

---

# 7. Recruitment

Recruitment is a monthly editable operational list.

The intended experience is similar to an Excel-like list while remaining a
data-driven Runtime experience.

Requirements:

- editable rows
- month-specific persistence
- organization-specific data
- historical month retrieval
- no impact on Member OKR scoring

---

# 8. Client Performance

Client Performance is one Runtime tab that may contain several independently
named tables.

Example conceptual structure:

```text
Client Performance
├── Table A
├── Table B
├── Table C
└── Additional configured tables
```

The table names and structures must be data-driven rather than hardcoded.

Each table remains part of the organization's Custom Tables configuration.

---

# 9. Monthly History

The new operational experiences must respect the existing monthly Runtime
cadence.

Historical viewing must retrieve the operational data associated with the
selected performance month.

The system must not simply display the current month's operational values when
a historical month is selected.

This preserves the existing Runtime principle that time-bound execution and
historical state belong to the Runtime domain.

---

# 10. Builder / Runtime Boundary

The existing architecture remains:

```text
Builder
= reusable presentation and composition

Member OKRs
= employee performance source of truth

Runtime
= time-bound execution and historical state

Custom Tables
= configurable operational data structures used by Runtime
```

Custom Tables do not become a second Builder.

Custom Tables do not become a second Runtime.

Custom Tables do not become a second Member OKR domain.

The existing Performance Builder remains responsible for reusable presentation
and composition.

---

# 11. Source-of-Truth Rules

The following remain unchanged.

Member Objectives belong to the Member OKR domain.

Member Key Results belong to the Member OKR domain.

Member Initiatives belong to the Member OKR domain.

Monthly performance execution belongs to Runtime.

Historical Runtime execution remains in Runtime history.

Custom operational data belongs to the Custom Tables / Runtime operational
domain.

No new operational tab may create a competing source of truth for Member OKRs
or Runtime performance calculations.

---

# 12. Organization Ownership

All Custom Tables and operational data must resolve through the appropriate
Organization context.

The feature must preserve the existing multi-tenant architecture.

Organizations must not see or modify another organization's operational tables
or Runtime operational data.

Platform Super Admin and Organization Admin access must continue to follow the
existing administrative context and authorization rules.

Production authorization / RLS remains a separate security milestone.

---

# 13. Database Direction

The implementation should use a reusable data model for Custom Tables and
their monthly Runtime data.

The final schema should be reviewed before implementation.

The initial design should avoid:

- one-off tables for Agenda
- one-off tables for VA List
- one-off tables for Recruitment
- one-off tables for each Client Performance table
- duplicate organization ownership models
- duplicate monthly reporting-period entities

The design should use existing Organization and Runtime identity patterns
where appropriate.

No existing historical Runtime structure should be deleted as part of this
milestone.

---

# 14. Existing Runtime Preservation

The new operational tabs must not break:

- existing member Runtime navigation
- existing monthly performance execution
- current Key Result persistence
- historical Runtime records
- Performance Sheet version preservation
- Member OKR source-of-truth behavior

This is an additive Runtime capability.

---

# 15. Implementation Scope

The next implementation should proceed incrementally.

### Phase 1

Establish the reusable Custom Tables configuration model.

### Phase 2

Expose Custom Tables configuration from the Performance area.

### Phase 3

Add Runtime operational tab navigation.

### Phase 4

Implement Agenda.

### Phase 5

Implement VA List.

### Phase 6

Implement Recruitment.

### Phase 7

Implement Client Performance and independently named tables.

### Phase 8

Verify monthly persistence and historical retrieval.

### Phase 9

Compile, browser test, commit, and update documentation.

---

# 16. Files Added

No application source files are added by this architecture checkpoint.

Implementation files will be recorded in the next completed implementation
Waypoint.

---

# 17. Files Modified

No application source files are modified by this architecture checkpoint.

Implementation changes will be recorded in the next completed implementation
Waypoint.

---

# 18. Files Removed

None.

---

# 19. Database Changes

No production database migration is introduced by this architecture checkpoint.

The reusable Custom Tables schema must be designed and reviewed before
implementation.

---

# 20. Documentation Updated

The following documentation is updated for this milestone:

- `docs/01_Platform_Decisions.md`
- `docs/02_Platform_Backlog.md`
- `docs/waypoints/20261009_Waypoint_30_Runtime_Operational_Tabs_and_Custom_Tables.md`

The Product North Star does not require a material change because this feature
fits the existing product model of configurable performance experiences,
operational performance data, Runtime execution, and reusable presentation.

The Engineering Process does not require a change.

Waypoint 29 remains a permanent historical record and is not rewritten.

---

# 21. Technical Debt

Known technical debt for this milestone includes:

- final Custom Tables database schema
- Runtime operational data persistence implementation
- monthly historical retrieval implementation
- operational tab authorization verification
- production RLS

These items should be addressed as part of implementation rather than hidden
behind feature-specific shortcuts.

---

# 22. Milestone Status

```text
Member OKR Performance Architecture
    FOUNDATION COMPLETE / VERIFIED

Runtime Performance Experience
    FOUNDATION COMPLETE / VERIFIED

Runtime Operational Tabs and Custom Tables
    ARCHITECTURE DEFINED / NEXT IMPLEMENTATION

OKR Template Library
    PLANNED / NEW PRODUCT CAPABILITY

Production Authorization / RLS
    OUTSTANDING

Historical KPI Updates
    DEFERRED

KPI Calculation Engine
    DEFERRED

Historical Performance Reporting
    DEFERRED

Dynamic Dashboards
    FUTURE / CONTINUING

Live AI
    FUTURE / BUSINESS APPROVAL REQUIRED
```

---

# 23. Next Session

Start from this Waypoint.

Review:

1. Product North Star
2. Waypoint 30
3. Platform Decisions
4. Platform Backlog

Then confirm the Runtime Operational Tabs and Custom Tables milestone before
writing application code.

The implementation should begin with the smallest reusable data model that
supports the agreed operational experiences.

The guiding architectural sentence is:

> **Custom Tables provide reusable, organization-scoped operational data
> structures that make additional Runtime experiences possible without
> creating a second performance engine or competing source of truth.**

The repository documentation remains the authoritative engineering record.
