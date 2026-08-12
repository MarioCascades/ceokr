# CascadEffects Performance Platform

# Platform Decisions

This document records architectural decisions that have been intentionally adopted for the platform.

These decisions are considered the current source of truth unless superseded by a future decision.

---

## Decision 001

### Builder owns definitions

The Builder is responsible for defining immutable Performance Sheet templates.

The Runtime never modifies Builder definitions.

Status

Accepted

---

## Decision 002

### Runtime owns execution

Performance execution is represented by:

- Assignment
- Performance Instance
- Key Result Progress
- KPI Update

Status

Accepted

---

## Decision 003

### One business concept = one domain model

Every core business concept has a single domain model.

Examples:

- PerformanceSheet
- Assignment
- ReportingPeriod
- PerformanceInstance
- KeyResultProgress
- KPIUpdate

Status

Accepted

---

## Decision 004

### BuilderDocument is stored as JSONB

The BuilderDocument is persisted as a JSONB document.

This allows published Performance Sheets to remain immutable while supporting future Builder enhancements.

Status

Accepted

---

## Decision 005

### Versioning model

Performance Sheets support:

- Draft
- Published
- Archived

Published versions are immutable.

New changes are created as draft revisions.

Status

Accepted