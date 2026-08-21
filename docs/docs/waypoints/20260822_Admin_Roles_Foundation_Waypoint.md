# CascadEffects Performance Platform

# Waypoint — Admin Roles Foundation

# Date: 2026-08-22

---

## 1. Overview

The Administration Roles Foundation milestone is complete.

This milestone introduces the foundational role and permission architecture
for the CascadEffects Performance Platform.

The implementation establishes the database, domain, service, and initial
Administration UI foundation required for organization-scoped Roles and
global platform Permissions.

The resulting security model foundation is:

Organization

    ↓

Organization Membership

    ↓

Role

    ↓

Role Permission

    ↓

Permission

The implementation intentionally establishes the foundation without yet
implementing production authorization enforcement or Row Level Security.

The Builder and Runtime architecture remain unchanged.

This milestone continues the Administration layer of the platform.

---

## 2. Milestone Status

Status:

COMPLETE — ROLE FOUNDATION

Completed:

- Permissions database foundation
- Organization-scoped Roles database foundation
- Role Permissions database foundation
- Membership Roles database foundation
- Permission catalog
- Tenant integrity constraints
- Permission domain model
- Role domain model
- Role Permission domain model
- Membership Role domain model
- Role service
- Permission service
- Role Permission service
- Membership Role service
- Roles Administration route
- Roles Administration page
- Role list
- Create Role workflow
- Edit Role workflow
- Delete Role workflow
- TypeScript verification
- Real database CRUD verification

Not yet complete:

- Permission assignment UI
- Permission removal UI
- Membership Role assignment UI
- Membership Role removal UI
- User-to-Role Administration workflow
- Production tenant authorization
- Production Row Level Security
- Full authorization enforcement

Next Roles & Permissions capability:

- Permission assignment to Roles
- Permission removal from Roles
- Role assignment to Organization Memberships

---

## 3. Architecture Decisions

### 3.1 Permissions are global platform definitions

Permissions represent reusable platform capabilities.

Permissions are not owned by an individual organization.

The permission model therefore uses a global catalog:

Platform

    ↓

Permissions

Organizations consume these permissions through organization-scoped Roles.

---

### 3.2 Roles are organization-scoped

Roles belong to an Organization.

The Role model contains:

- organization_id
- name
- description
- is_active

Role names are unique within an Organization.

The same role name may therefore exist in multiple organizations.

Example:

Organization A

    Manager

Organization B

    Manager

These are separate organization-scoped Role records.

---

### 3.3 Role Permissions are relationships

A Role does not contain permission definitions directly.

The relationship is represented through:

role_permissions

The relationship is:

Role

    ↓

Role Permission

    ↓

Permission

This avoids duplicating permission definitions across organizations.

---

### 3.4 Membership Roles are relationships

A user's organizational role is represented through the Organization
Membership rather than directly on the User profile.

The relationship is:

User

    ↓

Organization Membership

    ↓

Membership Role

    ↓

Role

This preserves the separation between:

- Authentication identity
- Application User
- Organization Membership
- Organization Role

---

### 3.5 Tenant integrity is enforced by PostgreSQL

The database was designed so that a Membership Role cannot reference a Role
belonging to another Organization.

Composite organization-aware constraints were added for:

- organization_memberships
- roles
- membership_roles

The database therefore protects against cross-organization role assignment
at the relational integrity level.

---

### 3.6 Organization context remains explicit

Organization-owned service operations require organization context.

Role operations use:

organizationId

alongside:

roleId

This keeps tenant boundaries explicit throughout the application service
layer.

---

### 3.7 Authorization is intentionally deferred

This milestone does not implement production authorization.

The current implementation establishes the data and application foundation
that future authorization enforcement will use.

Production authorization remains a separate milestone covering:

- authenticated administrator verification
- tenant authorization
- service authorization
- Supabase RLS
- database enforcement

---

### 3.8 Administration remains separate from Builder and Runtime

Roles and Permissions belong to the Administration layer.

Builder and Runtime architecture were not modified during this milestone.

---

## 4. Database Changes

### 4.1 Permissions table

Created:

public.permissions

Columns:

- id
- key
- name
- description
- created_at

Permission keys are globally unique.

---

### 4.2 Roles table

Created:

public.roles

Columns:

- id
- organization_id
- name
- description
- is_active
- created_at
- updated_at

Roles are linked to:

public.organization

through:

