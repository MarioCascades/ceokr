/*
============================================================
CascadEffects Performance Platform
Migration: Split CascadEffects Recruitment Updates

Creates two monthly tables in the existing Recruitment Updates
Runtime tab:
  - Active Listings: Remote (existing definition/key retained)
  - US Based Hires (new definition/key: us-based-hires)

Classification is intentionally exact and immutable after this
migration: row_data.role = 'Remote VA' remains in the existing
Remote table. Every other value, including blank or NULL, moves
to US Based Hires.

Preservation guarantees:
  - Existing source table ID, key, and Runtime tab key remain.
  - Existing row IDs are retained; non-Remote rows are moved,
    not copied or deleted.
  - Every monthly instance is cloned, including empty months.
  - Monthly finalization, timestamps, and column snapshots are
    preserved. Snapshot column IDs are remapped for the new table.
  - All row_data, status, is_hidden, position, and timestamps
    remain unchanged.
  - Pending on Client remains restricted to CascadEffects.

Expected pre-migration baseline, verified by Mario:
  total rows 192; Remote VA 148; US Based Hires 44;
  hidden rows 24 (21 Remote, 3 US Based).

Run once in Supabase SQL Editor. Transaction aborts if the source
baseline differs or the destination key already exists.
============================================================
*/

BEGIN;

LOCK TABLE
    public.custom_table_definitions,
    public.custom_table_columns,
    public.custom_table_months,
    public.custom_table_rows
IN SHARE ROW EXCLUSIVE MODE;

DO $preflight$
DECLARE
    v_definition_id uuid;
    v_total bigint;
    v_remote bigint;
    v_us bigint;
    v_hidden bigint;
BEGIN
    SELECT id
    INTO v_definition_id
    FROM public.custom_table_definitions
    WHERE id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
      AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND table_key = 'recruitment-updates'
    FOR UPDATE;

    IF v_definition_id IS NULL THEN
        RAISE EXCEPTION 'Expected CascadEffects Recruitment Updates definition was not found.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.custom_table_definitions
        WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
          AND table_key = 'us-based-hires'
    ) THEN
        RAISE EXCEPTION 'The us-based-hires table already exists. Migration stopped without changes.';
    END IF;

    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE row_data ->> 'role' = 'Remote VA'),
        COUNT(*) FILTER (WHERE row_data ->> 'role' IS DISTINCT FROM 'Remote VA'),
        COUNT(*) FILTER (WHERE is_hidden)
    INTO v_total, v_remote, v_us, v_hidden
    FROM public.custom_table_months AS m
    JOIN public.custom_table_rows AS r
      ON r.table_month_id = m.id
     AND r.organization_id = m.organization_id
    WHERE m.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND m.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid;

    IF v_total <> 192 OR v_remote <> 148 OR v_us <> 44 OR v_hidden <> 24 THEN
        RAISE EXCEPTION
            'Recruitment baseline changed. Expected total/remote/US/hidden = 192/148/44/24; found %/%/%/%. No changes applied.',
            v_total, v_remote, v_us, v_hidden;
    END IF;
END;
$preflight$;

/* Stable source identifiers; only the display name changes. */
UPDATE public.custom_table_definitions
SET name = 'Active Listings: Remote',
    updated_at = now()
WHERE id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

/* Create the second monthly definition in the same Runtime tab. */
INSERT INTO public.custom_table_definitions (
    organization_id,
    table_key,
    name,
    description,
    runtime_tab_key,
    is_enabled,
    persistence_mode
)
SELECT
    organization_id,
    'us-based-hires',
    'US Based Hires',
    description,
    runtime_tab_key,
    is_enabled,
    persistence_mode
FROM public.custom_table_definitions
WHERE id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

/* Map each existing column ID to a new ID for the second table. */
CREATE TEMP TABLE recruitment_split_column_id_map (
    old_id_text text PRIMARY KEY,
    new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

INSERT INTO recruitment_split_column_id_map (old_id_text, new_id)
SELECT id::text, gen_random_uuid()
FROM public.custom_table_columns
WHERE table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

/*
 * Historical snapshots can contain column IDs no longer present in
 * the live column definition. Give those snapshot-only IDs their own
 * stable mapped IDs too, so the original snapshot structure survives.
 */
INSERT INTO recruitment_split_column_id_map (old_id_text, new_id)
SELECT DISTINCT snapshot_item.item ->> 'id', gen_random_uuid()
FROM public.custom_table_months AS m
CROSS JOIN LATERAL jsonb_array_elements(m.columns_snapshot) AS snapshot_item(item)
WHERE m.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND m.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
  AND snapshot_item.item ? 'id'
  AND snapshot_item.item ->> 'id' IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM recruitment_split_column_id_map AS id_map
      WHERE id_map.old_id_text = snapshot_item.item ->> 'id'
  );

