CascadEffects Performance Platform

Product North Star

Document: docs/03_Product_North_Star.md
Status: CURRENT --- PRODUCT NORTH STAR
Created: 2026-09-01

Purpose

This document defines the product North Star for the CascadEffects
Performance Platform.

It exists to prevent development from drifting into isolated features,
rebuilding completed systems, or confusing the Administration layer with
the Builder or Runtime.

The repository documentation remains the engineering source of truth.
This document adds the permanent product-level direction that every
future feature should support.

The North Star

CascadEffects is a multi-tenant SaaS platform that allows
CascadEffects Platform Super Admins to create, configure, publish, and
manage performance-management systems for multiple organizations ---
without custom software development for each organization.

The platform is not Mint rebuilt in another codebase.

Mint is a reference implementation that demonstrates the kind of
performance experience the platform must be able to generate.

The platform must allow each customer organization to have its own
people, structure, roles, performance definitions, dashboards, reporting
experience, and operational performance data.

The Core Product Model

The platform has three major layers:

ADMINISTRATION
|
| manages organizations, people,
| permissions, definitions, assignments
v
BUILDER
|
| creates reusable Performance Sheet definitions
v
PUBLISHED PERFORMANCE SHEET
|
| assigned to a person, team,
| department, or organization
v
RUNTIME
|
| records period-specific performance
v
PERFORMANCE DATA / REPORTING

The critical architectural boundary remains:

Builder Definition
↓
Published Performance Sheet Version
↓
Assignment
↓
Performance Instance
↓
Runtime Execution
↓
Historical Performance / Reporting

Builder definitions must remain separate from period-specific Runtime
state.

CascadEffects Platform Super Admin

The CascadEffects Platform Super Admin is a platform-level
administrator.

The Super Admin is responsible for operating the SaaS platform across
organizations.

A Super Admin may:

create and manage organizations

enter and administer an organization

manage organization structure

manage users and memberships

manage roles and permissions

manage Performance Sheets

open and use the Builder

create and publish Performance Sheet definitions

assign published Performance Sheets

administer organization performance configuration

manage platform-level administration

eventually manage other CascadEffects Super Admins

A Platform Super Admin is NOT an Organization Role.

Platform authority is represented separately through Platform
Memberships.

A Super Admin does not need an Organization Membership merely to
administer an organization.

Organization Admin

An Organization Admin belongs to a specific customer organization.

The Organization Admin manages that organization's operational
configuration according to the permissions granted through the
organization Roles & Permissions system.

The conceptual relationship is:

CascadEffects Platform
|
+-- Platform Super Admin
|
+-- Organization A
|      |
|      +-- Organization Admin
|      +-- Departments
|      +-- Teams
|      +-- Users / Members
|      +-- Roles / Permissions
|      +-- Performance Sheets
|      +-- Assignments
|
+-- Organization B
|
+-- Organization Admin
+-- Departments
+-- Teams
+-- Users / Members
+-- Roles / Permissions
+-- Performance Sheets
+-- Assignments

The important product rule is:

The Super Admin operates above the organization boundary and can
administer the organization; the Organization Admin operates within
the organization according to organization-level authorization.

Production authorization and RLS will enforce these boundaries.

Organizations Are Independent Tenants

Each organization is its own tenant.

For example:

Mint Orthodontics

might have:

its own branding

its own departments

its own teams

its own users

its own roles

its own Performance Sheets

its own objectives

its own Key Results

its own initiatives

its own assignments

its own Runtime performance data

its own dashboards

its own reports

Another organization may configure all of these differently.

The platform must not assume that every organization has the same
hierarchy, roles, KPIs, objectives, or dashboard design.

The Performance Sheet Is the Central Product Artifact

The Performance Sheet is the configurable performance-management
definition created through the Builder.

A Performance Sheet can define, for example:

Performance Header

Possible fields may include:

date updated

period progress

reporting period / time frame

other organization-specific performance context

Objectives

An organization may define any number of objectives.

Example:

Patient Starts

New Patient Conversion

Key Results

Each Objective may contain multiple Key Results.

Example:

Starts @ Home

Total Starts

SDS

Total Production

Collections from Starts

Initiatives

Initiatives remain lightweight execution notes attached to Key Results.

They are not project-management objects.

Comments

Comments may be part of the performance experience where supported by
the Builder/Runtime architecture.

The Builder owns the reusable definition.

Runtime owns period-specific execution values.

Mint Is the Reference --- Not the Architecture

The existing Mint OKR application demonstrates the desired type of
employee performance experience.

For example, a member-facing performance sheet may display:

employee name

employee role

role definition

objectives

Key Results

previous-period values

target values

current-period values

score

initiatives

date updated

