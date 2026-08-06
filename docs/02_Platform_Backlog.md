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

# Future Platform Features

- Performance Sheet Library
- Multi-tenant administration
- Workflow engine
- Notification engine
- AI insights
- Predictive analytics
- Dashboard builder