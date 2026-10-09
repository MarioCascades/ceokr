/*
============================================================
CascadEffects Performance Platform
Runtime Navigation Tabs
------------------------------------------------------------
Migration: 20261009

Purpose:

Create the organization-owned Runtime navigation configuration
layer.

Runtime navigation controls the order of all Runtime tabs,
including:

- Dashboard
- Member Runtime tabs
- Operational Runtime tabs

Examples:

  dashboard
  member:<user-id>
  agenda
  va-list
  recruitment
  client-performance

Runtime navigation is intentionally separate from:

- Member OKRs
- Runtime execution
- Runtime scoring
- Custom Tables
- Performance history

The navigation table stores the organization's preferred
Runtime tab order and identity.

This migration does NOT implement:

- Runtime navigation administration UI
- Runtime navigation service logic
- Default tab provisioning
- RLS policies
- Authorization policies
- Custom Tables
- Operational tab data

Those are separate implementation layers.

Organization authorization remains application/repository
controlled at this stage, consistent with the current platform
architecture.
============================================================
*/

BEGIN;


/* ============================================================
   1. Runtime Navigation Tabs
============================================================ */

CREATE TABLE IF NOT EXISTS public.runtime_navigation_tabs (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL
    REFERENCES public.organization(id)
    ON DELETE CASCADE,

  /*
   * Stable Runtime navigation identifier.
   *
   * Examples:
   *
   * dashboard
   * member:<user-id>
   * agenda
   * va-list
   * recruitment
   * client-performance
   */
  tab_key text NOT NULL,

  /*
   * Determines how the Runtime tab is interpreted.
   */
  tab_type text NOT NULL,

  /*
   * Display label used by Runtime navigation.
   *
   * Member labels may be refreshed from the current
   * organization membership record when rendered.
   */
  label text NOT NULL,

  /*
   * Organization-defined Runtime navigation order.
   *
   * Lower values appear before higher values.
   */
  position integer NOT NULL
    DEFAULT 0,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT runtime_navigation_tabs_tab_key_not_blank
    CHECK (
      length(trim(tab_key)) > 0
    ),

  CONSTRAINT runtime_navigation_tabs_label_not_blank
    CHECK (
      length(trim(label)) > 0
    ),

  CONSTRAINT runtime_navigation_tabs_tab_type_valid
    CHECK (
      tab_type IN (
        'dashboard',
        'member',
        'operational'
      )
    ),

  CONSTRAINT runtime_navigation_tabs_position_valid
    CHECK (
      position >= 0
    ),

  CONSTRAINT runtime_navigation_tabs_organization_tab_unique
    UNIQUE (
      organization_id,
      tab_key
    )
);


/* ============================================================
   2. Organization Index
============================================================ */

CREATE INDEX IF NOT EXISTS
  idx_runtime_navigation_tabs_organization
ON public.runtime_navigation_tabs (
  organization_id
);


/* ============================================================
   3. Organization + Position Index
------------------------------------------------------------
Used by Runtime navigation when loading the organization's
configured tab order.
============================================================ */

CREATE INDEX IF NOT EXISTS
  idx_runtime_navigation_tabs_organization_position
ON public.runtime_navigation_tabs (
  organization_id,
  position
);


/* ============================================================
   4. Organization + Type Index
------------------------------------------------------------
Supports future filtering or administration of member and
operational Runtime tabs without changing the navigation model.
============================================================ */

CREATE INDEX IF NOT EXISTS
  idx_runtime_navigation_tabs_organization_type
ON public.runtime_navigation_tabs (
  organization_id,
  tab_type
);


/* ============================================================
   5. Documentation
------------------------------------------------------------

Runtime navigation ownership:

  Organization
       |
       v
  runtime_navigation_tabs
       |
       +-- Dashboard
       |
       +-- Member Runtime tabs
       |
       +-- Operational Runtime tabs


Source-of-truth boundaries:

  Member OKRs
      |
      +-- Member objectives
      +-- Member key results
      +-- Member initiatives

  Runtime
      |
      +-- Monthly execution
      +-- Historical performance snapshots

  Custom Tables / Operational Runtime
      |
      +-- Operational data

  Runtime Navigation
      |
      +-- Tab identity
      +-- Tab type
      +-- Tab label
      +-- Tab order


The navigation layer does not own performance data.

It only determines how Runtime tabs are organized and
presented for an organization.

No RLS policies are introduced by this migration.
No default navigation records are inserted here because
default and membership-dependent Runtime tabs are provisioned
by the application/service layer.
============================================================ */


COMMIT;