percentage into the period

OKR time frame

This is a reference for the experience.

The CascadEffects platform must generate this kind of experience from
data and configuration rather than hardcoding Mint's users, objectives,
KPIs, teams, or pages.

One Organization Can Have Many Users

An organization may have many members.

Each member can have:

a unique application identity

a name

a role

department association

team association

organization membership

permissions

assigned Performance Sheets

Runtime performance records

The platform must support individual, team, department, and
organization-level performance.

Performance Is Time-Bound

Performance data is not simply a single current number.

The platform must support time-bound performance.

Conceptually:

Performance Sheet Definition
↓
Assignment
↓
Performance Instance
↓
KPI Updates
↓
Score / Aggregation
↓
Historical Record

This is necessary for:

monthly performance cadence

historical reporting

trend analysis

comparisons

auditability

future predictive analytics

Runtime values must not overwrite the reusable Builder definition.

Administration Is the Management Layer

The Administration area exists to manage the business and platform data
that supports the performance system.

The current Administration hierarchy is:

Organization
↓
Departments
↓
Teams
↓
Users / Members
↓
Organization Membership
↓
Roles / Permissions
↓
Performance Sheets
↓
Assignments

Platform authority exists above this hierarchy:

CascadEffects Platform
↓
Platform Membership
↓
Platform Super Admin
↓
Organizations

The Administration home page is therefore a control center, not the
performance application itself.

Administration Areas

The Super Admin Administration experience is intended to provide access
to:

Organization

Organization profile, branding, and configuration.

Departments

Create and manage organization departments.

Teams

Create and manage organization teams.

Users

Invite and manage organization users/members.

Roles & Permissions

Define organization roles and control access through permissions.

Performance Sheets

Manage reusable Performance Sheet definitions and open them in the
Builder.

Assignments

Assign published Performance Sheets to:

individuals

teams

departments

organizations

Objectives

Provide administration visibility into Performance Sheet objectives.

The Objectives area must remain connected to the Builder definition
rather than becoming a second source of truth.

Key Results

Provide administration visibility into measurable outcomes defined by
Performance Sheets.

The Key Results area must remain connected to the Builder definition.

Initiatives

Provide administration visibility into initiatives associated with Key
Results.

Dashboards

Future capability for configurable dashboards generated from platform
data.

Reports

Future capability for historical and organizational performance
reporting.

Settings

Platform and organization configuration.

AI Configuration

Future configuration for AI-assisted planning, recommendations,
analysis, and reporting.

Important Rule: Do Not Create Duplicate Sources of Truth

A feature should not create a second independent representation of a
concept already owned elsewhere.

Examples:

Builder owns Performance Sheet definitions.

Runtime owns period-specific execution state.

Organization owns organizational identity.

Memberships connect users to organizations.

Roles and Permissions own organization authorization.

Platform Memberships own platform-level authority.

If an Administration screen displays Objectives, it should read from the
appropriate Performance Sheet definition rather than maintaining a
separate Objective database simply because the screen is called
"Objectives."

The same principle applies to Key Results and other Builder-owned
definitions.

Builder Is the Construction Engine

The Builder is not a one-off editor for Mint.

It is the reusable construction engine of CascadEffects.

The Builder must allow administrators to configure Performance Sheet
definitions including:

organization presentation

navigation

performance header

objectives

Key Results

initiatives

comments

validation

draft persistence

publishing

revision creation

published version preservation

Published versions are immutable.

Changes to a published Performance Sheet create a new draft revision.

Runtime Is the Execution Engine

Runtime is the operational performance experience.

Runtime is responsible for:

Performance Instance state

Key Result progress

current values

scores

employee comments

manager comments

Runtime status

aggregate Runtime state

Runtime must not modify Builder definitions.

The member-facing experience shown by the Mint reference should
ultimately be generated by this Runtime layer from the assigned
published Performance Sheet version and its period-specific performance
data.

The Platform Must Be Data-Driven

Avoid hardcoding:

users

names

organizations

departments

teams

roles

objectives

Key Results

dashboards

reporting structures

KPI calculations

Prefer:

database records

IDs

relationships

configuration

reusable definitions

published versions

assignments

permissions

data-driven rendering

The goal is:

Configure once, generate repeatedly.

The Super Admin Product Journey

The intended high-level journey is:

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

Create Performance Sheet
↓

Open Performance Sheet in Builder
↓

Build Objectives
↓

Add Key Results
↓

Add Initiatives
↓

Validate
↓

Publish
↓

Assign published version
↓

Runtime generates working performance experience
↓

Members update performance
↓

Managers review / approve where applicable
↓

Historical performance becomes reportable

This is the product journey we are building toward.

