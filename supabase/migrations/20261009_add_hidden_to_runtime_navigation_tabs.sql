/*
============================================================
CascadEffects Performance Platform
Runtime Navigation Tabs
------------------------------------------------------------
Migration: 20261009

Purpose:

Add persistent visibility control to organization Runtime
navigation tabs.

This allows administrators to:

- Hide Runtime tabs
- Activate previously hidden Runtime tabs
- Maintain a separate hidden-tab list
- Preserve hidden state across browser refreshes

Operational Runtime tabs are not being implemented by this
migration.

The four operational placeholder records that were created
before their underlying features were built are removed:

- agenda
- va-list
- recruitment
- client-performance

They can be introduced later when their corresponding
operational features are actually implemented.

Existing Dashboard and Member Runtime navigation records
remain intact.

============================================================
*/

BEGIN;


ALTER TABLE public.runtime_navigation_tabs

  ADD COLUMN IF NOT EXISTS
    is_hidden boolean NOT NULL
    DEFAULT false;


CREATE INDEX IF NOT EXISTS
  idx_runtime_navigation_tabs_organization_hidden

ON public.runtime_navigation_tabs (
  organization_id,
  is_hidden,
  position
);


DELETE FROM public.runtime_navigation_tabs

WHERE tab_key IN (
  'agenda',
  'va-list',
  'recruitment',
  'client-performance'
);


COMMIT;