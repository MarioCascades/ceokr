/*
==========================================================
CascadEffects Performance Platform
Default Organization Roles
----------------------------------------------------------
Creates the default organization-scoped roles:

- Organization Admin
- Member

Organization Admin receives the organization-management
permission catalog currently defined by the platform.

Member receives basic organization viewing permissions.

This migration is intentionally idempotent so it can be
run safely against existing environments.

IMPORTANT:

Platform Super Admin is NOT created here.

Super Admin is a platform-level authority represented by:

public.platform_memberships

Organization Admin is represented by:

public.roles
        ↓
public.role_permissions
        ↓
public.membership_roles
        ↓
public.organization_memberships

This migration does NOT implement:

- RLS
- authentication
- Super Admin assignment
- authorization functions
- role administration UI
==========================================================
*/

BEGIN;


/* ========================================================
   1. Ensure Core Permission Catalog Exists
======================================================== */

INSERT INTO public.permissions (
  key,
  name,
  description
)
VALUES

(
  'users.view',
  'View Users',
  'View users and organization memberships.'
),

(
  'users.create',
  'Create Users',
  'Invite and create users within an organization.'
),

(
  'users.edit',
  'Edit Users',
  'Edit user profile and membership information.'
),

(
  'users.deactivate',
  'Deactivate Users',
  'Deactivate users without deleting historical records.'
),

(
  'departments.view',
  'View Departments',
  'View organization departments.'
),

(
  'departments.manage',
  'Manage Departments',
  'Create, edit, and delete organization departments.'
),

(
  'teams.view',
  'View Teams',
  'View organization teams.'
),

(
  'teams.manage',
  'Manage Teams',
  'Create, edit, and delete organization teams.'
),

(
  'performance_sheets.view',
  'View Performance Sheets',
  'View Performance Sheet definitions.'
),

(
  'performance_sheets.manage',
  'Manage Performance Sheets',
  'Create, edit, publish, revise, archive, and manage Performance Sheets.'
)

ON CONFLICT (
  key
)
DO NOTHING;


/* ========================================================
   2. Provision Organization Admin Role
======================================================== */

INSERT INTO public.roles (
  organization_id,
  name,
  description,
  is_active
)
SELECT
  o.id,
  'Organization Admin',
  'Administrative role for managing an organization and its members.',
  true
FROM public.organization o
WHERE NOT EXISTS (
  SELECT 1
  FROM public.roles r
  WHERE r.organization_id = o.id
    AND lower(r.name) = lower('Organization Admin')
);


/* ========================================================
   3. Provision Member Role
======================================================== */

INSERT INTO public.roles (
  organization_id,
  name,
  description,
  is_active
)
SELECT
  o.id,
  'Member',
  'Standard organization member role.',
  true
FROM public.organization o
WHERE NOT EXISTS (
  SELECT 1
  FROM public.roles r
  WHERE r.organization_id = o.id
    AND lower(r.name) = lower('Member')
);


/* ========================================================
   4. Organization Admin Permissions
----------------------------------------------------------
Organization Admin receives the current organization
administration permission catalog.

We intentionally assign only permissions that currently
exist in the platform permission catalog.

Future permissions should be added through future
migrations rather than hardcoded into application logic.
======================================================== */

INSERT INTO public.role_permissions (
  role_id,
  permission_id
)
SELECT
  r.id,
  p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE lower(r.name) = lower('Organization Admin')
  AND p.key IN (
    'users.view',
    'users.create',
    'users.edit',
    'users.deactivate',
    'departments.view',
    'departments.manage',
    'teams.view',
    'teams.manage',
    'performance_sheets.view',
    'performance_sheets.manage'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );


/* ========================================================
   5. Member Permissions
----------------------------------------------------------
Members receive read-oriented permissions only.

They do NOT receive:

- users.create
- users.edit
- users.deactivate
- departments.manage
- teams.manage
- performance_sheets.manage
======================================================== */

INSERT INTO public.role_permissions (
  role_id,
  permission_id
)
SELECT
  r.id,
  p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE lower(r.name) = lower('Member')
  AND p.key IN (
    'users.view',
    'departments.view',
    'teams.view',
    'performance_sheets.view'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );


COMMIT;