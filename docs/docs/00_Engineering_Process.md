# CascadEffects Performance Platform

# Engineering Process

Version: 1.0

Status: Active

---

# Purpose

This document defines how the CascadEffects Performance Platform is developed.

The goal is to ensure development remains consistent, scalable, and understandable regardless of when development resumes or who is contributing.

This process is considered part of the platform.

---

# Core Principles

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

---

# Starting Every Development Session

Before writing code:

## Step 1

Review the latest Waypoint.

This becomes the official checkpoint for resuming development.

---

## Step 2

Review:

- Platform Decisions
- Platform Backlog

Only if changes affect architecture.

---

## Step 3

Confirm today's milestone.

Example:

- Runtime
- Persistence
- Builder
- Dashboards
- AI

Development should remain focused on one milestone at a time.

---

## Step 4

Begin implementation.

---

# Ending Every Development Session

Before stopping work:

## Compile

Verify the project builds successfully.

---

## Commit

Commit all completed work to Git.

---

## Documentation

Update if necessary:

- Platform Decisions
- Platform Backlog

---

## Create Waypoint

Every major milestone ends with a new Waypoint.

The Waypoint becomes the official resume point for future development.

---

# Waypoint Template

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

---

# Technical Debt

Technical debt may only be deferred when:

- It does not change the business domain.
- It does not change database relationships.
- It is documented in Platform_Backlog.md.

If these conditions are not met, the work should be completed immediately.

---

# Documentation

Project documentation lives in:

docs/

Current documents include:

- Engineering Process
- Platform Decisions
- Platform Backlog
- Waypoints

Additional documents may be introduced as the platform evolves.

---

# Development Workflow

```
Review Waypoint
        ↓
Review Decisions
        ↓
Review Backlog
        ↓
Confirm Milestone
        ↓
Build
        ↓
Compile
        ↓
Commit
        ↓
Update Documentation
        ↓
Create Waypoint
```

---

# Philosophy

The project should never depend on memory.

It should always be possible to pause development for days, weeks, or months and resume by reviewing the latest Waypoint and the project documentation.

The repository—not memory—is the source of truth.

---

# Working Agreement

This platform is developed through collaboration between the Product Owner and the AI Architecture Partner.

The Product Owner is responsible for product vision, business direction, and prioritization.

The AI Architecture Partner is responsible for architectural guidance, engineering consistency, technical review, and protecting the long-term integrity of the platform.

Both partners agree to:

- Build with simplicity.
- Challenge unnecessary complexity.
- Document important decisions.
- Keep technical debt visible.
- Review the latest Waypoint before resuming development.
- Continuously improve the platform without losing sight of the product vision.

The objective is not only to build software, but to build a platform that remains understandable, maintainable, and scalable for years to come.