/* Clone live column configuration exactly, with independent IDs. */
INSERT INTO public.custom_table_columns (
    id,
    organization_id,
    table_definition_id,
    column_key,
    label,
    data_type,
    position,
    is_required,
    is_visible,
    is_editable,
    settings,
    created_at,
    updated_at
)
SELECT
    id_map.new_id,
    source_column.organization_id,
    destination_definition.id,
    source_column.column_key,
    source_column.label,
    source_column.data_type,
    source_column.position,
    source_column.is_required,
    source_column.is_visible,
    source_column.is_editable,
    source_column.settings,
    source_column.created_at,
    source_column.updated_at
FROM public.custom_table_columns AS source_column
JOIN recruitment_split_column_id_map AS id_map
  ON id_map.old_id_text = source_column.id::text
JOIN public.custom_table_definitions AS destination_definition
  ON destination_definition.organization_id = source_column.organization_id
 AND destination_definition.table_key = 'us-based-hires'
WHERE source_column.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND source_column.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

/* Create a destination month for every source month, including empty months. */
CREATE TEMP TABLE recruitment_split_month_id_map (
    old_month_id uuid PRIMARY KEY,
    new_month_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

INSERT INTO recruitment_split_month_id_map (old_month_id, new_month_id)
SELECT id, gen_random_uuid()
FROM public.custom_table_months
WHERE table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

INSERT INTO public.custom_table_months (
    id,
    organization_id,
    table_definition_id,
    performance_month,
    columns_snapshot,
    is_finalized,
    created_at,
    updated_at
)
SELECT
    month_map.new_month_id,
    source_month.organization_id,
    destination_definition.id,
    source_month.performance_month,
    COALESCE(snapshot_copy.columns_snapshot, '[]'::jsonb),
    source_month.is_finalized,
    source_month.created_at,
    source_month.updated_at
FROM public.custom_table_months AS source_month
JOIN recruitment_split_month_id_map AS month_map
  ON month_map.old_month_id = source_month.id
JOIN public.custom_table_definitions AS destination_definition
  ON destination_definition.organization_id = source_month.organization_id
 AND destination_definition.table_key = 'us-based-hires'
LEFT JOIN LATERAL (
    SELECT jsonb_agg(
        CASE
            WHEN snapshot_item.item ? 'id'
             AND id_map.new_id IS NOT NULL
            THEN jsonb_set(
                snapshot_item.item,
                '{id}',
                to_jsonb(id_map.new_id::text),
                false
            )
            ELSE snapshot_item.item
        END
        ORDER BY snapshot_item.ordinality
    ) AS columns_snapshot
    FROM jsonb_array_elements(source_month.columns_snapshot)
         WITH ORDINALITY AS snapshot_item(item, ordinality)
    LEFT JOIN recruitment_split_column_id_map AS id_map
      ON id_map.old_id_text = snapshot_item.item ->> 'id'
) AS snapshot_copy ON true
WHERE source_month.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND source_month.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid;

/*
 * Move every non-exact Remote VA row into its corresponding new month.
 * Row IDs and every other row field are deliberately untouched.
 */
UPDATE public.custom_table_rows AS row_record
SET table_month_id = month_map.new_month_id
FROM recruitment_split_month_id_map AS month_map
JOIN public.custom_table_months AS source_month
  ON source_month.id = month_map.old_month_id
WHERE row_record.table_month_id = month_map.old_month_id
  AND row_record.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
  AND source_month.organization_id = row_record.organization_id
  AND source_month.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
  AND row_record.row_data ->> 'role' IS DISTINCT FROM 'Remote VA';

/* Final integrity check before committing. */
DO $postflight$
DECLARE
    v_remote_total bigint;
    v_remote_hidden bigint;
    v_us_total bigint;
    v_us_hidden bigint;
    v_source_months bigint;
    v_destination_months bigint;
    v_wrong_source_rows bigint;
    v_wrong_destination_rows bigint;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE r.is_hidden)
    INTO v_remote_total, v_remote_hidden
    FROM public.custom_table_months AS m
    JOIN public.custom_table_rows AS r
      ON r.table_month_id = m.id
     AND r.organization_id = m.organization_id
    WHERE m.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND m.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid;

    SELECT COUNT(*), COUNT(*) FILTER (WHERE r.is_hidden)
    INTO v_us_total, v_us_hidden
    FROM public.custom_table_months AS m
    JOIN public.custom_table_rows AS r
      ON r.table_month_id = m.id
     AND r.organization_id = m.organization_id
    JOIN public.custom_table_definitions AS d
      ON d.id = m.table_definition_id
    WHERE d.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND d.table_key = 'us-based-hires';

    SELECT COUNT(*) INTO v_wrong_source_rows
    FROM public.custom_table_months AS m
    JOIN public.custom_table_rows AS r ON r.table_month_id = m.id
    WHERE m.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND m.table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid
      AND r.row_data ->> 'role' IS DISTINCT FROM 'Remote VA';

    SELECT COUNT(*) INTO v_wrong_destination_rows
    FROM public.custom_table_months AS m
    JOIN public.custom_table_rows AS r ON r.table_month_id = m.id
    JOIN public.custom_table_definitions AS d ON d.id = m.table_definition_id
    WHERE d.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND d.table_key = 'us-based-hires'
      AND r.row_data ->> 'role' = 'Remote VA';

    SELECT COUNT(*) INTO v_source_months
    FROM public.custom_table_months
    WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND table_definition_id = 'e468d86a-b529-4018-8cc6-8ec97454af60'::uuid;

    SELECT COUNT(*) INTO v_destination_months
    FROM public.custom_table_months AS m
    JOIN public.custom_table_definitions AS d
      ON d.id = m.table_definition_id
    WHERE d.organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
      AND d.table_key = 'us-based-hires';

    IF v_remote_total <> 148 OR v_remote_hidden <> 21
       OR v_us_total <> 44 OR v_us_hidden <> 3
       OR v_source_months <> v_destination_months
       OR v_wrong_source_rows <> 0 OR v_wrong_destination_rows <> 0 THEN
        RAISE EXCEPTION
            'Post-migration integrity check failed. Remote rows/hidden %,/%; US rows/hidden %,/%; months source/destination %/%. Transaction rolled back.',
            v_remote_total, v_remote_hidden,
            v_us_total, v_us_hidden,
            v_source_months, v_destination_months;
    END IF;
