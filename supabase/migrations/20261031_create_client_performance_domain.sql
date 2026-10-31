/*
============================================================
CascadEffects Performance Platform
Client Performance Domain Foundation
------------------------------------------------------------
Migration: 20261031

Purpose:
Create additive, organization-scoped persistence for the
Client Performance Runtime workspace.

This migration deliberately does NOT:
- alter existing Custom Tables definitions or operational rows;
- alter Runtime navigation records;
- seed or rename client records;
- modify existing roles or permissions;
- change Recruitment, Agenda, VA Roster, or Performance Sheets.

The existing Custom Table definition remains the registration
and Runtime entry point. These tables own Client Performance's
structured workspace data.

Authorization follows the existing server-side repository
pattern: no direct anon/authenticated table access; privileged
server-side operations use service_role only after application
authorization and organization ownership checks.

============================================================
*/

BEGIN;

/* ==========================================================
   1. Client Workspaces
========================================================== */

CREATE TABLE public.client_performance_clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id uuid NOT NULL
        REFERENCES public.organization(id)
        ON DELETE CASCADE,

    custom_table_definition_id uuid NOT NULL,

    client_key text NOT NULL,
    display_name text NOT NULL,

    position integer NOT NULL DEFAULT 0,
    is_enabled boolean NOT NULL DEFAULT true,

    /*
     * Client-specific Current Performance Snapshot field
     * configuration. This is configuration only; saved values
     * live in client_performance_snapshots.
     *
     * Expected shape: JSON array of field descriptors.
     */
    snapshot_fields jsonb NOT NULL DEFAULT '[]'::jsonb,

    /*
     * Updated only by a successful workspace save transaction.
     * Client administration/configuration changes must not
     * advance this performance-data timestamp.
     */
    last_updated_at timestamptz NULL,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT client_performance_clients_definition_org_fkey
        FOREIGN KEY (custom_table_definition_id, organization_id)
        REFERENCES public.custom_table_definitions(id, organization_id)
        ON DELETE RESTRICT,

    CONSTRAINT client_performance_clients_key_not_blank
        CHECK (length(trim(client_key)) > 0),

    CONSTRAINT client_performance_clients_name_not_blank
        CHECK (length(trim(display_name)) > 0),

    CONSTRAINT client_performance_clients_position_valid
        CHECK (position >= 0),

    CONSTRAINT client_performance_clients_snapshot_fields_array
        CHECK (jsonb_typeof(snapshot_fields) = 'array'),

    CONSTRAINT client_performance_clients_org_key_unique
        UNIQUE (organization_id, client_key),

    CONSTRAINT client_performance_clients_id_org_unique
        UNIQUE (id, organization_id)
);

CREATE INDEX client_performance_clients_org_enabled_position_idx
    ON public.client_performance_clients (
        organization_id,
        is_enabled,
        position
    );

CREATE INDEX client_performance_clients_definition_idx
    ON public.client_performance_clients (
        custom_table_definition_id,
        organization_id
    );


/* ==========================================================
   2. Current Performance Snapshots
========================================================== */

