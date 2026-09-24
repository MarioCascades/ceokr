# CascadEffects Performance Platform

# Product North Star

**Document:** docs/03_Product_North_Star.md

**Status:** CURRENT

**Last Updated:** 2026-09-24

---

# Purpose

This document defines the product North Star for the CascadEffects
Performance Platform.

It prevents development from drifting into isolated features, rebuilding
completed systems, or confusing Administration, Builder, Member OKRs, and
Runtime.

The repository documentation remains the engineering source of truth.

---

# The North Star

CascadEffects is a multi-tenant SaaS platform that allows CascadEffects
Platform Super Admins and authorized Organization Admins to create,
configure, publish, and operate performance-management systems for multiple
organizations without custom software development for each organization.

The platform is not Mint rebuilt in another codebase.

Mint is a reference implementation that demonstrates the kind of performance
experience CascadEffects must be able to generate.

The platform must allow each customer organization to have its own:

- people
- structure
- roles
- permissions
- performance presentation
- member OKRs
- operational performance data
- dashboards
- reporting experience

---

# The Core Product Model

The platform has four connected domains:

```text
ADMINISTRATION
|
| manages organizations, people,
| memberships, permissions, and
| performance configuration
v
MEMBER OKRs
|
| owns employee Objectives,
| Key Results, Initiatives,
| and performance values
v
RUNTIME
|
| records period-specific execution
| and historical state
v
PERFORMANCE DATA / REPORTING
```

Separately:

```text
PERFORMANCE BUILDER
|
| defines reusable presentation
| and composition
v
PUBLISHED PERFORMANCE SHEET
```

The Builder configuration and Member OKRs are composed to produce the member
performance experience.

The critical product relationship is:

```text
Organization Membership
↓
Member
↓
Member OKRs
↓
Monthly Performance Execution
↓
Historical Performance
```

and:

```text
Performance Sheet Definition
↓
Published Presentation Configuration
↓
Member Performance Experience
```

---

# Member OKRs Are the Employee Performance Data

This is a core product rule.

The employee's specific performance data is their Member OKR.

A member's OKR consists of:

- Objectives
- Key Results
- Initiatives
- Key Result performance values
- comments and applicable execution state

The source of truth is the Member OKR domain.

The same Member OKR data must feed:

- Member OKR management
- Member performance
- Runtime
- monthly history
- dashboards
- tables
- charts
- reports
- future AI analysis

The platform must not create a second employee-performance data model for
any of these experiences.

---

# Organization Membership Automatically Includes the Member

A member belongs to the organization's performance environment because the
member has an Organization Membership.

There is no product requirement to manually assign an employee to a
Performance Sheet in order for that employee to participate.

The product relationship is:

```text
Organization
↓
Organization Membership
↓
Member
↓
Member OKRs
```

Assignments are therefore not part of the long-term product participation
model.

Existing Assignment infrastructure may remain temporarily for migration and
historical compatibility.

---

# Performance Builder Is the Composition Layer

The Performance Builder is not the place where employee Objectives, Key
Results, or Initiatives are created.

The Builder configures how the performance experience is composed and
presented.

Builder configuration may include:

- Performance Header
- Member Navigation
- Layout
- Sections
- Fields
- Tables
- Charts
- Reports
- display configuration
- reusable presentation rules
- publishing
- versioning

The Builder answers:

> How should this organization's performance experience look and behave?

Member OKRs answer:

> What is this member's actual performance?

---

# The Performance Product Family

CascadEffects should be capable of generating reusable performance products
such as:

1. Member OKR Sheets
2. Dashboards
3. Tables
4. Charts
5. Reports

The Builder is the composition engine used to configure how these products
are presented.

The underlying data remains owned by the appropriate domain.

For Member OKR Sheets:

```text
Organization Membership
↓
Member OKRs
↓
Builder presentation
```

For dashboards and reports:

```text
Member OKRs
+
Runtime history
+
authorized organization data
↓
Builder composition
```

---

# Member Navigation

Member navigation is data-driven.

A performance experience may show:

```text
Main | Mario | Mari | Emily | Jordyn
```

The member tabs are generated from Organization Membership.

They are not hardcoded.

When a member is selected:

```text
Selected Member
↓
Organization Membership
↓
Member OKRs
↓
Member Performance Experience
```

Selecting Mari loads Mari's OKRs.

Selecting Mario loads Mario's OKRs.

No Assignment lookup is required to establish the member's participation.

---

# Member OKR Hierarchy

