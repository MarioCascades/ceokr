# CascadEffects Performance Platform

# Waypoint 17 — Administration Assignment Management

Date: 2026-08-28
Milestone: Administration — Assignment Management
Status: COMPLETE

---

# 1. Overview

This Waypoint records completion of the Administration Assignment
Management workflow and its connection to Runtime Performance Execution.

Administration now provides the management and navigation entry point for
assigning published Performance Sheet versions to Runtime subjects.

The implementation does not rebuild the Builder.

The implementation does not duplicate Runtime execution logic.

Assignments connect:

Published Performance Sheet Version

↓

Reporting Period

↓

Assignment Subject

↓

Performance Instance

↓

Runtime Execution

---

# 2. Completed Work

Assignment Management completed:

• Assignment Administration entry point

• Assignment management page

• Assignment listing

• Assignment creation

• Assignment subject selection

• Individual assignment support

• Team assignment support

• Department assignment support

• Organization assignment support

• Assignment lifecycle management

• Draft assignment state

• Active assignment state

• Completed assignment state

• Cancelled assignment state

• Published Performance Sheet association

• Reporting Period association

• Assignment → Performance Instance integration

---

# 3. Assignment Subject Model

Assignments use:

assignmentType

subjectId

The supported assignment types are:

individual

team

department

organization

The subject is referenced by ID rather than by name.

This preserves the data-driven architecture and avoids hardcoded
organizational structures.

Individual assignments resolve the subject through the application User
model.

Team assignments reference Team records.

Department assignments reference Department records.

Organization assignments reference the Organization tenant.

---

# 4. Performance Sheet Association

Assignments reference the exact published Performance Sheet version.

The Runtime does not resolve the latest published version when executing
an Assignment.

The relationship is:

Assignment

↓

performanceSheetId

↓

Exact published Performance Sheet

This preserves historical Runtime integrity.

Published Performance Sheet versions remain immutable.

---

# 5. Reporting Period Association

Assignments reference a Reporting Period.

The Reporting Period establishes the time-bound context for the assignment.

The resulting Performance Instance uses the Reporting Period associated
with the Assignment.

---

# 6. Assignment → Performance Instance

The Assignment workflow successfully connects an active Assignment to
Runtime execution.

Verified flow:

Performance Sheet

↓

Published Version

↓

Assignment

↓

Activate Assignment

↓

Performance Instance

↓

Runtime

The Performance Instance references:

• Assignment

• Exact Performance Sheet version

• Reporting Period

• Organization

---

# 7. Runtime Integration

The Runtime execution loader now resolves:

• Performance Instance

• Assignment

• Reporting Period

• Exact published Performance Sheet

• Key Result Progress

• Runtime subject

The Builder document remains the immutable Performance Sheet definition.

Runtime execution state remains separate from Builder definition state.

---

# 8. Runtime Subject Resolution

Individual Assignment subject resolution has been integrated into Runtime.

The Runtime resolves the assigned User using the Assignment subjectId.

The Runtime subject exposes:

• subject type

• subject ID

• display name

• email

For an Individual assignment:

Assignment

↓

subjectId

↓

Application User

↓

Runtime Subject

↓

Runtime Performance Header

This prevents the Runtime from displaying the placeholder employee identity
stored in the reusable Builder document.

The verified Runtime execution now displays the actual assigned user.

Example:

Assignment Subject:

Test User

Runtime:

Test User

---

# 9. Builder / Runtime Boundary

The Builder remains responsible for:

• Performance Sheet definition

• structure

• navigation

• Performance Header definition

• Objectives

• Key Results

• Initiatives

• Comments

• validation

• draft persistence

• publishing

• revision creation

Runtime remains responsible for:

• Performance Instance execution

• Runtime Key Result Progress

• Current Value

• Score

• comments

• lifecycle state

• aggregate state

The Runtime does not modify the published Builder document.

The actual execution subject is resolved from the Assignment.

---

# 10. Runtime Key Result Updates

