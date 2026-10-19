/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Custom Table Repository
 * ----------------------------------------------------------
 * Provides Supabase persistence for reusable, organization-
 * scoped Custom Tables and their monthly operational data.
 *
 * Database tables:
 * - custom_table_definitions
 * - custom_table_columns
 * - custom_table_months
 * - custom_table_rows (monthly operational data)
 * - custom_table_operational_rows (persistent current-state data)
 *
 * This repository does not replace the application service
 * layer or authorization policies.
 * ==========================================================
 */

import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import type {
  CustomTableDefinition,
  CreateCustomTableDefinitionInput,
  UpdateCustomTableDefinitionInput,
  CustomTableColumn,
  CreateCustomTableColumnInput,
  UpdateCustomTableColumnInput,
  CustomTableColumnSnapshot,
  CustomTableMonth,
  CreateCustomTableMonthInput,
  UpdateCustomTableMonthInput,
  CustomTableRow,
  CreateCustomTableRowInput,
  UpdateCustomTableRowInput,
  CustomTableOperationalStatus,
  CustomTableRowData,
} from "@/lib/types/domain/customtable";

/* ==========================================================
   Database Records
========================================================== */

interface CustomTableDefinitionRecord {
  id: string;
  organization_id: string;
  table_key: string;
  name: string;
  description: string | null;
  runtime_tab_key: string | null;
  is_enabled: boolean;
  persistence_mode?: "monthly" | "current_state";
  created_at: string;
  updated_at: string;
}

interface CustomTableColumnRecord {
  id: string;
  organization_id: string;
  table_definition_id: string;
  column_key: string;
  label: string;
  data_type: CustomTableColumn["dataType"];
  position: number;
  is_required: boolean;
  is_visible: boolean;
  is_editable: boolean;
  settings: CustomTableColumn["settings"];
  created_at: string;
  updated_at: string;
}