The product hierarchy is:

```text
Member
│
└── Objectives
    │
    └── Key Results
        │
        └── Initiatives
```

Each member can have their own performance objectives and measurable
outcomes.

The exact number and structure of Objectives, Key Results, and Initiatives
must remain data-driven.

---

# Runtime Is the Execution Layer

Runtime is responsible for time-bound performance execution.

Runtime records:

- monthly execution state
- current values
- scores
- comments
- lifecycle state
- aggregate state
- historical execution context

Runtime must not modify the reusable Builder configuration.

Runtime must not become the permanent source of Member OKRs.

The relationship is:

```text
Member OKRs
↓
Monthly Performance Execution
↓
Historical Performance
```

---

# Monthly Performance

Monthly performance is a product cadence.

The platform does not require an administrator-managed arbitrary
Reporting Period entity to operate monthly performance.

Historical performance should be derived from dated execution records.

The exact published Performance Sheet configuration used during a month
must be preserved for historical presentation.

---

# Performance Sheet

A Performance Sheet is the reusable presentation/configuration artifact.

It can define:

- Performance Header
- navigation
- layout
- sections
- fields
- tables
- charts
- reports/display composition

A Performance Sheet does not own a specific employee's Objectives, Key
Results, or Initiatives.

Published versions are immutable.

Changes create new draft revisions.

The same published configuration can be used to present different members'
OKRs.

---

# Mint Is the Reference — Not the Architecture

Mint demonstrates the desired class of employee performance experience.

For example, a member-facing performance experience may display:

- employee identity
- employee role
- role context
- objectives
- Key Results
- previous values
- target values
- current values
- score
- initiatives
- date updated
- percentage into the period
- OKR time frame

CascadEffects must generate this experience from data and configuration.

It must not hardcode Mint's users, objectives, teams, KPIs, or pages.

---

# Organizations Are Independent Tenants

Each organization is its own tenant.

An organization may have:

- its own branding
- departments
- teams
- users
- memberships
- roles
- permissions
- Member OKRs
- Performance Sheet configurations
- Runtime performance data
- dashboards
- reports

The platform must not assume every organization has the same hierarchy,
roles, KPIs, Objectives, or dashboard design.

---

# Administration Is the Management Layer

Administration manages the platform and organization data supporting the
performance system.

Administration areas include:

- Organization
- Departments
- Teams
- Users / Members
- Roles & Permissions
- Performance Sheets
- Member OKRs
- Dashboards
- Reports
- Settings
- AI configuration

Administration must not create duplicate performance engines.

Examples:

Performance Sheet Administration → manages Builder definitions.

Member OKR Administration → manages actual member OKR data.

Runtime → manages period-specific execution.

---

# Source-of-Truth Rule

One business concept must have one authoritative source.

Examples:

Organization → Organization domain

Organization Membership → Membership domain

Roles / Permissions → Authorization domain

Member Objectives → Member OKR domain

Member Key Results → Member OKR domain

Member Initiatives → Member OKR domain

Performance Sheet → Builder configuration domain

Monthly execution → Runtime domain

Historical KPI updates → Historical performance domain

Dashboards / Reports → presentation/query layers over authoritative data

No Administration page, dashboard, report, Builder screen, Runtime screen, or
AI feature may create a competing source of truth for these concepts.

---

# Super Admin Product Journey

The high-level product journey becomes:

```text
Super Admin creates Organization
↓
Configure Organization
↓
Create Departments / Teams
↓
Add Users / Members
↓
Configure Roles & Permissions
↓
Members automatically enter performance environment
↓
Create / configure Performance Sheet
↓
Open Builder
↓
Configure presentation
↓
Publish
↓
Members manage their own OKRs
↓
Member Performance Experience renders those OKRs
↓
Monthly Runtime records execution
↓
Managers review where applicable
↓
Historical performance becomes reportable
```

There is no required Assignment step between membership and performance
participation.

---

# Member Product Journey

The intended member journey is:

```text
Member signs in
↓
Authorized Organization context
↓
Member Workspace
↓
Member selects month / performance view
↓
Member sees their OKRs
↓
Member updates performance
↓
Runtime records period-specific execution
↓
Historical performance accumulates
```

A member's organization membership is the basis for access to their
performance environment.

Production authorization remains a separate security requirement.

---

# Manager / Administrator Product Journey

Managers and authorized administrators will eventually be able to:

- view authorized member performance
- review OKRs
- review monthly execution
- add manager comments
- approve or complete performance where applicable
- analyze historical performance

