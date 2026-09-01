CascadEffects Performance Platform

Waypoint 15 --- Administration Users Completion

Date: 2026-08-26

Milestone: Administration --- Users / Members Completion

Status: COMPLETE

1. Overview

This waypoint records completion of the Users / Members Administration
workflow.

The Users Administration capability now supports:

User invitation

User editing

Department assignment

Team assignment

User deactivation

Membership Role management

The deactivation workflow preserves organizational history and role
relationships.

No Builder or Runtime architecture was modified.

2. Completed Work

Users / Members

Completed:

User invitation workflow

User Edit workflow

User profile editing

Department editing

Team editing

Active / inactive state editing

User Deactivate workflow

Organization Membership updates

Membership Role management from User Edit

Role assignment to Organization Membership

Role removal from Organization Membership

User Deactivate

The completed workflow is:

Users

↓

Select active user

↓

Deactivate

↓

Confirmation dialog

↓

deactivateUser()

↓

users.is_active = false

↓

Refresh Users Management view

The user record remains in the organization.

Existing Organization Membership data remains intact.

Existing Membership Role relationships remain intact.

This preserves organizational history and supports future historical
performance reporting.

3. Architecture Decisions

3.1 Deactivation is a state change

Deactivation does not delete the User.

The implementation updates:

users.is_active

to:

false

This preserves the user record and its historical relationships.

3.2 Organization Membership is preserved

Deactivating a User does not delete:

Organization Membership

Department assignment

Team assignment

This preserves organizational history.

3.3 Membership Roles are preserved

Deactivation does not remove Membership Role relationships.

Roles remain associated with the Organization Membership unless
explicitly removed through the Role management workflow.

This prevents destructive behavior and preserves historical
authorization relationships.

3.4 Existing service capability reused

The existing:

deactivateUser()

service function was reused.

No duplicate deactivate service was created.

3.5 Existing User Edit architecture preserved

User Edit remains responsible for:

User profile

Department

Team

Active state

Membership Role management remains a separate component.

4. Files Added

src/components/admin/users/deactivateuserdialog.tsx

5. Files Modified

src/components/admin/users/userspage.tsx

6. Files Removed

None.

7. Database Changes

No database migration was required.

The existing users.is_active field was reused.

No Organization Membership or Membership Role records are deleted during
deactivation.

8. Functional Verification

User Deactivation

Verified:

Open Users Administration

Select active user

Click Deactivate

Confirmation dialog opens

Correct user name is displayed

Confirm Deactivate User

Dialog closes

User changes to Inactive

Page refresh preserves Inactive state

Result:

PASS

Historical Relationship Preservation

After deactivation, the User Edit workflow was reopened.

Verified:

User information remains available

Department remains available

Team remains available

Role assignments remain available

Result:

PASS

9. TypeScript Verification

Command:

npx tsc --noEmit --pretty false

Result:

PASS

10. Technical Debt

The following remain outstanding:

Production Tenant Authorization

Status:

OUTSTANDING

Production Row Level Security

Status:

OUTSTANDING

Full Authorization Enforcement

Status:

OUTSTANDING

Authorization must eventually be enforced consistently across:

UI

server services

APIs

database / RLS

11. Platform Backlog Impact

Users / Members is now complete from a functional Administration
perspective.

Completed:

User Invitation

User Edit

User Deactivate

Department assignment

Team assignment

Membership Role management

Remaining Users-specific work is primarily production authorization and
security hardening.

The next Administration product capability is:

Performance Sheet Management.

12. Current Platform Position

Builder

ESTABLISHED

Runtime Execution Foundation

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

COMPLETE

Roles & Permissions

FUNCTIONAL FOUNDATION COMPLETE

Performance Sheet Management

NEXT ADMIN PHASE

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

Start from this Waypoint.

Review:

Latest Waypoint

docs/docs/01_Platform_Decisions.md

docs/docs/02_Platform_Backlog.md

Confirm:

Administration --- Performance Sheet Management

as the next development milestone.

The first implementation step should inspect the existing Performance
Sheet and Builder entry points before creating new Administration UI.

Do not rebuild the Builder.

Administration should provide the management/lifecycle entry point while
the Builder remains responsible for Performance Sheet definition and
editing.

14. Milestone Status

Users / Members:

COMPLETE

User Edit:

COMPLETE

User Deactivate:

COMPLETE

Membership Role Management:

COMPLETE

Roles & Permissions:

FUNCTIONAL FOUNDATION COMPLETE

Performance Sheet Management:

NEXT

Production Authorization / RLS:

OUTSTANDING