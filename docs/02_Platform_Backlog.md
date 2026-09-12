CascadEffects Performance Platform

Platform Backlog

Document Status: CURRENT

Last Updated: 2026-09-11

This document tracks intentionally deferred architecture, product

capabilities, and future platform work.

It is not a historical development log.

Completed work should be recorded in Waypoints.

The latest Waypoint and current Platform Decisions take precedence when

determining the current project state.

Current Development Phase

Authentication + Role-Based Entry

Status

NEXT MILESTONE

The Runtime Dashboard / member performance separation has been completed and
verified.

The next dependency is authentication because the intended product experience
requires the platform to identify whether the authenticated actor is a
Platform Super Admin, Organization Admin, or Member.

This milestone establishes the smallest authentication foundation required to
route each actor to the correct landing experience.

Completed:

Organization

Departments

Teams

Users / Members --- Invitation Foundation

Users / Members --- User Edit

Users / Members --- User Deactivate

Roles & Permissions --- Role Foundation

Roles & Permissions --- Permission Assignment

Roles & Permissions --- Permission Removal

Roles & Permissions --- Membership Role Assignment

Roles & Permissions --- Membership Role Removal

Performance Sheet Management

Assignment Management

Administration Page Structure / Shared Header Standardization

Administration Organization Context / Cascading Selection

Status

COMPLETE / ESTABLISHED

The Super Admin Administration experience preserves explicit Organization
context across child Administration pages.

The established product pattern is:

Organization
↓
Department
↓
Team

The Organization page is the top-level tenant-management page and does not
require an Organization selector above it.

Child Administration pages use the selected Organization where applicable.

Department and Team context are dependent on the selected parent
Organization.

Changing the selected Organization resets dependent Department and Team
context.

The selected Organization ID is navigation and query context only.

It is not the authorization boundary.

Server-side authorization and eventual production RLS remain authoritative.

The same Organization context pattern applies to:

Users / Members

Roles & Permissions

Performance Sheets

Assignments

Objectives

Key Results

Initiatives

Dashboards

Reports

Settings

Organization Admin context is different.

An Organization Admin operates within one fixed Organization context and does
not provide an Organization-switching selector.

The Builder remains one shared engine for both administrative entry
contexts.

The Administration context reconciliation work is complete for the current
scope.

Production authorization and security hardening remain separate
architecture milestones.

The Builder and Runtime foundations already exist and are not rebuilt as part
of this Administration work.

Administration Roadmap

Organization

Status

COMPLETE

Departments

Status

COMPLETE

Teams

Status

COMPLETE

Users / Members

Status

COMPLETE

The Users / Members foundation establishes:

application user profile

organization membership

Department association

Team association

active / inactive state

Supabase Auth relationship

Completed:

User database foundation

Organization Membership database foundation

User domain model

Organization Membership domain model

User Management read model

User service

Users Administration page

Invite User workflow

Department → Team filtering

Server-side Supabase Admin workflow

Auth invitation

Organization Membership creation

User Edit workflow

User profile editing

Department editing

Team association editing

Active / inactive state editing

User Deactivate workflow

Membership Role management from User Edit

Remaining Users work:

Production tenant authorization

Production Row Level Security

Platform Authority

Status

FOUNDATION COMPLETE

The platform-level administrative authority foundation is established.

Completed:

Platform Membership database foundation

Platform Super Admin role model

Platform Super Admin persistence

Server-side Platform Super Admin resolution

Platform Super Admin authorization boundary

Platform Super Admin authority above Organization Roles

A Platform Super Admin does not require an Organization Membership in every

Organization they administer.

Platform Super Admins are not Organization Roles.

Platform Super Admins can administer organization-owned resources across

Organizations on behalf of those Organizations.

Organization Admins remain restricted to resources belonging to their own

Organization.

Remaining Platform Authority work:

Platform Administration UI

Super Admin assignment workflow

Super Admin management workflow

Production platform authorization enforcement

Production Row Level Security

Roles & Permissions

Status

FUNCTIONAL FOUNDATION COMPLETE

The Roles & Permissions foundation establishes:

reusable global Permissions

organization-scoped Roles

Role Permissions

Membership Roles

organization-aware database integrity

Role domain model

