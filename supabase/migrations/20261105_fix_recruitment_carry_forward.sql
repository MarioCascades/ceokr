-- Recruitment Updates carry-forward correction.
-- Copies every source listing (including hidden rows and every workflow status).
-- Existing destination months are reusable only when they contain no rows.
-- A destination containing any rows is protected from overwrite or duplication.

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
    v_target_created boolean := false;
    v_existing_row_count bigint := 0;
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

    IF v_target_month_id IS NOT NULL THEN
        v_target_created := true;
    ELSE
        SELECT target_month.id
        INTO v_target_month_id
        FROM public.custom_table_months AS target_month
        WHERE target_month.organization_id = p_organization_id
          AND target_month.table_definition_id = p_table_definition_id
          AND target_month.performance_month = p_target_performance_month
        FOR UPDATE;

        IF v_target_month_id IS NULL THEN
            RAISE EXCEPTION
                'Target month could not be created or retrieved.';
        END IF;

        SELECT pg_catalog.count(*)
        INTO v_existing_row_count
        FROM public.custom_table_rows AS target_row
        WHERE target_row.organization_id = p_organization_id
          AND target_row.table_month_id = v_target_month_id;

        IF v_existing_row_count > 0 THEN
            RAISE EXCEPTION
                'The target month already contains listings. No records were changed.';
        END IF;
    END IF;

    /*
     * Copy the complete source screen state:
     * - visible and hidden listings
     * - all operational statuses, including completed and cancelled
     * - row data and source ordering
     *
     * The source month is never modified.
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
        source_row.is_hidden,
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
      AND source_row.table_month_id = p_source_month_id;

    RETURN QUERY SELECT v_target_month_id, v_target_created;
END;
$function$;

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