The Super Admin Must Be Able to Administer What the Organization Admin Can

A core product requirement is:

A CascadEffects Super Admin must be able to administer an
organization without being artificially blocked by that organization's
membership structure.

This means the Super Admin should ultimately be able to:

inspect organization configuration

edit organization configuration

manage departments

manage teams

manage users

manage memberships

manage roles and permissions

manage Performance Sheets

open Performance Sheets in Builder

administer assignments

administer organization performance configuration

The Super Admin authority must remain platform-level.

The Organization Admin remains organization-scoped.

This distinction must be preserved in the authorization architecture.

What We Are NOT Building

We are NOT:

rebuilding Mint

hardcoding one customer's performance sheet

creating separate custom software for every organization

rebuilding the Builder

rebuilding the Runtime foundation

creating duplicate Objective or Key Result sources of truth

creating custom dashboards for each customer

treating Administration screens as separate performance engines

We ARE building the platform that can generate systems like Mint.

Product Decision Rule

Before implementing a feature, ask:

Question 1

Does this help CascadEffects create, configure, administer, execute, or
understand an organization's performance system?

Question 2

Is the feature reusable across many organizations?

Question 3

Does it preserve the Builder / Runtime boundary?

Question 4

Does it maintain one source of truth?

Question 5

Does it respect platform-level versus organization-level authorization?

Question 6

Does it move the platform toward configurable performance management
rather than toward a hardcoded customer application?

If the answer is no or unclear, stop and discuss the architecture before
coding.

Development Guardrail

At the beginning of every development session:

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
IDENTIFY THE SPECIFIC FEATURE
↓
VERIFY IT SUPPORTS THE NORTH STAR
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

No implementation should begin until the current milestone has been
re-established from the documentation.

Current Project Position

As of the latest completed implementation Waypoint (Waypoint 18):

Builder: COMPLETE / ESTABLISHED

Runtime Execution Foundation: COMPLETE / ESTABLISHED

Administration: IN PROGRESS

Organization: COMPLETE

Departments: COMPLETE

Teams: COMPLETE

Users / Members: COMPLETE

Roles & Permissions: FUNCTIONAL FOUNDATION COMPLETE

Platform Memberships: COMPLETE

Platform Super Admin Authorization Foundation: COMPLETE

Performance Sheet Management: COMPLETE

Assignment Management: COMPLETE

Dashboards: FUTURE

Reports: FUTURE

AI: FUTURE

Production Authorization / RLS: OUTSTANDING

The next development direction must be selected from the current
Waypoint, Platform Decisions, and Platform Backlog.

Current Security Boundary

Platform Super Admin authority is established as a separate
platform-level authority.

The current authorization model is conceptually:

Supabase Auth
↓
Application User
↓
├── Platform Membership
│        ↓
│   Platform Super Admin
│
OR
│
└── Organization Membership
↓
Membership Roles
↓
Organization Roles
↓
Role Permissions
↓
Permission

The current foundation is not yet complete production authorization.

Production enforcement must eventually cover:

authenticated identity

active platform membership where required

organization membership where required

role assignment

permission assignment

organization context

resource ownership

UI

server services

API routes

database / RLS

The Final Test

When we are unsure what to build next, return to this sentence:

We are building CascadEffects so a Super Admin can create a
configurable performance-management system for an organization, and
that system can then operate for its users through Builder → Published
Performance Sheet → Assignment → Runtime → Historical Performance.

If a proposed feature moves us toward that outcome, it belongs on the
roadmap.

If it moves us sideways, duplicates an existing source of truth,
rebuilds completed architecture, or only solves one customer's hardcoded
problem, we should stop and reconsider.

Relationship to Other Documentation

This document does not replace:

docs/waypoints/

docs/01_Platform_Decisions.md

docs/02_Platform_Backlog.md

docs/00_Engineering_Process.md

Instead:

Product North Star defines what we are building and why.

Latest Waypoint defines where we currently are.

Platform Decisions define architectural rules.

Platform Backlog defines intentionally deferred work.

Engineering Process defines how we execute and preserve
continuity.

Together these documents are the guardrail against development drift.

Administrative Actor and Organization Context Model

CascadEffects has two distinct administrative experiences.

Platform Super Admin

The Platform Super Admin is a platform-level administrator operating above
the organization tenant boundary.

The Super Admin Administration experience is cross-organization.

When a Super Admin operates on organization-owned resources, the Super Admin
selects an Organization context.

The selected Organization determines which tenant's resources are displayed
and managed.

A Super Admin does not need an Organization Membership merely to administer
an organization.

Organization Admin

The Organization Admin is an organization-scoped administrator.

The Organization Admin operates only within the organization for which the
administrator is authorized.

