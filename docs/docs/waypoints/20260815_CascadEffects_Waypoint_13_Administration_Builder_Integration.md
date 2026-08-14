# CascadEffects Performance Platform

# Development Waypoint 13

## Administration → Performance Sheet Builder Integration

Checkpoint Date: 15 August 2026

Milestone: Platform Navigation & Performance Sheet Management Entry Point

---

# 1. Overview

The CascadEffects platform now has a verified Runtime execution foundation and a functioning Performance Sheet Builder lifecycle.

The next architectural requirement is to connect these existing platform capabilities through the Administration experience.

The existing Administration page is the organization's management entry point.

The existing Builder remains the Performance Sheet definition and construction experience.

This milestone establishes the intended relationship between Administration and Builder.

The Builder is not being rebuilt.

The Builder is not being moved into Administration.

Administration will provide the management and navigation entry point to the existing Builder.

---

# 2. Product Flow

The intended platform flow is:

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

The current platform already supports the major architectural layers represented in this flow.

The missing connection is the Administration entry point into the existing Performance Sheet Builder.

---

# 3. Administration Role

The existing Administration page is responsible for providing access to organizational management capabilities.

Current Administration areas include:

Organization

- Organization
- Departments
- Teams
- Users
- Roles & Permissions

Performance

- Objectives
- Key Results
- Initiatives

Analytics

- Dashboards
- Reports

Platform

- Settings
- AI Configuration

Performance Sheet management is now identified as an additional Administration capability.

Future Administration navigation should expose:

Performance

- Performance Sheets
- Objectives
- Key Results
- Initiatives

Performance Sheets will provide the entry point into Performance Sheet definition management.

---

# 4. Builder Role

The Builder remains the dedicated Performance Sheet construction experience.

The Builder is responsible for:

- defining Performance Sheet structure
- editing Objectives
- editing Key Results
- editing Initiatives
- configuring Performance Header content
- configuring Comments
- validating BuilderDocument definitions
- saving drafts
- publishing definitions
- creating revisions
- preserving published versions

The existing Builder lifecycle remains unchanged.

Do not rebuild the Builder.

Do not duplicate Builder functionality inside Administration.

Do not move Builder state into Administration.

---

# 5. Existing Builder Lifecycle

The existing Builder lifecycle remains:

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

Published Performance Sheet versions remain immutable.

Changes to a published Performance Sheet are created through new draft revisions.

The existing Performance Sheet versioning model remains authoritative.

---

# 6. Architecture Boundary

The platform continues to maintain the following separation:

Administration

    manages organizational configuration
    provides management/navigation entry points

Builder

    defines reusable Performance Sheet structures

Published Performance Sheet

    immutable version of a Builder definition

Assignment

    connects a published Performance Sheet version to a runtime subject

Performance Instance

    represents operational execution

Runtime

    owns period-specific performance state

The architectural flow is:

Administration
        ↓
Performance Sheets
        ↓
Builder Definition
        ↓
Published Performance Sheet
        ↓
Assignment
        ↓
Performance Instance
        ↓
Runtime

---

# 7. Current Implementation Gap

The existing setup flow is already working:

Welcome
        ↓
Start Setup
        ↓
Organization Setup
        ↓
Go to Administration
        ↓
Administration

The current Administration page does not yet provide a Performance Sheets entry point.

The existing Builder is available separately through:

/builder

Therefore the current gap is navigation and product integration rather than Builder functionality.

The immediate objective is to connect:

Administration
        ↓
Performance Sheets
        ↓
/builder

---

# 8. Current Builder Status

The Builder lifecycle was previously completed and verified.

The Builder supports:

- BuilderDocument
- Objectives
- Key Results
- Initiatives
- Comments
- validation
- draft persistence
- publishing
- published version loading
- revision creation
- version preservation

The Builder should not be rebuilt as part of this milestone.

The existing Builder implementation is the platform's Performance Sheet construction engine.

---

# 9. Runtime Relationship

The Runtime architecture remains separate from Builder.

Builder defines the performance system.

Runtime executes the performance system.

The verified Runtime execution flow is:

Published Performance Sheet
        ↓
Assignment
        ↓
Performance Instance
        ↓
Key Result Progress
        ↓
Runtime UI
        ↓
Runtime Mutation
        ↓
Persisted Runtime State

Runtime does not modify Builder definitions.

---

# 10. Product Direction

The long-term manager workflow is expected to become:

Manager / Administrator
        ↓
Administration
        ↓