END;
$postflight$;

/*
============================================================
Supplemental workflow compatibility for the new table.

Keep the existing Pending on Client status and atomic row
create/update behavior, while permitting the new CascadEffects
US Based Hires table key. The organization ID guard remains
in place, so this does not enable the status for other tenants.
============================================================
*/


ALTER TABLE public.custom_table_rows
    DROP CONSTRAINT IF EXISTS custom_table_rows_status_valid;

ALTER TABLE public.custom_table_rows
    ADD CONSTRAINT custom_table_rows_status_valid
    CHECK (
        operational_status IN (
            'in_progress',
            'on_hold',
            'completed',
            'cancelled',
            'pending_on_client'
        )
    );

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
            'cancelled',
            'pending_on_client'
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

    IF p_operational_status = 'pending_on_client'
       AND NOT EXISTS (
           SELECT 1
           FROM public.custom_table_definitions AS definition
           WHERE definition.id = v_month.table_definition_id
             AND definition.organization_id = p_organization_id
             AND definition.organization_id =
                 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
             AND definition.table_key IN ('recruitment', 'recruitment-updates', 'us-based-hires')
       ) THEN
        RAISE EXCEPTION
            'Pending on Client is only valid for CascadEffects Recruitment.';
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
            'cancelled',
            'pending_on_client'
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

    IF p_operational_status = 'pending_on_client'
       AND NOT EXISTS (
           SELECT 1
           FROM public.custom_table_definitions AS definition
           WHERE definition.id = v_month.table_definition_id
             AND definition.organization_id = p_organization_id
             AND definition.organization_id =
                 'e571cd65-b7f8-4669-bb41-370806097792'::uuid
             AND definition.table_key IN ('recruitment', 'recruitment-updates', 'us-based-hires')
       ) THEN
        RAISE EXCEPTION
            'Pending on Client is only valid for CascadEffects Recruitment.';
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
COMMIT;
