/*
============================================================
CascadEffects Performance Platform
Atomic Custom Table Operations
------------------------------------------------------------
Migration: 20261013

Purpose:
1. Make monthly carry-forward atomic and idempotent.
2. Serialize all supported row mutations through the
   monthly record lock.
3. Make active and hidden row reordering atomic.
4. Preserve monthly uniqueness and historical records.

Security:
- Functions execute with the invoking role's privileges.
- Execution is restricted to service_role.
- Application service authorization and ownership checks
  remain mandatory before privileged RPC calls.
- These functions do not replace RLS policies.

IMPORTANT:
All row mutations must use these functions for the shared
locking protocol to be effective.
============================================================
*/

BEGIN;

/* ==========================================================
   1. Create an Operational Row Atomically
========================================================== */

CREATE OR REPLACE FUNCTION public.create_custom_table_row_atomic(
    p_organization_id uuid,
    p_table_month_id uuid,
    p_row_data jsonb,
    p_operational_status text,
    p_is_hidden boolean
)
RETURNS SETOF public.custom_table_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_month public.custom_table_months%ROWTYPE;
    v_position integer;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_month_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and Custom Table month are required.';
    END IF;

    IF p_row_data IS NULL
       OR pg_catalog.jsonb_typeof(p_row_data) <> 'object' THEN
        RAISE EXCEPTION 'Row data must be a JSON object.';
    END IF;

    IF p_operational_status IS NULL
       OR p_operational_status NOT IN (
           'in_progress',
           'on_hold',
           'completed'
       ) THEN
        RAISE EXCEPTION 'Invalid operational status.';
    END IF;

    IF p_is_hidden IS NULL THEN
        RAISE EXCEPTION 'Row visibility must be specified.';
    END IF;

    SELECT month_record.*
    INTO v_month
    FROM public.custom_table_months AS month_record
    WHERE month_record.id = p_table_month_id
      AND month_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table month was not found for this organization.';
    END IF;

    IF v_month.is_finalized THEN
        RAISE EXCEPTION
            'Cannot add rows to a finalized Custom Table month.';
    END IF;

    SELECT COALESCE(MAX(row_record.position) + 1, 0)
    INTO v_position
    FROM public.custom_table_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
      AND row_record.is_hidden = p_is_hidden;

    RETURN QUERY
    INSERT INTO public.custom_table_rows (
        organization_id,
        table_month_id,
        row_data,
        operational_status,
        is_hidden,
        position
    )
    VALUES (
        p_organization_id,
        p_table_month_id,
        p_row_data,
        p_operational_status,
        p_is_hidden,
        v_position
    )
    RETURNING *;
END;
$function$;


/* ==========================================================
   2. Update an Operational Row Atomically

   NULL means preserve the corresponding existing value.
   Visibility changes append the row to the destination
   section and normalize the old section's ordering.
========================================================== */

