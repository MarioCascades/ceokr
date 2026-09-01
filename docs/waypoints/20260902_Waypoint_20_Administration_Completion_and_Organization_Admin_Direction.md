CascadEffects Performance Platform

Waypoint 20 — Administration Completion and Organization Admin Workspace Direction

Date: 2026-09-02

Milestone Status: IN PROGRESS — Administration Completion / Organization Admin Workspace Preparation

Overview

This Waypoint establishes a fresh operational checkpoint for the CascadEffects Performance Platform.

It is intentionally written as a current-state checkpoint rather than a continuation of an older Waypoint narrative. The purpose is to prevent future development sessions from becoming dependent on historical assumptions that may no longer reflect the current product direction.

The immediate priority is to finish the Administration experience correctly, with particular attention to:

consistent Administration navigation

correct Super Admin organization context

organization-aware child Administration pages

cascading Organization → Department → Team selection where applicable

preservation of Builder as the source of truth for Objectives, Key Results, and Initiatives

consistent behavior across the Administration area

After Administration is corrected and verified, the next major product focus is the creation of the Organization Admin workspace.

Production authorization and comprehensive RLS are intentionally deferred for the moment so development can stay focused on the product experience and platform functionality needed for the current delivery timeline.

1. Current Product Direction

The CascadEffects Performance Platform is a configurable, multi-tenant performance management platform.

The platform is not a rebuild of Mint.

Mint remains the Version 1 operational reference. The CascadEffects platform is being built as the reusable engine capable of supporting multiple organizations and dynamically generated performance systems.

The core architectural boundary remains:

Administration → Builder → Published Performance Sheet → Runtime → Historical Performance Data / Reporting

Builder owns performance definitions.

Runtime owns period-specific execution and mutable performance values.

Administration manages the organizational and platform-level configuration and provides visibility/entry points into the appropriate systems.

2. Current Administrative Actor Model

There are two intended administrative experiences.

Platform Super Admin

The Platform Super Admin operates at the platform level.

For the current Administration experience, the Super Admin must be able to:

see all organizations

select an organization when working with organization-owned resources

manage organization-specific resources in the selected organization

move between organizations without confusing the selected context

The selected Organization is UI/query context.

It is not, by itself, an authorization mechanism.

Authorization will be implemented separately at the appropriate later milestone.

Organization Admin

The Organization Admin workspace will be organization-scoped.

The Organization Admin will work inside the organization they are authorized to administer.

There should be:

no cross-organization tenant switcher

a fixed organization context

access to the same underlying Builder engine

organization-scoped administration according to the eventual Roles & Permissions model

The Organization Admin workspace is the next major product focus after Administration completion.

3. Administration Page Standard

All Administration child pages should follow a consistent structure.

Shared Navigation

Every Administration child page should provide:

← Back to Administration

The shared AdminPageHeader should be used where appropriate so page titles, descriptions, and navigation remain consistent.

Organization Context

The Organization page is the top-level exception.

It manages the organizations themselves and therefore does not require an Organization selector above the page.

All organization-owned child Administration pages should provide an explicit Organization selector for the Platform Super Admin.

Changing the selected Organization must reset dependent selections.

Cascading Context

Where hierarchy applies, context follows:

Organization → Department → Team

Department and Team selectors must be constrained by the selected parent context.

Changing Organization resets Department and Team.

Changing Department resets Team.

The selected IDs, not display names, should drive data queries and mutations.

4. Administration Pages to Reconcile and Verify

The Administration experience includes:

Organization

list organizations

create organizations

edit organizations

manage organizations

delete organizations where supported

This is the top-level tenant management page.

Departments

select Organization

list departments belonging to that Organization

create/edit/manage departments

maintain selected Organization context

Teams

select Organization

select Department

list teams belonging to that Department

create/edit/manage teams

reset Department/Team when Organization changes

Users / Members

select Organization

manage users/members for the selected Organization

maintain correct organization context

Roles & Permissions

select Organization

manage organization-level roles and permissions

maintain correct organization context

Authorization enforcement itself is deferred.

Performance Sheets

select Organization

manage Performance Sheets for the selected Organization

continue using Builder as the definition engine

Assignments

select Organization

manage assignments for the selected Organization

