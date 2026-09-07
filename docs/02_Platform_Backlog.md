CascadEffects Performance Platform

Platform Backlog

Document Status: CURRENT

Last Updated: 2026-09-02

This document tracks intentionally deferred architecture, product

capabilities, and future platform work.

It is not a historical development log.

Completed work should be recorded in Waypoints.

The latest Waypoint and current Platform Decisions take precedence when

determining the current project state.

Current Development Phase

Member Workspace Foundation

Status

NEXT MILESTONE

The platform is currently completing the Administration management layer.

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

Runtime Workspace Enhancements

Status

FUTURE

Future enhancements may include:

richer Runtime workspace presentation

weighted aggregation

additional KPI visualization

historical updates

expanded workflow controls

additional reporting context

improved member experience

Runtime Workspace is NOT the current milestone.

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

FUTURE

Create centralized design tokens for:

Deep Navy

Coral

White

light gray surfaces

typography

buttons

forms

cards

dialogs

tables

navigation

status indicators

The design system should be reusable across:

Administration

Builder

Runtime

Dashboards

Reports

Organization-specific branding should eventually be configurable through

Administration.

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

Dashboards

V1 ESTABLISHED / DYNAMIC SYSTEM FUTURE

Reports

FUTURE

AI

FUTURE

Production Authorization / RLS

OUTSTANDING

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

Next Development Session

Start from the latest Waypoint.

Review:

Latest Waypoint

Platform Decisions

Platform Backlog

Product North Star

Confirm the Member Workspace Foundation milestone before implementation.

The Administration foundation is established for the current scope.

Completed Administration foundation includes:

Organization

Departments

Teams

Users / Members

Roles & Permissions foundation

Performance Sheet Management

Assignment Management

Administration Page Structure / Shared Header Standardization

Super Admin Organization context

Organization → Department → Team cascading context

Organization context across child Administration pages

Organization Admin fixed Organization context

One Builder / two administrative entry contexts

Super Admin → Organization Workspace entry

Objectives / Key Results / Initiatives remaining Builder-owned

Monthly cadence without an administrator-managed Reporting Period entity

The next development phase is:

Member Workspace Foundation

Before implementation, inspect the existing Runtime architecture.

The Member Workspace must:

operate on existing Runtime architecture

consume existing Assignments

consume existing Performance Instances

consume published Performance Sheet versions

preserve the Builder / Runtime boundary

avoid creating a parallel performance engine

avoid duplicating Objective definitions

avoid duplicating Key Result definitions

avoid duplicating Initiative definitions

avoid duplicating KPI calculation logic

avoid creating member-specific Performance Sheet definitions

respect the existing monthly execution model

Production authorization and security hardening remain separate milestones.

The Platform Membership / Super Admin foundation is complete but is not

yet production security hardening.

High-priority architectural hardening remains:

Production Tenant Authorization

Production Row Level Security

Runtime Security Boundaries

Assignment Subject Validation

Performance Instance Relationship Integrity

Historical KPI Updates

KPI Calculation Engine

Weighted Aggregation

Historical Performance Reporting

Other future product capabilities may include:

advanced Performance Sheet management

additional management workflows

Dashboards

Reports

AI configuration

Do not rebuild Builder.

Do not rebuild Runtime.

Do not duplicate Runtime execution logic.

Do not introduce an arbitrary Reporting Period entity.

The repository remains the authoritative engineering record.

Current Deferred Priorities

Priority: High

Member Workspace Foundation

Production Tenant Authorization

Production Row Level Security

Runtime Security Boundaries

Historical KPI Updates

KPI Calculation Engine

Weighted Aggregation

Historical Performance Reporting

Priority: Medium

Assignment Subject Validation

Performance Instance Relationship Integrity

Organization Domain Model

Repository Mappers

Organization table naming standardization

Priority: Future Product

Multiple Performance Sheet Definitions

Performance Sheet Library

Archive

Duplicate

Search

Filtering

Dynamic Dashboard System

Reports

AI-Assisted Planning

Predictive Analytics

CascadEffects Design System

Environment Validation