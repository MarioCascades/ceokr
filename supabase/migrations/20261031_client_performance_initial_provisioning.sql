
/*
============================================================
CascadEffects Performance Platform
Client Performance Initial Provisioning
------------------------------------------------------------
Migration: 20261031

Creates the six initial client workspaces:

1. Kirkland & Richmond
2. Desman
3. Burns
4. Mint
5. Peak
6. Indie Ortho

Creates:
- Client workspace configuration
- Empty snapshot records
- Blank monthly records for 2025 and 2026
- Visible year settings for 2025 and 2026

Safety:
- Idempotent: safe to execute more than once.
- Does not overwrite existing client configurations.
- Does not overwrite existing snapshots or metrics.
- Does not fabricate historical performance values.
- Does not create or infer initiative entries.
- Does not enable the Runtime Custom Table definition.

============================================================
*/

BEGIN;

/* ==========================================================
   1. Verify Organization and Custom Table Definition
========================================================== */

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM public.organization
        WHERE id = 'e571cd65-b7f8-4669-bb41-370806097792'
          AND company_name = 'CascadEffects'
    ) THEN
        RAISE EXCEPTION
            'CascadEffects organization was not found.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.custom_table_definitions
        WHERE id = '3d49013b-7682-4d37-9cba-6229d3cf15ec'
          AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'
          AND table_key = 'client-performance'
    ) THEN
        RAISE EXCEPTION
            'The CascadEffects Client Performance Custom Table definition was not found.';
    END IF;

END;
$$;


/* ==========================================================
   2. Create Six Client Workspaces
========================================================== */

INSERT INTO public.client_performance_clients (
    organization_id,
    custom_table_definition_id,
    client_key,
    display_name,
    position,
    is_enabled,
    snapshot_fields
)
VALUES

/* ----------------------------------------------------------
   Kirkland & Richmond
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'kirkland-richmond',
    'Kirkland & Richmond',
    1,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'days-worked',
            'label', 'Days Worked',
            'dataType', 'number',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'avg-prod-per-day',
            'label', 'Avg Prod per day',
            'dataType', 'number',
            'position', 5,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
),

/* ----------------------------------------------------------
   Desman
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'desman',
    'Desman',
    2,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'notes',
            'label', 'Notes',
            'dataType', 'text',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
),

/* ----------------------------------------------------------
   Burns
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'burns',
    'Burns',
    3,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'notes',
            'label', 'Notes',
            'dataType', 'text',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
),

/* ----------------------------------------------------------
   Mint
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'mint',
    'Mint',
    4,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'notes',
            'label', 'Notes',
            'dataType', 'text',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
),

/* ----------------------------------------------------------
   Peak
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'peak',
    'Peak',
    5,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'notes',
            'label', 'Notes',
            'dataType', 'text',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
),

/* ----------------------------------------------------------
   Indie Ortho
---------------------------------------------------------- */

(
    'e571cd65-b7f8-4669-bb41-370806097792',
    '3d49013b-7682-4d37-9cba-6229d3cf15ec',
    'indie-ortho',
    'Indie Ortho',
    6,
    true,
    jsonb_build_array(

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'start',
            'label', 'Start',
            'dataType', 'date',
            'position', 0,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'production',
            'label', 'Production',
            'dataType', 'number',
            'position', 1,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'collection',
            'label', 'Collection',
            'dataType', 'number',
            'position', 2,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'starts',
            'label', 'Starts',
            'dataType', 'number',
            'position', 3,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        ),

        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'columnKey', 'notes',
            'label', 'Notes',
            'dataType', 'text',
            'position', 4,
            'isRequired', false,
            'isVisible', true,
            'isEditable', true,
            'settings', '{}'::jsonb
        )
    )
)

ON CONFLICT (organization_id, client_key)
DO NOTHING;


/* ==========================================================
   3. Create Empty Snapshot Records
========================================================== */

INSERT INTO public.client_performance_snapshots (
    client_id,
    organization_id,
    snapshot_data
)
SELECT
    client.id,
    client.organization_id,
    '{}'::jsonb
FROM public.client_performance_clients AS client
WHERE client.organization_id =
    'e571cd65-b7f8-4669-bb41-370806097792'
  AND client.custom_table_definition_id =
    '3d49013b-7682-4d37-9cba-6229d3cf15ec'
  AND client.client_key IN (
      'kirkland-richmond',
      'desman',
      'burns',
      'mint',
      'peak',
      'indie-ortho'
  )
ON CONFLICT (client_id)
DO NOTHING;


