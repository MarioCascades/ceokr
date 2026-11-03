
/*
============================================================
CascadEffects Performance Platform
Client Performance Monthly Average Production Persistence
------------------------------------------------------------
Migration: 20261104

Purpose:
1. Add Avg Production per Day to monthly metrics only.
2. Extend the existing atomic workspace save function to
   persist that value without changing existing save behavior.
3. Preserve all existing monthly, snapshot, and initiative data.

This is an additive migration. No existing values are deleted,
rewritten, or inferred into a month.
============================================================
*/

BEGIN;

ALTER TABLE public.client_performance_monthly_metrics
    ADD COLUMN IF NOT EXISTS avg_prod_per_day numeric(16, 2) NULL;

CREATE OR REPLACE FUNCTION
public.save_client_performance_workspace_atomic(
    p_organization_id uuid,
    p_client_id uuid,
    p_snapshot_data jsonb,
    p_monthly_metrics jsonb,
    p_initiatives jsonb
)
RETURNS timestamptz
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_client public.client_performance_clients%ROWTYPE;
    v_item jsonb;
    v_changes jsonb;
    v_record_id uuid;
    v_rows_updated integer;
    v_saved_at timestamptz;
BEGIN
    /* ------------------------------------------------------
       A. Validate request
    ------------------------------------------------------ */

    IF p_organization_id IS NULL
       OR p_client_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and client are required.';
    END IF;

    IF p_snapshot_data IS NOT NULL
       AND pg_catalog.jsonb_typeof(p_snapshot_data) <> 'object' THEN
        RAISE EXCEPTION
            'Snapshot data must be a JSON object.';
    END IF;

    IF p_monthly_metrics IS NOT NULL
       AND pg_catalog.jsonb_typeof(p_monthly_metrics) <> 'array' THEN
        RAISE EXCEPTION
            'Monthly metrics must be a JSON array.';
    END IF;

    IF p_initiatives IS NOT NULL
       AND pg_catalog.jsonb_typeof(p_initiatives) <> 'array' THEN
        RAISE EXCEPTION
            'Initiatives must be a JSON array.';
    END IF;

    IF p_snapshot_data IS NULL
       AND (
           p_monthly_metrics IS NULL
           OR p_monthly_metrics = '[]'::jsonb
       )
       AND (
           p_initiatives IS NULL
           OR p_initiatives = '[]'::jsonb
       ) THEN
        RAISE EXCEPTION
            'At least one workspace section must be supplied.';
    END IF;

    /* ------------------------------------------------------
       B. Lock and validate client ownership
    ------------------------------------------------------ */

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

    /* ------------------------------------------------------
       C. Save snapshot values

       JSONB concatenation performs a top-level merge.
       Existing keys not supplied in this request remain.
    ------------------------------------------------------ */

    IF p_snapshot_data IS NOT NULL THEN

        INSERT INTO public.client_performance_snapshots (
            client_id,
            organization_id,
            snapshot_data,
            created_at,
            updated_at
        )
        VALUES (
            p_client_id,
            p_organization_id,
            p_snapshot_data,
            pg_catalog.clock_timestamp(),
            pg_catalog.clock_timestamp()
        )
        ON CONFLICT (client_id)
        DO UPDATE SET
            snapshot_data =
                public.client_performance_snapshots.snapshot_data
                || EXCLUDED.snapshot_data,
            updated_at = pg_catalog.clock_timestamp();

    END IF;

    /* ------------------------------------------------------
       D. Update monthly metrics

       Only supplied properties are updated.
       JSON null explicitly clears a nullable value.
       Missing properties preserve existing values.
    ------------------------------------------------------ */

    FOR v_item IN
        SELECT element.value
        FROM pg_catalog.jsonb_array_elements(
            COALESCE(p_monthly_metrics, '[]'::jsonb)
        ) AS element(value)
    LOOP

        IF pg_catalog.jsonb_typeof(v_item) <> 'object'
           OR pg_catalog.jsonb_typeof(v_item->'changes') <> 'object'
           OR v_item->>'id' IS NULL THEN
            RAISE EXCEPTION
                'Each monthly metric update requires an ID and changes object.';
        END IF;

        v_changes := v_item->'changes';

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.jsonb_object_keys(v_changes) AS item(key)
            WHERE item.key NOT IN (
                'production',
                'collection',
                'starts',
                'daysWorked',
                'avgProdPerDay'
            )
        ) THEN
            RAISE EXCEPTION
                'Monthly metric update contains an unsupported field.';
        END IF;

        v_record_id := (v_item->>'id')::uuid;

        UPDATE public.client_performance_monthly_metrics AS metric
        SET
            production = CASE
                WHEN v_changes ? 'production'
                THEN (v_changes->>'production')::numeric
                ELSE metric.production
            END,

            collection = CASE
                WHEN v_changes ? 'collection'
                THEN (v_changes->>'collection')::numeric
                ELSE metric.collection
            END,

            starts = CASE
                WHEN v_changes ? 'starts'
                THEN (v_changes->>'starts')::integer
                ELSE metric.starts
            END,

            days_worked = CASE
                WHEN v_changes ? 'daysWorked'
                THEN (v_changes->>'daysWorked')::numeric
                ELSE metric.days_worked
            END,

            avg_prod_per_day = CASE
                WHEN v_changes ? 'avgProdPerDay'
                THEN (v_changes->>'avgProdPerDay')::numeric
                ELSE metric.avg_prod_per_day
            END,

            updated_at = pg_catalog.clock_timestamp()

        WHERE metric.id = v_record_id
          AND metric.client_id = p_client_id
          AND metric.organization_id = p_organization_id;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

        IF v_rows_updated <> 1 THEN
            RAISE EXCEPTION
                'Monthly metric record % was not found in this workspace.',
                v_record_id;
        END IF;

    END LOOP;

    /* ------------------------------------------------------
       E. Update initiatives

       Only supplied properties are updated.
       JSON null explicitly clears nullable fields.
       Missing properties preserve existing values.
    ------------------------------------------------------ */

    FOR v_item IN
        SELECT element.value
        FROM pg_catalog.jsonb_array_elements(
            COALESCE(p_initiatives, '[]'::jsonb)
        ) AS element(value)
    LOOP

        IF pg_catalog.jsonb_typeof(v_item) <> 'object'
           OR pg_catalog.jsonb_typeof(v_item->'changes') <> 'object'
           OR v_item->>'id' IS NULL THEN
            RAISE EXCEPTION
                'Each initiative update requires an ID and changes object.';
        END IF;

        v_changes := v_item->'changes';

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.jsonb_object_keys(v_changes) AS item(key)
            WHERE item.key NOT IN (
                'title',
                'description',
                'completionMonth',
                'additionalData',
                'notes',
                'position'
            )
        ) THEN
            RAISE EXCEPTION
                'Initiative update contains an unsupported field.';
        END IF;

        IF v_changes ? 'additionalData'
           AND pg_catalog.jsonb_typeof(
               v_changes->'additionalData'
           ) <> 'object' THEN
            RAISE EXCEPTION
                'Initiative additionalData must be a JSON object.';
        END IF;

        v_record_id := (v_item->>'id')::uuid;

        UPDATE public.client_performance_initiatives AS initiative
        SET
            title = CASE
                WHEN v_changes ? 'title'
                THEN v_changes->>'title'
                ELSE initiative.title
            END,

            description = CASE
                WHEN v_changes ? 'description'
                THEN v_changes->>'description'
                ELSE initiative.description
            END,

            completion_month = CASE
                WHEN v_changes ? 'completionMonth'
                THEN v_changes->>'completionMonth'
                ELSE initiative.completion_month
            END,

            additional_data = CASE
                WHEN v_changes ? 'additionalData'
                THEN v_changes->'additionalData'
                ELSE initiative.additional_data
            END,

            notes = CASE
                WHEN v_changes ? 'notes'
                THEN v_changes->>'notes'
                ELSE initiative.notes
            END,

            position = CASE
                WHEN v_changes ? 'position'
                THEN (v_changes->>'position')::integer
                ELSE initiative.position
            END,

            updated_at = pg_catalog.clock_timestamp()

        WHERE initiative.id = v_record_id
          AND initiative.client_id = p_client_id
          AND initiative.organization_id = p_organization_id;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

        IF v_rows_updated <> 1 THEN
            RAISE EXCEPTION
                'Initiative record % was not found in this workspace.',
                v_record_id;
        END IF;

    END LOOP;

    /* ------------------------------------------------------
       F. Advance Last Updated

       This statement is reached only after all supplied
       changes have succeeded.
    ------------------------------------------------------ */

    v_saved_at := pg_catalog.clock_timestamp();

    UPDATE public.client_performance_clients
    SET
        last_updated_at = v_saved_at,
        updated_at = v_saved_at
    WHERE id = p_client_id
      AND organization_id = p_organization_id;

    RETURN v_saved_at;

END;
$function$;


/* ==========================================================
   2. Restrict Function Execution
========================================================== */

REVOKE ALL PRIVILEGES ON FUNCTION
public.save_client_performance_workspace_atomic(
    uuid,
    uuid,
    jsonb,
    jsonb,
    jsonb
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
public.save_client_performance_workspace_atomic(
    uuid,
    uuid,
    jsonb,
    jsonb,
    jsonb
)
TO service_role;


/* ==========================================================
   3. Function Documentation
========================================================== */

COMMENT ON FUNCTION
public.save_client_performance_workspace_atomic(
    uuid,
    uuid,
    jsonb,
    jsonb,
    jsonb
)
IS
'Atomically saves Client Performance snapshot values, monthly metric updates (including Avg Production per Day), and initiative updates for one organization-owned client workspace. Advances Last Updated only after all supplied changes succeed.';

COMMIT;
