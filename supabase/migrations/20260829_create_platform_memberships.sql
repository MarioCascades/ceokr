/*
==========================================================
CascadEffects Performance Platform
Platform Memberships
----------------------------------------------------------
Creates the platform-level administrative layer.

Hierarchy:

CascadEffects Platform
        ↓
Platform Membership
        ↓
Super Admin
        ↓
Organizations
        ↓
Organization Membership
        ↓
Organization Roles

Platform Super Admins are NOT organization roles.

A Super Admin can administer organizations without
requiring an organization membership in each organization.

This migration intentionally does NOT implement:

- RLS policies
- Authorization functions
- Platform administration UI
- Super Admin assignment UI

Those are separate implementation steps.
==========================================================
*/

BEGIN;


/* ========================================================
   1. Platform Memberships
======================================================== */

CREATE TABLE IF NOT EXISTS public.platform_memberships (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,

  platform_role text NOT NULL
    DEFAULT 'super_admin',

  is_active boolean NOT NULL
    DEFAULT true,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT platform_memberships_user_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE RESTRICT,

  CONSTRAINT platform_memberships_role_check
    CHECK (
      platform_role = 'super_admin'
    ),

  CONSTRAINT platform_memberships_user_role_unique
    UNIQUE (
      user_id,
      platform_role
    )
);


/* ========================================================
   2. Indexes
======================================================== */

CREATE INDEX IF NOT EXISTS
  platform_memberships_user_id_idx
ON public.platform_memberships (
  user_id
);

CREATE INDEX IF NOT EXISTS
  platform_memberships_active_idx
ON public.platform_memberships (
  is_active
);


/* ========================================================
   3. Documentation
----------------------------------------------------------
Platform memberships represent authority at the
CascadEffects platform level.

They are intentionally separate from:

public.organization_memberships

because a platform Super Admin does not need to belong
to every organization in order to administer it.
======================================================== */


COMMIT;