Permission domain model

Role Permission domain model

Membership Role domain model

Role service

Permission service

Role Permission service

Membership Role service

Roles Administration UI

Completed:

Permission database foundation

Permission catalog

Role database foundation

Role Permission database foundation

Membership Role database foundation

organization-aware integrity constraints

Role CRUD

Permission assignment

Permission removal

Membership Role assignment

Membership Role removal

User / Membership Role Administration workflow

TypeScript verification

real database CRUD verification

User Edit integration

Remaining Roles & Permissions work:

Production tenant authorization

Production Row Level Security

Full authorization enforcement across UI, services, APIs, and

database/RLS

Platform-level authorization integration

Performance Sheet Management

Status

COMPLETE

The Administration Performance Sheet management workflow is complete.

Completed:

Performance Sheet listing

Create Performance Sheet

Select Performance Sheet

Open Builder

Draft management

Published version management

Exact version selection

Version history

Published version navigation

Draft revision navigation

Builder navigation

Administration navigation

Published → Revision workflow

Performance Sheet lifecycle entry point

Builder remains responsible for Performance Sheet definition and editing.

Published versions remain immutable.

The existing performance_sheets records provide version history.

Deferred:

Archive

Duplicate

Search

Filtering

Advanced Performance Sheet management

Assignment Management

Status

COMPLETE

Assignment Management connects published Performance Sheet versions to

Runtime subjects.

Completed:

Assignment listing

Assignment creation

Assignment subject selection

Individual assignments

Team assignments

Department assignments

Organization assignments

Assignment lifecycle

Draft state

Active state

Completed state

Cancelled state

Published Performance Sheet association

Performance timeframe / monthly cadence context

Assignment → Performance Instance integration

Runtime subject resolution

Individual User identity resolution

Assignment Management remains an Administration capability.

Builder remains responsible for Performance Sheet definition.

Runtime remains responsible for Performance Instance execution.

Assignments reference exact published Performance Sheet versions.

Deferred hardening:

Assignment Subject Validation

Performance Instance Relationship Integrity

Production authorization

Production Row Level Security

Runtime security boundaries

Builder

Builder Definition Lifecycle

Status

ESTABLISHED

The Builder already supports the core definition lifecycle.

The Builder should not be rebuilt as part of Administration development.

The established lifecycle is:

Draft

↓

Validate

↓

Publish

↓

Published Version

↓

Create Revision

↓

New Draft

Published definitions remain immutable.

Multiple Performance Sheet Definitions

Status

DEFERRED

Future organizations will manage multiple logical Performance Sheets.

The platform should support:

sheet_key

Performance Sheet Library

multiple definitions

version selection

organization-scoped definitions

Runtime assignments should continue referencing the exact published

version.

3A. Administrative Entry Contexts

Platform Super Admin Administration Context

Status

ESTABLISHED

The Super Admin Administration experience is platform-level and supports
administration across Organizations through explicit Organization context.

The selected Organization is a UI/query context and must not replace
server-side authorization.

Organization Admin Workspace

Status

COMPLETE / ESTABLISHED

The Organization Admin workspace has been established as a separate
organization-scoped administrative entry context.

The Organization Admin workspace:

operates within one fixed Organization context

does not provide cross-Organization switching

provides access to organization configuration and administrative capabilities
according to the current product scope

uses the same underlying Builder engine as the Super Admin experience

does not create a second Builder

The current Organization Admin workspace establishes the intended UX and
navigation contract.

Production authorization must eventually derive and validate the
Organization Admin scope from authenticated Organization membership, role,
and permissions.

Priority

Complete

3B. Administration Context Components

Status

ESTABLISHED

The reusable Administration context pattern has been standardized for:

Organization selection

Department selection

Team selection

The component pattern resets dependent selections when a parent context
changes and passes IDs rather than names.

These components are UX/navigation context helpers, not authorization
mechanisms.

The Organization Admin workspace intentionally uses fixed Organization
context rather than an Organization-switching selector.

Priority

Complete

Runtime

Runtime Execution Foundation

Status

ESTABLISHED

The Runtime architecture has established:

Performance Instance resolution

Assignment resolution

exact published Performance Sheet resolution

time-bound execution context / monthly cadence

