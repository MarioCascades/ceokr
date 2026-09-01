# CascadEffects Performance Platform

# Waypoint — Admin Users

# Date: 2026-08-21

---

## 1. Overview

The Administration Users / Members foundation milestone is complete.

This milestone extended the CascadEffects Performance Platform organizational
hierarchy by introducing Users and Organization Memberships beneath Teams.

The resulting organizational hierarchy is:

Organization

    ↓

Department

    ↓

Team

    ↓

User / Member

The Users capability was implemented as a data-driven Administration feature
using the existing platform architecture.

The implementation establishes the relationship between:

- Supabase Auth identity
- Application User profile
- Organization Membership
- Department association
- Team association
- Active / inactive state

The implementation includes:

- PostgreSQL Users persistence
- Organization Membership persistence
- Supabase Auth relationship
- Organization ownership
- Department association
- Team association
- User domain model
- Organization Membership domain model
- User Management read model
- User service
- Users Admin route
- Users Admin page
- Users list
- Invite User workflow
- Department selection
- Team selection
- Department → Team filtering
- Server-side Supabase Admin client
- Admin Users API route
- Auth invitation email
- Database verification
- TypeScript compilation verification
- Git checkpoint

The Builder and Runtime architecture remain unchanged.

This milestone continues the Administration layer of the platform.

---

## 2. Milestone Status

Status:

COMPLETE — INVITATION FOUNDATION

Completed:

- Users database foundation
- Organization Membership database foundation
- Supabase Auth relationship
- User domain model
- Organization Membership domain model
- User Management read model
- User service
- Users Admin route
- Users Admin page
- Users list
- Invite User dialog
- User form
- Department selection
- Team selection
- Department → Team filtering
- Server-side Supabase Admin client
- Admin Users API route
- Auth invitation workflow
- Application user creation
- Organization membership creation
- Auth invitation email verification
- Database verification
- TypeScript verification
- Git checkpoint

Not yet complete:

- User Edit workflow
- User Deactivate workflow
- Production tenant authorization
- Production Row Level Security
- Full Roles & Permissions authorization

Next Administration capability:

- Continue Users / Members management or proceed to Roles & Permissions
  after confirming the next milestone against the current Waypoint,
  Platform Decisions, and Platform Backlog.

---

## 3. Architecture Decisions

### 3.1 User identity separation

The platform distinguishes between:

Supabase Auth identity

    ↓

Application User profile

    ↓

Organization Membership

    ↓

Department / Team association

This prevents authentication identity from becoming the sole source of
business-user information.

---

### 3.2 Supabase Auth identity

Supabase Auth remains responsible for authentication identity.

The application User record stores:

- auth_user_id
- first_name
- last_name
- display_name
- email
- is_active

The relationship is:

users.auth_user_id

references:

auth.users.id

The Auth identity is therefore distinct from the application User profile.

---

### 3.3 Organization Membership

Organization membership is represented separately from the User profile.

The membership stores:

- user_id
- organization_id
- department_id
- team_id

This allows the same application User architecture to support future
organization membership and role expansion without placing organizational
ownership directly into the authentication identity.

---

### 3.4 Organization ownership

Organization remains the tenant boundary.

Organization Membership contains:

- organization_id

Department and Team associations are also validated against the selected
Organization.

The Users invitation API verifies that:

- the selected Department belongs to the Organization
- the selected Team belongs to the Organization
- the selected Team belongs to the selected Department

---

### 3.5 User organization uniqueness

A User may not have duplicate membership records for the same Organization.

The Organization Membership table therefore uses a unique relationship:

UNIQUE (

    user_id,

    organization_id

)

This prevents duplicate membership records for the same User and
Organization.

---

### 3.6 Department and Team association

Users are associated with organizational structure through
organization_memberships.

The relationship is:

Organization

    ↓

Department

    ↓

Team

    ↓

Organization Membership

    ↓

User

Department and Team identifiers are stored as UUID relationships rather than
names.

---

### 3.7 Server-side Supabase Admin client

Privileged Supabase operations use a dedicated server-side client:

src/lib/supabase/admin.ts

