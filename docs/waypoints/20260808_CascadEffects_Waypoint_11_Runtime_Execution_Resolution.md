CascadEffects Performance Platform
Development Waypoint 11
Runtime Execution Resolution & Initialization

Checkpoint Date: 8 August 2026

Milestone: Runtime Foundation — Execution Resolution

1. Overview

This milestone continued the transition from the Performance Sheet Builder into the Runtime execution architecture.

The Builder remains responsible for defining reusable Performance Sheet definitions.

Runtime is now responsible for resolving and working with operational performance execution records.

The current architectural flow is:

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
Runtime Execution

This preserves the architectural boundary established during the Builder lifecycle milestone: published definitions are immutable, while employee/member performance values belong to the Runtime execution layer.

2. Completed Work
Runtime execution domain

Established the Runtime execution chain around:

Assignment
Performance Instance
Key Result Progress

The existing database records were successfully verified during development.

Assignment

An active organization-level Assignment was created referencing the published Performance Sheet.

Current verified Assignment:

Assignment ID:
01718810-85a9-4088-92dc-30fed55ad2a1

Performance Sheet:
6fc01bbd-ecb4-46ab-bcaa-e45cee7342fa

Reporting Period:
3cb8f784-4831-48fd-81fe-b4769a80b455

Assignment Type:
organization

Status:
active
Performance Instance

A Performance Instance exists for the Assignment:

Performance Instance:
e3a54125-a152-4d0f-bb44-c8093eeae04e

Status:
in_progress

Overall Score:
0

Progress:
0
Key Result Progress

The Runtime initialization architecture was implemented so that Builder definitions create Runtime Key Result Progress records without copying runtime-specific values from the Builder.

Runtime initialization now starts with:

currentValue = ""
score = 0
status = not_started

rather than copying Builder current or score.

This reinforces the separation between reusable definition data and period-specific execution data.

Runtime execution resolver

Implemented Runtime execution resolution through the Performance Instance and Assignment.

Runtime now follows:

Performance Instance
        ↓
Assignment
        ↓
Exact Published Performance Sheet
        ↓
Key Result Progress

Rather than simply loading the organization's latest published Performance Sheet.

This is important for version integrity and historical execution.

Runtime page

The Runtime page now uses:

loadRuntimeExecution()

and renders the resolved published Performance Sheet document.

The /runtime route currently loads without errors.

3. Architecture Decisions
Decision: Runtime must resolve the assigned Performance Sheet version

Runtime must not assume that the latest published Performance Sheet is the one being executed.

The Assignment identifies the exact published Performance Sheet version.

Therefore:

Assignment.performanceSheetId

is the authoritative relationship.

This protects historical execution when future versions are published.

Example:

Version 1 → historical execution

Version 2 → current assignment

Version 3 → newly published

Runtime → Version 2
Decision: Builder values are not Runtime execution values

Builder definitions may contain fields that historically represented current and score.

Runtime initialization must not treat those values as the employee's current performance state.

Runtime owns:

current value
score
status
confidence
employee comments
manager comments

The Builder owns reusable definitions.

This follows the established Builder/runtime boundary.

Decision: Performance Instance is the Runtime execution anchor

The Performance Instance represents an actual execution of a Performance Sheet for an Assignment and Reporting Period.

Runtime data should be resolved from the Performance Instance rather than directly from the Builder.

4. Files Added / Created

The following Runtime files have been established during this milestone:

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
5. Files Modified

Runtime page:

src/app/runtime/page.tsx

Performance Sheet repository was extended to support loading an exact published version by ID:

src/lib/repositories/performancesheetrepository.ts

Specifically:

loadPublishedById()

was added for Runtime execution resolution.

6. Database Changes

The following Runtime database structures are now being used:

organization
reporting_periods
performance_sheets
assignments
performance_instances
key_result_progress

Verified relationships include:

assignments.organization_id
    → organization.id

assignments.performance_sheet_id
    → performance_sheets.id

assignments.reporting_period_id
    → reporting_periods.id

Runtime execution also maintains:

performance_instances.assignment_id

and:

key_result_progress.performance_instance_id
7. Verified Database State

Organization:

Test 1

ID:
e18bca45-874f-4120-8685-1461e992a3b6

Reporting Period:

July 2026

ID:
3cb8f784-4831-48fd-81fe-b4769a80b455

Published Performance Sheet:

Performance Sheet

ID:
6fc01bbd-ecb4-46ab-bcaa-e45cee7342fa

Status:
published

Version:
2

The published document currently contains:

Objective 1

Key Result:
Increase test 1

Target:
100

Current:
55

The 55 value remains Builder document data and should not automatically become Runtime performance data.

8. Testing Completed
TypeScript / Build

PASS

The Runtime changes compile without errors.

Runtime route

PASS

The following route loads without errors:

http://localhost:3000/runtime
Runtime resolver

Implemented

Runtime now resolves:

Performance Instance
→ Assignment
→ Exact Published Performance Sheet
→ Key Result Progress
End-to-end execution test

PENDING

We have not yet completed the final test proving that creating an execution from an Assignment automatically produces the expected Key Result Progress records.

This is intentionally left as the next test rather than being marked complete prematurely.

9. Technical Debt
Production RLS

Production-grade tenant-aware RLS remains outstanding.

The earlier Builder milestone explicitly identified relaxed development security as technical debt.

Authorization

organization_id filtering is not sufficient as the final authorization model.

Authenticated user → organization → role → permission relationships still need to be established.

Runtime member identity

The current Assignment supports:

individual
team
department
organization

but the full member/user/team/department identity architecture remains future work.

KPI calculation engine

Runtime currently stores:

currentValue
score

but the generalized KPI calculation engine has not yet been implemented.

Historical KPI updates

Key Result Progress currently represents current Runtime state.

A durable time-series KPI Update model is still required for historical reporting and trend analysis.

Multiple Performance Sheet definitions

The current organization-level lookup still supports the single-active-sheet development assumption in some Builder paths.

The long-term architecture requires selection by sheet_key / logical definition when multiple Performance Sheet definitions are supported.

10. Next Session

The immediate next task is:

Complete the Runtime execution integration test

Verify:

Active Assignment
        ↓
createPerformanceExecutionFromAssignment()
        ↓
Performance Instance
        ↓
initializePerformanceInstance()
        ↓
Key Result Progress records

Then query Supabase and confirm:

performance_instances

contains the expected execution and:

key_result_progress

contains one Runtime progress record for each Key Result in the published Performance Sheet.

Expected initial Runtime state:

current_value = ""
score = 0
status = "not_started"

After that succeeds, the next architectural step should be designing the actual Runtime editing/update flow for Key Result Progress rather than adding more Builder functionality.

11. Milestone Status

Runtime Foundation: 🟢 In Progress

Builder Definition Lifecycle: 🟢 Complete

Assignment Foundation: 🟢 Established

Performance Instance Foundation: 🟢 Established

Key Result Progress Foundation: 🟢 Established

Runtime Resolution: 🟢 Established

End-to-End Execution Test: 🟡 Pending

Member Runtime Editing: ⚪ Not Started

KPI Calculation Engine: ⚪ Not Started

Historical KPI Updates: ⚪ Not Started

Production RLS / Authorization: 🔴 Outstanding

12. Resume Instruction

When development resumes:

Start with the existing Assignment and Performance Instance. Do not rebuild the Builder lifecycle. Verify the end-to-end Assignment → Performance Instance → Key Result Progress initialization flow, then begin the Runtime editing/update layer.

Waypoint Outcome

The CascadEffects platform has now moved beyond simply rendering published Builder documents.

The platform has an emerging execution architecture:

                 BUILDER
                    │
                    ▼
          Published Definition
                    │
                    ▼
               ASSIGNMENT
                    │
                    ▼
          PERFORMANCE INSTANCE
                    │
                    ▼
          KEY RESULT PROGRESS
                    │
                    ▼
                RUNTIME

The key architectural boundary is now established: Builder defines the system; Runtime executes the system.

This is the correct place to checkpoint before beginning the next Runtime capability.