/* ==========================================================
   4. Create Blank Monthly Metrics for 2025 and 2026
========================================================== */

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
    client.id,
    client.organization_id,
    years.performance_year,
    months.performance_month,
    NULL,
    NULL,
    NULL,
    NULL
FROM public.client_performance_clients AS client

CROSS JOIN generate_series(2025, 2026)
    AS years(performance_year)

CROSS JOIN generate_series(1, 12)
    AS months(performance_month)

WHERE client.organization_id =
    'e571cd65-b7f8-4669-bb41-370806097792'
  AND client.custom_table_definition_id =
    '3d49013b-7682-4d37-9cba-6229d3cf15ec'
  AND client.client_key IN (
      'kirkland-richmond',
      'desman',
      'burns',
      'mint',
      'peak',
      'indie-ortho'
  )

ON CONFLICT (
    client_id,
    performance_year,
    performance_month
)
DO NOTHING;


/* ==========================================================
   5. Initialize Shared Year Visibility
========================================================== */

INSERT INTO public.client_performance_year_visibility (
    client_id,
    organization_id,
    performance_year,
    is_hidden
)
SELECT
    client.id,
    client.organization_id,
    years.performance_year,
    false
FROM public.client_performance_clients AS client

CROSS JOIN generate_series(2025, 2026)
    AS years(performance_year)

WHERE client.organization_id =
    'e571cd65-b7f8-4669-bb41-370806097792'
  AND client.custom_table_definition_id =
    '3d49013b-7682-4d37-9cba-6229d3cf15ec'
  AND client.client_key IN (
      'kirkland-richmond',
      'desman',
      'burns',
      'mint',
      'peak',
      'indie-ortho'
  )

ON CONFLICT (
    client_id,
    performance_year
)
DO NOTHING;


/* ==========================================================
   6. Verify Provisioning Counts
========================================================== */

DO $$
DECLARE
    v_client_count integer;
    v_snapshot_count integer;
    v_metric_count integer;
    v_visibility_count integer;
BEGIN

    SELECT count(*)
    INTO v_client_count
    FROM public.client_performance_clients
    WHERE organization_id =
        'e571cd65-b7f8-4669-bb41-370806097792'
      AND custom_table_definition_id =
        '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client_key IN (
          'kirkland-richmond',
          'desman',
          'burns',
          'mint',
          'peak',
          'indie-ortho'
      );

    SELECT count(*)
    INTO v_snapshot_count
    FROM public.client_performance_snapshots AS snapshot
    JOIN public.client_performance_clients AS client
      ON client.id = snapshot.client_id
    WHERE client.organization_id =
        'e571cd65-b7f8-4669-bb41-370806097792'
      AND client.custom_table_definition_id =
        '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client.client_key IN (
          'kirkland-richmond',
          'desman',
          'burns',
          'mint',
          'peak',
          'indie-ortho'
      );

    SELECT count(*)
    INTO v_metric_count
    FROM public.client_performance_monthly_metrics AS metric
    JOIN public.client_performance_clients AS client
      ON client.id = metric.client_id
    WHERE client.organization_id =
        'e571cd65-b7f8-4669-bb41-370806097792'
      AND client.custom_table_definition_id =
        '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client.client_key IN (
          'kirkland-richmond',
          'desman',
          'burns',
          'mint',
          'peak',
          'indie-ortho'
      )
      AND metric.performance_year IN (2025, 2026);

    SELECT count(*)
    INTO v_visibility_count
    FROM public.client_performance_year_visibility AS visibility
    JOIN public.client_performance_clients AS client
      ON client.id = visibility.client_id
    WHERE client.organization_id =
        'e571cd65-b7f8-4669-bb41-370806097792'
      AND client.custom_table_definition_id =
        '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client.client_key IN (
          'kirkland-richmond',
          'desman',
          'burns',
          'mint',
          'peak',
          'indie-ortho'
      )
      AND visibility.performance_year IN (2025, 2026);

    IF v_client_count <> 6 THEN
        RAISE EXCEPTION
            'Expected 6 client workspaces, found %.',
            v_client_count;
    END IF;

    IF v_snapshot_count <> 6 THEN
        RAISE EXCEPTION
            'Expected 6 snapshot records, found %.',
            v_snapshot_count;
    END IF;

    IF v_metric_count <> 144 THEN
        RAISE EXCEPTION
            'Expected 144 monthly metric records, found %.',
            v_metric_count;
    END IF;

    IF v_visibility_count <> 12 THEN
        RAISE EXCEPTION
            'Expected 12 year visibility records, found %.',
            v_visibility_count;
    END IF;

END;
$$;

COMMIT;
