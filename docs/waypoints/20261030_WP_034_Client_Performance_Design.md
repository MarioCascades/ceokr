# CascadEffects Performance Platform

# Waypoint 34: Client Performance Persistent Spreadsheet Design

**Date:** 2026-10-30  
**Status:** DESIGN CONFIRMED / ARCHITECTURE VERIFICATION PENDING / IMPLEMENTATION NOT STARTED  
**Previous Waypoint:** Waypoint 33: Agenda and Client Performance Persistence

---

# 1. Purpose

This Waypoint captures the Client Performance requirements clarified on October 29–30, 2026. It is the current checkpoint for Client Performance design and explicitly supersedes the Client Performance portion of Waypoint 33 where that earlier checkpoint says there is no monthly history or describes only independent current-state tables.

Waypoint 33 remains historical and continues to govern the separately specified Agenda requirements. This Waypoint does not claim that Client Performance has been implemented, tested, committed, or deployed.

The repository, current source code, migrations, and actual database configuration remain the engineering source of truth. The supplied `src` and `supabase` ZIPs dated October 29 are the current review inputs for the next architecture-verification step.

---

# 2. Confirmed Product Model

Client Performance is one Runtime entry for the CascadEffects tenant. It is an internal operational workspace used to manage the performance of multiple clients served by CascadEffects. It is not a customer-facing dashboard made available to other tenants.

The page has a client selector. Selecting a client switches the entire workspace for that client, including:

1. Current Performance Snapshot.
2. Monthly Metrics tables.
3. Key Initiatives Tracker.

Do not render every client's full tables at once. Keep each client's data, column configuration, year visibility, and Last Updated timestamp independent.

---

# 3. Persistent Spreadsheet Behavior

Each client has a continuous spreadsheet-style workspace. Monthly records from multiple years coexist in the same table. Users do not select a month, load a monthly snapshot, or copy-forward a monthly record.

## 3.1 Initial year visibility

- Show two years by default: **2025 and 2026**.
- Display January through December rows within each year, using the source spreadsheet's structure and headings.
- Existing values remain persisted until deliberately changed.

## 3.2 Year controls

Provide the following controls:

- **Hide Year:** Hides the selected year's rows from the main workspace without deleting or modifying their data.
- **Restore Year / Show Hidden Years:** Allows an authorized user to display a previously hidden year again.
- **Add Another Year:** Appends the next year with January through December rows. It must not replace or overwrite existing years. The system must continue to support additional years beyond 2027 without a code change each January.

Year visibility is configuration, not a deletion or data-archiving operation. Hiding, restoring, or adding a year must not change saved metrics or initiatives. Whether year visibility is shared organization configuration or a personal view preference must be decided during architecture review; the agreed minimum is that visibility actions never mutate metric data.

---

# 4. Client-Specific Table Layouts

Do not assume all clients use identical columns.

The supplied spreadsheet screenshots show Kirkland & Richmond with a more extensive monthly metrics layout, including:

- Month
- Production
- Collection
- Starts
- Days Worked
- Avg Prod per Day

Other shown clients, including Desman, use a simpler monthly layout, with fewer metrics columns. Current snapshot fields and Key Initiatives Tracker columns/presentation may also vary. These observed differences must be verified against the supplied spreadsheet references and the current code before the final schema is approved. Do not invent unclear columns or assume every screenshot is legible enough to establish every field.

Use one shared Client Performance feature and shared application behavior with client-specific column configuration. Adding a new client should create a workspace using the standard/default structure and columns, while allowing the columns to be configured for that client. Do not create a separate database table per client, and do not let changes to one client's column configuration silently change another client's layout or historical data.

Preserve spreadsheet-like section structure, row values, notes, and initiative details. The exact schema and whether generic Custom Tables JSON persistence can safely support these requirements remain open until source and migration review is complete.

---

# 5. Current Performance Snapshot and Key Initiatives Tracker

Each client workspace includes a Current Performance Snapshot and a Key Initiatives Tracker alongside the monthly metrics.

- Preserve each client's existing values and source-specific fields.
- Keep initiatives, descriptions/completion details, completion month, and notes persistent as represented in the client's source table.
- Editing one field must not reset unrelated snapshot values, monthly rows, years, or initiative records.
- A successful save must persist the intended changes and reload correctly after refresh, navigation away/back, reopening, and sign-in.

The supplied screenshots are the visual/source reference for these sections. Verify exact headings and per-client variations before finalizing implementation details.

---

# 6. Client Administration

Provide an Organization Admin management experience to add, enable, and disable clients. The exact placement should be chosen after inspecting the current Organization Admin dashboard and Custom Tables settings; likely options are a dedicated Client Performance management card/page or an appropriate section of Custom Tables settings.

- **Add Client:** Creates a new client workspace with the standard sections and default columns, plus an independently configurable column layout.
- **Disable Client:** Hides the client from the normal Runtime client selector. It must not delete the client's metrics, snapshot, initiatives, column configuration, year visibility, or timestamp.
- **Enable Client:** Restores the client to the normal selector with its saved data and configuration intact.
- Client management must not require creating a new database table for each client.
- The initial known client list in the supplied screenshots includes Kirkland & Richmond, Desman, Indie Ortho, Burns Ortho, Peak Orthodontics, and Mint Orthodontics. Confirm the canonical display names against the source files before seeding or migrating any data.

