# CascadEffects Performance Platform

# Platform Backlog

This document tracks architectural improvements and future capabilities that have been intentionally deferred.

Only items that are intentionally postponed belong here.

Completed Runtime execution work is recorded in the appropriate Waypoint and is not duplicated here.

---

# Architecture

## Organization table naming

Current

organization

Future

organizations

Reason

Standardize naming across all database tables.

Priority

Medium

Status

Deferred

---

## Organization domain model

Current

src/lib/types/organization.ts

Future

src/lib/domain/organization.ts

Introduce

src/lib/supabase/types/organization.row.ts

Reason

Separate persistence models from domain models.

Priority

Medium

Status

Deferred

---

## Repository row naming

Rename

PerformanceSheetRecord

to

PerformanceSheetRow

Reason

Improve naming consistency.

Priority

Low

Status

Deferred

---

## Repository mappers

Create

src/lib/supabase/mappers/

Reason

Separate persistence mapping from repository logic.

Priority

Medium

Status

Deferred

---

## Assignment subject validation

Current

Assignment uses:

assignmentType + subjectId

Future

Validate that subjectId belongs to the entity represented by assignmentType.

Reason

Prevent invalid polymorphic assignment references.

Priority

Medium

Status

Deferred

---

## Performance Instance relationship integrity

Current

PerformanceInstance stores:

assignmentId

performanceSheetId

reportingPeriodId

Future

Enforce consistency between the Performance Instance and its Assignment.

Reason

Prevent duplicated Runtime references from becoming inconsistent.

Priority

Medium

Status

Deferred

---

## Tenant authorization hardening

Current

Runtime persistence is being developed without production tenant authorization enforcement.

Future

Enforce organization-level authorization across Runtime repositories and services.

Reason

Ensure Runtime data cannot cross organization boundaries.

Priority

High

Status

Deferred

---

## Production Row Level Security

Current

RLS is intentionally OFF for the current Runtime persistence development phase.

Future

Implement and validate production-ready Supabase Row Level Security policies.

Reason

Protect tenant data and enforce database-level access boundaries before production release.

Priority

High

Status

Deferred

---

## Runtime security boundaries

Current

Runtime repositories are being implemented directly against Supabase during persistence development.

Future

Establish appropriate server-side service boundaries and authorization checks for production Runtime operations.

Reason

Prevent unauthorized direct access to Runtime persistence operations.

Priority

High

Status

Deferred

---

## KPI calculation engine

Current

Runtime can persist:

- currentValue
- score
- confidence
- status

The Runtime score is currently treated as persisted Runtime state.

Future

Create a generalized KPI calculation engine that can calculate Runtime scores from KPI definitions, measurement types, targets, scoring rules, and current measurements.

The engine should support future KPI types such as:

- numeric
- currency
- percentage
- time-bound
- reverse-scoring
- shared/team metrics
- department metrics
- organization metrics

Reason

Separate reusable KPI definitions from Runtime calculations and avoid hardcoding scoring logic into individual Runtime components.

Priority

High

Status

Deferred

---

## Historical KPI Updates

Current

Key Result Progress represents the current Runtime state.

Future

Create a durable time-series KPI Update model.

KPI Updates should preserve:

- performance instance
- key result
- measured value
- calculated score
- timestamp
- reporting context
- update source where appropriate

Reason

Current Runtime state alone is insufficient for historical reporting, trend analysis, auditability, and future predictive analytics.

Priority

High

Status

Deferred

---

## Runtime comments persistence

Current

The Runtime domain supports:

- employee comments
- manager comments

The full interactive Runtime comment workflow is not yet implemented.

Future

Implement Runtime comment editing and persistence.

Reason

Comments are part of the operational performance experience and must belong to Runtime execution rather than Builder definitions.

Priority

Medium

Status

Deferred

---

## Runtime confidence workflow

Current

Key Result Progress supports:

confidence

Future

Expose confidence editing and persistence through the Runtime workspace.

Reason

Confidence is part of Runtime performance state and should be available to the employee/member and/or manager where appropriate.

Priority

Medium

Status

Deferred

---

## Runtime status workflow

Current

Key Result Progress supports:

- not_started
- in_progress
- completed

Performance Instance supports its own lifecycle status.

Future

Define and implement the complete Runtime lifecycle and transition rules.

Reason

Performance execution requires controlled transitions between working, submitted, approved, and completed states.

Priority

High

Status

Deferred

---

## Performance Instance aggregate calculations

Current

Performance Instance aggregate values are recalculated from Runtime Key Result Progress records.

Current aggregates include:

- overallScore
- progress
- status

Future

Formalize weighted aggregation rules at:

- Key Result level
- Objective level
- Performance Instance level

Reason

Performance Sheet definitions already contain objective and Key Result weights. Runtime aggregation should eventually honor those weights rather than relying on a simple unweighted average.

Priority

High

Status

Deferred

---

## Assignment subject validation

Current

Assignment supports:

- individual
- team
- department
- organization

Future

Validate polymorphic subject references against the actual entity represented by assignmentType.

Reason

Prevent invalid Runtime assignments.

Priority

Medium

Status

Deferred

---

## Multiple Performance Sheet definitions

Current

Some Builder paths still use the current single-active-sheet development assumption.

Future

Introduce Performance Sheet Library / selector functionality using:

sheet_key

to identify logical Performance Sheet definitions.

Runtime assignments should continue referencing the exact published Performance Sheet version.

Reason

Organizations will eventually manage multiple performance systems rather than a single Performance Sheet.

Priority

Medium

Status

Deferred

---

# Runtime Workspace

## Runtime Workspace

Current

Runtime can now:

- resolve a Performance Instance
- resolve its Assignment
- resolve the exact published Performance Sheet version
- load Key Result Progress
- edit Runtime Current Value
- persist Runtime changes
- recalculate Performance Instance aggregate state

Future

Build the complete Runtime performance workspace.

The workspace should progressively support:

- Runtime header
- employee/member identity
- reporting period
- Performance Instance status
- overall score
- overall progress
- objectives
- weighted Key Results
- current values
- KPI scores
- confidence
- initiatives
- employee comments
- manager comments
- Runtime status transitions

Reason

Move from the verified Runtime persistence foundation into the complete operational performance experience.

Priority

High

Status

Next Milestone

---

# Future Platform Features

- Performance Sheet Library
- Multi-tenant administration
- Workflow engine
- Notification engine
- AI insights
- Predictive analytics
- Dashboard builder
### Deployment / Environment Configuration Hardening

Status: Future

Ensure deployment configuration is documented and validated consistently
across development, preview, and production environments.

Future considerations:

- Environment variable validation
- Missing environment variable detection
- Production deployment health checks
- Supabase connectivity verification
- Clear deployment failure diagnostics
- Separation of public configuration from server-only secrets