Performance Sheets
        ↓
Create or select Performance Sheet
        ↓
Builder
        ↓
Create / Edit / Revise
        ↓
Publish
        ↓
Assign to User / Team / Other Subject
        ↓
Performance Instance
        ↓
Runtime

This workflow is intended to allow managers and administrators to create reusable performance systems and later manage which users or teams execute them.

The Builder should remain reusable and data-driven.

The system should not create a separate hardcoded form implementation for each employee.

---

# 11. Future Performance Sheet Management

The immediate milestone only establishes Administration → Builder navigation.

A future Performance Sheet management experience should eventually support:

- Performance Sheet Library
- multiple logical Performance Sheets
- sheet_key selection
- draft listing
- published version listing
- revision management
- duplicate
- archive
- assignment
- user/team association
- Performance Sheet search and filtering

These capabilities should be added incrementally.

They should not be implemented as part of the initial navigation connection unless required.

---

# 12. Architectural Constraints

The following constraints remain active:

- Do not rebuild the Builder.
- Do not duplicate Builder state.
- Do not move BuilderDocument ownership into Administration.
- Do not place Runtime performance values into BuilderDocument.
- Do not mutate published Performance Sheet versions.
- Do not create employee-specific hardcoded Performance Sheet implementations.
- Do not introduce a second source of truth for Performance Sheet definitions.
- Preserve the existing Assignment → Performance Instance → Runtime boundary.

---

# 13. Next Implementation

The next implementation task is intentionally small.

Add a Performance Sheets entry to the existing Administration page.

The entry should navigate to the existing Builder route:

/builder

The first verification should be:

Welcome
        ↓
Start Setup
        ↓
Organization Setup
        ↓
Administration
        ↓
Performance Sheets
        ↓
Builder

No Builder functionality should be changed during this integration step.

---

# 14. Next Architectural Milestone

After Administration → Builder navigation is verified, the next architectural question is:

How should the Administration Performance Sheets area evolve from a simple Builder entry point into a true Performance Sheet management interface?

That future interface should eventually allow administrators/managers to:

- view Performance Sheets
- create new Performance Sheets
- edit drafts
- create revisions
- publish
- archive
- assign published versions
- manage Performance Sheet relationships to users and teams

This should be designed before implementing a larger Performance Sheet Library.

---

# 15. Technical Debt / Deferred Work

The following remain deferred:

- Performance Sheet Library
- Multiple logical Performance Sheets per organization
- Assignment subject validation
- Performance Instance relationship integrity
- Tenant authorization
- Production RLS
- KPI calculation engine
- Historical KPI Updates
- Weighted aggregation rules
- Complete Runtime workflow
- Production security hardening

These items should not be pulled into the Administration → Builder navigation task unless required.

---

# 16. Milestone Status

Runtime Foundation: 🟢 Established

Runtime Execution Resolution: 🟢 Complete

Runtime Mutation: 🟢 Complete

Runtime Workspace Foundation: 🟢 Established

Employee Comments: 🟢 Implemented

Manager Comments: 🟢 Implemented

Runtime Status Workflow: 🟢 Implemented

Performance Sheet Builder Lifecycle: 🟢 Complete

Administration Page: 🟢 Existing

Administration → Builder Integration: 🟡 Next

Performance Sheet Library: ⚪ Future

Multiple Performance Sheet Definitions: ⚪ Future

Assignment Management UI: ⚪ Future

Historical KPI Updates: ⚪ Not Started

KPI Calculation Engine: ⚪ Not Started

Production RLS / Authorization: 🔴 Outstanding

---

# 17. Resume Instruction

When development resumes:

Start from this waypoint.

Do not rebuild the Builder.

Do not move Builder functionality into Administration.

Inspect the existing Administration page and existing Builder route.

Connect the Administration Performance Sheets entry to the existing Builder.

Verify the complete:

Setup → Administration → Performance Sheets → Builder

journey.

After that verification, stop and reassess the next Performance Sheet management milestone before adding additional functionality.

---

# 18. Waypoint Outcome

The platform architecture now explicitly defines Administration as the management entry point for Performance Sheets while preserving the Builder as the dedicated Performance Sheet construction engine.

The intended relationship is:

Administration
        ↓
Performance Sheets
        ↓
Builder
        ↓
Published Performance Sheet
        ↓
Assignment
        ↓
Performance Instance
        ↓
Runtime

This decision connects the existing platform capabilities without replacing or duplicating any existing architectural layer.