Runtime subject resolution

Key Result Progress

Current Value

Score

employee comments

manager comments

aggregate recalculation

Runtime lifecycle state

Builder and Runtime remain separate architectural layers.

Confidence is not part of the current Runtime Key Result update workflow.

Runtime Scoring Utility

Status

ESTABLISHED

The Runtime currently includes a small scoring utility.

Current scoring method:

Percentage of Target

current value ÷ target value × 100

Scores are stored internally on a 0–100 scale.

The Runtime UI displays the score as a percentage.

The current scoring utility intentionally remains small.

A generalized KPI Calculation Engine remains future platform work.

Runtime Product Experience

Status

FOUNDATION CHECKPOINT COMPLETE / CONTINUING AFTER AUTHENTICATION

The Runtime Execution Foundation and Member Workspace Foundation are

established.

The next milestone is to turn those foundations into the complete

day-to-day performance-management experience.

Priority areas include:

- richer Runtime workspace presentation
- member performance workflow
- monthly navigation
- previous/current/target performance presentation
- measurement-type-aware value entry
- score visibility
- Objective / Key Result / Initiative presentation
- initiative add/edit/remove workflow
- employee comments
- manager comments
- Runtime lifecycle presentation
- manager review / approval experience
- clear performance status
- historical month navigation
- consistent performance-sheet visual hierarchy

The work must reuse the existing Runtime engine.

Do not create a second performance engine or a second Member performance

data model.

Mint remains a UX reference, not an architecture to rebuild.

The Runtime Product Experience must remain generated from:

Builder Definition

↓

Published Performance Sheet

↓

Assignment

↓

Monthly Performance Instance

↓

Runtime Data

↓

Member / Manager Experience

Priority

High

Architecture

Organization Table Naming

Current

organization

Future

organizations

Reason

Standardize naming across database tables.

Priority

Medium

Status

Deferred

Organization Domain Model

Current

src/lib/types/organization.ts

Future

src/lib/domain/organization.ts

Introduce persistence row types separately where appropriate.

Reason

Separate persistence models from domain models.

Priority

Medium

Status

Deferred

Repository Row Naming

Rename:

PerformanceSheetRecord

to:

PerformanceSheetRow

Reason

Improve naming consistency.

Priority

Low

Status

Deferred

Repository Mappers

Create:

src/lib/supabase/mappers/

Reason

Separate persistence mapping from repository logic.

Priority

Medium

Status

Deferred

Security

Tenant Authorization Hardening

Status

DEFERRED

Production authorization must enforce Organization boundaries across

repositories and services.

Organization Admin authorization is restricted to resources belonging to

their own Organization.

Platform Super Admin authorization may administer organization-owned

resources across Organizations on behalf of those Organizations.

The authorization boundary must be enforced server-side and through

production RLS rather than relying only on UI visibility.

Priority

High

Production Row Level Security

Status

DEFERRED

Implement and validate production-ready Supabase RLS policies.

RLS must preserve Organization tenant isolation while allowing the

platform-level Super Admin authority defined by Platform Decisions.

Priority

High

Runtime Security Boundaries

Status

DEFERRED

Establish appropriate server-side service boundaries and authorization

checks for production Runtime operations.

Priority

High

User / Role Authorization

Status

DEFERRED

After Users / Members and Roles / Permissions are established, implement

consistent authorization across:

UI

server services

database / RLS

Organization Admin access must remain organization-scoped.

Platform Super Admin access must support platform-level administration

across Organizations.

Priority

High

Runtime Data Architecture

Assignment Subject Validation

Status

DEFERRED

Validate that subjectId belongs to the entity represented by

assignmentType.

Examples:

individual → valid User

team → valid Team

department → valid Department

organization → valid Organization

Reason

Prevent invalid polymorphic assignment references.

Priority

Medium

Performance Instance Relationship Integrity

Status

DEFERRED

Enforce consistency between Performance Instance and Assignment.

The Performance Instance should remain consistent with:

Assignment

Organization

time-bound execution context / monthly cadence

Exact Performance Sheet version

Reason

Prevent duplicated Runtime references from becoming inconsistent.

Priority

Medium

Reporting Cadence / Historical Time Model

Status