roles_organization_fkey

---

### 4.3 Role uniqueness

Created:

roles_organization_name_unique

Constraint:

UNIQUE (

    organization_id,

    name

)

This allows each Organization to maintain its own Role names.

---

### 4.4 Role organization composite key

Created:

roles_id_organization_unique

Constraint:

UNIQUE (

    id,

    organization_id

)

This supports organization-aware composite foreign key enforcement.

---

### 4.5 Role Permissions table

Created:

public.role_permissions

Columns:

- id
- role_id
- permission_id
- created_at

The table connects Roles to global Permissions.

---

### 4.6 Role Permission uniqueness

Created:

role_permissions_role_permission_unique

Constraint:

UNIQUE (

    role_id,

    permission_id

)

This prevents assigning the same Permission to the same Role more than once.

---

### 4.7 Membership Roles table

Created:

public.membership_roles

Columns:

- id
- organization_membership_id
- role_id
- organization_id
- created_at

This table connects Organization Memberships to organization-scoped Roles.

---

### 4.8 Organization Membership composite key

Created:

organization_memberships_id_organization_unique

Constraint:

UNIQUE (

    id,

    organization_id

)

This supports organization-aware composite foreign key enforcement from
membership_roles.

---

### 4.9 Membership Role organization integrity

Created:

membership_roles_membership_organization_fkey

This ensures that the Membership Role references a Membership belonging to
the same Organization.

Created:

membership_roles_role_organization_fkey

This ensures that the Membership Role references a Role belonging to the
same Organization.

This prevents cross-organization Role assignment at the database level.

---

### 4.10 Membership Role uniqueness

Created:

membership_roles_membership_role_unique

Constraint:

UNIQUE (

    organization_membership_id,

    role_id,

    organization_id

)

This prevents duplicate Role assignments to the same Organization
Membership.

---

### 4.11 Indexes

Created indexes for:

- roles organization
- roles organization and active state
- role permissions by role
- role permissions by permission
- membership roles by membership
- membership roles by role
- membership roles by organization

These indexes establish the initial query paths for organization-scoped
Administration operations.

---

### 4.12 Permission seed catalog

The migration seeded the following platform permissions:

- users.view
- users.create
- users.edit
- users.deactivate
- departments.view
- departments.manage
- teams.view
- teams.manage
- performance_sheets.view
- performance_sheets.manage

The permission catalog was verified directly in Supabase.

---

### 4.13 Migration

Created and applied:

supabase/migrations/20260821_create_roles_and_permissions.sql

The migration executed successfully in Supabase SQL Editor.

Result:

Success. No rows returned.

---

## 5. Files Added

### Domain Models

- src/lib/types/domain/permission.ts
- src/lib/types/domain/role.ts
- src/lib/types/domain/rolepermission.ts
- src/lib/types/domain/membershiprole.ts

### Services

- src/services/role.service.ts
- src/services/permission.service.ts
- src/services/rolepermission.service.ts
- src/services/membershiprole.service.ts

### Administration Components

- src/components/admin/roles/roleform.tsx
- src/components/admin/roles/roledialog.tsx
- src/components/admin/roles/deleteroledialog.tsx
- src/components/admin/roles/roleslist.tsx
- src/components/admin/roles/rolespage.tsx

### Administration Route

- src/app/admin/roles/page.tsx

### Database

- supabase/migrations/20260821_create_roles_and_permissions.sql

---

## 6. Files Modified

No previously established Builder or Runtime files were modified.

The Roles Foundation was implemented using new domain, service, component,
route, and database files.

---

## 7. Files Removed

No files were removed during the Roles Foundation milestone.

---

## 8. Permission Domain Model

Created:

src/lib/types/domain/permission.ts

The Permission model represents:

- id
- key
- name
- description
- created_at

Permissions are treated as global platform capability definitions.

---

## 9. Role Domain Model

Created:

src/lib/types/domain/role.ts

The Role model represents:

- id
- organization_id
- name
- description
- is_active
- created_at
- updated_at

The domain model also provides:

- CreateRoleInput
- UpdateRoleInput

---

## 10. Role Permission Domain Model

Created:

src/lib/types/domain/rolepermission.ts

The Role Permission model represents:

- id
- role_id
- permission_id
- created_at

The domain model also provides:

- CreateRolePermissionInput

---

## 11. Membership Role Domain Model

Created:

