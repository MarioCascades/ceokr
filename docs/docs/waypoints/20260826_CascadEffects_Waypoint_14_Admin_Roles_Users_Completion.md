CascadEffects Performance Platform

Waypoint 14 --- Administration Roles, Membership Roles & User Edit

Date: 2026-08-26

Milestone: Administration --- Roles & Permissions Functional
Completion + User Edit

Status: COMPLETE

1. Overview

This waypoint records completion of the current Administration milestone
covering the functional Roles & Permissions workflow and the User Edit
workflow.

The implementation extended the existing organization-scoped Role
architecture without modifying the Builder or Runtime architecture.

The completed functional relationship is:

User

↓

Organization Membership

↓

Membership Role

↓

Role

↓

Role Permission

↓

Permission

The implementation remains data-driven and organization-aware.

2. Completed Work

Roles & Permissions

Completed:

Role creation

Role editing

Role deletion

Dynamic Permission catalog loading

Permission assignment to Roles

Permission removal from Roles

Membership Role assignment

Membership Role removal

Organization-aware validation

Duplicate assignment protection

Role permission persistence

Membership role persistence

Role and Permission UI integration

The Roles Administration workflow now supports managing the permissions
associated with an organization-scoped Role.

Users / Members

Completed:

User Edit workflow

User profile editing

Department editing

Team editing

Active / inactive state editing

Organization Membership updates

Membership Role management from User Edit

Role assignment to an Organization Membership

Role removal from an Organization Membership

The existing User invitation workflow remains intact.

3. Architecture Decisions

3.1 Permissions remain global

Permissions remain platform-level capability definitions.

Organizations do not create independent copies of permission
definitions.

Roles compose these reusable permissions through role_permissions.

3.2 Roles remain organization-scoped

Roles continue to belong to a specific organization.

The Role relationship remains:

Role

↓

organization_id

3.3 Membership owns organizational role assignment

Roles are assigned to Organization Memberships rather than directly to
Users.

The relationship remains:

User

↓

Organization Membership

↓

Membership Role

↓

Role

This preserves future multi-organization membership support.

3.4 User profile and membership remain separate

User profile data is updated through the User service.

Department and Team assignments are updated through the Organization
Membership service.

Role assignments are managed independently through the Membership Role
service.

This avoids creating a single monolithic User administration model.

3.5 Existing services were reused

No new database service architecture was required for this milestone.

Existing services were reused:

role.service.ts

permission.service.ts

rolepermission.service.ts

membershiprole.service.ts

user.service.ts

3.6 Builder and Runtime remain unchanged

The Builder and Runtime architectures were not modified as part of this
Administration milestone.

Administration remains the configuration layer.

Builder remains responsible for Performance Sheet definition.

Runtime remains responsible for execution of published Performance Sheet
versions.

4. Files Added

src/components/admin/roles/rolepermissions.tsx

src/components/admin/users/usereditdialog.tsx

src/components/admin/users/userroles.tsx

5. Files Modified

src/components/admin/roles/roledialog.tsx

src/components/admin/roles/rolespage.tsx

src/components/admin/users/userspage.tsx

6. Files Removed

None.

7. Database Changes

No new database migration was required for this milestone.

Existing tables were reused:

roles

permissions

role_permissions

organization_memberships

membership_roles

users

Existing organization-aware constraints remain the database-level
integrity foundation.

No Builder or Runtime database changes were introduced.

8. Functional Workflows Verified

8.1 Role Permission Assignment

Admin

↓

Roles

↓

Edit Role

↓

Permissions

↓

Assign

↓

role_permissions

↓

Permission remains assigned after reload

Result:

PASS

8.2 Role Permission Removal

Admin

↓

Roles

↓

Edit Role

↓

Permissions

↓

Remove

↓

role_permissions

↓

Permission no longer assigned after reload

Result:

PASS

8.3 Membership Role Assignment

Admin

↓

Users

↓

Edit User

↓

Roles

↓

Assign

↓

membership_roles

↓

Role remains assigned after reopening User Edit

Result:

PASS

8.4 Membership Role Removal

Admin

↓

Users

↓

Edit User

↓