interface CustomTableMonthRecord {
  id: string;
  organization_id: string;
  table_definition_id: string;
  performance_month: string;
  columns_snapshot: CustomTableColumnSnapshot[];
  is_finalized: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomTableOperationalRowRecord {
  id: string;
  organization_id: string;
  table_definition_id: string;
  row_data: CustomTableRowData;
  operational_status: CustomTableOperationalStatus;
  is_hidden: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type CustomTablePersistenceMode = "monthly" | "current_state";

export interface CustomTableOperationalRow {
  id: string;
  organizationId: string;
  tableDefinitionId: string;
  rowData: CustomTableRowData;
  operationalStatus: CustomTableOperationalStatus;
  isHidden: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomTableRowRecord {
  id: string;
  organization_id: string;
  table_month_id: string;
  row_data: CustomTableRowData;
  operational_status: CustomTableOperationalStatus;
  is_hidden: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface AtomicCustomTableMonthResult {
  month_id: string;
  created: boolean;
}

/* ==========================================================
   Record Mapping
========================================================== */

function mapDefinition(
  record: CustomTableDefinitionRecord
): CustomTableDefinition {
  return {
    id: record.id,
    organizationId: record.organization_id,
    tableKey: record.table_key,
    name: record.name,
    description: record.description,
    runtimeTabKey: record.runtime_tab_key,
    isEnabled: record.is_enabled,
    persistenceMode:
      record.persistence_mode === "current_state" ||
      persistenceModeForTableKey(
        record.table_key,
        record.runtime_tab_key
      ) === "current_state"
        ? "current_state"
        : "monthly",
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapColumn(
  record: CustomTableColumnRecord
): CustomTableColumn {
  return {
    id: record.id,
    organizationId: record.organization_id,
    tableDefinitionId: record.table_definition_id,
    columnKey: record.column_key,
    label: record.label,
    dataType: record.data_type,
    position: record.position,
    isRequired: record.is_required,
    isVisible: record.is_visible,
    isEditable: record.is_editable,
    settings: record.settings ?? {},
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapMonth(
  record: CustomTableMonthRecord
): CustomTableMonth {
  return {
    id: record.id,
    organizationId: record.organization_id,
    tableDefinitionId: record.table_definition_id,
    performanceMonth: record.performance_month,
    columnsSnapshot: record.columns_snapshot ?? [],
    isFinalized: record.is_finalized,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapOperationalRow(
  record: CustomTableOperationalRowRecord
): CustomTableOperationalRow {
  return {
    id: record.id,
    organizationId: record.organization_id,
    tableDefinitionId: record.table_definition_id,
    rowData: record.row_data ?? {},
    operationalStatus: record.operational_status,
    isHidden: record.is_hidden,
    position: record.position,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * Atomic row RPCs return a set of records. Normalize the
 * response and fail explicitly if the expected row is absent.
 */
function requireAtomicOperationalRow(
  data: unknown,
  operation: string
): CustomTableOperationalRow {
  const record = Array.isArray(data) ? data[0] : data;

  if (!record || typeof record !== "object") {
    throw new Error(
      `Atomic persistent Custom Table row ${operation} returned no row.`
    );
  }

  return mapOperationalRow(record as CustomTableOperationalRowRecord);
}

/**
 * Atomic Custom Table row RPCs return a set of records.
 * Normalize the response and fail if the expected row is absent.
 */
function mapRow(record: CustomTableRowRecord): CustomTableRow {
  return {
    id: record.id,
    organizationId: record.organization_id,
    tableMonthId: record.table_month_id,
    rowData: record.row_data ?? {},
    operationalStatus: record.operational_status,
    isHidden: record.is_hidden,
    position: record.position,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function requireAtomicRow(
  data: unknown,
  operation: string
): CustomTableRow {
  const record = Array.isArray(data) ? data[0] : data;

  if (!record || typeof record !== "object") {
    throw new Error(
      `Atomic Custom Table row ${operation} returned no row.`
    );
  }

  return mapRow(record as CustomTableRowRecord);
}

/* ==========================================================
   Custom Table Definitions
========================================================== */

/**
 * Load all Custom Table definitions belonging to an
 * organization.
 *
 * Disabled tables are included so administrators can
 * manage their configuration.
 */
export async function loadCustomTableDefinitions(
  organizationId: string
): Promise<CustomTableDefinition[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Custom Table definitions: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapDefinition(record as CustomTableDefinitionRecord)
  );
}

/**
 * Load one Custom Table definition within an organization.
 */
export async function findCustomTableDefinitionById(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", tableDefinitionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Custom Table definition: ${error.message}`
    );
  }

  return data
    ? mapDefinition(data as CustomTableDefinitionRecord)
    : null;
}

/**
 * Find a definition by its stable organization-scoped key.
 */
export async function findCustomTableDefinitionByKey(
  organizationId: string,
  tableKey: string
): Promise<CustomTableDefinition | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_key", tableKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find Custom Table definition: ${error.message}`
    );
  }

  return data
    ? mapDefinition(data as CustomTableDefinitionRecord)
    : null;
}

/**
 * Resolve persistence from the trusted stable table key or
 * its assigned Runtime tab key.
 *
 * The persistence mode is platform-defined, not user-configurable.
 * Runtime operational tables keep current-state data, while
 * Recruitment and other custom tables retain monthly behavior.
 */
function persistenceModeForTableKey(
  tableKey: string,
  runtimeTabKey?: string | null
): CustomTablePersistenceMode {
  const normalizedTableKey = tableKey.trim().toLowerCase();
  const normalizedRuntimeTabKey =
    runtimeTabKey?.trim().toLowerCase() ?? "";

  const currentStateKeys = new Set([
    "va-list",
    "va-roster",
    "agenda",
    "client-performance",
  ]);

  if (
    currentStateKeys.has(normalizedTableKey) ||
    currentStateKeys.has(normalizedRuntimeTabKey)
  ) {
    return "current_state";
  }

  return "monthly";
}

/**
 * Create a Custom Table definition.
 *
 * Permission checks must be performed by the calling
 * service before this operation is exposed to a user.
 *
 * Persistence mode is derived from the table key and assigned
 * Runtime tab key, never from a client-supplied setting.
 */
export async function createCustomTableDefinition(
  input: CreateCustomTableDefinitionInput
): Promise<CustomTableDefinition> {
  const supabase = supabaseAdmin;
  const persistenceMode = persistenceModeForTableKey(
    input.tableKey,
    input.runtimeTabKey
  );

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .insert({
      organization_id: input.organizationId,
      table_key: input.tableKey,
      name: input.name,
      description: input.description ?? null,
      runtime_tab_key: input.runtimeTabKey ?? null,
      is_enabled: input.isEnabled ?? true,
      persistence_mode: persistenceMode,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create Custom Table definition: ${error.message}`
    );
  }

  return mapDefinition(data as CustomTableDefinitionRecord);
}

/**
 * Update a definition without changing its stable table key
 * or stored persistence mode.
 */
export async function updateCustomTableDefinition(
  organizationId: string,
  tableDefinitionId: string,
  input: UpdateCustomTableDefinitionInput
): Promise<CustomTableDefinition> {
  const updates: {
    name?: string;
    description?: string | null;
    runtime_tab_key?: string | null;
    is_enabled?: boolean;
  } = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.description !== undefined) {
    updates.description = input.description;
  }

  if (input.runtimeTabKey !== undefined) {
    updates.runtime_tab_key = input.runtimeTabKey;
  }

  if (input.isEnabled !== undefined) {
    updates.is_enabled = input.isEnabled;
  }

  if (Object.keys(updates).length === 0) {
    const existing = await findCustomTableDefinitionById(
      organizationId,
      tableDefinitionId
    );

    if (!existing) {
      throw new Error("Custom Table definition was not found.");
    }

    return existing;
  }

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .update(updates)
    .eq("organization_id", organizationId)
    .eq("id", tableDefinitionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update Custom Table definition: ${error.message}`
    );
  }

  return mapDefinition(data as CustomTableDefinitionRecord);
}

/**
 * Delete a definition and its dependent records.
 *
 * The database schema cascades deletion to its columns,
 * monthly instances, and rows. The service layer must
 * explicitly authorize this destructive operation.
 */
export async function deleteCustomTableDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<void> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", tableDefinitionId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete Custom Table definition: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("Custom Table definition was not found.");
  }
}

/* ==========================================================
   Custom Table Columns
========================================================== */

/**
 * Load the configured columns for a Custom Table in display
 * order.
 */
export async function loadCustomTableColumns(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableColumn[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_columns")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Custom Table columns: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapColumn(record as CustomTableColumnRecord)
  );
}

/**
 * Create a configured column.
 */
export async function createCustomTableColumn(
  input: CreateCustomTableColumnInput
): Promise<CustomTableColumn> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_columns")
    .insert({
      organization_id: input.organizationId,
      table_definition_id: input.tableDefinitionId,
      column_key: input.columnKey,
      label: input.label,
      data_type: input.dataType ?? "text",
      position: input.position ?? 0,
      is_required: input.isRequired ?? false,
      is_visible: input.isVisible ?? true,
      is_editable: input.isEditable ?? true,
      settings: input.settings ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create Custom Table column: ${error.message}`
    );
  }

  return mapColumn(data as CustomTableColumnRecord);
}

/**
 * Update the configurable properties of a column.
 */
export async function updateCustomTableColumn(
  organizationId: string,
  tableDefinitionId: string,
  columnId: string,
  input: UpdateCustomTableColumnInput
): Promise<CustomTableColumn> {
  const updates: {
    label?: string;
    data_type?: CustomTableColumn["dataType"];
    position?: number;
    is_required?: boolean;
    is_visible?: boolean;
    is_editable?: boolean;
    settings?: CustomTableColumn["settings"];
  } = {};

  if (input.label !== undefined) {
    updates.label = input.label;
  }

  if (input.dataType !== undefined) {
    updates.data_type = input.dataType;
  }

  if (input.position !== undefined) {
    updates.position = input.position;
  }

  if (input.isRequired !== undefined) {
    updates.is_required = input.isRequired;
  }

  if (input.isVisible !== undefined) {
    updates.is_visible = input.isVisible;
  }

  if (input.isEditable !== undefined) {
    updates.is_editable = input.isEditable;
  }

  if (input.settings !== undefined) {
    updates.settings = input.settings;
  }

  const supabase = supabaseAdmin;

  if (Object.keys(updates).length === 0) {
    const { data, error } = await supabase
      .from("custom_table_columns")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("table_definition_id", tableDefinitionId)
      .eq("id", columnId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load Custom Table column: ${error.message}`
      );
    }

    if (!data) {
      throw new Error("Custom Table column was not found.");
    }

    return mapColumn(data as CustomTableColumnRecord);
  }

  const { data, error } = await supabase
    .from("custom_table_columns")
    .update(updates)
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("id", columnId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update Custom Table column: ${error.message}`
    );
  }

  return mapColumn(data as CustomTableColumnRecord);
}

/**
 * Delete a configured column.
 *
 * The application service must update future column
 * snapshots and define how existing row_data values are
 * handled before exposing column deletion.
 */
export async function deleteCustomTableColumn(
  organizationId: string,
  tableDefinitionId: string,
  columnId: string
): Promise<void> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_columns")
    .delete()
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("id", columnId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete Custom Table column: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("Custom Table column was not found.");
  }
}

/* ==========================================================
   Monthly Table Instances
========================================================== */

/**
 * Load all monthly instances for one Custom Table.
 */
export async function loadCustomTableMonths(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableMonth[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_months")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .order("performance_month", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load Custom Table months: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapMonth(record as CustomTableMonthRecord)
  );
}

/**
 * Find a monthly instance by its ID.
 */
export async function findCustomTableMonthById(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string
): Promise<CustomTableMonth | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_months")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("id", tableMonthId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Custom Table month: ${error.message}`
    );
  }

  return data
    ? mapMonth(data as CustomTableMonthRecord)
    : null;
}

/**
 * Find a monthly instance by its performance month.
 */
export async function findCustomTableMonthByPerformanceMonth(
  organizationId: string,
  tableDefinitionId: string,
  performanceMonth: string
): Promise<CustomTableMonth | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_months")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("performance_month", performanceMonth)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find Custom Table month: ${error.message}`
    );
  }

