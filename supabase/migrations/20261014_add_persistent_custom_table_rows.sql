BEGIN;

-- ============================================================
-- 1. Define persistence mode
-- ============================================================

ALTER TABLE public.custom_table_definitions
    ADD COLUMN IF NOT EXISTS persistence_mode text
    NOT NULL DEFAULT 'monthly';

DO $migration$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_constraint
        WHERE conname = 'custom_table_definitions_persistence_mode_check'
          AND conrelid = 'public.custom_table_definitions'::regclass
    ) THEN
        ALTER TABLE public.custom_table_definitions
            ADD CONSTRAINT custom_table_definitions_persistence_mode_check
            CHECK (persistence_mode IN ('monthly', 'current_state'));
    END IF;
END;
$migration$;

-- Existing monthly Recruitment remains monthly.
-- Operational lists use persistent current-state records.

UPDATE public.custom_table_definitions
SET
    persistence_mode = CASE
        WHEN table_key = 'recruitment' THEN 'monthly'
        WHEN table_key IN (
            'va-list',
            'va-roster',
            'agenda',
            'client-performance'
        ) THEN 'current_state'
        ELSE persistence_mode
    END,
    updated_at = pg_catalog.now()
WHERE table_key IN (
    'recruitment',
    'va-list',
    'va-roster',
    'agenda',
    'client-performance'
);

-- ============================================================
-- 2. Persistent operational rows
-- ============================================================

CREATE TABLE IF NOT EXISTS public.custom_table_operational_rows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    table_definition_id uuid NOT NULL,
    row_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    operational_status text NOT NULL DEFAULT 'in_progress',
    is_hidden boolean NOT NULL DEFAULT false,
    position integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
    updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),

    CONSTRAINT custom_table_operational_rows_definition_fk
        FOREIGN KEY (table_definition_id, organization_id)
        REFERENCES public.custom_table_definitions (id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT custom_table_operational_rows_status_check
        CHECK (
            operational_status IN (
                'in_progress',
                'on_hold',
                'completed',
                'cancelled'
            )
        ),

    CONSTRAINT custom_table_operational_rows_position_check
        CHECK (position >= 0),

    CONSTRAINT custom_table_operational_rows_data_object_check
        CHECK (pg_catalog.jsonb_typeof(row_data) = 'object'),

    CONSTRAINT custom_table_operational_rows_id_org_definition_unique
        UNIQUE (id, organization_id, table_definition_id)
);

CREATE INDEX IF NOT EXISTS
    custom_table_operational_rows_definition_visibility_position_idx
ON public.custom_table_operational_rows (
    organization_id,
    table_definition_id,
    is_hidden,
    position,
    created_at,
    id
);

CREATE INDEX IF NOT EXISTS
    custom_table_operational_rows_definition_status_idx
ON public.custom_table_operational_rows (
    organization_id,
    table_definition_id,
    operational_status
);

-- No direct authenticated-client access. Application authorization
-- must run in the service layer before using privileged operations.

ALTER TABLE public.custom_table_operational_rows ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.custom_table_operational_rows
    FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.custom_table_operational_rows
    TO service_role;

-- ============================================================
-- 3. Create a persistent row atomically
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_custom_table_operational_row_atomic(
    p_organization_id uuid,
    p_table_definition_id uuid,
    p_row_data jsonb DEFAULT '{}'::jsonb,
    p_operational_status text DEFAULT 'in_progress',
    p_is_hidden boolean DEFAULT false,
    p_position integer DEFAULT NULL
)
RETURNS SETOF public.custom_table_operational_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_definition public.custom_table_definitions%ROWTYPE;
    v_position integer;
    v_row public.custom_table_operational_rows%ROWTYPE;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_definition_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and Custom Table definition are required.';
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
        RAISE EXCEPTION 'Row visibility is required.';
    END IF;

    IF p_position IS NOT NULL AND p_position < 0 THEN
        RAISE EXCEPTION 'Row position cannot be negative.';
    END IF;

    SELECT definition.*
    INTO v_definition
    FROM public.custom_table_definitions AS definition
    WHERE definition.id = p_table_definition_id
      AND definition.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table definition was not found for this organization.';
    END IF;

    IF v_definition.persistence_mode <> 'current_state' THEN
        RAISE EXCEPTION
            'Persistent row operations require a current-state table.';
    END IF;

    IF NOT v_definition.is_enabled THEN
        RAISE EXCEPTION 'This Custom Table is disabled.';
    END IF;

    IF p_position IS NULL THEN
        SELECT COALESCE(MAX(row_record.position) + 1, 0)
        INTO v_position
        FROM public.custom_table_operational_rows AS row_record
        WHERE row_record.organization_id = p_organization_id
          AND row_record.table_definition_id = p_table_definition_id
          AND row_record.is_hidden = p_is_hidden;
    ELSE
        v_position := p_position;
    END IF;

    INSERT INTO public.custom_table_operational_rows (
        organization_id,
        table_definition_id,
        row_data,
        operational_status,
        is_hidden,
        position
    )
    VALUES (
        p_organization_id,
        p_table_definition_id,
        p_row_data,
        p_operational_status,
        p_is_hidden,
        v_position
    )
    RETURNING * INTO v_row;

    RETURN NEXT v_row;
    RETURN;
