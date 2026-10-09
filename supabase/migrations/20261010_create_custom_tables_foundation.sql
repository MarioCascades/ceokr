/*
============================================================
CascadEffects Performance Platform
Custom Tables Foundation
------------------------------------------------------------
Migration: 20261010

Purpose:
Create the reusable, organization-scoped data model for
Custom Tables, beginning with Recruitment.

Architecture:

Organization
    |
    v
Custom Table Definition
    |
    +-- Configurable Columns
    |
    v
Monthly Table Instance
    |
    +-- Column Configuration Snapshot
    |
    +-- Operational Rows
           |
           +-- Editable Cell Values
           +-- Operational Status
           +-- Active / Hidden Visibility
           +-- Persistent Row Order

Design principles:

- Custom Tables are independent of Member OKRs.
- Operational rows do not contribute to OKR scoring.
- Table definitions are reusable across months.
- Monthly operational data is stored independently.
- Organization ownership is enforced through foreign keys.
- Runtime navigation remains a separate concern.
- Existing Runtime and Member OKR tables are not modified.
- No separate show_in_runtime setting is introduced.
- is_enabled determines whether a Custom Table is available
  for display in Runtime.

Security:
This migration follows the existing migration convention
of establishing schema before implementing authorization.
RLS and access policies must be implemented and tested
before production use.

============================================================
*/

BEGIN;


/* ==========================================================
   1. Custom Table Definitions
========================================================== */

CREATE TABLE IF NOT EXISTS public.custom_table_definitions (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL
    REFERENCES public.organization(id)
    ON DELETE CASCADE,

  /*
   * Stable identifier within an organization.
   *
   * Examples:
   * recruitment
   * va-list
   * client-performance
   */
  table_key text NOT NULL,

  name text NOT NULL,

  description text NULL,

  /*
   * Optional association with a Runtime operational tab.
   *
   * Examples:
   * recruitment
   * va-list
   * client-performance
   *
   * This field does not itself create a navigation record.
   */
  runtime_tab_key text NULL,

  /*
   * Single table-level availability setting.
   *
   * true  = enabled and eligible to appear in Runtime
   * false = hidden from Runtime
   *
   * This is separate from individual row visibility.
   */
  is_enabled boolean NOT NULL
    DEFAULT true,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT custom_table_definitions_key_not_blank
    CHECK (
      length(trim(table_key)) > 0
    ),

  CONSTRAINT custom_table_definitions_name_not_blank
    CHECK (
      length(trim(name)) > 0
    ),

  CONSTRAINT custom_table_definitions_org_key_unique
    UNIQUE (
      organization_id,
      table_key
    ),

  /*
   * Supports organization-scoped composite foreign keys.
   */
  CONSTRAINT custom_table_definitions_id_org_unique
    UNIQUE (
      id,
      organization_id
    )
);


/* ==========================================================
   2. Custom Table Column Definitions
========================================================== */

CREATE TABLE IF NOT EXISTS public.custom_table_columns (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL,

  table_definition_id uuid NOT NULL,

  /*
   * Stable key used to identify a cell value in row_data.
   */
  column_key text NOT NULL,

  label text NOT NULL,

  /*
   * Supported initial data types:
   * text, number, date, boolean, status, select
   */
  data_type text NOT NULL
    DEFAULT 'text',

  /*
   * Lower values appear earlier in the column order.
   */
  position integer NOT NULL
    DEFAULT 0,

  is_required boolean NOT NULL
    DEFAULT false,

  is_visible boolean NOT NULL
    DEFAULT true,

  is_editable boolean NOT NULL
    DEFAULT true,

  /*
   * Extensible column configuration.
   *
   * Examples:
   * select options
   * status colors
   * display hints
   * future validation settings
   */
  settings jsonb NOT NULL
    DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT custom_table_columns_definition_org_fkey
    FOREIGN KEY (
      table_definition_id,
      organization_id
    )
    REFERENCES public.custom_table_definitions (
      id,
      organization_id
    )
    ON DELETE CASCADE,

  CONSTRAINT custom_table_columns_key_not_blank
    CHECK (
      length(trim(column_key)) > 0
    ),

  CONSTRAINT custom_table_columns_label_not_blank
    CHECK (
      length(trim(label)) > 0
    ),

  CONSTRAINT custom_table_columns_position_valid
    CHECK (
      position >= 0
    ),

  CONSTRAINT custom_table_columns_data_type_valid
    CHECK (
      data_type IN (
        'text',
        'number',
        'date',
        'boolean',
        'status',
        'select'
      )
    ),

  CONSTRAINT custom_table_columns_settings_object
    CHECK (
      jsonb_typeof(settings) = 'object'
    ),

  CONSTRAINT custom_table_columns_definition_key_unique
    UNIQUE (
      table_definition_id,
      column_key
    ),

  CONSTRAINT custom_table_columns_id_definition_unique
    UNIQUE (
      id,
      table_definition_id
    )
);