Runtime Key Result updates were verified through the active Performance
Instance.

The Runtime successfully persisted:

• Current Value

• Score

• Employee Comment

• Manager Comment

• Status

Confidence was removed from the Runtime Key Result update workflow.

---

# 11. Runtime Scoring

A small Runtime scoring utility was introduced:

src/lib/runtime/keyresultscoring.ts

The current Runtime scoring method is:

current value ÷ target value × 100

The result is clamped between:

0 and 100

The Runtime UI displays the score as a percentage.

Example:

Current:

50

Target:

100

Score:

50%

The utility intentionally remains small.

A generalized configurable KPI Calculation Engine remains future platform
work.

---

# 12. Runtime Aggregate Recalculation

When Runtime Key Result Progress is updated, the Performance Instance
aggregate is recalculated.

The current aggregate calculation averages Runtime Key Result scores.

Runtime progress is calculated from completed Key Result Progress records.

The Performance Instance remains the Runtime aggregate anchor.

Formal weighted aggregation remains future platform work.

---

# 13. Runtime Lifecycle

The verified Runtime lifecycle remains:

In Progress

↓

Submitted

↓

Approved

↓

Completed

The Performance Instance status is updated through the existing Runtime
transition service.

Assignment Management does not duplicate Runtime lifecycle logic.

---

# 14. Administration Navigation

Verified Administration navigation includes:

Administration

↓

Performance Sheets

↓

Assignments

The Assignment page provides access to the Assignment workflow.

The Builder remains responsible for Performance Sheet editing.

---

# 15. Files Added

The Assignment Management implementation includes:

src/app/admin/assignments/page.tsx

src/components/admin/assignments/assignmentspage.tsx

src/lib/runtime/keyresultscoring.ts

docs/docs/waypoints/20260827_CascadEffects_Waypoint_16_Performance_Sheet_Management.md

This Waypoint adds:

docs/docs/waypoints/20260828_CascadEffects_Waypoint_17_Assignment_Management.md

---

# 16. Files Modified

The completed implementation modified existing Administration,
Assignment, Runtime, and User functionality including:

src/app/admin/layout.tsx

src/app/admin/page.tsx

src/app/runtime/actions.ts

src/app/runtime/page.tsx

src/app/dev/runtime-test/page.tsx

src/app/page.tsx

src/components/runtime/keyresults/keyresultrow.tsx

src/components/runtime/performancesheet/performancesheet.tsx

src/lib/repositories/assignmentrepository.ts

src/lib/repositories/performancesheetrepository.ts

src/lib/runtime/runtimeexecution.ts

src/lib/runtime/updatekeyresultprogress.ts

src/services/assignment.service.ts

src/services/user.service.ts

---

# 17. Database Changes

No new database migration was required for the completed workflow.

Existing platform records are used:

• assignments

• performance_sheets

• reporting_periods

• performance_instances

• key_result_progress

• users

The existing relational architecture remains the source of truth.

---

# 18. Architecture Decisions

Assignment Management does not replace Builder.

Assignment Management does not replace Runtime.

Administration owns assignment management and lifecycle entry points.

Builder owns Performance Sheet definition.

Published Performance Sheet versions remain immutable.

Assignments reference exact published Performance Sheet versions.

Performance Instances represent Runtime execution.

Runtime resolves the actual assignment subject rather than modifying the
Builder document.

IDs are used for relationships rather than display names.

No separate assignment subject table was introduced.

No separate Performance Sheet version-history table was introduced.

No new scoring folder was introduced.

The current scoring utility remains a small Runtime utility.

A generalized KPI Calculation Engine remains future work.

Formal weighted aggregation remains future work.

---

# 19. Functional Verification

Assignment Administration — PASS

Assignment Listing — PASS

Individual Assignment — PASS

Team Assignment — PASS

Department Assignment — PASS

Organization Assignment — PASS

Assignment Lifecycle — PASS

Published Performance Sheet Association — PASS

Reporting Period Association — PASS

Assignment → Performance Instance — PASS

