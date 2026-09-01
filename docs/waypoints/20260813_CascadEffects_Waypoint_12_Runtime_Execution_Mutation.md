# CascadEffects Performance Platform

# Development Waypoint 12

## Runtime Execution & First Runtime Mutation

Checkpoint Date: 13 August 2026

Milestone: Runtime Foundation — Execution & Mutation

---

# 1. Overview

This milestone completed the first end-to-end Runtime execution and mutation workflow.

The CascadEffects platform has now moved beyond rendering published Performance Sheet definitions.

Runtime can now:

- resolve an active Performance Instance
- resolve the Assignment associated with that execution
- resolve the exact published Performance Sheet version assigned to the execution
- load Runtime Key Result Progress records
- display Runtime performance data
- edit a Runtime Key Result current value
- persist the Runtime change
- recalculate the Performance Instance aggregate state

The architectural boundary remains:

Builder defines the performance system.

Runtime executes the performance system.

---

# 2. Current Architecture

The verified Runtime execution flow is:

Builder Definition
        ↓
Published Performance Sheet
        ↓
Assignment
        ↓
Performance Instance
        ↓
Key Result Progress
        ↓
Runtime UI
        ↓
Runtime Mutation
        ↓
Persisted Runtime State
        ↓
Performance Instance Aggregate

Builder definitions remain immutable.

Runtime owns period-specific execution state.

---

# 3. Completed Work

## Runtime execution integration

The Runtime execution chain was successfully tested:

Active Assignment
        ↓
Performance Instance
        ↓
Key Result Progress

The expected Runtime Key Result Progress records were created.

Initial Runtime state was verified as:

current_value = ""
score = 0
status = not_started

---

## Runtime execution resolution

Runtime continues to resolve execution through:

Performance Instance
        ↓
Assignment
        ↓
Exact Published Performance Sheet
        ↓
Key Result Progress

Runtime does not simply load the organization's latest published Performance Sheet.

The Assignment remains the authoritative reference to the exact Performance Sheet version being executed.

---

## Runtime Key Result editing

Runtime Key Result editing was implemented.

The Runtime UI now allows the user to edit:

Current Value

The updated value is persisted to the Runtime Key Result Progress record.

---

## Runtime mutation

A successful Runtime mutation was verified.

Before:

current_value = 75

After:

current_value = 80

The updated Runtime record was confirmed in the database.

Verified record:

Key Result Progress ID:

c7222d2d-1605-4174-bccd-1feb4147e2c0

Performance Instance:

6b2f3c5d-d4c7-4398-9698-fb7fe7d9edf4

Current Value:

80

Score:

75

Status:

in_progress

---

## Performance Instance aggregate recalculation

After Runtime Key Result Progress was updated, the Performance Instance aggregate was recalculated.

The update service currently recalculates:

- overallScore
- progress
- status

The aggregate calculation currently uses Runtime Key Result Progress records rather than Builder definition values.

---

# 4. Architecture Decisions Confirmed

## Builder owns definitions

Builder definitions remain the reusable source of truth for Performance Sheet structure.

Builder does not own period-specific employee/member performance values.

---

## Runtime owns execution

Runtime owns:

- current value
- score
- confidence
- employee comments
- manager comments
- Runtime status

---

## Performance Instance is the Runtime execution anchor

Runtime execution is associated with a specific Performance Instance.

The Performance Instance identifies the Assignment and Performance Sheet version being executed.

---

## Exact published version is required

Runtime must resolve the exact published Performance Sheet referenced by the Assignment.

Runtime must not silently switch an existing execution to a newer published version.

This preserves historical execution integrity.

---

## Runtime state is separate from Builder state

Builder document fields such as:

current

score

must not be treated as the employee's actual Runtime performance state.

Runtime values are stored in Runtime persistence structures.

---

# 5. Files Added

The following Runtime architecture files are now established:

src/lib/domain/assignment.ts

src/lib/domain/performanceinstance.ts

src/lib/domain/keyresultprogress.ts

src/lib/repositories/assignmentrepository.ts

src/lib/repositories/performanceinstancerepository.ts

src/lib/repositories/keyresultprogressrepository.ts

src/lib/runtime/createperformanceexecution.ts

src/lib/runtime/createperformanceexecutionfromassignment.ts

src/lib/runtime/initializeperformanceinstance.ts

src/lib/runtime/runtimeexecution.ts

src/lib/runtime/updatekeyresultprogress.ts

---

# 6. Files Modified

Runtime page:

src/app/runtime/page.tsx

Runtime Performance Sheet component:

src/components/runtime/performancesheet/performancesheet.tsx

Runtime Objective Card:

src/components/runtime/performancesheet/objectivecard.tsx

Runtime Key Result Row:

src/components/runtime/keyresults/keyresultrow.tsx

Performance Sheet repository:

src/lib/repositories/performancesheetrepository.ts

---

# 7. Database Structures

Runtime currently uses:

organization

reporting_periods

performance_sheets

assignments

performance_instances

key_result_progress

Verified Runtime relationships include:

assignments.organization_id
    →
organization.id

assignments.performance_sheet_id
    →