/* ==========================================================
   3. Monthly Custom Table Instances
========================================================== */

CREATE TABLE IF NOT EXISTS public.custom_table_months (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL,

  table_definition_id uuid NOT NULL,

  /*
   * First calendar day of the performance month.
   *
   * Example:
   * 2026-10-01 represents October 2026.
   */
  performance_month date NOT NULL,

  /*
   * Snapshot of the column configuration used for this
   * month. Historical rendering can use this snapshot when
   * the reusable table definition changes later.
   */
  columns_snapshot jsonb NOT NULL
    DEFAULT '[]'::jsonb,

  /*
   * Indicates that the month has been finalized.
   *
   * Application services must enforce the actual editing
   * restrictions associated with finalization.
   */
  is_finalized boolean NOT NULL
    DEFAULT false,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT custom_table_months_definition_org_fkey
    FOREIGN KEY (
      table_definition_id,
      organization_id
    )
    REFERENCES public.custom_table_definitions (
      id,
      organization_id
    )
    ON DELETE CASCADE,

  CONSTRAINT custom_table_months_first_day
    CHECK (
      performance_month =
      date_trunc('month', performance_month)::date
    ),

  CONSTRAINT custom_table_months_snapshot_array
    CHECK (
      jsonb_typeof(columns_snapshot) = 'array'
    ),

  CONSTRAINT custom_table_months_table_month_unique
    UNIQUE (
      table_definition_id,
      performance_month
    ),

  CONSTRAINT custom_table_months_id_org_unique
    UNIQUE (
      id,
      organization_id
    )
);


/* ==========================================================
   4. Custom Table Operational Rows
========================================================== */

CREATE TABLE IF NOT EXISTS public.custom_table_rows (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  organization_id uuid NOT NULL,

  table_month_id uuid NOT NULL,

  /*
   * Each row stores its own editable cell values.
   *
   * Keys correspond to the configured column_key values.
   * Example:
   *
   * {
   *   "role": "Remote VA",
   *   "role_details": "Sales CRM Virtual Assistant",
   *   "action_plan": "Endorse candidates",
   *   "remarks": "Waiting for client feedback",
   *   "future_task": "Follow up Friday",
   *   "current_state": "Client interview pending"
   * }
   *
   * The separate operational_status column below is not
   * stored in row_data.
   */
  row_data jsonb NOT NULL
    DEFAULT '{}'::jsonb,

  /*
   * Standardized operational status.
   *
   * This is separate from the recruiter's free-form
   * Current State, Action Plan, and Remarks fields.
   */
  operational_status text NOT NULL
    DEFAULT 'in_progress',

  /*
   * Individual row visibility.
   *
   * false = appears in the active list
   * true  = appears in the Hidden Listings section
   *
   * Hiding a row does not delete it.
   */
  is_hidden boolean NOT NULL
    DEFAULT false,

  /*
   * Persistent row order within the monthly table.
   *
   * Lower values appear first.
   *
   * Ordering operations such as Move to Top, Move Up,
   * Move Down, and Move to Bottom will update this value.
   */
  position integer NOT NULL
    DEFAULT 0,

  created_at timestamptz NOT NULL
    DEFAULT now(),

  updated_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT custom_table_rows_month_org_fkey
    FOREIGN KEY (
      table_month_id,
      organization_id
    )
    REFERENCES public.custom_table_months (
      id,
      organization_id
    )
    ON DELETE CASCADE,

  CONSTRAINT custom_table_rows_data_object
    CHECK (
      jsonb_typeof(row_data) = 'object'
    ),

  CONSTRAINT custom_table_rows_status_valid
    CHECK (
      operational_status IN (
        'in_progress',
        'on_hold',
        'completed'
      )
    ),

  CONSTRAINT custom_table_rows_position_valid
    CHECK (
      position >= 0
    )
);