preserve the existing Assignment architecture

do not reintroduce an arbitrary reportingPeriodId

Objectives

Objectives Administration is a visibility/entry layer.

Objectives remain Builder-owned definitions.

Administration must not create a second Objective source of truth.

The page should allow the Super Admin to select an Organization, inspect the relevant Builder-owned Objectives, and enter Builder when editing is required.

Key Results

Same source-of-truth rule as Objectives.

Key Results remain Builder-owned definitions.

Initiatives

Same source-of-truth rule as Objectives and Key Results.

Initiatives remain Builder-owned definitions.

Dashboards

select Organization

view/manage the organization's dashboard experience

continue moving toward dashboards generated from platform data/configuration rather than custom hardcoded dashboards

Reports

select Organization

provide organization-scoped reporting access

preserve historical performance visibility

Settings

select Organization

manage organization-scoped configuration

AI Configuration

AI Configuration remains future work and should not be expanded as part of the immediate Administration completion effort.

5. Builder / Runtime Boundary

This boundary remains unchanged.

Builder owns

Performance Sheet definitions

Objectives

Key Results

Initiatives

structure and configuration

versioned performance definitions

Runtime owns

assignments

performance instances

runtime execution

KPI updates

scores

progress

historical performance data

Administration must not duplicate Builder-owned definitions.

6. Reporting / Time Model

The current product direction uses a monthly performance cadence.

There is no current requirement to introduce or restore an administrator-managed arbitrary ReportingPeriod entity.

Do not reintroduce:

reportingPeriodId

a new Reporting Period CRUD system

duplicate period configuration

unless there is a future explicit product decision requiring it.

Historical reporting remains important and should be built around time-bound runtime performance data.

7. What Has Been Completed

The platform already has substantial foundations in place.

Administration Foundations

Completed or functionally established:

Organization management foundation

Department management

Team management

Users / Members foundation

Roles & Permissions foundation

Platform authority foundation

Performance Sheet management

Assignment management

Administration routing/component structure

shared Administration page-header pattern

Builder / Administration separation

Builder-owned Objectives / Key Results / Initiatives model

Runtime Foundations

Established:

Builder definition model

Performance Sheet structure

assignment foundation

runtime execution foundation

runtime workflow foundation

performance instance foundation

runtime scoring/aggregate concepts

historical performance direction

Architecture / Documentation

The following documentation has been reconciled to the current product direction:

Product North Star

Platform Decisions

Platform Backlog

Engineering Process

These documents now explicitly recognize:

Super Admin organization context

Organization Admin fixed context

one Builder with two administrative entry contexts

cascading Organization → Department → Team context

Builder ownership of Objectives/KRs/Initiatives

monthly performance cadence

documentation continuity as part of the engineering process

8. Immediate Work — Administration Completion

This is the next implementation milestone.

Do not move to the Organization Admin workspace until the Administration experience has been reconciled and verified.

Required work

A. Audit every Administration page

Verify each route and component against the Administration standard in this Waypoint.

B. Restore consistent Super Admin organization context

Every organization-owned child page should allow the Super Admin to select the Organization.

C. Implement / standardize cascading selectors

Where applicable:

Organization → Department → Team

D. Verify dependent reset behavior

Changing Organization must reset Department and Team.

Changing Department must reset Team.

E. Verify data queries

The selected organization/department/team IDs must actually control the data being displayed.

A selector that changes visually but does not change the underlying query is not considered complete.

F. Verify navigation

Every child page should consistently provide:

← Back to Administration

G. Verify Builder entry points

Objectives, Key Results, Initiatives, and Performance Sheets must continue to use Builder as the authoritative definition system.

H. Verify Dashboard / Reports / Settings context

These pages must follow the same Organization context pattern.

I. Browser verification

Administration should be tested page-by-page in the browser after implementation.

J. Compile verification

Run TypeScript compilation after the complete Administration batch.

K. Git verification

Review the complete diff before committing.

9. Next Major Milestone — Organization Admin Workspace

Once Administration is complete and verified, move to:

Organization Admin Workspace Foundation

The Organization Admin workspace should provide a clean organization-scoped experience for an administrator operating within one organization.

