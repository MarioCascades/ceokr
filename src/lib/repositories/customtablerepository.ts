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
 * - custom_table_rows
 *
 * This repository does not replace the application service
 * layer or authorization policies.
 * ==========================================================
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function mapRow(
  record: CustomTableRowRecord
): CustomTableRow {
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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
 * Create a Custom Table definition.
 *
 * Permission checks must be performed by the calling
 * service before this operation is exposed to a user.
 */
export async function createCustomTableDefinition(
  input: CreateCustomTableDefinitionInput
): Promise<CustomTableDefinition> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("custom_table_definitions")
    .insert({
      organization_id: input.organizationId,
      table_key: input.tableKey,
      name: input.name,
      description: input.description ?? null,
      runtime_tab_key: input.runtimeTabKey ?? null,
      is_enabled: input.isEnabled ?? true,
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
 * Update a definition without changing its stable table key.
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

  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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

  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
 * Create a monthly instance.
 *
 * If no snapshot is supplied, the current configured columns
 * are loaded and captured before creating the month.
 */
export async function createCustomTableMonth(
  input: CreateCustomTableMonthInput
): Promise<CustomTableMonth> {
  const existing = await findCustomTableMonthByPerformanceMonth(
    input.organizationId,
    input.tableDefinitionId,
    input.performanceMonth
  );

  if (existing) {
    return existing;
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

  const supabase = await createSupabaseServerClient();

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
    throw new Error(
      `Failed to create Custom Table month: ${error.message}`
    );
  }

  return mapMonth(data as CustomTableMonthRecord);
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

  const supabase = await createSupabaseServerClient();

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
   Operational Rows
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
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

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
 * Create an operational row.
 */
export async function createCustomTableRow(
  input: CreateCustomTableRowInput
): Promise<CustomTableRow> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("custom_table_rows")
    .insert({
      organization_id: input.organizationId,
      table_month_id: input.tableMonthId,
      row_data: input.rowData ?? {},
      operational_status:
        input.operationalStatus ?? "in_progress",
      is_hidden: input.isHidden ?? false,
      position: input.position ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create Custom Table row: ${error.message}`
    );
  }

  return mapRow(data as CustomTableRowRecord);
}

/**
 * Update the supplied row properties.
 *
 * Partial updates preserve values that were not supplied.
 */
export async function updateCustomTableRow(
  organizationId: string,
  tableMonthId: string,
  rowId: string,
  input: UpdateCustomTableRowInput
): Promise<CustomTableRow> {
  const updates: {
    row_data?: CustomTableRowData;
    operational_status?: CustomTableOperationalStatus;
    is_hidden?: boolean;
    position?: number;
  } = {};

  if (input.rowData !== undefined) {
    updates.row_data = input.rowData;
  }

  if (input.operationalStatus !== undefined) {
    updates.operational_status = input.operationalStatus;
  }

  if (input.isHidden !== undefined) {
    updates.is_hidden = input.isHidden;
  }

  if (input.position !== undefined) {
    updates.position = input.position;
  }

  if (Object.keys(updates).length === 0) {
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

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("custom_table_rows")
    .update(updates)
    .eq("organization_id", organizationId)
    .eq("table_month_id", tableMonthId)
    .eq("id", rowId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update Custom Table row: ${error.message}`
    );
  }

  return mapRow(data as CustomTableRowRecord);
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
 * Delete a row permanently.
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
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("custom_table_rows")
    .delete()
    .eq("organization_id", organizationId)
    .eq("table_month_id", tableMonthId)
    .eq("id", rowId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete Custom Table row: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("Custom Table row was not found.");
  }
}

/* ==========================================================
   Row Ordering
========================================================== */

/**
 * Persist a complete row ordering for one visibility section.
 *
 * The caller must pass every row ID in that section exactly
 * once, in the intended order.
 *
 * Updates are organization- and month-scoped. This operation
 * is not atomic: use a database RPC/transaction before relying
 * on concurrent multi-user reordering in production.
 */
export async function saveCustomTableRowOrder(
  organizationId: string,
  tableMonthId: string,
  rowIds: string[],
  isHidden: boolean
): Promise<CustomTableRow[]> {
  const uniqueIds = new Set(rowIds);

  if (uniqueIds.size !== rowIds.length) {
    throw new Error(
      "Row ordering contains duplicate row IDs."
    );
  }

  const currentRows = await loadCustomTableRows(
    organizationId,
    tableMonthId
  );

  const sectionRows = currentRows.filter(
    (row) => row.isHidden === isHidden
  );

  const expectedIds = new Set(
    sectionRows.map((row) => row.id)
  );

  if (
    expectedIds.size !== uniqueIds.size ||
    rowIds.some((rowId) => !expectedIds.has(rowId))
  ) {
    throw new Error(
      "Row ordering must contain every row in the selected section."
    );
  }

  for (
    let position = 0;
    position < rowIds.length;
    position += 1
  ) {
    const rowId = rowIds[position];
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("custom_table_rows")
      .update({ position })
      .eq("organization_id", organizationId)
      .eq("table_month_id", tableMonthId)
      .eq("id", rowId)
      .eq("is_hidden", isHidden)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to save Custom Table row order: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        `Could not update row order for row ${rowId}.`
      );
    }
  }

  return loadCustomTableRows(
    organizationId,
    tableMonthId
  );
}