ESTABLISHED PRODUCT RULE / ARCHITECTURAL HARDENING FUTURE

Monthly performance is a product cadence, not an administrator-managed
Reporting Period entity.

The platform should derive time-bound performance context from assignment,
performance instance, and dated Runtime records.

Do not reintroduce reportingPeriodId into Assignment or PerformanceInstance
unless a future product decision explicitly changes this rule.

Historical KPI Updates remain responsible for durable time-series records
needed for reporting, trends, auditability, and future analytics.

Priority

High

Historical KPI Updates

Status

DEFERRED

Create a durable time-series KPI Update model.

The model should preserve:

Performance Instance

Key Result

measured value

calculated score

timestamp

reporting context

update source where appropriate

Reason

Support historical reporting, trend analysis, auditability, and future

predictive analytics.

Priority

High

KPI Calculation Engine

Status

DEFERRED

Create a generalized KPI calculation engine supporting future KPI types

such as:

numeric

currency

percentage

time-bound

reverse scoring

shared/team metrics

department metrics

organization metrics

Reason

Separate reusable KPI definitions from Runtime calculations.

Priority

High

Weighted Aggregation

Status

DEFERRED

Formalize weighted aggregation at:

Key Result level

Objective level

Performance Instance level

Reason

Runtime aggregation should eventually honor Performance Sheet weights.

Priority

High

Runtime Workflow

Runtime Lifecycle

Status

ESTABLISHED / FUTURE ENHANCEMENTS

The core Runtime lifecycle has been implemented and verified.

Current lifecycle:

In Progress

↓

Submitted

↓

Approved

↓

Completed

Future work may refine:

transition rules

authorization

workflow controls

manager approval behavior

Historical Reporting

Historical Performance Reporting

Status

FUTURE

Support:

previous reporting periods

performance trends

team comparisons

department comparisons

organizational comparisons

historical performance records

Priority

High


---

Settings and AI Product Experience

Settings and AI work should follow the administrative authority model and
remain separate from the authentication foundation until the authentication
milestone is complete.

## Super Admin Settings

Status

PLANNED

Build a platform-level Settings page for CascadEffects Super Admins.

Initial scope:

- platform-level configuration areas
- global defaults where appropriate
- platform feature controls
- future global AI configuration
- clearly identified future settings

Do not duplicate Organization-specific configuration here.

Priority

Medium

## Organization Admin Settings

Status

NEXT AFTER AUTHENTICATION / PLANNED

Build an organization-scoped Settings page for Organization Admins.

Initial scope:

- Organization preferences
- organization performance-management preferences where appropriate
- notification preferences
- organization integrations / data configuration where appropriate
- clearly identified future settings

The page must use the authenticated Organization context.

Do not provide an Organization-switching selector.

Do not reintroduce administrator-managed Reporting Period configuration.

Priority

Medium

## Super Admin AI Mock-up

Status

PLANNED / MOCK-UP FIRST

Create a Super Admin AI page that demonstrates the future CascadEffects AI
experience without requiring live AI API usage.

Initial UI may include:

- sample questions
- suggested prompts
- example help responses
- "Chat with Me" interaction
- visible future-capability messaging

Priority

Medium

## Organization Admin AI Mock-up

Status

PLANNED / MOCK-UP FIRST

Create an Organization Admin AI page with the same future-assistant concept,
but scoped to Organization Admin workflows.

Initial UI may include:

- sample organization-management questions
- suggested prompts
- example help responses
- "Chat with Me" interaction
- visible future-capability messaging

Priority

Medium

## Live AI Help Assistant

Status

FUTURE / BUSINESS APPROVAL REQUIRED

Implement the live documentation/product-help assistant after business
approval for the separate AI API operating expense.

Requirements include:

- secure server-side API integration
- approved CascadEffects documentation context
- relevant-document retrieval
- no browser-exposed API keys
- usage monitoring
- cost controls
- no private performance-data access in Phase 1

Priority

Medium

## AI Data-Aware Expansion

Status

FUTURE

Future phases may add:

- performance analysis
- KPI insights
- planning assistance
- reporting summaries
- recommendations
- predictive analytics

This requires completed authentication, authorization, Organization scoping,
and secure data-access architecture before private performance data is
provided to the AI.