src/lib/types/domain/membershiprole.ts

The Membership Role model represents:

- id
- organization_membership_id
- role_id
- organization_id
- created_at

The domain model also provides:

- CreateMembershipRoleInput

---

## 12. Role Service

Implemented:

src/services/role.service.ts

The service provides:

- listRoles
- getRole
- createRole
- updateRole
- deleteRole

All organization-owned Role operations explicitly use organization context.

The service validates:

- organization
- role name
- duplicate organization role names
- organization ownership

---

## 13. Permission Service

Implemented:

src/services/permission.service.ts

The service provides:

- listPermissions
- getPermission
- getPermissionByKey
- createPermission

Permissions remain global platform definitions.

Organization administrators should not create new permission definitions.

The create operation exists for future platform-level administration
capabilities.

---

## 14. Role Permission Service

Implemented:

src/services/rolepermission.service.ts

The service provides:

- listRolePermissions
- createRolePermission
- deleteRolePermission

The service verifies:

- Role ownership by Organization
- Permission existence
- duplicate Role/Permission relationships

The service is ready for the future Permission assignment UI.

---

## 15. Membership Role Service

Implemented:

src/services/membershiprole.service.ts

The service provides:

- listMembershipRoles
- createMembershipRole
- deleteMembershipRole

The service verifies:

- Membership organization ownership
- Role organization ownership
- Organization consistency

The service is ready for the future User/Membership Role assignment UI.

---

## 16. Admin Roles UI

Created:

/admin/roles

The Roles Administration page supports:

- Organization display
- Role count
- Role listing
- Create Role
- Edit Role
- Delete Role
- Active/inactive state
- Role descriptions

The UI is organization-aware and retrieves Roles dynamically.

Roles are not hardcoded.

---

## 17. Role Create Workflow

The completed workflow is:

Admin

    ↓

Roles

    ↓

Create Role

    ↓

Enter Role Name

    ↓

Enter Description

    ↓

Set Active State

    ↓

Create Role

    ↓

Role Service

    ↓

Supabase

    ↓

public.roles

    ↓

Refresh Roles List

This workflow was successfully tested with a real organization Role.

---

## 18. Role Edit Workflow

The completed workflow is:

Admin

    ↓

Roles

    ↓

Edit

    ↓

Modify Role

    ↓

Save Changes

    ↓

Role Service

    ↓

Supabase

    ↓

Refresh Roles List

The Edit workflow was successfully tested with the real database.

---

## 19. Role Delete Workflow

The completed workflow is:

Admin

    ↓

Roles

    ↓

Delete

    ↓

Confirm

    ↓

Role Service

    ↓

Supabase

    ↓

Role removed from list

The Delete workflow was successfully tested with the real database.

---

## 20. Verification

### TypeScript

Verified successfully using:

npx tsc --noEmit --pretty false

Result:

PASS

No TypeScript errors were reported.

---

### Database tables

Verified that the following tables exist:

- membership_roles
- permissions
- role_permissions
- roles

Result:

PASS

---

### Permission catalog

Verified that all 10 seeded permissions exist.

Result:

PASS

Verified permissions:

- departments.manage
- departments.view
- performance_sheets.manage
- performance_sheets.view
- teams.manage
- teams.view
- users.create
- users.deactivate
- users.edit
- users.view

---

### Database constraints

Verified:

organization_memberships_id_organization_unique

roles_id_organization_unique

roles_organization_name_unique

role_permissions_role_permission_unique

membership_roles_membership_fkey

membership_roles_role_fkey

membership_roles_membership_organization_fkey

membership_roles_role_organization_fkey

membership_roles_membership_role_unique

Result:

PASS

---

### Role CRUD

Create Role:

PASS

Read Role:

PASS

Update Role:

PASS

Delete Role:

PASS

---

## 21. Test Data

A temporary Role was created and used for CRUD verification.

Test Role:

Test Manager

The Role was successfully:

- created
- displayed
- edited
- deleted

The test Role was removed after verification.

No temporary Role is intentionally retained as part of this milestone.

---

## 22. Technical Debt

### 22.1 Permission assignment UI

The platform has the database and service foundation required to assign
Permissions to Roles.

The Administration UI has not yet implemented:

- Permission list for a Role
- Assign Permission
- Remove Permission

This is the next logical Roles & Permissions UI capability.

---

### 22.2 Membership Role assignment UI

