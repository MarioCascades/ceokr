/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Teams
 * ----------------------------------------------------------
 * Creates the Team persistence model.
 *
 * Hierarchy:
 *
 * Organization
 *      ↓
 * Department
 *      ↓
 * Team
 * ==========================================================
 */

-- ==========================================================
-- Ensure Departments can participate in the composite
-- organization/department integrity relationship.
--
-- departments.id is already the primary key, but PostgreSQL
-- requires the exact referenced column combination to have
-- a UNIQUE or PRIMARY KEY constraint for a composite FK.
-- ==========================================================

ALTER TABLE public.departments
ADD CONSTRAINT departments_id_organization_id_unique
UNIQUE (id, organization_id);


-- ==========================================================
-- Teams
-- ==========================================================

CREATE TABLE public.teams (
  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL,

  department_id uuid NOT NULL,

  name text NOT NULL,

  description text NULL,

  is_active boolean NOT NULL
    DEFAULT true,

  created_at timestamptz NULL
    DEFAULT now(),

  updated_at timestamptz NULL
    DEFAULT now(),

  CONSTRAINT teams_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organization(id)
    ON DELETE RESTRICT,

  CONSTRAINT teams_department_organization_fkey
    FOREIGN KEY (
      department_id,
      organization_id
    )
    REFERENCES public.departments (
      id,
      organization_id
    )
    ON DELETE RESTRICT,

  CONSTRAINT teams_organization_department_name_unique
    UNIQUE (
      organization_id,
      department_id,
      name
    )
);


-- ==========================================================
-- Indexes
-- ==========================================================

CREATE INDEX teams_organization_id_idx
  ON public.teams (
    organization_id
  );

CREATE INDEX teams_department_id_idx
  ON public.teams (
    department_id
  );

CREATE INDEX teams_organization_department_idx
  ON public.teams (
    organization_id,
    department_id
  );