  return data
    ? mapMonth(data as CustomTableMonthRecord)
    : null;
}

/**
 * Create a monthly instance only when one does not already exist.
 *
 * A unique-constraint race is handled by reading the winning record.
 * Other database errors are surfaced instead of being masked.
 */
export async function createCustomTableMonthIfAbsent(
  input: CreateCustomTableMonthInput
): Promise<{ month: CustomTableMonth; created: boolean }> {
  const existing = await findCustomTableMonthByPerformanceMonth(
    input.organizationId,
    input.tableDefinitionId,
    input.performanceMonth
  );

  if (existing) {
    return { month: existing, created: false };
  }

  const columnsSnapshot =
    input.columnsSnapshot ??
    (await loadCustomTableColumns(
      input.organizationId,
      input.tableDefinitionId
    )).map(
      (column): CustomTableColumnSnapshot => ({
        id: column.id,
        columnKey: column.columnKey,
        label: column.label,
        dataType: column.dataType,
        position: column.position,
        isRequired: column.isRequired,
        isVisible: column.isVisible,
        isEditable: column.isEditable,
        settings: column.settings,
      })
    );

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_months")
    .insert({
      organization_id: input.organizationId,
      table_definition_id: input.tableDefinitionId,
      performance_month: input.performanceMonth,
      columns_snapshot: columnsSnapshot,
      is_finalized: input.isFinalized ?? false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const existingAfterInsert =
        await findCustomTableMonthByPerformanceMonth(
          input.organizationId,
          input.tableDefinitionId,
          input.performanceMonth
        );

      if (existingAfterInsert) {
        return { month: existingAfterInsert, created: false };
      }
    }

    throw new Error(
      `Failed to create Custom Table month: ${error.message}`
    );
  }

  return {
    month: mapMonth(data as CustomTableMonthRecord),
    created: true,
  };
}