END;
$function$;

-- ============================================================
-- 4. Update a persistent row atomically
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_custom_table_operational_row_atomic(
    p_organization_id uuid,
    p_table_definition_id uuid,
    p_row_id uuid,
    p_row_data jsonb DEFAULT NULL,
    p_operational_status text DEFAULT NULL,
    p_is_hidden boolean DEFAULT NULL,
    p_position integer DEFAULT NULL
)
RETURNS SETOF public.custom_table_operational_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_definition public.custom_table_definitions%ROWTYPE;
    v_row public.custom_table_operational_rows%ROWTYPE;
    v_new_position integer;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_definition_id IS NULL
       OR p_row_id IS NULL THEN
        RAISE EXCEPTION
            'Organization, definition, and row are required.';
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

    SELECT definition.*
    INTO v_definition
    FROM public.custom_table_definitions AS definition
    WHERE definition.id = p_table_definition_id
      AND definition.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table definition was not found for this organization.';
    END IF;

    IF v_definition.persistence_mode <> 'current_state' THEN
        RAISE EXCEPTION
            'Persistent row operations require a current-state table.';
    END IF;

    IF NOT v_definition.is_enabled THEN
        RAISE EXCEPTION 'This Custom Table is disabled.';
    END IF;

    SELECT row_record.*
    INTO v_row
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Persistent row was not found in this Custom Table.';
    END IF;

    IF p_is_hidden IS NOT NULL
       AND p_is_hidden <> v_row.is_hidden THEN

        SELECT COALESCE(MAX(row_record.position) + 1, 0)
        INTO v_new_position
        FROM public.custom_table_operational_rows AS row_record
        WHERE row_record.organization_id = p_organization_id
          AND row_record.table_definition_id = p_table_definition_id
          AND row_record.is_hidden = p_is_hidden;

        UPDATE public.custom_table_operational_rows AS row_record
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
          AND row_record.table_definition_id = p_table_definition_id;

        -- Normalize the section the row left.
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
            FROM public.custom_table_operational_rows AS row_record
            WHERE row_record.organization_id = p_organization_id
              AND row_record.table_definition_id = p_table_definition_id
              AND row_record.is_hidden = v_row.is_hidden
        )
        UPDATE public.custom_table_operational_rows AS row_record
        SET
            position = ordered_rows.new_position,
            updated_at = pg_catalog.now()
        FROM ordered_rows
        WHERE row_record.id = ordered_rows.id
          AND row_record.position <> ordered_rows.new_position;
    ELSE
        UPDATE public.custom_table_operational_rows AS row_record
        SET
            row_data = COALESCE(p_row_data, row_record.row_data),
            operational_status = COALESCE(
                p_operational_status,
                row_record.operational_status
            ),
            is_hidden = COALESCE(p_is_hidden, row_record.is_hidden),
            position = COALESCE(p_position, row_record.position),
            updated_at = pg_catalog.now()
        WHERE row_record.id = p_row_id
          AND row_record.organization_id = p_organization_id
          AND row_record.table_definition_id = p_table_definition_id;
    END IF;

    RETURN QUERY
    SELECT row_record.*
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id;
END;
$function$;

-- ============================================================
-- 5. Delete a persistent row atomically
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_custom_table_operational_row_atomic(
    p_organization_id uuid,
    p_table_definition_id uuid,
    p_row_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_definition public.custom_table_definitions%ROWTYPE;
    v_row public.custom_table_operational_rows%ROWTYPE;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_definition_id IS NULL
       OR p_row_id IS NULL THEN
        RAISE EXCEPTION
            'Organization, definition, and row are required.';
    END IF;

    SELECT definition.*
    INTO v_definition
    FROM public.custom_table_definitions AS definition
    WHERE definition.id = p_table_definition_id
      AND definition.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table definition was not found for this organization.';
    END IF;

    IF v_definition.persistence_mode <> 'current_state' THEN
        RAISE EXCEPTION
            'Persistent row operations require a current-state table.';
    END IF;

    IF NOT v_definition.is_enabled THEN
        RAISE EXCEPTION 'This Custom Table is disabled.';
    END IF;

    SELECT row_record.*
    INTO v_row
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Persistent row was not found in this Custom Table.';
    END IF;

    DELETE FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.id = p_row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id;

    -- Keep positions contiguous within the affected section.
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
        FROM public.custom_table_operational_rows AS row_record
        WHERE row_record.organization_id = p_organization_id
          AND row_record.table_definition_id = p_table_definition_id
          AND row_record.is_hidden = v_row.is_hidden
    )
    UPDATE public.custom_table_operational_rows AS row_record
    SET
        position = ordered_rows.new_position,
        updated_at = pg_catalog.now()
    FROM ordered_rows
    WHERE row_record.id = ordered_rows.id
      AND row_record.position <> ordered_rows.new_position;

    RETURN true;