The client uses:

SUPABASE_SERVICE_ROLE_KEY

The service-role credential must remain server-side.

It must not be exposed through:

NEXT_PUBLIC_*

environment variables.

Client components must not import the Admin client.

---

### 3.8 Admin Users API boundary

User invitation is handled through:

POST /api/admin/users

The intended flow is:

Browser

    ↓

/api/admin/users

    ↓

Server-side Supabase Admin client

    ↓

Supabase Auth

    ↓

public.users

    ↓

organization_memberships

The API route owns the privileged invitation workflow.

---

### 3.9 Application validation and database integrity

Application validation provides user-facing validation.

PostgreSQL remains the final integrity authority.

Important relationships are enforced through database constraints and foreign
keys.

The API additionally validates Department and Team ownership before creating
the User.

---

## 4. Database Changes

### 4.1 Users table

Created:

public.users

Columns:

- id
- auth_user_id
- first_name
- last_name
- display_name
- email
- is_active
- created_at
- updated_at

---

### 4.2 Users relationships

Created:

users_auth_user_id_fkey

References:

auth.users(id)

The application User is therefore linked to the Supabase Auth identity.

---

### 4.3 Auth identity uniqueness

Created:

users_auth_user_id_unique

Constraint:

UNIQUE (

    auth_user_id

)

This prevents multiple application User records from representing the same
Supabase Auth identity.

---

### 4.4 Organization Membership table

Created:

public.organization_memberships

Columns:

- id
- user_id
- organization_id
- department_id
- team_id
- created_at
- updated_at

---

### 4.5 Organization Membership relationships

Created foreign keys for:

- user_id → users(id)
- organization_id → organization(id)
- department_id → departments(id)
- team_id → teams(id)

These relationships connect the User to the existing organization hierarchy.

---

### 4.6 Organization membership uniqueness

Created:

organization_memberships_user_organization_unique

Constraint:

UNIQUE (

    user_id,

    organization_id

)

This prevents duplicate organization membership records for the same User.

---

### 4.7 Migration

Created:

supabase/migrations/20260821_create_users_and_memberships.sql

The migration creates the Users and Organization Membership database
foundation.

---

## 5. Files Added

### Application

- src/app/admin/users/page.tsx

- src/app/api/admin/users/route.ts

### Components

- src/components/admin/users/inviteuserdialog.tsx

- src/components/admin/users/userform.tsx

- src/components/admin/users/userslist.tsx

- src/components/admin/users/userspage.tsx

### Supabase

- src/lib/supabase/admin.ts

### Domain Models

- src/lib/types/domain/user.ts

- src/lib/types/domain/organizationmembership.ts

- src/lib/types/domain/usermanagement.ts

### Database

- supabase/migrations/20260821_create_users_and_memberships.sql

---

## 6. Files Modified

The following existing application files were modified during the Users
implementation:

- src/components/admin/users/inviteuserdialog.tsx

- src/components/admin/users/userform.tsx

- src/components/admin/users/userslist.tsx

- src/components/admin/users/userspage.tsx

- src/services/user.service.ts

---

## 7. Files Removed

Removed duplicate API route:

- src/app/api/users/route.ts

The duplicate route contained the same invitation workflow as:

- src/app/api/admin/users/route.ts

The duplicate was removed to maintain a single authoritative Admin Users API
endpoint.

---

## 8. User Domain Model

Created:

src/lib/types/domain/user.ts

The User model represents:

- id
- auth_user_id
- first_name
- last_name
- display_name
- email
- is_active
- created_at
- updated_at

The model intentionally separates the application User profile from the
Supabase Auth identity.

---

## 9. Organization Membership Domain Model

Created:

src/lib/types/domain/organizationmembership.ts

The Organization Membership model represents:

- id
- user_id
- organization_id
- department_id
- team_id
- created_at
- updated_at

This model establishes the organizational context of a User.

---

## 10. User Management Read Model

Created:

src/lib/types/domain/usermanagement.ts

The User Management model supports the Admin Users presentation layer.

It allows the Users UI to present the User together with organizational
context such as:

- Department
- Team
- Active state
- User identity information