CREATE OR REPLACE FUNCTION public.update_custom_table_row_atomic(
    p_organization_id uuid,
    p_table_month_id uuid,
    p_row_id uuid,
    p_row_data jsonb,
    p_operational_status text,
    p_is_hidden boolean,
    p_position integer
)
RETURNS SETOF public.custom_table_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_month public.custom_table_months%ROWTYPE;
    v_row public.custom_table_rows%ROWTYPE;
    v_new_position integer;
    v_visibility_changed boolean;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_month_id IS NULL
       OR p_row_id IS NULL THEN
        RAISE EXCEPTION
            'Organization, month, and row are required.';
    END IF;

    IF p_row_data IS NOT NULL
       AND pg_catalog.jsonb_typeof(p_row_data) <> 'object' THEN
        RAISE EXCEPTION 'Row data must be a JSON object.';
    END IF;

    IF p_operational_status IS NOT NULL
       AND p_operational_status NOT IN (
           'in_progress',
           'on_hold',
           'completed'
       ) THEN
        RAISE EXCEPTION 'Invalid operational status.';
    END IF;

    IF p_position IS NOT NULL AND p_position < 0 THEN
        RAISE EXCEPTION 'Row position cannot be negative.';
    END IF;

    SELECT month_record.*
    INTO v_month
    FROM public.custom_table_months AS month_record
    WHERE month_record.id = p_table_month_id
      AND month_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table month was not found for this organization.';
    END IF;

    IF v_month.is_finalized THEN
        RAISE EXCEPTION
            'Cannot edit rows in a finalized Custom Table month.';
    END IF;

    SELECT row_record.*
    INTO v_row
    FROM public.custom_table_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table row was not found in this month.';
    END IF;

    v_visibility_changed :=
        p_is_hidden IS NOT NULL
        AND p_is_hidden <> v_row.is_hidden;

    IF v_visibility_changed THEN
        SELECT COALESCE(MAX(row_record.position) + 1, 0)
        INTO v_new_position
        FROM public.custom_table_rows AS row_record
        WHERE row_record.organization_id = p_organization_id
          AND row_record.table_month_id = p_table_month_id
          AND row_record.is_hidden = p_is_hidden;

        UPDATE public.custom_table_rows AS row_record
        SET
            row_data = COALESCE(p_row_data, row_record.row_data),
            operational_status = COALESCE(
                p_operational_status,
                row_record.operational_status
            ),
            is_hidden = p_is_hidden,
            position = v_new_position,
            updated_at = pg_catalog.now()
        WHERE row_record.id = p_row_id
          AND row_record.organization_id = p_organization_id
          AND row_record.table_month_id = p_table_month_id;

        /*
         * Normalize the section the row left. The monthly lock
         * serializes this with other compliant row mutations.
         */
        WITH ordered_rows AS (
            SELECT
                row_record.id,
                (
                    pg_catalog.row_number() OVER (
                        ORDER BY
                            row_record.position,
                            row_record.created_at,
                            row_record.id
                    ) - 1
                )::integer AS new_position
            FROM public.custom_table_rows AS row_record
            WHERE row_record.organization_id = p_organization_id
              AND row_record.table_month_id = p_table_month_id
              AND row_record.is_hidden = v_row.is_hidden
        )
        UPDATE public.custom_table_rows AS row_record
        SET
            position = ordered_rows.new_position,
            updated_at = pg_catalog.now()
        FROM ordered_rows
        WHERE row_record.id = ordered_rows.id
          AND row_record.position <> ordered_rows.new_position;
    ELSE
        UPDATE public.custom_table_rows AS row_record
        SET
            row_data = COALESCE(p_row_data, row_record.row_data),
            operational_status = COALESCE(
                p_operational_status,
                row_record.operational_status
            ),
            position = COALESCE(p_position, row_record.position),
            updated_at = pg_catalog.now()
        WHERE row_record.id = p_row_id
          AND row_record.organization_id = p_organization_id
          AND row_record.table_month_id = p_table_month_id;
    END IF;

    RETURN QUERY
    SELECT row_record.*
    FROM public.custom_table_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id;
END;
$function$;


/* ==========================================================
   3. Delete an Operational Row Atomically

   Available for explicitly authorized destructive workflows.
   Ordinary operational removal should use hiding instead.
========================================================== */