The workspace should reuse the same platform engine rather than introducing a second Builder.

Initial scope should include:

organization dashboard / landing experience

organization navigation

organization context

access to relevant organization administration

Performance Sheet management through the existing Builder

assignments

visibility into Objectives

visibility into Key Results

visibility into Initiatives

dashboards

reports

organization settings

The workspace should be designed so that the eventual Roles & Permissions system can determine what the Organization Admin is allowed to see and modify.

For the immediate build, authorization enforcement can remain deferred.

10. Authorization Strategy — Deferred

Production authorization and comprehensive RLS are intentionally deferred from the immediate implementation sequence.

This is a scheduling decision, not an architectural rejection.

The platform still recognizes that production authorization must eventually protect:

UI access

server services

API routes

database access

tenant isolation

organization boundaries

runtime security

For the current delivery window:

Build the correct product structure first.

Then return to production authorization and RLS as a dedicated security milestone.

Do not use UI selectors as a substitute for authorization.

11. Technical Debt / Deferred Work

The following remain outstanding:

production authorization enforcement

production Row Level Security

complete server/API authorization enforcement

runtime security boundaries

Assignment Subject Validation

Performance Instance Relationship Integrity hardening

historical KPI update hardening

KPI calculation engine expansion

weighted aggregation expansion

advanced reporting

dynamic dashboard generation expansion

AI features

Organization Admin Roles & Permissions enforcement

These should not interrupt the immediate Administration → Organization Admin workspace sequence unless a blocking dependency is discovered.

12. Development Discipline From This Waypoint

Future sessions should use this Waypoint as the current operational checkpoint.

The repository documentation remains authoritative, but development should begin from the current state described here, rather than assuming that an older Waypoint accurately describes the current implementation.

The working sequence is:

Review Current Waypoint
↓
Review Product North Star
↓
Review Platform Decisions
↓
Review Platform Backlog
↓
Confirm Milestone
↓
Inspect Existing Administration Architecture
↓
Build Administration Completion Batch
↓
Compile
↓
Browser / Functional Verification
↓
Review Diff
↓
Commit
↓
Update Documentation
↓
Create Next Waypoint

No large refactor should be introduced merely to make the architecture look cleaner.

Prefer targeted, reusable fixes that establish the intended Administration standard.

13. Next Session

The next development session should begin with:

Milestone: Administration Completion

First task:

Audit and correct the Administration pages so they behave as one coherent Super Admin Administration system.

The immediate goal is not to add new platform capabilities.

The goal is to make the existing Administration experience correct, consistent, organization-aware, and ready for demonstration.

After that milestone is verified:

Begin Organization Admin Workspace Foundation.

Authorization/RLS work will follow as a later dedicated milestone.

14. Milestone Status

Administration: IN PROGRESS — COMPLETION / RECONCILIATION

Organization: COMPLETE

Departments: COMPLETE

Teams: COMPLETE

Users / Members: FUNCTIONAL FOUNDATION COMPLETE

Roles & Permissions: FUNCTIONAL FOUNDATION COMPLETE — ENFORCEMENT DEFERRED

Platform Authority: FOUNDATION COMPLETE — PRODUCTION ENFORCEMENT DEFERRED

Performance Sheet Management: COMPLETE / BUILDER-OWNED

Assignment Management: COMPLETE / FOUNDATION

Objectives: ADMINISTRATION VISIBILITY / BUILDER ENTRY

Key Results: ADMINISTRATION VISIBILITY / BUILDER ENTRY

Initiatives: ADMINISTRATION VISIBILITY / BUILDER ENTRY

Dashboards: V1 ESTABLISHED / DYNAMIC SYSTEM EXPANSION FUTURE

Reports: FOUNDATION / ADMINISTRATION CONTEXT REQUIRED

Builder: ESTABLISHED

Runtime: ESTABLISHED

Production Authorization / RLS: DEFERRED

Organization Admin Workspace: NEXT MAJOR MILESTONE

Final Direction

The immediate path is deliberately simple:

1. Finish Administration correctly.

2. Verify it end-to-end.

3. Commit it.

4. Build the Organization Admin workspace.

5. Return to authorization and RLS as a dedicated security milestone.

This Waypoint is the current operational starting point for that sequence.