Roles

↓

Remove

↓

membership_roles

↓

Role no longer assigned after reopening User Edit

Result:

PASS

8.5 User Edit

Admin

↓

Users

↓

Edit

↓

User Edit Dialog

↓

User profile update



Organization Membership update

↓

Supabase

↓

Refresh Users

Result:

PASS

8.6 Department / Team Update

User Edit supports:

Department selection

Team selection filtered by Department

Organization Membership persistence

Result:

PASS

9. Verification

TypeScript

Command:

npx tsc --noEmit --pretty false

Result:

PASS

No TypeScript errors were reported after the completed implementation.

Git Staged Diff Validation

Command:

git diff --cached --check

Result:

PASS

No whitespace errors were reported.

Manual UI Verification

Verified:

Role creation

Role editing

Permission assignment

Permission removal

Membership Role assignment

Membership Role removal

User Edit

Department update

Team update

Persistence after reload / dialog reopen

Result:

PASS

10. Technical Debt

The following remain intentionally outstanding.

User Deactivate

The existing User service contains the deactivateUser capability, but
the Administration UI workflow has not yet been completed.

Status:

NEXT

Production Tenant Authorization

Organization context currently exists throughout the Administration
service layer, but production authorization must eventually verify the
authenticated administrator's organization access.

Status:

OUTSTANDING

Production Row Level Security

Production Supabase RLS policies have not yet been fully implemented and
validated for the Administration authorization architecture.

Status:

OUTSTANDING

Full Authorization Enforcement

The Roles and Permissions architecture establishes the authorization
foundation but does not yet enforce permissions consistently across:

UI

server services

API routes

database / RLS

Status:

OUTSTANDING

11. Platform Backlog Impact

The current Platform Backlog was updated to reflect the completed
milestone.

Completed:

Permission assignment

Permission removal

Membership Role assignment

Membership Role removal

User / Membership Role Administration workflow

User Edit workflow

Remaining immediate Users / Members work:

User Deactivate workflow

Remaining security work:

Production tenant authorization

Production Row Level Security

Full authorization enforcement across UI, services, APIs, and
database/RLS

12. Current Platform Position

Builder

ESTABLISHED

Runtime

ESTABLISHED

Administration

IN PROGRESS

Organization

COMPLETE

Departments

COMPLETE

Teams

COMPLETE

Users / Members

USER EDIT COMPLETE

User Deactivate:

NEXT

Roles & Permissions

FUNCTIONAL FOUNDATION COMPLETE

Performance Sheet Management

FUTURE ADMIN PHASE

Assignment Management

FUTURE

Dashboards

FUTURE

Reports

FUTURE

AI

FUTURE

Production Authorization / RLS

OUTSTANDING

13. Next Development Session

The next confirmed Administration capability is:

User Deactivate

Expected workflow:

Users

↓

Select User

↓

Deactivate

↓

users.is_active = false

↓

Refresh User Management

The existing deactivateUser() service capability should be reused
rather than creating a duplicate service operation.

After User Deactivate is complete, reassess the Administration roadmap
using:

Latest Waypoint

docs/01_Platform_Decisions.md

docs/02_Platform_Backlog.md

The next larger Administration phase is expected to evaluate:

Performance Sheet Management

Assignment Management

Additional Administration capabilities

Production authorization and RLS remain separate security milestones.

14. Documentation Maintenance

This waypoint should be committed together with the completed
implementation and the updated Platform Backlog.

Do not modify earlier Waypoints.

Earlier Waypoints remain historical engineering records.

The repository should now treat this Waypoint as the current checkpoint
for the completed Roles & Permissions functional milestone and User Edit
workflow.

15. Milestone Status

Administration:

IN PROGRESS

Roles & Permissions:

FUNCTIONAL FOUNDATION COMPLETE

User Edit:

COMPLETE

Permission Assignment:

COMPLETE

Permission Removal:

COMPLETE

Membership Role Assignment:

COMPLETE

Membership Role Removal:

COMPLETE

User Deactivate:

NEXT

Builder:

ESTABLISHED

Runtime:

ESTABLISHED

Production Authorization / RLS:

OUTSTANDING