CREATE OR REPLACE FUNCTION public.delete_custom_table_row_atomic(
    p_organization_id uuid,
    p_table_month_id uuid,
    p_row_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_month public.custom_table_months%ROWTYPE;
    v_deleted_id uuid;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_month_id IS NULL
       OR p_row_id IS NULL THEN
        RAISE EXCEPTION
            'Organization, month, and row are required.';
    END IF;

    SELECT month_record.*
    INTO v_month
    FROM public.custom_table_months AS month_record
    WHERE month_record.id = p_table_month_id
      AND month_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table month was not found for this organization.';
    END IF;

    IF v_month.is_finalized THEN
        RAISE EXCEPTION
            'Cannot delete rows from a finalized Custom Table month.';
    END IF;

    DELETE FROM public.custom_table_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
    RETURNING row_record.id INTO v_deleted_id;

    IF v_deleted_id IS NULL THEN
        RAISE EXCEPTION
            'Custom Table row was not found in this month.';
    END IF;

    RETURN true;
END;
$function$;


/* ==========================================================
   4. Atomically Reorder Active or Hidden Rows

   The submitted list must contain every row in the selected
   section exactly once.
========================================================== */

CREATE OR REPLACE FUNCTION public.save_custom_table_row_order_atomic(
    p_organization_id uuid,
    p_table_month_id uuid,
    p_row_ids uuid[],
    p_is_hidden boolean
)
RETURNS SETOF public.custom_table_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_month public.custom_table_months%ROWTYPE;
    v_expected_count bigint;
    v_submitted_count bigint;
    v_updated_count bigint;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_month_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and Custom Table month are required.';
    END IF;

    IF p_is_hidden IS NULL OR p_row_ids IS NULL THEN
        RAISE EXCEPTION
            'Visibility section and row ordering are required.';
    END IF;

    IF pg_catalog.array_position(p_row_ids, NULL::uuid) IS NOT NULL THEN
        RAISE EXCEPTION
            'Row ordering cannot contain null row IDs.';
    END IF;

    SELECT COUNT(DISTINCT submitted.row_id)
    INTO v_submitted_count
    FROM pg_catalog.unnest(p_row_ids) AS submitted(row_id);

    IF v_submitted_count <> pg_catalog.cardinality(p_row_ids) THEN
        RAISE EXCEPTION
            'Row ordering contains duplicate row IDs.';
    END IF;

    SELECT month_record.*
    INTO v_month
    FROM public.custom_table_months AS month_record
    WHERE month_record.id = p_table_month_id
      AND month_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table month was not found for this organization.';
    END IF;

    IF v_month.is_finalized THEN
        RAISE EXCEPTION
            'Cannot reorder rows in a finalized Custom Table month.';
    END IF;

    PERFORM row_record.id
    FROM public.custom_table_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
      AND row_record.is_hidden = p_is_hidden
    FOR UPDATE;

    SELECT COUNT(*)
    INTO v_expected_count
    FROM public.custom_table_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
      AND row_record.is_hidden = p_is_hidden;

    IF v_expected_count <> pg_catalog.cardinality(p_row_ids) THEN
        RAISE EXCEPTION
            'Row ordering must include every row in the selected section.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_catalog.unnest(p_row_ids) AS submitted(row_id)
        LEFT JOIN public.custom_table_rows AS row_record
          ON row_record.id = submitted.row_id
         AND row_record.organization_id = p_organization_id
         AND row_record.table_month_id = p_table_month_id
         AND row_record.is_hidden = p_is_hidden
        WHERE row_record.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Row ordering contains a row outside the selected section.';
    END IF;

    WITH requested_order AS (
        SELECT
            submitted.row_id,
            (submitted.ordinality - 1)::integer AS new_position
        FROM pg_catalog.unnest(p_row_ids)
            WITH ORDINALITY AS submitted(row_id, ordinality)
    )
    UPDATE public.custom_table_rows AS row_record
    SET
        position = requested_order.new_position,
        updated_at = pg_catalog.now()
    FROM requested_order
    WHERE row_record.id = requested_order.row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
      AND row_record.is_hidden = p_is_hidden;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    IF v_updated_count <> v_expected_count THEN
        RAISE EXCEPTION
            'The complete row ordering could not be persisted.';
    END IF;

    RETURN QUERY
    SELECT row_record.*
    FROM public.custom_table_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_month_id = p_table_month_id
    ORDER BY
        row_record.is_hidden ASC,
        row_record.position ASC,
        row_record.created_at ASC,
        row_record.id ASC;
END;
$function$;


/* ==========================================================
   5. Atomic Monthly Carry-Forward

   The source month lock serializes this operation with other
   operations that use the same monthly-locking protocol.

   If the target month already exists, it is returned unchanged.
========================================================== */

CREATE OR REPLACE FUNCTION public.copy_forward_custom_table_month_atomic(
    p_organization_id uuid,
    p_table_definition_id uuid,
    p_source_month_id uuid,
    p_target_performance_month date,
    p_columns_snapshot jsonb
)
RETURNS TABLE (
    month_id uuid,
    created boolean
)
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_source_month public.custom_table_months%ROWTYPE;
    v_target_month_id uuid;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_definition_id IS NULL
       OR p_source_month_id IS NULL THEN
        RAISE EXCEPTION
            'Organization, table definition, and source month are required.';
    END IF;

    IF p_target_performance_month IS NULL
       OR p_target_performance_month <>
          pg_catalog.date_trunc(
              'month',
              p_target_performance_month
          )::date THEN
        RAISE EXCEPTION
            'Target month must be the first day of a calendar month.';
    END IF;

    IF p_columns_snapshot IS NULL
       OR pg_catalog.jsonb_typeof(p_columns_snapshot) <> 'array' THEN
        RAISE EXCEPTION
            'Column snapshot must be a JSON array.';
    END IF;

    SELECT source_month.*
    INTO v_source_month
    FROM public.custom_table_months AS source_month
    WHERE source_month.id = p_source_month_id
      AND source_month.organization_id = p_organization_id
      AND source_month.table_definition_id = p_table_definition_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Source month was not found for this organization and table.';
    END IF;

    IF v_source_month.is_finalized THEN
        RAISE EXCEPTION
            'Cannot carry forward from a finalized Custom Table month.';
    END IF;

    IF p_target_performance_month <= v_source_month.performance_month THEN
        RAISE EXCEPTION
            'Target month must be later than the source month.';
    END IF;

    INSERT INTO public.custom_table_months (
        organization_id,
        table_definition_id,
        performance_month,
        columns_snapshot,
        is_finalized
    )
    VALUES (
        p_organization_id,
        p_table_definition_id,
        p_target_performance_month,
        p_columns_snapshot,
        false
    )
    ON CONFLICT (
        table_definition_id,
        performance_month
    )
    DO NOTHING
    RETURNING id INTO v_target_month_id;

    IF v_target_month_id IS NULL THEN
        SELECT target_month.id
        INTO v_target_month_id
        FROM public.custom_table_months AS target_month
        WHERE target_month.organization_id = p_organization_id
          AND target_month.table_definition_id = p_table_definition_id
          AND target_month.performance_month = p_target_performance_month;

        IF v_target_month_id IS NULL THEN
            RAISE EXCEPTION
                'Target month could not be created or retrieved.';
        END IF;

        RETURN QUERY SELECT v_target_month_id, false;
        RETURN;
    END IF;

    /*
     * Because row-writing operations must acquire the source
     * month lock first, eligible rows cannot be concurrently
     * changed by another compliant writer during this snapshot.
     */
    INSERT INTO public.custom_table_rows (
        organization_id,
        table_month_id,
        row_data,
        operational_status,
        is_hidden,
        position
    )
    SELECT
        p_organization_id,
        v_target_month_id,
        source_row.row_data,
        source_row.operational_status,
        false,
        (
            pg_catalog.row_number() OVER (
                ORDER BY
                    source_row.position ASC,
                    source_row.created_at ASC,
                    source_row.id ASC
            ) - 1
        )::integer
    FROM public.custom_table_rows AS source_row
    WHERE source_row.organization_id = p_organization_id
      AND source_row.table_month_id = p_source_month_id
      AND source_row.is_hidden = false
      AND source_row.operational_status <> 'completed';

    RETURN QUERY SELECT v_target_month_id, true;
END;
$function$;


/* ==========================================================
   6. Restrict RPC Execution to service_role
========================================================== */

REVOKE ALL ON FUNCTION
    public.create_custom_table_row_atomic(
        uuid, uuid, jsonb, text, boolean
    )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.create_custom_table_row_atomic(
        uuid, uuid, jsonb, text, boolean
    )
TO service_role;


REVOKE ALL ON FUNCTION
    public.update_custom_table_row_atomic(
        uuid, uuid, uuid, jsonb, text, boolean, integer
    )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.update_custom_table_row_atomic(
        uuid, uuid, uuid, jsonb, text, boolean, integer
    )
TO service_role;


REVOKE ALL ON FUNCTION
    public.delete_custom_table_row_atomic(
        uuid, uuid, uuid
    )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.delete_custom_table_row_atomic(
        uuid, uuid, uuid
    )
TO service_role;


REVOKE ALL ON FUNCTION
    public.save_custom_table_row_order_atomic(
        uuid, uuid, uuid[], boolean
    )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.save_custom_table_row_order_atomic(
        uuid, uuid, uuid[], boolean
    )
TO service_role;


REVOKE ALL ON FUNCTION
    public.copy_forward_custom_table_month_atomic(
        uuid, uuid, uuid, date, jsonb
    )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.copy_forward_custom_table_month_atomic(
        uuid, uuid, uuid, date, jsonb
    )
TO service_role;

COMMIT;