/* ==========================================================
   5. Indexes
========================================================== */

/*
 * Find enabled or hidden tables belonging to an organization.
 */

CREATE INDEX IF NOT EXISTS
  idx_custom_table_definitions_org_enabled

ON public.custom_table_definitions (
  organization_id,
  is_enabled,
  name
);


/*
 * Load configured columns in display order.
 */

CREATE INDEX IF NOT EXISTS
  idx_custom_table_columns_definition_position

ON public.custom_table_columns (
  table_definition_id,
  position
);


/*
 * Retrieve the organization's operational tables by month.
 */

CREATE INDEX IF NOT EXISTS
  idx_custom_table_months_org_month

ON public.custom_table_months (
  organization_id,
  performance_month DESC
);


/*
 * Load active and hidden rows in their saved order.
 */

CREATE INDEX IF NOT EXISTS
  idx_custom_table_rows_month_visibility_position

ON public.custom_table_rows (
  table_month_id,
  is_hidden,
  position
);


/*
 * Support filtering by operational status.
 */

CREATE INDEX IF NOT EXISTS
  idx_custom_table_rows_month_status

ON public.custom_table_rows (
  table_month_id,
  operational_status
);


/* ==========================================================
   6. Architecture Notes
==========================================================

A. RECRUITMENT CONFIGURATION

The initial Recruitment definition will use these six
configurable columns:

1. Role
2. Role Details
3. Action Plan
4. Remarks
5. Future Task
6. Current State

The generic operational Status is stored separately in
custom_table_rows.operational_status.

The six columns above are not seeded by this migration.
The application/service layer will create the initial
Recruitment definition and its column definitions.

B. TABLE ENABLEMENT

custom_table_definitions.is_enabled controls whether a
Custom Table is eligible to appear in Runtime.

There is intentionally no separate show_in_runtime column.

The application must synchronize this setting with the
existing runtime_navigation_tabs configuration, including
its is_hidden behavior, without creating duplicate
navigation records.

C. ROW VISIBILITY

custom_table_rows.is_hidden controls individual row visibility.

Hidden rows remain stored and can be activated again.

This is independent of table-level enablement and
operational status.

D. ROW ORDERING

custom_table_rows.position stores the persistent order.

The application must safely update row positions when
moving rows to the top, up, down, or bottom.

Active and hidden rows must be presented in their respective
sections, with hidden listings below the active list.

E. MONTHLY HISTORY

Each configured table can have one monthly instance per
performance month.

Each monthly instance has its own operational rows.

Copy-forward behavior must create records for the new month
without modifying the previous month's rows.

Historical column snapshots support historical rendering
when table configuration changes later.

The application/service layer must enforce finalized-month
editing rules; the is_finalized flag alone does not provide
immutability.

F. ORGANIZATION OWNERSHIP

Composite foreign keys ensure that a column, monthly
instance, or row cannot reference a parent belonging to
another organization.

This does not replace authorization checks or RLS policies.

G. PERMISSIONS

This migration does not create RLS policies or grant
permissions.

The application must allow authorized organization members
to edit operational Recruitment data, while restricting
table configuration and table enablement to authorized
administrators.

Superadmin access must follow the platform's existing
authorization model.

H. EXISTING FEATURES

This migration does not modify:

- Existing Member OKR tables
- Existing Runtime execution records
- Existing Performance Sheet definitions
- Existing historical Runtime records
- Existing Runtime navigation records

No operational navigation tabs are inserted by this
migration.

============================================================
*/

COMMIT;