/**
 * Atomically create a target month and copy eligible rows from
 * a source month.
 *
 * The database function creates the target month and copies
 * eligible rows in one transaction. If the target month already
 * exists, it returns that month without modifying its rows.
 *
 * The calling service must authorize this operation before use.
 *
 * IMPORTANT: This RPC uses the privileged server-side client
 * because the migration restricts function execution to service_role.
 * Never import this repository into client-side code.
 */
export async function copyForwardCustomTableMonthAtomic(input: {
  organizationId: string;
  tableDefinitionId: string;
  sourceMonthId: string;
  targetPerformanceMonth: string;
  columnsSnapshot?: CustomTableColumnSnapshot[];
}): Promise<{ month: CustomTableMonth; created: boolean }> {
  const columnsSnapshot =
    input.columnsSnapshot ??
    (await loadCustomTableColumns(
      input.organizationId,
      input.tableDefinitionId
    )).map(
      (column): CustomTableColumnSnapshot => ({
        id: column.id,
        columnKey: column.columnKey,
        label: column.label,
        dataType: column.dataType,
        position: column.position,
        isRequired: column.isRequired,
        isVisible: column.isVisible,
        isEditable: column.isEditable,
        settings: column.settings,
      })
    );

  const { data, error } = await supabaseAdmin.rpc(
    "copy_forward_custom_table_month_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_definition_id: input.tableDefinitionId,
      p_source_month_id: input.sourceMonthId,
      p_target_performance_month: input.targetPerformanceMonth,
      p_columns_snapshot: columnsSnapshot,
    }
  );

  if (error) {
    throw new Error(
      `Failed to copy forward Custom Table month: ${error.message}`
    );
  }

  const result = (
    Array.isArray(data) ? data[0] : data
  ) as AtomicCustomTableMonthResult | null;

  if (!result || typeof result.month_id !== "string") {
    throw new Error(
      "Atomic Custom Table carry-forward returned no target month."
    );
  }

  const month = await findCustomTableMonthById(
    input.organizationId,
    input.tableDefinitionId,
    result.month_id
  );

  if (!month) {
    throw new Error(
      "The target Custom Table month could not be loaded after carry-forward."
    );
  }

  return {
    month,
    created: result.created === true,
  };
}