performance_sheets.id

assignments.reporting_period_id
    →
reporting_periods.id

performance_instances.assignment_id
    →
assignments.id

key_result_progress.performance_instance_id
    →
performance_instances.id

---

# 8. Testing Completed

## TypeScript / Build

PASS

---

## Development Runtime

PASS

Runtime route:

/runtime

loads successfully.

---

## Runtime execution resolution

PASS

Runtime successfully resolves:

Performance Instance
→ Assignment
→ Exact Published Performance Sheet
→ Key Result Progress

---

## Runtime mutation

PASS

Runtime Current Value was edited through the UI.

Test:

75 → 80

The updated value persisted to Supabase.

---

## Performance Instance recalculation

PASS

The Runtime update triggered Performance Instance aggregate recalculation.

---

## Final Runtime UI

PASS

Runtime now displays:

- Organization
- Employee / Performance Header
- Metrics
- Objectives
- Key Results
- Target
- Current Runtime Value
- Score
- Status
- Runtime progress bar
- Comments area

---

# 9. Known Limitations / Technical Debt

## KPI calculation engine

The generalized KPI calculation engine has not yet been implemented.

Runtime currently allows the Runtime score to be persisted, but score calculation from KPI definitions and measurements is still future architecture.

---

## Historical KPI Updates

Key Result Progress currently represents current Runtime state.

A durable time-series KPI Update model is still required for:

- historical reporting
- trend analysis
- audit history
- period-over-period comparisons
- future predictive analytics

---

## Runtime comments

The Runtime domain supports:

employee comments

manager comments

but full interactive persistence has not yet been implemented in the Runtime UI.

---

## Confidence

Confidence exists in the Runtime domain but is not yet exposed as a complete Runtime editing workflow.

---

## Status workflow

Runtime currently supports basic Key Result Progress status values.

A complete lifecycle for:

not_started
in_progress
completed

and Performance Instance transitions requires additional workflow design.

---

## Runtime member identity

Assignment currently supports:

individual
team
department
organization

but the full member/user/team/department identity architecture remains future work.

---

## Production authorization

Production tenant authorization is still outstanding.

RLS remains intentionally deferred during development.

---

## Production security

Production Runtime operations will eventually require:

- authenticated user enforcement
- organization authorization
- role/permission enforcement
- server-side Runtime service boundaries
- production Supabase RLS

---

# 10. Next Milestone

## Runtime Workspace

The next milestone should transform the current Runtime mutation prototype into a complete Runtime performance workspace.

Priority sequence:

1. Runtime Header from actual execution data
2. Reporting Period information
3. Performance Instance status display
4. Overall score and progress display
5. Complete Key Result editing
6. Confidence editing
7. Employee comments
8. Manager comments
9. Runtime status transitions
10. Initiative interaction
11. Objective-level aggregation
12. Runtime UX refinement toward the Mint reference experience

The Mint application remains a UX reference only.

The CascadEffects Runtime must remain generic and data-driven.

---

# 11. Future Architecture

After the Runtime Workspace milestone, the next major architectural concern should be the historical KPI Update model.

Conceptually:

Performance Instance
        ↓
Key Result Progress
        ↓
KPI Updates
        ↓
Historical Reporting
        ↓
Trend Analysis
        ↓
AI Insights

KPI Update history should preserve time-bound performance changes rather than relying solely on the current Key Result Progress record.

---

# 12. Milestone Status

Runtime Foundation: 🟢 Established

Runtime Execution Resolution: 🟢 Complete

Runtime Execution Integration Test: 🟢 Complete

Key Result Progress Initialization: 🟢 Complete

Runtime Current Value Mutation: 🟢 Complete

Performance Instance Aggregate Recalculation: 🟢 Complete

Runtime Workspace: 🟡 Next

KPI Calculation Engine: ⚪ Not Started

Historical KPI Updates: ⚪ Not Started

Runtime Comments: ⚪ Not Started

Runtime Status Workflow: ⚪ Not Started

Production RLS / Authorization: 🔴 Outstanding

---

# 13. Resume Instruction

When development resumes:

Start from the existing Runtime execution and mutation architecture.

Do not rebuild the Builder lifecycle.

Do not move Runtime performance values back into BuilderDocument.

Do not replace the existing Performance Instance execution anchor.

The next implementation milestone is:

Runtime Workspace

Begin by reviewing the existing Runtime header components and determine which values should come from:

Performance Instance

Assignment

Reporting Period

and

Published Performance Sheet

before changing the UI.

---

# 14. Waypoint Outcome

The CascadEffects platform now has a verified Runtime execution loop.

The system can now:

define a Performance Sheet

↓

publish a Performance Sheet version

↓

assign the published version

↓

create a Performance Instance

↓

initialize Key Result Progress

↓

resolve Runtime execution

↓

edit Runtime performance data

↓

persist Runtime performance data

↓

recalculate Performance Instance aggregates

This establishes the first real operational Runtime capability of the CascadEffects Performance Platform.

The next objective is no longer proving that Runtime persistence works.

The next objective is building the complete Runtime performance workspace on top of this foundation.