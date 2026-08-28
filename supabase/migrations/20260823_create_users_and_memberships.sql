/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Users & Organization Memberships
 * ----------------------------------------------------------
 * Phase 1:
 *
 * Supabase Auth
 *      ↓
 * public.users
 *      ↓
 * organization_memberships
 *
 * Authentication remains owned by Supabase Auth.
 * Application profile and organization membership are owned
 * by the CascadEffects public schema.
 * ==========================================================
 */


-- ==========================================================
-- Application Users
-- ==========================================================

CREATE TABLE public.users (
  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  auth_user_id uuid NOT NULL,

  first_name text NOT NULL,

  last_name text NOT NULL,

  display_name text NULL,

  email text NOT NULL,

  is_active boolean NOT NULL
    DEFAULT true,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT users_auth_user_id_unique
    UNIQUE (auth_user_id),

  CONSTRAINT users_auth_user_id_fkey
    FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id)
    ON DELETE RESTRICT
);


-- ==========================================================
-- Organization Memberships
-- ==========================================================

CREATE TABLE public.organization_memberships (
  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,

  organization_id uuid NOT NULL,

  department_id uuid NULL,

  team_id uuid NULL,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT organization_memberships_user_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE RESTRICT,

  CONSTRAINT organization_memberships_organization_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organization(id)
    ON DELETE RESTRICT,

  CONSTRAINT organization_memberships_department_fkey
    FOREIGN KEY (department_id)
    REFERENCES public.departments(id)
    ON DELETE RESTRICT,

  CONSTRAINT organization_memberships_team_fkey
    FOREIGN KEY (team_id)
    REFERENCES public.teams(id)
    ON DELETE RESTRICT,

  CONSTRAINT organization_memberships_user_organization_unique
    UNIQUE (
      user_id,
      organization_id
    )
);


-- ==========================================================
-- Indexes
-- ==========================================================

CREATE INDEX organization_memberships_user_id_idx
  ON public.organization_memberships (
    user_id
  );

CREATE INDEX organization_memberships_organization_id_idx
  ON public.organization_memberships (
    organization_id
  );

CREATE INDEX organization_memberships_department_id_idx
  ON public.organization_memberships (
    department_id
  );

CREATE INDEX organization_memberships_team_id_idx
  ON public.organization_memberships (
    team_id
  );

CREATE INDEX organization_memberships_organization_department_idx
  ON public.organization_memberships (
    organization_id,
    department_id
  );

CREATE INDEX organization_memberships_organization_team_idx
  ON public.organization_memberships (
    organization_id,
    team_id
  );