Runtime Execution — PASS

Runtime Key Result Update — PASS

Runtime Score Calculation — PASS

Runtime Score Percentage Display — PASS

Runtime Subject Resolution — PASS

Individual User Display — PASS

Builder / Runtime Separation — PASS

---

# 20. TypeScript Verification

Command:

npx tsc --noEmit --pretty false

Result:

PASS

---

# 21. Browser Verification

Runtime execution was verified through the browser.

The active Assignment successfully produced a Performance Instance.

The Runtime successfully displayed:

Test User

July 2026

Objective 1

Key Result

Current Value:

50

Score:

50%

The Runtime update persisted successfully.

---

# 22. Git Verification

Completed implementation was committed to Git.

Commit:

2e263c2

Commit message:

Complete Performance Sheet Administration

Working tree:

CLEAN

---

# 23. Technical Debt

Production Tenant Authorization — OUTSTANDING

Production Row Level Security — OUTSTANDING

Full Authorization Enforcement — OUTSTANDING

Authorization must eventually be enforced consistently across:

• UI

• server services

• APIs

• database / RLS

Assignment Subject Validation remains a future hardening capability.

Performance Instance Relationship Integrity remains a future hardening
capability.

---

# 24. Deferred Work

The following remain intentionally deferred:

• Production Tenant Authorization

• Production Row Level Security

• Runtime Security Boundaries

• Assignment Subject Validation hardening

• Performance Instance Relationship Integrity

• Performance Sheet Library

• Archive lifecycle

• Duplicate Performance Sheet

• Search

• Filtering

• Advanced Performance Sheet management

• Formal Weighted Aggregation

• Generalized KPI Calculation Engine

• Historical KPI Updates

• Historical Reporting

• Dashboards

• Reports

• AI

---

# 25. Team / Department / Organization Runtime Subject UX

Assignment Management supports Team, Department, and Organization
assignment types.

The current Runtime subject presentation was specifically verified for
Individual assignments.

Team, Department, and Organization Runtime presentation should be designed
as separate execution UX decisions rather than forcing those concepts into
the employee-oriented Runtime header.

No additional subject abstraction was introduced prematurely.

---

# 26. Current Platform Position

Builder — ESTABLISHED

Runtime Execution Foundation — ESTABLISHED

Administration — IN PROGRESS

Organization — COMPLETE

Departments — COMPLETE

Teams — COMPLETE

Users / Members — COMPLETE

Roles & Permissions — FUNCTIONAL FOUNDATION COMPLETE

Performance Sheet Management — COMPLETE

Assignment Management — COMPLETE

Dashboards — FUTURE

Reports — FUTURE

AI — FUTURE

Production Authorization / RLS — OUTSTANDING

---

# 27. Next Development Session

Start from this Waypoint.

Review:

Latest Waypoint

docs/docs/01_Platform_Decisions.md

docs/docs/02_Platform_Backlog.md

Confirm the next Administration milestone before implementation.

The next phase should not rebuild Builder or Runtime.

Priority architectural hardening areas include:

• Production Tenant Authorization

• Production Row Level Security

• Runtime Security Boundaries

• Assignment Subject Validation

• Performance Instance Relationship Integrity

Any new functional Administration capability should be evaluated against
the current Platform Decisions and Platform Backlog before implementation.

---

# 28. Milestone Status

Assignment Administration — COMPLETE

Assignment Creation — COMPLETE

Assignment Subject Selection — COMPLETE

Assignment Lifecycle — COMPLETE

Published Performance Sheet Association — COMPLETE

Reporting Period Association — COMPLETE

Assignment → Performance Instance — COMPLETE

Runtime Execution Integration — COMPLETE

Runtime Subject Resolution — COMPLETE

Runtime Scoring Utility — COMPLETE

Runtime Key Result Update — COMPLETE

Runtime Aggregate Recalculation — COMPLETE

TypeScript Verification — PASS

Browser Verification — PASS

Git Commit — COMPLETE

Working Tree — CLEAN