This avoids requiring the UI to treat the raw User table as the complete
source for organization-management presentation.

---

## 11. User Service

Implemented:

src/services/user.service.ts

The service provides the User management persistence boundary.

It supports organization-scoped User retrieval and User Management records.

The UI does not directly manage User database queries.

---

## 12. Admin Users UI

Created:

/admin/users

The Users Admin page supports:

- Organization display
- User count
- User listing
- Invite User
- Department selection
- Team selection
- Active state
- Edit entry point
- Deactivate entry point

The page is organization-aware and retrieves Department and Team data
dynamically.

Users, Departments, and Teams are not hardcoded into the UI.

---

## 13. Invite User Workflow

The completed invitation workflow is:

Admin

    ↓

Invite User

    ↓

Enter User information

    ↓

Select Department

    ↓

Select Team

    ↓

Submit

    ↓

POST /api/admin/users

    ↓

Validate Organization

    ↓

Validate Department

    ↓

Validate Team

    ↓

Supabase Auth invitation

    ↓

Create public.users record

    ↓

Create organization_memberships record

    ↓

Refresh Users list

The workflow was successfully tested with a real test User.

---

## 14. Department → Team Filtering

The Invite User form dynamically filters Team choices based on the selected
Department.

Before a Department is selected:

Team displays:

Select department first

After a Department is selected:

Team options are populated from the corresponding Department.

This confirms that Team assignment is data-driven rather than hardcoded.

---

## 15. Auth Invitation Verification

A real User invitation was successfully sent through Supabase Auth.

The invitation email was received successfully by the test email account.

This verifies the server-side Auth invitation workflow.

---

## 16. Application User Verification

The test User was successfully created and appeared in:

/admin/users

Verified presentation included:

- User name
- Email
- Department
- Team
- Active state

The Users list displayed:

Test User

with the selected Department and Team.

---

## 17. Organization Membership Verification

The test User was successfully associated with:

- the current Organization
- the selected Department
- the selected Team

The Organization Membership relationship was successfully created.

---

## 18. Verification

### TypeScript

Verified successfully using:

npx tsc --noEmit --pretty false

Final compilation passed with no errors.

---

### Database schema

Verified that:

public.users

exists with the expected User fields.

Verified that:

public.organization_memberships

exists with:

- id
- user_id
- organization_id
- department_id
- team_id
- created_at
- updated_at

---

### Database constraints

Verified:

users_pkey

users_auth_user_id_fkey

users_auth_user_id_unique

organization_memberships_pkey

organization_memberships_user_fkey

organization_memberships_organization_fkey

organization_memberships_department_fkey

organization_memberships_team_fkey

organization_memberships_user_organization_unique

---

### Invitation verification

Auth invitation:

PASS

Invitation email:

PASS

Application User:

PASS

Organization Membership:

PASS

Users Admin display:

PASS

Department assignment:

PASS

Team assignment:

PASS

---

## 19. Test Data

Current test User retained for continued development:

User:

Test User

Email:

sequelrio@gmail.com

Department:

Treatment Coordinator

Team:

TC Team

Status:

Active

This test User may be used for continued Users Admin testing.

The test record should not be treated as production data.

---

## 20. Technical Debt

### 20.1 User Edit

The Users list currently exposes an Edit action.

The complete Edit workflow has not yet been implemented.

Future Edit functionality should support appropriate User profile and
membership changes without allowing unsafe tenant reassignment.

---

### 20.2 User Deactivation

The Users list currently exposes a Deactivate action.

The complete Deactivate workflow has not yet been implemented.

Future deactivation should preserve historical records rather than deleting
the User where appropriate.

---

### 20.3 Tenant Authorization

The Users Admin API currently relies on the server-side Admin client and
organization identifiers supplied by the request.

Production authorization must eventually verify that the authenticated
requesting administrator is authorized to manage the specified Organization.

This remains an outstanding security milestone.

---

### 20.4 Production Row Level Security

Production-ready Supabase RLS policies have not yet been implemented and
validated for the Users / Membership architecture.

This remains deferred according to Platform Decisions and Platform Backlog.

