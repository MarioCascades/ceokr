CascadEffects Performance Platform

Development Waypoint 13

Runtime Workspace & Execution Workflow

Checkpoint Date: 15 August 2026

Milestone: Runtime Foundation — Interactive Execution Complete

1. Overview

This milestone extends Waypoint 12 and completes the core interactive Runtime execution workflow.

The platform now supports Runtime mutation beyond the initial Current Value prototype.

Runtime can now:

resolve a Performance Instance

resolve its Assignment

resolve the exact published Performance Sheet version

load Runtime Key Result Progress

edit Runtime Current Value

edit Runtime Confidence

persist employee comments

persist manager comments

recalculate Performance Instance aggregate state

transition Performance Instance lifecycle states

persist Runtime workflow state across refresh for the tested lifecycle states

The architectural boundary remains:

Builder defines the performance system.

Runtime executes the performance system.

Builder definitions remain immutable.

2. Current Architecture

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

The Performance Instance remains the Runtime execution anchor.

Runtime performance values remain separate from BuilderDocument definitions.

3. Completed Work

Runtime Key Result Editing

Runtime Key Result editing is working.

The Runtime UI supports:

Current Value

Confidence

Existing Runtime score display

Existing Runtime status display

Save action

Persistence

Runtime Confidence

Confidence editing and persistence were implemented.

Confidence is treated as Runtime state and is persisted with Key Result Progress.

Validation currently enforces a 0–100 range.

Employee Comments

Employee-level Runtime comments are now interactive and persistent.

The Runtime UI supports:

Editing employee comments

Saving employee comments

Loading persisted comments

Displaying saved comments after refresh

Employee comments remain Runtime state on the Performance Instance.

Manager Comments

Manager-level Runtime comments are now interactive and persistent.

The Runtime UI supports:

Editing manager comments

Saving manager comments

Loading persisted comments

Displaying saved comments after refresh

Manager comments remain Runtime state on the Performance Instance.

Performance Instance Aggregate Recalculation

After Runtime Key Result Progress changes, the Performance Instance aggregate is recalculated.

Current aggregates include:

overallScore

progress

status

The current calculation remains based on Runtime Key Result Progress records.

Weighted aggregation remains future architecture.

Runtime Lifecycle Workflow

The Performance Instance lifecycle was tested through:

In Progress
↓
Submitted
↓
Approved
↓
Completed

The UI displays the current lifecycle state and provides the appropriate workflow action.

The transitions persist successfully.

Submitted was verified after refresh.

Approved was verified after refresh.

Completed was successfully persisted and displayed immediately.

4. Architecture Decisions Confirmed

Builder owns definitions

Builder definitions remain the reusable source of truth for Performance Sheet structure.

Builder does not own period-specific employee/member performance values.

Runtime owns execution

Runtime owns:

current value

score

confidence

employee comments

manager comments

Runtime status

Performance Instance is the Runtime execution anchor

Runtime execution is associated with a specific Performance Instance.

The Performance Instance identifies the Assignment and Performance Sheet version being executed.

Exact published version is required

Runtime resolves the exact published Performance Sheet referenced by the Assignment.

Runtime must not silently switch an existing execution to a newer published version.

This preserves historical execution integrity.

Runtime state is separate from Builder state

BuilderDocument fields must not be treated as the employee's actual Runtime performance state.

Runtime values are stored in Runtime persistence structures.

5. Files Added

Runtime comment functionality added:

src/components/runtime/shared/employeecomments.tsx

src/components/runtime/shared/managercomments.tsx

src/lib/runtime/updateemployeecomments.ts

src/lib/runtime/updatemanagercomments.ts

Other Runtime files established in Waypoint 12 remain part of the current architecture.

6. Files Modified

src/app/runtime/actions.ts

src/components/runtime/performancesheet/performancesheet.tsx

src/components/runtime/keyresults/keyresultrow.tsx

src/lib/runtime/runtimeexecution.ts

Additional Runtime lifecycle files modified during this milestone remain part of the current repository state.

7. Database Structures

Runtime continues to use:

organization

reporting_periods

performance_sheets

assignments

performance_instances

key_result_progress

The Runtime architecture continues to maintain organization-scoped references.

Performance Instance stores:

assignmentId

performanceSheetId

reportingPeriodId

overallScore

progress

status

employeeComments

managerComments

lifecycle timestamps

Key Result Progress stores Runtime Key Result state including:

currentValue

score

confidence

employeeComment

managerComment

status

8. Testing Completed

TypeScript

PASS

npx tsc --noEmit --pretty false

completed without errors after the final Runtime changes.

Runtime Current Value

PASS

Runtime Current Value was edited and persisted.

Runtime Confidence

PASS

Runtime Confidence was edited and persisted.

Employee Comments

PASS

Employee comments were saved and remained after refresh.