END;
$function$;

-- ============================================================
-- 6. Reorder a persistent active or hidden section atomically
-- ============================================================

CREATE OR REPLACE FUNCTION public.save_custom_table_operational_row_order_atomic(
    p_organization_id uuid,
    p_table_definition_id uuid,
    p_row_ids uuid[],
    p_is_hidden boolean
)
RETURNS SETOF public.custom_table_operational_rows
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    v_definition public.custom_table_definitions%ROWTYPE;
    v_expected_count bigint;
    v_submitted_count bigint;
BEGIN
    IF p_organization_id IS NULL
       OR p_table_definition_id IS NULL THEN
        RAISE EXCEPTION
            'Organization and Custom Table definition are required.';
    END IF;

    IF p_row_ids IS NULL OR p_is_hidden IS NULL THEN
        RAISE EXCEPTION
            'Row ordering and visibility section are required.';
    END IF;

    IF pg_catalog.array_position(p_row_ids, NULL::uuid) IS NOT NULL THEN
        RAISE EXCEPTION 'Row ordering cannot contain null IDs.';
    END IF;

    SELECT definition.*
    INTO v_definition
    FROM public.custom_table_definitions AS definition
    WHERE definition.id = p_table_definition_id
      AND definition.organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Custom Table definition was not found for this organization.';
    END IF;

    IF v_definition.persistence_mode <> 'current_state' THEN
        RAISE EXCEPTION
            'Persistent row operations require a current-state table.';
    END IF;

    IF NOT v_definition.is_enabled THEN
        RAISE EXCEPTION 'This Custom Table is disabled.';
    END IF;

    SELECT COUNT(DISTINCT submitted.row_id)
    INTO v_submitted_count
    FROM pg_catalog.unnest(p_row_ids) AS submitted(row_id);

    IF v_submitted_count <> pg_catalog.cardinality(p_row_ids) THEN
        RAISE EXCEPTION 'Row ordering contains duplicate IDs.';
    END IF;

    PERFORM row_record.id
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
      AND row_record.is_hidden = p_is_hidden
    FOR UPDATE;

    SELECT COUNT(*)
    INTO v_expected_count
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
      AND row_record.is_hidden = p_is_hidden;

    IF v_expected_count <> pg_catalog.cardinality(p_row_ids) THEN
        RAISE EXCEPTION
            'Ordering must include every row in the selected section.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_catalog.unnest(p_row_ids) AS submitted(row_id)
        LEFT JOIN public.custom_table_operational_rows AS row_record
          ON row_record.id = submitted.row_id
         AND row_record.organization_id = p_organization_id
         AND row_record.table_definition_id = p_table_definition_id
         AND row_record.is_hidden = p_is_hidden
        WHERE row_record.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Ordering contains a row outside the selected section.';
    END IF;

    UPDATE public.custom_table_operational_rows AS row_record
    SET
        position = (submitted.ordinality - 1)::integer,
        updated_at = pg_catalog.now()
    FROM pg_catalog.unnest(p_row_ids)
        WITH ORDINALITY AS submitted(row_id, ordinality)
    WHERE row_record.id = submitted.row_id
      AND row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
      AND row_record.is_hidden = p_is_hidden;

    RETURN QUERY
    SELECT row_record.*
    FROM public.custom_table_operational_rows AS row_record
    WHERE row_record.organization_id = p_organization_id
      AND row_record.table_definition_id = p_table_definition_id
      AND row_record.is_hidden = p_is_hidden
    ORDER BY row_record.position, row_record.created_at, row_record.id;
END;
$function$;

-- ============================================================
-- 7. Restrict RPC execution to service_role
-- ============================================================

REVOKE ALL ON FUNCTION
    public.create_custom_table_operational_row_atomic(
        uuid, uuid, jsonb, text, boolean, integer
    )
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION
    public.update_custom_table_operational_row_atomic(
        uuid, uuid, uuid, jsonb, text, boolean, integer
    )
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION
    public.delete_custom_table_operational_row_atomic(
        uuid, uuid, uuid
    )
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION
    public.save_custom_table_operational_row_order_atomic(
        uuid, uuid, uuid[], boolean
    )
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.create_custom_table_operational_row_atomic(
        uuid, uuid, jsonb, text, boolean, integer
    )
    TO service_role;

GRANT EXECUTE ON FUNCTION
    public.update_custom_table_operational_row_atomic(
        uuid, uuid, uuid, jsonb, text, boolean, integer
    )
    TO service_role;

GRANT EXECUTE ON FUNCTION
    public.delete_custom_table_operational_row_atomic(
        uuid, uuid, uuid
    )
    TO service_role;

GRANT EXECUTE ON FUNCTION
    public.save_custom_table_operational_row_order_atomic(
        uuid, uuid, uuid[], boolean
    )
    TO service_role;

COMMIT;