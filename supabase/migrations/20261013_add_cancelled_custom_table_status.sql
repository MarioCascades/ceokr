
/*
============================================================
CascadEffects Performance Platform

Migration: Add Cancelled Custom Table Status

Purpose:
1. Allow cancelled when creating Custom Table rows.
2. Allow cancelled when updating Custom Table rows.
3. Preserve existing atomic locking, row ordering,
   visibility handling, and validation behavior.

This is a forward migration.
Do not rerun the original atomic or foundation migration.
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
           'completed',
           'cancelled'
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
           'completed',
           'cancelled'
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
            row_data = COALESCE(
                p_row_data,
                row_record.row_data
            ),
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
         * Normalize the section the row left.
         * The monthly lock serializes this with other
         * compliant row mutations.
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
            row_data = COALESCE(
                p_row_data,
                row_record.row_data
            ),
            operational_status = COALESCE(
                p_operational_status,
                row_record.operational_status
            ),
            position = COALESCE(
                p_position,
                row_record.position
            ),
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

COMMIT;