These workflows must consume the same Member OKR and Runtime sources.

---

# What We Are NOT Building

We are NOT:

- rebuilding Mint
- hardcoding one customer's performance sheet
- creating separate custom software for every organization
- putting employee Objectives/KRs/Initiatives inside the Builder
- requiring Assignment for organization membership
- creating duplicate Member performance models
- creating custom dashboards for each customer
- treating Administration screens as separate performance engines
- creating a second Runtime engine

We ARE building the platform that can generate systems like Mint.

---

# Product Decision Rule

Before implementing a feature, ask:

1. Does it help CascadEffects create, configure, administer, execute, or
   understand an organization's performance system?
2. Is it reusable across many organizations?
3. Does it preserve the Builder / Member OKR / Runtime boundaries?
4. Does it maintain one source of truth?
5. Does it respect platform-level versus organization-level authorization?
6. Does it move the platform toward configurable performance management
   rather than a hardcoded customer application?

If the answer is no or unclear, stop and reconcile the architecture before
coding.

---

# Development Guardrail

At the beginning of every development session:

```text
READ PRODUCT NORTH STAR
↓
READ LATEST WAYPOINT
↓
READ PLATFORM DECISIONS
↓
READ PLATFORM BACKLOG
↓
CONFIRM CURRENT MILESTONE
↓
IDENTIFY SPECIFIC FEATURE
↓
VERIFY IT SUPPORTS NORTH STAR
↓
BUILD
↓
COMPILE
↓
TEST
↓
COMMIT
↓
UPDATE DOCUMENTATION
↓
CREATE NEW WAYPOINT
```

No implementation should begin until the current milestone has been
re-established from documentation.

---

# Current Product Position

Builder

ESTABLISHED / COMPOSITION ENGINE

Runtime Execution Foundation

ESTABLISHED

Administration Foundation

ESTABLISHED

Organization

COMPLETE

Departments

COMPLETE

Teams

COMPLETE

Users / Members

COMPLETE

Roles & Permissions

FUNCTIONAL FOUNDATION COMPLETE

Platform Memberships

COMPLETE

Performance Sheet Management

COMPLETE

Assignment Management

LEGACY / TRANSITIONAL

Member Workspace

FOUNDATION COMPLETE

Member OKR Domain

NEXT ARCHITECTURAL MILESTONE

Authentication + Role-Based Entry

FOUNDATION COMPLETE / VERIFIED

Dashboards

V1 ESTABLISHED / DYNAMIC FUTURE

Reports

FUTURE

AI Presentation Mock-Ups

ESTABLISHED / PRESENTATION-ONLY

Live AI

FUTURE / BUSINESS APPROVAL REQUIRED

Production Authorization / RLS

OUTSTANDING

---

# Final Product Promise

The platform promise is:

> Configure the performance experience once, define each member's
> performance through their own OKRs, execute performance monthly, and
> generate reusable historical performance experiences without custom
> software development.

The final architecture is:

```text
Organization
↓
Organization Membership
↓
Member
↓
Member OKRs
↓
Monthly Performance Execution
↓
Historical Performance
```

with:

```text
Performance Sheet
↓
Builder
↓
Published Presentation Configuration
↓
Member Performance Experience
```

The Builder composes.

Member OKRs provide the employee performance data.

Runtime executes and preserves time-bound performance.

Dashboards, Tables, Charts, Reports, and future AI consume the same
authoritative data.

---

# Relationship to Other Documentation

This document does not replace:

- docs/waypoints/
- docs/01_Platform_Decisions.md
- docs/02_Platform_Backlog.md
- docs/00_Engineering_Process.md

Instead:

Product North Star defines what we are building and why.

Latest Waypoint defines where we currently are.

Platform Decisions define architectural rules.

Platform Backlog defines intentionally deferred work.

Engineering Process defines how we execute and preserve continuity.

Together these documents prevent development drift.

---

# Documentation Continuity Guardrail

If implementation behavior conflicts with this Product North Star, stop before
coding and reconcile the documentation and architecture first.

When a requirement materially changes:

- actor responsibilities
- organization context
- authorization boundaries
- source-of-truth ownership
- Builder / Member OKR / Runtime boundaries
- database relationships

the requirement must first be reflected in the appropriate repository
documents.

The conversation is not sufficient evidence to change the product model.

The repository documentation is the authoritative record.

**Status**

CURRENT — PRODUCT NORTH STAR