Priority

Medium

## Authentication and Role-Based Entry

Status

NEXT MILESTONE

The platform must replace the current role-selection login experience with
authentication-driven role recognition.

Required actor types:

- Platform Super Admin
- Organization Admin
- Member

The authenticated session should resolve:

- Supabase Auth identity
- Application User
- Platform Membership where applicable
- Organization Membership where applicable
- applicable role context

Required post-login landing experiences:

```text
Platform Super Admin
↓
Super Admin Landing
├── Manage Organizations
└── Open Organization Performance
    ↓
Organization Selector

Organization Admin
↓
Organization Admin Landing
├── Open Organization Workspace
└── Open Organization Performance

Member
↓
Member Landing
├── Open My Performance
└── Open Organization Performance
```

Authentication should include:

- Login
- authenticated session
- identity resolution
- role-aware routing
- Forgot Password
- Password Reset

The role-selection dropdown must not be used as an authorization mechanism.

Production authorization and RLS remain a separate security milestone.

Priority

High


Dashboards

Dynamic Dashboard System

Status

FUTURE

Dashboards should be generated from platform data rather than

custom-built for individual organizations.

Potential dashboard levels:

individual

team

department

executive

organization

AI

AI-Assisted Planning

Status

FUTURE

Potential capabilities:

objective generation

Key Result recommendations

KPI suggestions

goal quality analysis

initiative recommendations

performance insights

strategic planning assistance

automated reporting summaries

Predictive Analytics

Status

FUTURE

Potential capabilities:

performance trend analysis

risk detection

forecasting

organizational performance insights

Visual Design System

CascadEffects Design System

Status

PARTIALLY ESTABLISHED / CONTINUE AFTER AUTHENTICATION

The next product-experience increment should establish the centralized
CascadEffects default design system before broad page-by-page visual
refinement.

Official Brand Guide colors:

Deep Navy

#082550

Grayish Blue

#B4C2D1

Light Blue

#E9F4F8

Dark Charcoal

#272D2C

White

#FFFFFF

Coral

#E26D5C

The four signature brand colors that should remain visually prominent are:

Deep Navy

Grayish Blue

Light Blue

Coral

Coral is a selective callout / action color.

The design system should centralize reusable tokens for:

page backgrounds

surfaces

cards

borders

typography

buttons

forms

dialogs

tables

navigation

status indicators

spacing

radius

shadows

iconography

The Brand Guide typography direction should be reflected where appropriate:

Roboto Black

Martel Sans

Khula

The platform should favor consistent line iconography and consistent stroke
treatment.

The visual experience should feel:

clean

modern

minimalist

structured

confident

professional

The centralized design system should be reusable across:

Administration

Builder

shared platform navigation

Dashboards

Reports

Runtime

Runtime may later apply organization-specific visual configuration.

Organization-specific branding should eventually be configurable through
Administration.

The CascadEffects default theme should remain the platform fallback.


Deployment / Environment Configuration

Environment Validation

Status

FUTURE

Future deployment hardening should include:

environment variable validation

missing environment detection

production health checks

Supabase connectivity verification

clear deployment diagnostics

separation of public configuration from server-only secrets

Current Milestone Rule

The current milestone must always be determined from:

Latest Waypoint

Platform Decisions

Platform Backlog

Historical Waypoints must not be treated as current task lists.

If an older document says something is "Next Milestone" but a newer

Waypoint shows that work has already progressed beyond it, the older

statement is historical and must not redirect development.

Documentation Maintenance

When a major milestone is completed:

Update the relevant Platform Decisions if architecture changed.

Update this Platform Backlog if roadmap status changed.

Compile successfully.

Test the implementation.

Commit the implementation.

Push to GitHub.

Create a new Waypoint.

Confirm the new Waypoint is the current project checkpoint.

Do not modify historical Waypoints merely to make them current.

Current Project Position

Builder

COMPLETE / ESTABLISHED

Runtime Execution Foundation

COMPLETE / ESTABLISHED

Administration Foundation

COMPLETE / ESTABLISHED

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

Platform Authority

FOUNDATION COMPLETE

Platform Memberships

COMPLETE

Platform Super Admin authorization foundation

COMPLETE