/**
 * Create a monthly instance, returning an existing instance if one
 * already exists for the requested performance month.
 *
 * This preserves the behavior expected by ordinary workspace
 * initialization. Carry-forward operations should use the atomic
 * repository function above.
 */
export async function createCustomTableMonth(
  input: CreateCustomTableMonthInput
): Promise<CustomTableMonth> {
  const result = await createCustomTableMonthIfAbsent(input);
  return result.month;
}

/**
 * Update a monthly snapshot or finalization flag.
 *
 * Finalization authorization and editing restrictions
 * belong in the service layer.
 */
export async function updateCustomTableMonth(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  input: UpdateCustomTableMonthInput
): Promise<CustomTableMonth> {
  const updates: {
    columns_snapshot?: CustomTableColumnSnapshot[];
    is_finalized?: boolean;
  } = {};

  if (input.columnsSnapshot !== undefined) {
    updates.columns_snapshot = input.columnsSnapshot;
  }

  if (input.isFinalized !== undefined) {
    updates.is_finalized = input.isFinalized;
  }

  if (Object.keys(updates).length === 0) {
    const existing = await findCustomTableMonthById(
      organizationId,
      tableDefinitionId,
      tableMonthId
    );

    if (!existing) {
      throw new Error("Custom Table month was not found.");
    }

    return existing;
  }

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_months")
    .update(updates)
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("id", tableMonthId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update Custom Table month: ${error.message}`
    );
  }

  return mapMonth(data as CustomTableMonthRecord);
}

/* ==========================================================
   Monthly Operational Rows
========================================================== */

/**
 * Load rows for a monthly instance.
 *
 * Active and hidden rows are both returned. The UI or service
 * can divide them into their respective sections.
 */
export async function loadCustomTableRows(
  organizationId: string,
  tableMonthId: string
): Promise<CustomTableRow[]> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_rows")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_month_id", tableMonthId)
    .order("is_hidden", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Custom Table rows: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapRow(record as CustomTableRowRecord)
  );
}

/**
 * Find one row inside a specific monthly instance.
 */
export async function findCustomTableRowById(
  organizationId: string,
  tableMonthId: string,
  rowId: string
): Promise<CustomTableRow | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("custom_table_rows")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_month_id", tableMonthId)
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find Custom Table row: ${error.message}`
    );
  }

  return data
    ? mapRow(data as CustomTableRowRecord)
    : null;
}

/**
 * Create an operational row through the atomic database
 * function. The database assigns its position while holding
 * the monthly lock, avoiding concurrent insert collisions.
 */
