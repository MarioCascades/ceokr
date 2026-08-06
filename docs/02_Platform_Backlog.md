# CascadEffects Performance Platform

# Platform Backlog

This document tracks architectural improvements that have been intentionally deferred.

Only items that are intentionally postponed belong here.

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

# Future Platform Features

- Performance Sheet Library
- Multi-tenant administration
- Workflow engine
- Notification engine
- AI insights
- Predictive analytics
- Dashboard builder