Performance Sheet Management

COMPLETE

Assignment Management

COMPLETE

Administration Page Structure / Shared Header Standardization

COMPLETE

Administration Organization Context / Cascading Selection

COMPLETE / ESTABLISHED

Organization Admin Workspace Foundation

COMPLETE / ESTABLISHED

Organization Admin Fixed Organization Context

ESTABLISHED

One Builder / Two Administrative Entry Contexts

ESTABLISHED

Objectives / Key Results / Initiatives

BUILDER-OWNED / ESTABLISHED

Monthly Performance Cadence

ESTABLISHED PRODUCT RULE

Member Performance Navigation

ESTABLISHED

Runtime Dashboard / Member Performance Separation

COMPLETE / VERIFIED

Runtime Product Experience

FOUNDATION CHECKPOINT COMPLETE / CONTINUING AFTER AUTHENTICATION

Authentication + Role-Based Entry

NEXT MILESTONE

Dashboards

V1 ESTABLISHED / DYNAMIC SYSTEM FUTURE

Reports

FUTURE

AI

PLANNED MOCK-UP / LIVE AI FUTURE

Settings

PLANNED / AUTHORITY-SCOPED

Production Authorization / RLS

OUTSTANDING / LATER SECURITY MILESTONE

Runtime Security Boundaries

DEFERRED

Historical KPI Updates

DEFERRED

KPI Calculation Engine

DEFERRED

Weighted Aggregation

DEFERRED

Historical Performance Reporting

DEFERRED

CascadEffects Design System

PARTIALLY ESTABLISHED / CONTINUE AFTER AUTHENTICATION

Next Development Session

Start from the latest Waypoint.

Review:

Latest Waypoint

Platform Decisions

Platform Backlog

Product North Star

Confirm the Authentication + Role-Based Entry milestone.

Inspect the existing:

- Supabase Auth implementation
- login page
- authentication services
- Application User resolution
- Platform Membership resolution
- Organization Membership resolution
- existing role / permission foundations

Implement only the authentication foundation required for the three role-based
landing experiences.

Required post-login entry:

Platform Super Admin

↓

Super Admin Landing

├── Manage Organizations

└── Open Organization Performance

    ↓

Organization Selector

Organization Admin

↓

Organization Admin Landing

├── Open Organization Workspace

└── Open Organization Performance

Member

↓

Member Landing

├── Open My Performance

└── Open Organization Performance

Authentication should include:

- Login
- authenticated session
- identity resolution
- role-aware routing
- Forgot Password
- Password Reset

Do not implement full production authorization or RLS as part of this
milestone unless an actual blocking dependency is discovered.

Do not rebuild Builder.

Do not create a second Runtime engine.

Do not create a second Member performance data model.

Do not reintroduce an administrator-managed Reporting Period entity.

After authentication is complete and verified, continue the product-experience
roadmap in this order unless the latest Waypoint establishes a different
priority:

1. Super Admin Settings
2. Organization Admin Settings
3. Super Admin AI mock-up
4. Organization Admin AI mock-up
5. Live AI Help Assistant after business approval
6. Remaining Runtime Product Experience / Design & Vibe work

Do not treat the AI mock-ups as live AI functionality.
Do not activate paid AI API usage without business approval.


---


# Current Milestone Update — Waypoint 26

The following product-experience work is now treated as completed presentation
work:

- Super Admin Settings presentation
- Organization Admin Settings presentation
- Super Admin AI mock-up
- Organization Admin AI mock-up
- Member AI Assistant floating mock-up

These items remain non-operational where AI is concerned. Live AI provider
integration, API costs, production AI data access, and production AI
authorization remain deferred.

The next active milestone is:

> Authentication + Role-Based Entry

The authentication milestone should establish:

- Supabase Auth session handling
- Application User resolution
- Platform Super Admin resolution
- Organization Membership resolution
- role-aware entry
- Super Admin landing
- Organization Admin landing
- Member landing
- Forgot Password
- Password Reset

Authentication must remain separate from production authorization.

Do not use role selection on the client as proof of authority. Production
authorization, tenant boundaries, permissions, server-side enforcement, and
RLS remain security work to be completed appropriately.

No Builder or Runtime rebuild is part of this milestone.