---

# 7. Save Behavior and Last Updated

Each client has its own Last Updated timestamp.

- Update it only after the relevant data has been successfully persisted.
- Do not advance it when the user merely types, clicks Save, or when a save fails.
- Reload the last successfully saved timestamp after refresh, reopening, and sign-in.
- Saving one client's workspace must not change another client's timestamp.
- Preserve any existing autosave/manual save interaction patterns only where they meet these semantics; confirm the intended Edit/Save UI during source review.

---

# 8. Permissions and Tenant Isolation

- Client Performance is available only in the CascadEffects tenant.
- Only Organization Admins and Superadmins may edit/save performance data or manage clients.
- Enforce permissions in server actions/services and at the database/RLS boundary. Hiding controls in the UI is not sufficient.
- Users without the required roles must not be able to bypass the rule through direct requests.
- Preserve organization scoping and existing Custom Tables authorization patterns.
- Verify that other tenants cannot discover or access this Client Performance entry or its data by changing URLs, request parameters, or client identifiers.
- Do not claim production authorization/RLS is complete until tested against the actual database configuration and relevant roles.

---

# 9. Architecture Decisions Still Pending

The product behavior is agreed, but the technical persistence model has not yet been finalized.

Before coding, inspect the current source and migrations to establish:

1. How Runtime navigation registers and provisions Custom Tables.
2. How the CascadEffects tenant is identified and scoped.
3. The current Custom Tables definition, row, and persistence schemas.
4. Existing repository/service/server-action patterns.
5. Existing role checks and Supabase RLS policies.
6. Whether generic JSON row persistence can safely support client-specific columns, persistent month rows across years, client management, year visibility, and reliable per-client Last Updated.
7. Whether a narrowly scoped structured persistence model is necessary while retaining Custom Tables registration/navigation integration.
8. Where the Org Admin client management experience best fits the existing UI.

Do not decide in advance that every requirement must use generic JSON persistence, nor create a parallel application unnecessarily. Present the proposed schema, migrations, affected files, authorization/RLS strategy, and implementation sequence for Mario's approval before changing code.

---

# 10. Implementation Workflow

Follow the established one-file-at-a-time process:

1. Review Product North Star, this Waypoint, Platform Decisions, Platform Backlog, and Engineering Process.
2. Inspect the actual current source files and migrations from the supplied latest `src` and `supabase` archives. Do not reconstruct files from memory.
3. Present the architecture proposal and wait for approval before implementation.
4. For each code change, inspect the current full file, provide the exact path and complete replacement file, and wait for Mario to apply and test it before moving to the next file.
5. Implement persistence and migration work in a sequence that protects existing data and tenant isolation.
6. Verify client add/enable/disable, per-client columns, monthly row persistence, hide/restore/add year, snapshot and initiative persistence, per-client timestamps, and role restrictions.
7. Test save, refresh, navigation away/back, reopening, and sign-in.
8. Run build and focused functional/database tests, including RLS/tenant isolation tests.
9. Regression-test existing Custom Tables, Agenda, VA Roster, and Recruitment behavior. Recruitment's monthly history/carry-forward and Cancelled workflow must not regress.
10. Commit only after the coherent milestone is verified. Update Platform Decisions and Backlog, create the next Waypoint, and report test results accurately.

---

# 11. Milestone Status

```text
Client Performance product behavior
    DESIGN CONFIRMED

Client-specific columns and table configurations
    REQUIREMENTS CONFIRMED / EXACT FIELDS TO VERIFY AGAINST SOURCES

Two initially visible years (2025 and 2026)
    CONFIRMED

Hide/restore year and add another year
    REQUIREMENTS CONFIRMED / IMPLEMENTATION NOT STARTED

Client add/enable/disable management
    REQUIREMENTS CONFIRMED / PLACEMENT AND IMPLEMENTATION PENDING

Per-client snapshot, monthly metrics, initiatives, and Last Updated
    REQUIREMENTS CONFIRMED / IMPLEMENTATION NOT VERIFIED

Data model, migrations, and persistence strategy
    ARCHITECTURE VERIFICATION PENDING

Server-side authorization and Supabase RLS
    VERIFICATION REQUIRED

Build, functional tests, tenant isolation, and regressions
    PENDING

Implementation and deployment
    NOT STARTED IN THIS WAYPOINT
```

---

# 12. Resume Rule

> Resume with architecture verification for Client Performance. Treat this Waypoint as superseding Waypoint 33's outdated Client Performance no-monthly-history direction. Build one CascadEffects-only Runtime workspace with a client selector; per-client current snapshot, continuous monthly rows, and Key Initiatives Tracker; client-specific columns; two visible years by default (2025 and 2026); hide/restore/add-year controls; Org Admin client add/enable/disable management; role-restricted editing; and a per-client Last Updated timestamp that changes only after successful persistence. Hiding years or disabling clients must never delete data. Inspect the supplied current source and Supabase migrations, present the architecture and migration plan for approval, and do not code until approved.