The Organization Admin does not receive a cross-tenant Organization selector.

The Organization context is established by the authenticated user's
organization authorization.

The Organization Admin can manage the organization's configuration and
performance-management system according to the organization's Roles &
Permissions.

The permanent distinction is:

Platform Super Admin
↓
Platform authority
↓
Select Organization
↓
Administer selected organization

Organization Admin
↓
Organization authority
↓
Authorized Organization
↓
Administer that organization

One Builder, Two Administrative Entry Contexts

CascadEffects has one reusable Builder engine.

There is not a separate Super Admin Builder and Organization Admin Builder.

Both administrative actors may enter the same Builder when authorized.

Super Admin entry:

Platform Administration
↓
Select Organization
↓
Performance Sheets
↓
Open Builder
↓
Edit selected organization's Performance Sheet

Organization Admin entry:

Organization Administration / Workspace
↓
Authorized Organization
↓
Performance Sheets
↓
Open Builder
↓
Edit that organization's Performance Sheet

The Builder remains the single authoritative construction engine.

Organization context determines which organization's definition is being
edited.

Authorization determines whether the actor may edit that definition.

Super Admin Administration Context Contract

The Platform Super Admin Administration experience is operated by the
Platform Super Admin.

The Organization page is the special top-level tenant-management page.
It does not require an Organization selector above it because it is where
organizations themselves are created and managed.

Every organization-child Administration page must operate against an
explicitly selected Organization context.

Expected context:

Departments
↓
Organization selector
↓
Department management

Teams
↓
Organization selector
↓
Department selector
↓
Team management

Users / Members
↓
Organization selector
↓
User management

Roles & Permissions
↓
Organization selector
↓
Role management

Performance Sheets
↓
Organization selector
↓
Performance Sheet management
↓
Builder

Assignments
↓
Organization selector
↓
Assignment management

Objectives / Key Results / Initiatives
↓
Organization selector
↓
Read Builder-owned definitions
↓
Open Builder when editing is required

Dashboards / Reports / Settings
↓
Organization selector
↓
Organization-scoped experience

Changing the selected Organization must reset dependent Department and
Team selections.

Every child Administration page should provide a clear return path to the
Administration home.

The Organization selector is an application/UX context mechanism. It is
not a database entity and does not replace authorization.

Organization Admin Context Contract

The Organization Admin experience is separate from the cross-organization
Super Admin Administration experience.

An Organization Admin:

operates only within the organization they are authorized to administer

cannot switch between organizations

does not receive a tenant-switching Organization selector

manages organization configuration according to Roles & Permissions

may access the shared Builder when authorized

uses the same underlying organization data and Builder definitions as the
Platform Super Admin

The Organization Admin's organization context is established by
authorization rather than by a Super Admin-style organization selector.

Administration Source-of-Truth Rule

Administration screens must not become duplicate sources of truth.

Builder owns reusable Performance Sheet definitions, including Objectives,
Key Results, Initiatives, validation, drafts, publishing, and revisions.

Runtime owns period-specific execution state and performance values.

Organization owns organizational identity and configuration.

Memberships connect users to organizations.

Roles and Permissions own organization authorization.

Platform Memberships own platform-level authority.

Therefore:

Objectives Administration reads Builder-owned Objectives.

Key Results Administration reads Builder-owned Key Results.

Initiatives Administration reads Builder-owned Initiatives.

Performance Sheet Administration manages the Builder entry point rather
than creating a second definition system.

Monthly Reporting Cadence Rule

Monthly performance is a product cadence.

The platform does not require administrator-managed arbitrary Reporting
Period records to make monthly performance work.

Historical and monthly reporting should derive from dated performance and
Runtime activity.

A Performance Sheet may still define a reporting period, time frame, or
other performance-header context when that is part of the configurable
performance experience. This does not imply a separate administrator-
managed Reporting Period entity in Assignment or Performance Instance.

Do not reintroduce Reporting Period administration into Assignment or
Performance Instance architecture unless a future product decision
explicitly requires it.

Documentation Continuity Guardrail

The product model above is part of the permanent North Star.

If implementation behavior conflicts with this model, stop before coding and
reconcile the documentation and architecture first.

When a new requirement materially changes:

actor responsibilities

organization context

authorization boundaries

source-of-truth ownership

Builder / Runtime boundaries

database relationships

the requirement must first be documented in the appropriate repository
documents.

The conversation is not sufficient evidence to change the product model.

The repository documentation is the authoritative record.

Status

CURRENT --- PRODUCT NORTH STAR

This document should be reviewed whenever a new development session begins
or when a major architectural or product decision is being considered.

If the product direction changes materially, update this document
explicitly rather than allowing the direction to change implicitly through
code.