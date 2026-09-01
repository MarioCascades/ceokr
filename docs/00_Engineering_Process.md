CascadEffects Performance Platform

Engineering Process

Version: 1.2

Status: Active

Purpose

This document defines how the CascadEffects Performance Platform is developed.

The goal is to ensure development remains consistent, scalable, and understandable regardless of when development resumes or who is contributing.

This process is considered part of the platform.

Core Principles

Build before optimizing.

Avoid over-engineering.

One business concept = one domain model.

Builder defines.

Runtime executes.

Repositories persist.

Every major decision is documented.

Every deferred improvement is tracked.

Never rely on memory.

The project documentation is the source of truth.

Starting Every Development Session

Before writing code:

Step 1

Review the Product North Star.

Confirm that the proposed work supports the current product direction and
does not reintroduce a previously rejected or superseded product model.

Step 2

Review the latest Waypoint.

This becomes the official checkpoint for resuming development.

Step 3

Review:

Platform Decisions

Platform Backlog

These documents establish the current architectural rules and forward-looking roadmap.

Review them before implementation begins, especially when the current milestone may have changed or when the work affects architecture, data relationships, security, or roadmap status.

Step 4

Confirm today's milestone.

Example:

Runtime

Persistence

Builder

Administration

Dashboards

AI

Development should remain focused on one milestone at a time.

Step 5

Inspect the existing architecture relevant to the milestone.

Before implementing changes, review the existing:

domain models

repositories

services

Runtime components

Builder components

Administration components

database relationships

Avoid duplicating existing business logic.

Prefer extending established platform capabilities when appropriate.

Step 6

Begin implementation.

Ending Every Development Session

Before stopping work:

Compile

Verify the project builds successfully.

Test

Perform appropriate functional verification.

Depending on the milestone, this may include:

browser verification

database verification

Runtime verification

Builder verification

Administration verification

workflow verification

Commit

Commit all completed work to Git.

The commit should represent a coherent unit of completed work.

Avoid mixing unrelated experimental or unfinished changes into a milestone commit.

Documentation

Update if necessary:

Platform Decisions

Platform Backlog

Documentation should be updated when the implementation changes the architectural state, roadmap status, or important engineering decisions.

Create Waypoint

Every major milestone ends with a new Waypoint.

The Waypoint becomes the official resume point for future development.

Confirm Repository State

After completing the milestone:

confirm the intended changes are committed

confirm no unintended files remain staged

confirm the working tree is clean

The repository should represent the documented engineering checkpoint.

Waypoint Template

Every Waypoint should include:

Overview

Completed Work

Architecture Decisions

Files Added

Files Modified

Files Removed

Database Changes

Documentation Updated

Technical Debt

Next Session

Milestone Status

Technical Debt

Technical debt may only be deferred when:

It does not change the business domain.

It does not change database relationships.

It is documented in Platform_Backlog.md.

If these conditions are not met, the work should be completed immediately.

Technical debt must not be used as a reason to knowingly leave an architecturally incorrect implementation in place.

Documentation

Project documentation lives in:

docs/

Current documents include:

Engineering Process

Platform Decisions

Platform Backlog

Waypoints

Additional documents may be introduced as the platform evolves.

Documentation Authority

The repository documentation is the authoritative engineering record.

The documentation hierarchy is:

Latest Waypoint

Platform Decisions

Platform Backlog

Historical Waypoints and development summaries

The latest Waypoint represents the current implementation checkpoint.

Platform Decisions represent architectural rules that remain active across milestones.

Platform Backlog represents intentionally deferred work and the forward-looking roadmap.

Historical Waypoints are permanent engineering records and should not be rewritten merely because the platform has advanced.

Development Workflow

Review Product North Star

    ↓

Review Waypoint

    ↓

Review Decisions

    ↓

Review Backlog

    ↓

Confirm Milestone

    ↓

Inspect Existing Architecture

    ↓

Build

    ↓

Compile

    ↓

Browser / Functional Verification

    ↓

Commit

    ↓

Update Documentation

    ↓

Create Waypoint

    ↓

Confirm Clean Repository

Architectural Discipline

Development should favor:

data-driven architecture

reusable domain models

normalized database relationships

organization-aware data ownership

incremental improvements

existing platform capabilities

clear Builder / Runtime boundaries

simple scalable solutions

Avoid:

hardcoded business structures

duplicate sources of truth

duplicated business logic

unnecessary rewrites

unnecessary abstractions

feature-specific database structures when a reusable model is practical

The platform should be designed to support multiple organizations, thousands of users, and large volumes of Runtime performance data.

Builder and Runtime Boundary

The Builder defines reusable Performance Sheet definitions.

The Runtime executes period-specific Performance Instances.

The architectural relationship is:

Builder Definition

↓

Published Performance Sheet

↓

Assignment

↓

Performance Instance

↓

Runtime Execution

