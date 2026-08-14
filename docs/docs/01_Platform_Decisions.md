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
---

## Decision 006

### Administration is the management entry point for Performance Sheets

The existing Administration area is the primary management interface for the organization's CascadEffects Performance Platform.

Performance Sheet management should be accessible from Administration.

The existing Builder remains the dedicated Performance Sheet definition and construction experience.

Administration does not replace or duplicate the Builder.

Instead, Administration provides the management and navigation entry point into the Builder.

The intended product flow is:

Organization Setup
        ↓
Administration
        ↓
Performance Sheets
        ↓
Builder
        ↓
Draft / Publish / Revision
        ↓
Assignment
        ↓
Performance Instance
        ↓
Runtime

The responsibilities remain separated:

Administration

- manages organization configuration
- manages organizational entities
- provides access to Performance Sheet management

Builder

- defines Performance Sheet structure
- manages Performance Sheet content
- validates definitions
- manages draft/published/revision lifecycle

Assignment

- connects a published Performance Sheet version to a runtime subject

Performance Instance

- represents the operational execution of an assigned Performance Sheet

Runtime

- executes the published Performance Sheet
- owns period-specific performance state

The existing `/builder` experience remains the Builder implementation.

The Administration area should provide the entry point to that Builder rather than moving Builder functionality into the Administration page itself.

Status

Accepted
## Vercel / Supabase Deployment Configuration

The CascadEffects Performance Platform uses Vercel for application deployment
and Supabase for PostgreSQL/database services.

The production Vercel project must define the Supabase client environment
variables required by the application:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

These variables must be configured for the appropriate Vercel deployment
environments, including Production and Preview.

The Supabase project URL and publishable key are deployment configuration,
not application source code.

A deployment that compiles successfully locally may still fail during Vercel
server/page evaluation if the required Supabase environment variables are
missing.

The repository code should continue to consume these values through
process.env rather than hardcoding Supabase credentials or URLs.

### Deployment Verification Rule

Before considering a production deployment verified:

1. Vercel environment variables are configured.
2. Production deployment completes successfully.
3. The deployed application can initialize its Supabase client.
4. The primary application navigation is verified.
5. Supabase-backed functionality is tested from the deployed application.

This configuration is infrastructure, not business logic.