export async function createCustomTableRow(
  input: CreateCustomTableRowInput
): Promise<CustomTableRow> {
  const { data, error } = await supabaseAdmin.rpc(
    "create_custom_table_row_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_month_id: input.tableMonthId,
      p_row_data: input.rowData ?? {},
      p_operational_status: input.operationalStatus ?? "in_progress",
      p_is_hidden: input.isHidden ?? false,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create Custom Table row: ${error.message}`
    );
  }

  return requireAtomicRow(data, "creation");
}

/**
 * Update the supplied row properties through the atomic database
 * function. Partial updates preserve properties not supplied.
 */
export async function updateCustomTableRow(
  organizationId: string,
  tableMonthId: string,
  rowId: string,
  input: UpdateCustomTableRowInput
): Promise<CustomTableRow> {
  const hasUpdates =
    input.rowData !== undefined ||
    input.operationalStatus !== undefined ||
    input.isHidden !== undefined ||
    input.position !== undefined;

  if (!hasUpdates) {
    const existing = await findCustomTableRowById(
      organizationId,
      tableMonthId,
      rowId
    );

    if (!existing) {
      throw new Error("Custom Table row was not found.");
    }

    return existing;
  }

  const { data, error } = await supabaseAdmin.rpc(
    "update_custom_table_row_atomic",
    {
      p_organization_id: organizationId,
      p_table_month_id: tableMonthId,
      p_row_id: rowId,
      p_row_data: input.rowData ?? null,
      p_operational_status: input.operationalStatus ?? null,
      p_is_hidden: input.isHidden ?? null,
      p_position: input.position ?? null,
    }
  );

  if (error) {
    throw new Error(
      `Failed to update Custom Table row: ${error.message}`
    );
  }

  return requireAtomicRow(data, "update");
}

/**
 * Hide a row without deleting it.
 */
export async function hideCustomTableRow(
  organizationId: string,
  tableMonthId: string,
  rowId: string
): Promise<CustomTableRow> {
  return updateCustomTableRow(
    organizationId,
    tableMonthId,
    rowId,
    { isHidden: true }
  );
}

/**
 * Restore a previously hidden row.
 */
export async function restoreCustomTableRow(
  organizationId: string,
  tableMonthId: string,
  rowId: string
): Promise<CustomTableRow> {
  return updateCustomTableRow(
    organizationId,
    tableMonthId,
    rowId,
    { isHidden: false }
  );
}

/**
 * Delete a row permanently through the atomic database function.
 *
 * Prefer hiding a row for ordinary operational removal.
 * This function is available for explicitly authorized
 * destructive workflows.
 */
export async function deleteCustomTableRow(
  organizationId: string,
  tableMonthId: string,
  rowId: string
): Promise<void> {
  const { data, error } = await supabaseAdmin.rpc(
    "delete_custom_table_row_atomic",
    {
      p_organization_id: organizationId,
      p_table_month_id: tableMonthId,
      p_row_id: rowId,
    }
  );

  if (error) {
    throw new Error(
      `Failed to delete Custom Table row: ${error.message}`
    );
  }

  if (data !== true) {
    throw new Error(
      "Atomic Custom Table row deletion was not confirmed."
    );
  }
}

/* ==========================================================
   Monthly Row Ordering
========================================================== */

/**
 * Persist a complete row ordering for one visibility section.
 *
 * The caller must pass every row ID in that section exactly
 * once, in the intended order.
 *
 * The database RPC validates the supplied IDs and updates
 * positions atomically. The service layer must authorize
 * this operation before calling the repository.
 *
 * IMPORTANT: This RPC uses the privileged server-side client
 * because the migration restricts function execution to service_role.
 * Never import this repository into client-side code.
 */
export async function saveCustomTableRowOrder(
  organizationId: string,
  tableMonthId: string,
  rowIds: string[],
  isHidden: boolean
): Promise<CustomTableRow[]> {
  const uniqueIds = new Set(rowIds);

  if (uniqueIds.size !== rowIds.length) {
    throw new Error("Row ordering contains duplicate row IDs.");
  }

  const { data, error } = await supabaseAdmin.rpc(
    "save_custom_table_row_order_atomic",
    {
      p_organization_id: organizationId,
      p_table_month_id: tableMonthId,
      p_row_ids: rowIds,
      p_is_hidden: isHidden,
    }
  );

  if (error) {
    throw new Error(
      `Failed to save Custom Table row order: ${error.message}`
    );
  }

  return ((data ?? []) as CustomTableRowRecord[]).map(mapRow);
}

/* ==========================================================
   Persistent Operational Rows
========================================================== */

/**
 * Load persistent current-state rows for one organization and
 * table definition.
 *
 * This uses the server-only service-role client because the
 * migration intentionally denies direct authenticated access.
 * The service layer must authorize the caller and verify tenant
 * ownership before invoking it.
 */
export async function loadCustomTableOperationalRows(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableOperationalRow[]> {
  const { data, error } = await supabaseAdmin
    .from("custom_table_operational_rows")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .order("is_hidden", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load persistent Custom Table rows: ${error.message}`
    );
  }

  return ((data ?? []) as CustomTableOperationalRowRecord[]).map(
    mapOperationalRow
  );
}

