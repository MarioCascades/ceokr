
/*
==========================================================
CascadEffects Performance Platform
Custom Tables Permissions
----------------------------------------------------------
Adds organization-scoped capabilities for Custom Tables.

Permissions:
- custom_tables.view
- custom_tables.manage
- custom_tables.rows.edit

Organization Admin receives all three permissions.
Member receives view and row-edit permissions so authorized
members can maintain operational rows without changing
Custom Table definitions or enablement.

This migration does NOT implement RLS or replace the
application authorization boundary. Server-side services
must validate organization membership, permission, and
resource ownership before reads or writes.
==========================================================
*/

BEGIN;

/* ========================================================
   1. Add Custom Tables Permission Definitions
======================================================== */

INSERT INTO public.permissions (
  key,
  name,
  description
)
VALUES
  (
    'custom_tables.view',
    'View Custom Tables',
    'View enabled Custom Tables and their organization-scoped operational data.'
  ),
  (
    'custom_tables.manage',
    'Manage Custom Tables',
    'Create and configure organization Custom Tables, manage their columns, and enable or disable their Runtime availability.'
  ),
  (
    'custom_tables.rows.edit',
    'Edit Custom Table Rows',
    'Add, edit, hide, restore, reorder, and update the status of rows in organization Custom Tables.'
  )
ON CONFLICT (key)
DO NOTHING;

/* ========================================================
   2. Grant All Custom Tables Permissions to Organization Admin
======================================================== */

INSERT INTO public.role_permissions (
  role_id,
  permission_id
)
SELECT
  r.id,
  p.id
FROM public.roles r
JOIN public.permissions p
  ON p.key IN (
    'custom_tables.view',
    'custom_tables.manage',
    'custom_tables.rows.edit'
  )
WHERE lower(r.name) = lower('Organization Admin')
  AND NOT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );

/* ========================================================
   3. Grant View and Row Editing to Members
----------------------------------------------------------
Members can maintain operational rows but cannot manage
Custom Table definitions, column configuration, or the
is_enabled setting.
======================================================== */

INSERT INTO public.role_permissions (
  role_id,
  permission_id
)
SELECT
  r.id,
  p.id
FROM public.roles r
JOIN public.permissions p
  ON p.key IN (
    'custom_tables.view',
    'custom_tables.rows.edit'
  )
WHERE lower(r.name) = lower('Member')
  AND NOT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );

COMMIT;