---

### 20.5 Roles and Permissions

Users have been designed with future role compatibility.

Roles and Permissions have not yet been implemented.

The future authorization model should eventually be enforced consistently
across:

- UI
- server services
- database / RLS

---

### 20.6 Environment Validation

The server-side Admin client now depends on:

SUPABASE_SERVICE_ROLE_KEY

The key is intentionally server-only.

Future environment validation should provide clearer startup and deployment
diagnostics for missing server configuration.

---

### 20.7 Visual Design System

The Users Admin UI currently uses the existing basic platform styling.

The centralized CascadEffects design system remains future work.

---

## 21. Architectural Lessons

### Authentication identity and application identity must remain separate.

Supabase Auth manages authentication identity.

The application User model manages business-user information.

---

### Organization membership is a separate business concept.

A User profile should not become the sole source of organizational ownership.

Organization Membership provides the correct boundary for future multi-organization
support.

---

### Relationships should use IDs.

Users reference Organizations, Departments, and Teams using UUID identifiers
rather than names.

---

### Server-only privileged operations must remain server-side.

The Supabase service-role key is never exposed through a public environment
variable.

Privileged Auth operations are performed through the server API boundary.

---

### Application validation and database integrity serve different purposes.

Application validation improves the user experience.

Database constraints remain the final integrity authority.

---

### Administration should remain separate from Builder and Runtime.

Users management belongs to Administration.

Builder and Runtime architecture were not modified during this milestone.

---

### One authoritative API route is preferred.

The duplicate:

src/app/api/users/route.ts

was removed.

The authoritative Admin invitation endpoint is:

/api/admin/users

---

## 22. Git Checkpoint

Users implementation was staged and reviewed.

The staged diff contained the intended Users milestone files.

Verified using:

git diff --cached --stat

The final staged change set contained:

- src/app/admin/users/page.tsx
- src/app/api/admin/users/route.ts
- src/components/admin/users/inviteuserdialog.tsx
- src/components/admin/users/userform.tsx
- src/components/admin/users/userslist.tsx
- src/components/admin/users/userspage.tsx
- src/lib/supabase/admin.ts
- src/lib/types/domain/organizationmembership.ts
- src/lib/types/domain/user.ts
- src/lib/types/domain/usermanagement.ts
- src/services/user.service.ts
- supabase/migrations/20260821_create_users_and_memberships.sql

TypeScript compilation passed.

The Users implementation was committed to Git.

Final working tree verification:

git status

Result:

nothing to commit, working tree clean

The Users implementation is therefore recorded as a clean Git checkpoint.

---

## 23. Platform Documentation Impact

The Users / Members capability has advanced from:

NEXT MILESTONE

to:

INVITATION FOUNDATION COMPLETE

Platform Decisions should continue to identify Users / Members as an
Administration responsibility.

Platform Backlog should be updated so that Users / Members no longer appears
as the immediate next milestone.

The remaining Users work should be tracked as:

- User Edit
- User Deactivate
- Production tenant authorization
- Production RLS
- Roles & Permissions compatibility

The next major Administration milestone should be confirmed after reviewing
the updated Platform Backlog.

---

## 24. Next Session

Resume from this Users Waypoint.

Before beginning new implementation:

1. Review this Waypoint.

2. Review Platform Decisions.

3. Review Platform Backlog.

4. Confirm the next Administration milestone.

5. Do not modify Builder or Runtime architecture unless explicitly required
   by the confirmed milestone.

Potential next work includes:

- Complete User Edit
- Complete User Deactivate
- Roles & Permissions

The exact next milestone must be confirmed from the current documentation
rather than conversational memory.

Continue using the engineering workflow:

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

---

## 25. Milestone Completion

Administration:

IN PROGRESS

Organization:

COMPLETE

Departments:

COMPLETE

Teams:

COMPLETE

Users / Members:

INVITATION FOUNDATION COMPLETE

Builder:

ESTABLISHED

Runtime:

ESTABLISHED

Production Authorization / RLS:

OUTSTANDING

Roles & Permissions:

FUTURE

Next:

Confirm the next Administration milestone.