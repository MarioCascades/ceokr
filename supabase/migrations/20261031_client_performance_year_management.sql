
/*
============================================================
CascadEffects Performance Platform
Client Performance Year Management
------------------------------------------------------------
Migration: 20261031

Operations:
1. Add the next available performance year.
2. Hide or restore an existing performance year.

Safety:
- Organization/client ownership is validated.
- Client row is locked during year creation.
- All 12 monthly records are created in one transaction.
- Duplicate years are prevented.
- Existing monthly data is never overwritten.
- Hiding a year never deletes its data.
- Functions are executable only by service_role.

============================================================
*/

BEGIN;

/* ==========================================================
   1. Add Next Performance Year
========================================================== */

CREATE OR REPLACE FUNCTION
public.add_client_performance_year(
    p_organization_id uuid,
    p_client_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_client public.client_performance_clients%ROWTYPE;
    v_latest_year integer;
    v_new_year integer;
BEGIN

    IF p_organization_id IS NULL
       OR p_client_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and client are required.';
    END IF;

    /* Lock the client to prevent concurrent year creation. */

    SELECT client_record.*
    INTO v_client
    FROM public.client_performance_clients AS client_record
    WHERE client_record.id = p_client_id
      AND client_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Client Performance workspace was not found for this organization.';
    END IF;

    /* Determine the latest year across both records. */

    SELECT MAX(year_value)
    INTO v_latest_year
    FROM (
        SELECT performance_year AS year_value
        FROM public.client_performance_monthly_metrics
        WHERE client_id = p_client_id
          AND organization_id = p_organization_id

        UNION ALL

        SELECT performance_year AS year_value
        FROM public.client_performance_year_visibility
        WHERE client_id = p_client_id
          AND organization_id = p_organization_id
    ) AS existing_years;

    IF v_latest_year IS NULL THEN
        RAISE EXCEPTION
            'No initial performance year has been provisioned for this client.';
    END IF;

    v_new_year := v_latest_year + 1;

    /* Create all twelve blank monthly records. */

    INSERT INTO public.client_performance_monthly_metrics (
        client_id,
        organization_id,
        performance_year,
        performance_month,
        production,
        collection,
        starts,
        days_worked
    )
    SELECT
        p_client_id,
        p_organization_id,
        v_new_year,
        month_number,
        NULL,
        NULL,
        NULL,
        NULL
    FROM pg_catalog.generate_series(1, 12)
        AS month_number
    ON CONFLICT (
        client_id,
        performance_year,
        performance_month
    )
    DO NOTHING;

    /* Initialize the new year as visible. */

    INSERT INTO public.client_performance_year_visibility (
        client_id,
        organization_id,
        performance_year,
        is_hidden
    )
    VALUES (
        p_client_id,
        p_organization_id,
        v_new_year,
        false
    )
    ON CONFLICT (
        client_id,
        performance_year
    )
    DO NOTHING;

    RETURN v_new_year;

END;
$function$;


/* ==========================================================
   2. Set Performance Year Visibility
========================================================== */

CREATE OR REPLACE FUNCTION
public.set_client_performance_year_visibility(
    p_organization_id uuid,
    p_client_id uuid,
    p_performance_year integer,
    p_is_hidden boolean
)
RETURNS timestamptz
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_client public.client_performance_clients%ROWTYPE;
    v_updated_at timestamptz;
    v_month_count integer;
BEGIN

    IF p_organization_id IS NULL
       OR p_client_id IS NULL
       OR p_performance_year IS NULL
       OR p_is_hidden IS NULL THEN
        RAISE EXCEPTION
            'Organization, client, year, and visibility are required.';
    END IF;

    IF p_performance_year < 2000
       OR p_performance_year > 9999 THEN
        RAISE EXCEPTION
            'Performance year is outside the supported range.';
    END IF;

    /* Lock and validate client ownership. */

    SELECT client_record.*
    INTO v_client
    FROM public.client_performance_clients AS client_record
    WHERE client_record.id = p_client_id
      AND client_record.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Client Performance workspace was not found for this organization.';
    END IF;

    /* Only provisioned years can be hidden or restored. */

    SELECT COUNT(*)
    INTO v_month_count
    FROM public.client_performance_monthly_metrics AS metric
    WHERE metric.client_id = p_client_id
      AND metric.organization_id = p_organization_id
      AND metric.performance_year = p_performance_year;

    IF v_month_count <> 12 THEN
        RAISE EXCEPTION
            'The requested performance year is not fully provisioned.';
    END IF;

    v_updated_at := pg_catalog.clock_timestamp();

    INSERT INTO public.client_performance_year_visibility (
        client_id,
        organization_id,
        performance_year,
        is_hidden,
        created_at,
        updated_at
    )
    VALUES (
        p_client_id,
        p_organization_id,
        p_performance_year,
        p_is_hidden,
        v_updated_at,
        v_updated_at
    )
    ON CONFLICT (
        client_id,
        performance_year
    )
    DO UPDATE SET
        is_hidden = EXCLUDED.is_hidden,
        updated_at = EXCLUDED.updated_at;

    RETURN v_updated_at;

END;
$function$;


/* ==========================================================
   3. Restrict Function Execution
========================================================== */

REVOKE ALL PRIVILEGES ON FUNCTION
public.add_client_performance_year(
    uuid,
    uuid
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
public.add_client_performance_year(
    uuid,
    uuid
)
TO service_role;


REVOKE ALL PRIVILEGES ON FUNCTION
public.set_client_performance_year_visibility(
    uuid,
    uuid,
    integer,
    boolean
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
public.set_client_performance_year_visibility(
    uuid,
    uuid,
    integer,
    boolean
)
TO service_role;


/* ==========================================================
   4. Function Documentation
========================================================== */

COMMENT ON FUNCTION
public.add_client_performance_year(
    uuid,
    uuid
)
IS
'Atomically appends the next performance year to one Client Performance workspace, creating twelve blank monthly records and a visible year setting without overwriting existing data.';

COMMENT ON FUNCTION
public.set_client_performance_year_visibility(
    uuid,
    uuid,
    integer,
    boolean
)
IS
'Sets shared organization-level visibility for a fully provisioned Client Performance year without deleting or modifying its monthly data.';

COMMIT;
