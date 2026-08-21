/*
==========================================================
CascadEffects Performance Platform
Roles & Permissions Foundation
----------------------------------------------------------
Creates the database foundation for:

- Permissions
- Organization-scoped Roles
- Role Permissions
- Membership Roles

This migration intentionally does NOT implement:

- Authorization enforcement
- RLS policies
- Role administration UI
- Role assignment UI
- Automatic organization role provisioning

Those are later milestones.
==========================================================
*/

BEGIN;


/* ========================================================
   1. Organization Membership Composite Key
----------------------------------------------------------
The composite key must exist before membership_roles is
created because membership_roles will reference it.
======================================================== */

ALTER TABLE public.organization_memberships
  ADD CONSTRAINT organization_memberships_id_organization_unique
  UNIQUE (
    id,
    organization_id
  );


/* ========================================================
   2. Permissions
======================================================== */

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  key text NOT NULL,

  name text NOT NULL,

  description text,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT permissions_key_unique
    UNIQUE (key)
);


/* ========================================================
   3. Roles
======================================================== */

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL,

  name text NOT NULL,

  description text,

  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),

  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT roles_organization_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organization(id)
    ON DELETE CASCADE,

  CONSTRAINT roles_organization_name_unique
    UNIQUE (
      organization_id,
      name
    ),

  CONSTRAINT roles_id_organization_unique
    UNIQUE (
      id,
      organization_id
    )
);


/* ========================================================
   4. Role Permissions
======================================================== */

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  role_id uuid NOT NULL,

  permission_id uuid NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT role_permissions_role_fkey
    FOREIGN KEY (role_id)
    REFERENCES public.roles(id)
    ON DELETE CASCADE,

  CONSTRAINT role_permissions_permission_fkey
    FOREIGN KEY (permission_id)
    REFERENCES public.permissions(id)
    ON DELETE CASCADE,

  CONSTRAINT role_permissions_role_permission_unique
    UNIQUE (
      role_id,
      permission_id
    )
);


/* ========================================================
   5. Membership Roles
======================================================== */

CREATE TABLE IF NOT EXISTS public.membership_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_membership_id uuid NOT NULL,

  role_id uuid NOT NULL,

  organization_id uuid NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT membership_roles_membership_fkey
    FOREIGN KEY (
      organization_membership_id
    )
    REFERENCES public.organization_memberships(id)
    ON DELETE CASCADE,

  CONSTRAINT membership_roles_role_fkey
    FOREIGN KEY (role_id)
    REFERENCES public.roles(id)
    ON DELETE CASCADE,

  CONSTRAINT membership_roles_membership_organization_fkey
    FOREIGN KEY (
      organization_membership_id,
      organization_id
    )
    REFERENCES public.organization_memberships (
      id,
      organization_id
    )
    ON DELETE CASCADE,

  CONSTRAINT membership_roles_role_organization_fkey
    FOREIGN KEY (
      role_id,
      organization_id
    )
    REFERENCES public.roles (
      id,
      organization_id
    )
    ON DELETE CASCADE,

  CONSTRAINT membership_roles_membership_role_unique
    UNIQUE (
      organization_membership_id,
      role_id,
      organization_id
    )
);


/* ========================================================
   6. Indexes
======================================================== */

CREATE INDEX IF NOT EXISTS
  roles_organization_id_idx
ON public.roles (
  organization_id
);


CREATE INDEX IF NOT EXISTS
  roles_organization_active_idx
ON public.roles (
  organization_id,
  is_active
);


CREATE INDEX IF NOT EXISTS
  role_permissions_role_id_idx
ON public.role_permissions (
  role_id
);


CREATE INDEX IF NOT EXISTS
  role_permissions_permission_id_idx
ON public.role_permissions (
  permission_id
);


CREATE INDEX IF NOT EXISTS
  membership_roles_membership_id_idx
ON public.membership_roles (
  organization_membership_id
);


CREATE INDEX IF NOT EXISTS
  membership_roles_role_id_idx
ON public.membership_roles (
  role_id
);


CREATE INDEX IF NOT EXISTS
  membership_roles_organization_id_idx
ON public.membership_roles (
  organization_id
);


/* ========================================================
   7. Seed Platform Permission Catalog
----------------------------------------------------------
Permissions are global reusable definitions.

These are capability definitions, not organization roles.
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


COMMIT;