CREATE TABLE public.client_performance_snapshots (
    client_id uuid PRIMARY KEY,
    organization_id uuid NOT NULL,

    snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT client_performance_snapshots_client_org_fkey
        FOREIGN KEY (client_id, organization_id)
        REFERENCES public.client_performance_clients(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT client_performance_snapshots_data_object
        CHECK (jsonb_typeof(snapshot_data) = 'object')
);

CREATE INDEX client_performance_snapshots_org_idx
    ON public.client_performance_snapshots (organization_id);


/* ==========================================================
   3. Continuous Monthly Metrics
========================================================== */

CREATE TABLE public.client_performance_monthly_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id uuid NOT NULL,
    organization_id uuid NOT NULL,

    performance_year integer NOT NULL,
    performance_month integer NOT NULL,

    production numeric(16, 2) NULL,
    collection numeric(16, 2) NULL,
    starts integer NULL,
    days_worked numeric(8, 2) NULL,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT client_performance_monthly_metrics_client_org_fkey
        FOREIGN KEY (client_id, organization_id)
        REFERENCES public.client_performance_clients(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT client_performance_monthly_metrics_year_valid
        CHECK (performance_year BETWEEN 1900 AND 9999),

    CONSTRAINT client_performance_monthly_metrics_month_valid
        CHECK (performance_month BETWEEN 1 AND 12),

    CONSTRAINT client_performance_monthly_metrics_starts_valid
        CHECK (starts IS NULL OR starts >= 0),

    CONSTRAINT client_performance_monthly_metrics_days_valid
        CHECK (days_worked IS NULL OR days_worked >= 0),

    CONSTRAINT client_performance_monthly_metrics_client_year_month_unique
        UNIQUE (client_id, performance_year, performance_month)
);

CREATE INDEX client_performance_monthly_metrics_org_client_year_idx
    ON public.client_performance_monthly_metrics (
        organization_id,
        client_id,
        performance_year,
        performance_month
    );


/* ==========================================================
   4. Key Initiatives Tracker
========================================================== */

CREATE TABLE public.client_performance_initiatives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id uuid NOT NULL,
    organization_id uuid NOT NULL,

    title text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    completion_month text NULL,

    /*
     * Preserves the existing additional tracker column until
     * its exact business label and data type are confirmed.
     */
    additional_data jsonb NOT NULL DEFAULT '{}'::jsonb,

    notes text NOT NULL DEFAULT '',
    position integer NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT client_performance_initiatives_client_org_fkey
        FOREIGN KEY (client_id, organization_id)
        REFERENCES public.client_performance_clients(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT client_performance_initiatives_additional_data_object
        CHECK (jsonb_typeof(additional_data) = 'object'),

    CONSTRAINT client_performance_initiatives_position_valid
        CHECK (position >= 0)
);

CREATE INDEX client_performance_initiatives_org_client_position_idx
    ON public.client_performance_initiatives (
        organization_id,
        client_id,
        position
    );


/* ==========================================================
   5. Shared Year Visibility Per Client
========================================================== */

CREATE TABLE public.client_performance_year_visibility (
    client_id uuid NOT NULL,
    organization_id uuid NOT NULL,

    performance_year integer NOT NULL,
    is_hidden boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT client_performance_year_visibility_client_org_fkey
        FOREIGN KEY (client_id, organization_id)
        REFERENCES public.client_performance_clients(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT client_performance_year_visibility_year_valid
        CHECK (performance_year BETWEEN 1900 AND 9999),

    CONSTRAINT client_performance_year_visibility_client_year_pk
        PRIMARY KEY (client_id, performance_year)
);

CREATE INDEX client_performance_year_visibility_org_client_idx
    ON public.client_performance_year_visibility (
        organization_id,
        client_id,
        performance_year
    );


/* ==========================================================
   6. Database Access Boundary
========================================================== */

DO $migration$
DECLARE
    v_table_name text;
    v_table_names text[] := ARRAY[
        'client_performance_clients',
        'client_performance_snapshots',
        'client_performance_monthly_metrics',
        'client_performance_initiatives',
        'client_performance_year_visibility'
    ];
BEGIN
    FOREACH v_table_name IN ARRAY v_table_names
    LOOP
        EXECUTE pg_catalog.format(
            'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
            v_table_name
        );

        EXECUTE pg_catalog.format(
            'REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated',
            v_table_name
        );

        EXECUTE pg_catalog.format(
            'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role',
            v_table_name
        );
    END LOOP;
END;
$migration$;


/* ==========================================================
   7. Schema Documentation
========================================================== */

COMMENT ON TABLE public.client_performance_clients IS
    'Client workspaces belonging to a provisioned organization Custom Table. Client-specific snapshot configuration and enabled state are stored here.';

COMMENT ON TABLE public.client_performance_snapshots IS
    'Current saved snapshot values for each Client Performance client workspace.';

COMMENT ON TABLE public.client_performance_monthly_metrics IS
    'Continuous month-by-month Client Performance metrics. One row per client, year, and month.';

COMMENT ON TABLE public.client_performance_initiatives IS
    'Persistent Key Initiatives Tracker records for each Client Performance client workspace.';

COMMENT ON TABLE public.client_performance_year_visibility IS
    'Shared organization-level visibility state for each client workspace and performance year. Hiding a year never deletes monthly metric records.';

COMMIT;