/**
 * Find one persistent row inside its organization and table.
 */
export async function findCustomTableOperationalRowById(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
): Promise<CustomTableOperationalRow | null> {
  const { data, error } = await supabaseAdmin
    .from("custom_table_operational_rows")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("table_definition_id", tableDefinitionId)
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find persistent Custom Table row: ${error.message}`
    );
  }

  return data
    ? mapOperationalRow(data as CustomTableOperationalRowRecord)
    : null;
}

/**
 * Create a persistent row using the atomic database RPC.
 */
export async function createCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowData?: CustomTableRowData;
  operationalStatus?: CustomTableOperationalStatus;
  isHidden?: boolean;
  position?: number;
}): Promise<CustomTableOperationalRow> {
  const { data, error } = await supabaseAdmin.rpc(
    "create_custom_table_operational_row_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_definition_id: input.tableDefinitionId,
      p_row_data: input.rowData ?? {},
      p_operational_status: input.operationalStatus ?? "in_progress",
      p_is_hidden: input.isHidden ?? false,
      p_position: input.position ?? null,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create persistent Custom Table row: ${error.message}`
    );
  }

  return requireAtomicOperationalRow(data, "creation");
}

/**
 * Update a persistent row using the atomic database RPC.
 */
export async function updateCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowId: string;
  rowData?: CustomTableRowData;
  operationalStatus?: CustomTableOperationalStatus;
  isHidden?: boolean;
  position?: number;
}): Promise<CustomTableOperationalRow> {
  const { data, error } = await supabaseAdmin.rpc(
    "update_custom_table_operational_row_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_definition_id: input.tableDefinitionId,
      p_row_id: input.rowId,
      p_row_data: input.rowData ?? null,
      p_operational_status: input.operationalStatus ?? null,
      p_is_hidden: input.isHidden ?? null,
      p_position: input.position ?? null,
    }
  );

  if (error) {
    throw new Error(
      `Failed to update persistent Custom Table row: ${error.message}`
    );
  }

  return requireAtomicOperationalRow(data, "update");
}

/**
 * Permanently delete one persistent row through the atomic RPC.
 *
 * Treat a false result as a failure rather than silently
 * reporting a successful deletion.
 */
export async function deleteCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowId: string;
}): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc(
    "delete_custom_table_operational_row_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_definition_id: input.tableDefinitionId,
      p_row_id: input.rowId,
    }
  );

  if (error) {
    throw new Error(
      `Failed to delete persistent Custom Table row: ${error.message}`
    );
  }

  if (data !== true) {
    throw new Error(
      "Persistent Custom Table row deletion was not confirmed."
    );
  }

  return true;
}

/**
 * Hide a persistent row without deleting its stored values.
 */
export async function hideCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowId: string;
}): Promise<CustomTableOperationalRow> {
  return updateCustomTableOperationalRow({
    ...input,
    isHidden: true,
  });
}

/**
 * Restore a hidden persistent row to the active list.
 */
export async function restoreCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowId: string;
}): Promise<CustomTableOperationalRow> {
  return updateCustomTableOperationalRow({
    ...input,
    isHidden: false,
  });
}

/**
 * Persist the complete ordering of one visibility section.
 *
 * The RPC validates the submitted IDs and updates positions
 * atomically, preventing partial order updates.
 */
export async function saveCustomTableOperationalRowOrder(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowIds: string[];
  isHidden: boolean;
}): Promise<CustomTableOperationalRow[]> {
  if (new Set(input.rowIds).size !== input.rowIds.length) {
    throw new Error(
      "Persistent row ordering contains duplicate row IDs."
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "save_custom_table_operational_row_order_atomic",
    {
      p_organization_id: input.organizationId,
      p_table_definition_id: input.tableDefinitionId,
      p_row_ids: input.rowIds,
      p_is_hidden: input.isHidden,
    }
  );

  if (error) {
    throw new Error(
      `Failed to save persistent Custom Table row order: ${error.message}`
    );
  }

  return ((data ?? []) as CustomTableOperationalRowRecord[]).map(
    mapOperationalRow
  );
}