Manager Comments

PASS

Manager comments were saved and remained after refresh.

Lifecycle Workflow

PASS

The tested Performance Instance lifecycle progressed:

In Progress
→ Submitted
→ Approved
→ Completed

The transitions persisted successfully.

Git State

The Runtime manager comments change was committed.

The working tree was confirmed clean after the commit.

9. Known Limitations / Technical Debt

Completed Runtime reload

A completed Performance Instance currently does not reopen through the current Runtime execution loader.

The loader currently searches for an active/in-progress Performance Instance.

This means a completed Performance Instance can be persisted successfully but is not yet resolved as a historical/read-only Runtime execution after refresh.

This should be addressed as part of future historical Runtime access rather than blocking the next Manager/Admin milestone.

KPI calculation engine

The generalized KPI calculation engine has not yet been implemented.

Runtime currently persists Runtime scores.

Future architecture should calculate scores from reusable KPI definitions, measurement types, targets, scoring rules, and current measurements.

Historical KPI Updates

Key Result Progress currently represents current Runtime state.

A durable time-series KPI Update model remains required for:

historical reporting

trend analysis

audit history

period-over-period comparisons

future predictive analytics

Weighted aggregation

Performance Instance aggregation currently uses Runtime Key Result Progress records.

Weighted Key Result and Objective aggregation remains future architecture.

Production authorization

Production tenant authorization remains outstanding.

RLS remains intentionally deferred during development.

Future Runtime operations require:

authenticated user enforcement

organization authorization

role/permission enforcement

server-side Runtime service boundaries

production Supabase RLS

10. Product Direction Clarified

The next major product phase is not additional Runtime lifecycle work.

The platform vision is now clearer:

Manager/Admin creates and manages Performance Forms.

A manager should be able to create a Performance Sheet once for a member or team and later edit or revise the form.

The manager should eventually be able to manage multiple members from an Admin/Performance Management workspace and create additional forms or components for them.

The system should support future reusable form structures such as:

Performance Sheets

Objectives

Key Results

Charts

Tables

KPI components

Initiatives

Comments

Other reusable Builder components

The Mint application remains a UX/product reference only.

The CascadEffects platform must remain generic and data-driven rather than hardcoding a Mint-specific form.

11. Next Milestone

Manager/Admin Performance Form Management

The next major milestone should establish the manager-facing management workflow.

Conceptual flow:

Manager/Admin
↓
Team / Member Management
↓
Select Member or Team
↓
Create Performance Sheet
↓
Configure reusable Builder components
↓
Save Draft
↓
Publish
↓
Assign to Member / Team
↓
Create Performance Instance
↓
Runtime executes the published form

The manager should later be able to return to the Admin area to:

edit existing forms

create new forms

add new members

assign forms

add objectives

add Key Results

add charts

add tables

modify components

create new published revisions

Existing Runtime executions must remain tied to their exact published Performance Sheet version.

12. Milestone Status

Runtime Foundation: 🟢 Established

Runtime Execution Resolution: 🟢 Complete

Runtime Current Value Mutation: 🟢 Complete

Runtime Confidence Workflow: 🟢 Complete

Employee Comments: 🟢 Complete

Manager Comments: 🟢 Complete

Performance Instance Aggregate Recalculation: 🟢 Complete

Performance Instance Lifecycle: 🟢 Complete

Runtime Workspace Foundation: 🟢 Complete

Completed Historical Runtime Reload: 🟡 Deferred

KPI Calculation Engine: ⚪ Not Started

Historical KPI Updates: ⚪ Not Started

Weighted Aggregation: ⚪ Not Started

Manager/Admin Form Management: 🟡 Next Milestone

Production RLS / Authorization: 🔴 Outstanding

13. Resume Instruction

When development resumes:

Start from this Waypoint.

Do not rebuild the Runtime execution architecture.

Do not move Runtime performance values into BuilderDocument.

Do not replace the Performance Instance execution anchor.

The next implementation milestone is:

Manager/Admin Performance Form Management

Before writing code:

Review the existing Builder architecture.

Review the current BuilderDocument structure.

Identify the existing Builder routes and components.

Identify how Performance Sheets are currently created, drafted, published, and versioned.

Determine what is already reusable for a Manager/Admin management workspace.

Design the member/team management workflow before implementing UI.

Preserve the existing Builder → Published Version → Assignment → Performance Instance → Runtime architecture.

14. Waypoint Outcome

The CascadEffects platform now has a verified interactive Runtime execution foundation.

The system can:

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

persist employee and manager comments

↓

recalculate Performance Instance aggregates

↓

transition Performance Instance lifecycle state

The next objective is to build the Manager/Admin experience that allows organizations to create, manage, assign, and revise the reusable Performance Forms that Runtime executes.

The Runtime engine is now a foundation for the larger dynamic performance-management platform.