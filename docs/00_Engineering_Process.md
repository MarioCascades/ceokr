CascadEffects Performance Platform

Engineering Process

Version: 1.1

Status: Active

Purpose

This document defines how the CascadEffects Performance Platform is developed.

The goal is to ensure development remains consistent, scalable, and understandable regardless of when development resumes or who is contributing.

This process is considered part of the platform.

Core Principles

1. Build before optimizing.

2. Avoid over-engineering.

3. One business concept = one domain model.

4. Builder defines.

5. Runtime executes.

6. Repositories persist.

7. Every major decision is documented.

8. Every deferred improvement is tracked.

9. Never rely on memory.

10. The project documentation is the source of truth.

Starting Every Development Session

Before writing code:

Step 1

Review the latest Waypoint.

This becomes the official checkpoint for resuming development.

Step 2

Review:

- Platform Decisions

- Platform Backlog

These documents establish the current architectural rules and forward-looking roadmap.

Review them before implementation begins, especially when the current milestone may have changed or when the work affects architecture, data relationships, security, or roadmap status.

Step 3

Confirm today's milestone.

Example:

- Runtime

- Persistence

- Builder

- Administration

- Dashboards

- AI

Development should remain focused on one milestone at a time.

Step 4

Inspect the existing architecture relevant to the milestone.

Before implementing changes, review the existing:

- domain models

- repositories

- services

- Runtime components

- Builder components

- Administration components

- database relationships

Avoid duplicating existing business logic.

Prefer extending established platform capabilities when appropriate.

Step 5

Begin implementation.

Ending Every Development Session

Before stopping work:

Compile

Verify the project builds successfully.

Test

Perform appropriate functional verification.

Depending on the milestone, this may include:

- browser verification

- database verification

- Runtime verification

- Builder verification

- Administration verification

- workflow verification

Commit

Commit all completed work to Git.

The commit should represent a coherent unit of completed work.

Avoid mixing unrelated experimental or unfinished changes into a milestone commit.

Documentation

Update if necessary:

- Platform Decisions

- Platform Backlog

Documentation should be updated when the implementation changes the architectural state, roadmap status, or important engineering decisions.

Create Waypoint

Every major milestone ends with a new Waypoint.

The Waypoint becomes the official resume point for future development.

Confirm Repository State

After completing the milestone:

- confirm the intended changes are committed

- confirm no unintended files remain staged

- confirm the working tree is clean

The repository should represent the documented engineering checkpoint.

Waypoint Template

Every Waypoint should include:

- Overview

- Completed Work

- Architecture Decisions

- Files Added

- Files Modified

- Files Removed

- Database Changes

- Documentation Updated

- Technical Debt

- Next Session

- Milestone Status

Technical Debt

Technical debt may only be deferred when:

- It does not change the business domain.

- It does not change database relationships.

- It is documented in Platform_Backlog.md.

If these conditions are not met, the work should be completed immediately.

Technical debt must not be used as a reason to knowingly leave an architecturally incorrect implementation in place.

Documentation

Project documentation lives in:

docs/

Current documents include:

- Engineering Process

- Platform Decisions

- Platform Backlog

- Waypoints

Additional documents may be introduced as the platform evolves.

Documentation Authority

The repository documentation is the authoritative engineering record.

The documentation hierarchy is:

1. Latest Waypoint

2. Platform Decisions

3. Platform Backlog

4. Historical Waypoints and development summaries

The latest Waypoint represents the current implementation checkpoint.

Platform Decisions represent architectural rules that remain active across milestones.

Platform Backlog represents intentionally deferred work and the forward-looking roadmap.

Historical Waypoints are permanent engineering records and should not be rewritten merely because the platform has advanced.

Development Workflow

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

- data-driven architecture

- reusable domain models

- normalized database relationships

- organization-aware data ownership

- incremental improvements

- existing platform capabilities

- clear Builder / Runtime boundaries

- simple scalable solutions

Avoid:

- hardcoded business structures

- duplicate sources of truth

- duplicated business logic

- unnecessary rewrites

- unnecessary abstractions

- feature-specific database structures when a reusable model is practical

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

- Performance Sheets

- Builder

- Assignments

- Runtime-related management

Administration should not duplicate Builder definition editing or Runtime execution logic.

The existing Builder remains the Performance Sheet definition engine.

The existing Runtime remains the Performance Instance execution engine.

Git Workflow

Git is part of the engineering process.

Completed milestones should be committed with a clear commit message.

Before committing:

- confirm the intended files

- confirm compilation

- confirm functional verification

After committing:

- confirm the commit succeeded

- confirm the working tree is clean

Large unrelated changes should not be bundled into a milestone commit unless they are intentionally part of the same architectural change.

Verification Philosophy

Compilation is necessary but not sufficient.

A successful TypeScript compilation does not by itself prove that a feature works correctly.

Major milestones should include appropriate functional verification.

Examples include:

- browser testing

- Runtime execution testing

- database CRUD testing

- Builder workflow testing

- Administration workflow testing

- lifecycle testing

The level of verification should match the risk and importance of the milestone.

Session Continuity

The project should remain resumable even after a long development pause.

When development resumes:

1. Review the latest Waypoint.

2. Review Platform Decisions.

3. Review Platform Backlog.

4. Confirm the current milestone.

5. Inspect the relevant existing implementation.

6. Continue from the documented checkpoint.

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

- Build with simplicity.

- Challenge unnecessary complexity.

- Document important decisions.

- Keep technical debt visible.

- Review the latest Waypoint before resuming development.

- Review current Platform Decisions and Platform Backlog before implementation.

- Avoid unnecessary rewrites.

- Preserve Builder / Runtime separation.

- Prefer data-driven architecture.

- Continuously improve the platform without losing sight of the product vision.

The objective is not only to build software, but to build a platform that remains understandable, maintainable, and scalable for years to come.