Runtime values must not become a second source of truth inside BuilderDocument.

Builder definitions remain separate from period-specific Runtime state.

Administration Boundary

Administration is responsible for organizational management and management entry points.

Administration may provide navigation into:

Performance Sheets

Builder

Assignments

Runtime-related management

Administration should not duplicate Builder definition editing or Runtime execution logic.

The existing Builder remains the Performance Sheet definition engine.

The existing Runtime remains the Performance Instance execution engine.

Administrative Context Contract

Administration must preserve a clear distinction between platform-level
Super Admin authority and organization-level Organization Admin authority.

For Platform Super Admin Administration:

Organization is the primary tenant context.

The Super Admin must explicitly select the Organization being administered
on organization-scoped Administration pages.

Organization selection is a UI/query context, not the authorization
boundary.

Department and Team selectors must resolve from the selected Organization.

Changing Organization must reset dependent Department and Team selections.

The selected Organization ID must drive server-side data queries and
mutations.

The Organization page is the top-level tenant-management page and is the
exception to the child-page Organization selector pattern.

For Organization Admin workspaces:

The Organization context is derived from the authenticated and authorized
Organization Membership.

Organization Admins must not receive a tenant-switching Organization
selector.

The client-selected context must never be treated as proof of
authorization.

The same administrative context rules apply consistently across Users,
Roles & Permissions, Performance Sheets, Assignments, Objectives, Key
Results, Initiatives, Dashboards, Reports, and Settings where those areas
are organization-scoped.

One Builder, Two Administrative Entry Contexts

The platform uses one shared Builder engine.

The two administrative entry contexts are:

Platform Super Admin
↓
Administration
↓
Selected Organization
↓
Performance Sheets
↓
Builder

Organization Admin
↓
Organization Workspace
↓
Authorized Organization
↓
Performance Sheets
↓
Builder

These are different entry contexts, not different Builder systems.

Objectives, Key Results, and Initiatives remain owned by the Builder
definition and must not become duplicate Administration sources of truth.

Reporting Cadence Rule

Monthly performance is a product reporting cadence.

Do not introduce or reintroduce an arbitrary administrator-managed
Reporting Period entity merely to represent monthly performance.

Time-bound Runtime execution should be represented through the Assignment,
Performance Instance, dated KPI updates, and related execution data.

Documentation Continuity Guardrail

If a change affects:

administrative actor boundaries

organization context

cascading selectors

Builder / Runtime ownership

source-of-truth ownership

reporting cadence

authorization boundaries

major Administration workflows

then the change must be reflected in the appropriate repository
documentation before or as part of the milestone completion.

A feature is not considered architecturally complete if the code works but
the governing documentation still describes a different product or
architecture.

Git Workflow

Git is part of the engineering process.

Completed milestones should be committed with a clear commit message.

Before committing:

confirm the intended files

confirm compilation

confirm functional verification

After committing:

confirm the commit succeeded

confirm the working tree is clean

Large unrelated changes should not be bundled into a milestone commit unless they are intentionally part of the same architectural change.

Verification Philosophy

Compilation is necessary but not sufficient.

A successful TypeScript compilation does not by itself prove that a feature works correctly.

Major milestones should include appropriate functional verification.

Examples include:

browser testing

Runtime execution testing

database CRUD testing

Builder workflow testing

Administration workflow testing

lifecycle testing

The level of verification should match the risk and importance of the milestone.

Session Continuity

The project should remain resumable even after a long development pause.

When development resumes:

Review the Product North Star.

Review the latest Waypoint.

Review Platform Decisions.

Review Platform Backlog.

Confirm the current milestone.

Inspect the relevant existing implementation.

Continue from the documented checkpoint.

The conversation is not the authoritative project record.

The repository documentation is the authoritative project record.

Philosophy

The project should never depend on memory.

It should always be possible to pause development for days, weeks, or months and resume by reviewing the latest Waypoint and the project documentation.

The repository—not memory—is the source of truth.

Development should favor long-term platform quality over short-term convenience.

The goal is to build a platform that remains understandable, maintainable, secure, and scalable as the number of organizations, users, and performance records grows.

Working Agreement

This platform is developed through collaboration between the Product Owner and the AI Architecture Partner.

The Product Owner is responsible for product vision, business direction, and prioritization.

The AI Architecture Partner is responsible for architectural guidance, engineering consistency, technical review, and protecting the long-term integrity of the platform.

Both partners agree to:

Build with simplicity.

Challenge unnecessary complexity.

Document important decisions.

Keep technical debt visible.

Review the latest Waypoint before resuming development.

Review current Platform Decisions and Platform Backlog before implementation.

Avoid unnecessary rewrites.

Preserve Builder / Runtime separation.

Prefer data-driven architecture.

Continuously improve the platform without losing sight of the product vision.

The objective is not only to build software, but to build a platform that remains understandable, maintainable, and scalable for years to come.