The platform has the database and service foundation required to assign
Roles to Organization Memberships.

The Administration UI has not yet implemented:

- User/Membership Role list
- Assign Role
- Remove Role

This should follow Permission assignment.

---

### 22.3 User Edit

User Edit remains incomplete from the previous Users milestone.

It should be addressed according to the confirmed Administration roadmap.

---

### 22.4 User Deactivation

User Deactivation remains incomplete from the previous Users milestone.

It should preserve historical records where appropriate.

---

### 22.5 Tenant Authorization

The current service layer establishes organization context, but production
authorization still requires authenticated administrator verification.

Organization identifiers supplied by clients must eventually be checked
against the authenticated user's authorization context.

---

### 22.6 Production Row Level Security

Production Supabase RLS policies have not yet been implemented and validated
for the Roles and Permissions architecture.

RLS remains a dedicated security milestone.

---

### 22.7 Full authorization enforcement

Roles and Permissions currently represent the platform's authorization
foundation.

They do not yet control access to application features.

Future enforcement must be implemented consistently across:

- UI
- server services
- API routes
- database/RLS

---

## 23. Architectural Lessons

### Roles should be organization-scoped.

Organizations must be able to define their own roles without sharing Role
records with other organizations.

---

### Permissions should be reusable.

Permissions are global capability definitions.

Organizations should compose these capabilities through their own Roles.

---

### Membership should own organizational role assignment.

Roles should be assigned to Organization Memberships rather than directly to
the User profile.

This maintains compatibility with future multi-organization membership.

---

### Tenant integrity should be enforced at the database layer.

Application checks are useful for user-facing validation.

PostgreSQL constraints remain the final relational integrity authority.

---

### Services should preserve tenant context.

Organization-owned operations should require organization context rather than
accepting globally scoped identifiers.

---

### Administration should remain modular.

Roles, Permissions, and Membership Roles are separate capabilities and should
not become one monolithic Administration component.

---

### Build vertical slices.

The Role milestone was validated through:

Database

    ↓

Domain

    ↓

Service

    ↓

UI

    ↓

Real CRUD

This approach reduces the risk of building large amounts of unverified UI or
service code.

---

## 24. Git Checkpoint

The Roles Foundation implementation has been compiled and manually verified.

TypeScript verification passed.

The real Role CRUD workflow passed:

- Create
- Read
- Update
- Delete

The Roles implementation should now be staged and committed together with
the documentation checkpoint.

Before the next implementation milestone:

1. Review the staged diff.
2. Confirm all intended Roles files are present.
3. Confirm no unintended files are included.
4. Commit the completed Roles Foundation.
5. Verify:

git status

Expected result after commit:

nothing to commit, working tree clean

---

## 25. Platform Documentation Impact

The previous Users Waypoint remains historical and is not modified.

The Users Waypoint identified Roles & Permissions as a future capability.

The project has now advanced into the Roles Foundation milestone.

Platform Backlog should therefore be updated so that the current
Administration state reflects:

Users / Members:

INVITATION FOUNDATION COMPLETE

Roles & Permissions:

ROLE FOUNDATION COMPLETE

The remaining Roles & Permissions work should be tracked as:

- Permission assignment
- Permission removal
- Membership Role assignment
- Membership Role removal
- Production tenant authorization
- Production RLS
- Full authorization enforcement

The exact next milestone should be confirmed against the updated Platform
Backlog before additional implementation begins.

---

## 26. Next Session

Resume from this Roles Foundation Waypoint.

Before beginning new implementation:

1. Review this Waypoint.
2. Review Platform Decisions.
3. Review Platform Backlog.
4. Confirm the next Administration milestone.
5. Verify the Git working tree is clean.
6. Do not modify Builder or Runtime architecture unless explicitly required
   by the confirmed milestone.

Recommended next Roles & Permissions work:

Permission assignment

    ↓

Permission removal

    ↓

Membership Role assignment

    ↓

Membership Role removal

    ↓

Roles & Permissions verification

After the Roles & Permissions capability is complete, production authorization
and RLS should be addressed as a dedicated security milestone.

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

## 27. Milestone Completion

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

Roles & Permissions:

ROLE FOUNDATION COMPLETE

Builder:

ESTABLISHED

Runtime:

ESTABLISHED

Production Authorization / RLS:

OUTSTANDING

Next:

Confirm the next Roles & Permissions milestone.