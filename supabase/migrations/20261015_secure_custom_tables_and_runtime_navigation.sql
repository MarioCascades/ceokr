
/*
============================================================
CascadEffects Performance Platform
Custom Tables and Runtime Navigation Security
------------------------------------------------------------
Migration: 20261015

Purpose:
1. Remove direct table privileges from anon and
   authenticated on Custom Tables and Runtime Navigation.
2. Enable Row Level Security on the protected tables.
3. Preserve server-side repository access through
   service_role.
4. Restrict Custom Table atomic RPC execution to
   service_role.
5. Preserve existing data, schemas, and operational behavior.

Security model:
- Authorization remains enforced by the server-side
  application service layer.
- Resource ownership must be checked before privileged
  repository operations.
- Client roles receive no direct table access.
- No permissive client RLS policies are introduced.

This migration does not modify operational records,
navigation ordering, persistence modes, or month history.
============================================================
*/

BEGIN;

-- ============================================================
-- 1. Secure existing Custom Tables and Runtime Navigation
-- ============================================================

DO $migration$
DECLARE
    v_table_name text;
    v_table_names text[] := ARRAY[
        'custom_table_definitions',
        'custom_table_columns',
        'custom_table_months',
        'custom_table_rows',
        'custom_table_operational_rows',
        'runtime_navigation_tabs'
    ];
    v_table regclass;
BEGIN
    FOREACH v_table_name IN ARRAY v_table_names
    LOOP
        v_table := pg_catalog.to_regclass(
            'public.' || v_table_name
        );

        -- Some migrations may not have been applied yet.
        -- Skip absent tables without failing this migration.
        IF v_table IS NULL THEN
            RAISE NOTICE
                'Skipping absent table: public.%',
                v_table_name;
            CONTINUE;
        END IF;

        -- Remove direct client-role access, including
        -- SELECT, INSERT, UPDATE, DELETE, TRUNCATE,
        -- REFERENCES, and TRIGGER privileges.
        EXECUTE pg_catalog.format(
            'REVOKE ALL PRIVILEGES ON TABLE %s
             FROM PUBLIC, anon, authenticated',
            v_table
        );

        -- Direct client access is intentionally not used.
        -- The server-side repository uses service_role.
        EXECUTE pg_catalog.format(
            'ALTER TABLE %s ENABLE ROW LEVEL SECURITY',
            v_table
        );

        -- Preserve privileged server-side CRUD operations.
        EXECUTE pg_catalog.format(
            'GRANT SELECT, INSERT, UPDATE, DELETE
             ON TABLE %s TO service_role',
            v_table
        );

        RAISE NOTICE
            'Secured table: public.%',
            v_table_name;
    END LOOP;
END;
$migration$;


-- ============================================================
-- 2. Restrict Custom Table Atomic RPC Functions
-- ============================================================

DO $migration$
DECLARE
    v_function record;
BEGIN
    /*
     * Restrict only the Custom Table atomic functions.
     * Function signatures are obtained from the database
     * catalog so overloaded functions are handled correctly.
     *
     * Functions execute with the invoking role's privileges.
     * The application service must still validate permissions
     * and resource ownership before calling these RPCs.
     */

    FOR v_function IN
        SELECT
            namespace.nspname AS schema_name,
            procedure.proname AS function_name,
            pg_catalog.pg_get_function_identity_arguments(
                procedure.oid
            ) AS identity_arguments
        FROM pg_catalog.pg_proc AS procedure
        JOIN pg_catalog.pg_namespace AS namespace
            ON namespace.oid = procedure.pronamespace
        WHERE namespace.nspname = 'public'
          AND procedure.prokind = 'f'
          AND procedure.proname IN (
              'create_custom_table_row_atomic',
              'update_custom_table_row_atomic',
              'delete_custom_table_row_atomic',
              'save_custom_table_row_order_atomic',
              'copy_forward_custom_table_month_atomic',
              'create_custom_table_operational_row_atomic',
              'update_custom_table_operational_row_atomic',
              'delete_custom_table_operational_row_atomic',
              'save_custom_table_operational_row_order_atomic'
          )
    LOOP
        EXECUTE pg_catalog.format(
            'REVOKE EXECUTE ON FUNCTION %I.%I(%s)
             FROM PUBLIC, anon, authenticated',
            v_function.schema_name,
            v_function.function_name,
            v_function.identity_arguments
        );

        EXECUTE pg_catalog.format(
            'GRANT EXECUTE ON FUNCTION %I.%I(%s)
             TO service_role',
            v_function.schema_name,
            v_function.function_name,
            v_function.identity_arguments
        );

        RAISE NOTICE
            'Restricted RPC: %.%(%)',
            v_function.schema_name,
            v_function.function_name,
            v_function.identity_arguments;
    END LOOP;
END;
$migration$;


COMMIT;
