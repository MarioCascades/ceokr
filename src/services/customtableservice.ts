/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Custom Table Service
 * ----------------------------------------------------------
 * Coordinates Custom Table business rules, authorization,
 * organization ownership, monthly workspaces, and operational
 * row management.
 *
 * This is a server-side service.
 *
 * Permissions:
 * - custom_tables.view
 * - custom_tables.manage
 * - custom_tables.rows.edit
 * ==========================================================
 */
import "server-only";
import { requirePermission } from "@/lib/auth/authorization";
import { getAuthorizationContext } from "@/lib/auth/authorizationcontext";
import {
  loadCustomTableDefinitions,
  findCustomTableDefinitionById,
  findCustomTableDefinitionByKey,
  createCustomTableDefinition,
  updateCustomTableDefinition,
  deleteCustomTableDefinition,
  loadCustomTableColumns,
  createCustomTableColumn,
  updateCustomTableColumn,
  deleteCustomTableColumn,
  loadCustomTableMonths,
  findCustomTableMonthById,
  findCustomTableMonthByPerformanceMonth,
  createCustomTableMonth,
  updateCustomTableMonth,
  loadCustomTableRows,
  findCustomTableRowById,
  createCustomTableRow,
  updateCustomTableRow,
  hideCustomTableRow,
  restoreCustomTableRow,
  deleteCustomTableRow,
  saveCustomTableRowOrder,
  copyForwardCustomTableMonthAtomic,
  loadCustomTableOperationalRows,
  findCustomTableOperationalRowById,
  createCustomTableOperationalRow,
  updateCustomTableOperationalRow,
  deleteCustomTableOperationalRow,
  hideCustomTableOperationalRow,
  restoreCustomTableOperationalRow,
  saveCustomTableOperationalRowOrder,
} from "@/lib/repositories/customtablerepository";
import type {
  CustomTableDefinition,
  CreateCustomTableDefinitionInput,
  UpdateCustomTableDefinitionInput,
  CustomTableColumn,
  CreateCustomTableColumnInput,
  UpdateCustomTableColumnInput,
  CustomTableMonth,
  CreateCustomTableMonthInput,
  UpdateCustomTableMonthInput,
  CustomTableRow,
  CustomTableOperationalStatus,
  CustomTableRowData,
  CreateCustomTableRowInput,
  UpdateCustomTableRowInput,
  CustomTableWorkspace,
  CopyForwardCustomTableMonthInput,
} from "@/lib/types/domain/customtable";
import { RECRUITMENT_DEFAULT_COLUMNS } from "@/lib/types/domain/customtable";
import type { CustomTableOperationalRow } from "@/lib/repositories/customtablerepository";

/* ==========================================================
   Permission Keys
========================================================== */

const CUSTOM_TABLE_VIEW_PERMISSION = "custom_tables.view";
const CUSTOM_TABLE_MANAGE_PERMISSION = "custom_tables.manage";
const CUSTOM_TABLE_ROWS_EDIT_PERMISSION = "custom_tables.rows.edit";

/* ==========================================================
   Shared Validation
========================================================== */

function requireOrganizationId(organizationId: string): void {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }
}

function requireIdentifier(value: string, label: string): void {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`);
  }
}

function requirePerformanceMonth(performanceMonth: string): void {
  if (!/^\d{4}-(0[1-9]|1[0-2])-01$/.test(performanceMonth)) {
    throw new Error(
      "Performance month must use YYYY-MM-01 format."
    );
  }
}

/* ==========================================================
   Authorization and Ownership
========================================================== */

async function requireCustomTableView(
  organizationId: string
): Promise<void> {
  requireOrganizationId(organizationId);

  await requirePermission(
    organizationId,
    CUSTOM_TABLE_VIEW_PERMISSION
  );
}

async function requireCustomTableManage(
  organizationId: string
): Promise<void> {
  requireOrganizationId(organizationId);

  await requirePermission(
    organizationId,
    CUSTOM_TABLE_MANAGE_PERMISSION
  );
}

/**
 * Provisioning changes alter the organization-specific table
 * schema. Only a CascadEffects Platform Super Admin may create,
 * delete, or change table definitions and column definitions.
 */
async function requireCustomTableProvisioning(
  organizationId: string
): Promise<void> {
  requireOrganizationId(organizationId);

  const context = await getAuthorizationContext(organizationId);

  if (!context?.isPlatformSuperAdmin) {
    throw new Error(
      "Only a CascadEffects Platform Super Admin can provision or configure Custom Tables."
    );
  }
}

async function requireCustomTableRowsEdit(
  organizationId: string
): Promise<void> {
  requireOrganizationId(organizationId);

  await requirePermission(
    organizationId,
    CUSTOM_TABLE_ROWS_EDIT_PERMISSION
  );
}

async function requireOwnedDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  requireIdentifier(
    tableDefinitionId,
    "Custom Table definition ID"
  );

  const definition = await findCustomTableDefinitionById(
    organizationId,
    tableDefinitionId
  );

  if (!definition) {
    throw new Error(
      "Custom Table definition was not found in this organization."
    );
  }

  return definition;
}

/**
 * Require that a table belongs to the organization and is enabled.
 * Row-changing operations use this check so disabling a table
 * prevents edits through the service, not just through the UI.
 */
async function requireEnabledDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  const definition = await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  if (!definition.isEnabled) {
    throw new Error("This Custom Table is disabled.");
  }

  return definition;
}

/**
 * Monthly instances and carry-forward are only valid for
 * tables configured with monthly persistence.
 */
async function requireMonthlyDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  const definition = await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  if (definition.persistenceMode !== "monthly") {
    throw new Error(
      "This Custom Table uses persistent current-state rows and does not support monthly instances."
    );
  }

  return definition;
}

/**
 * Persistent operational rows are only valid for tables
 * configured with current-state persistence.
 */
async function requireCurrentStateDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  const definition = await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  if (definition.persistenceMode !== "current_state") {
    throw new Error(
      "This Custom Table uses monthly persistence and does not support persistent current-state rows."
    );
  }

  return definition;
}

async function requireEnabledCurrentStateDefinition(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  const definition = await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  if (definition.persistenceMode !== "current_state") {
    throw new Error(
      "This Custom Table does not use persistent current-state rows."
    );
  }

  return definition;
}

async function requireOwnedMonth(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string
): Promise<CustomTableMonth> {
  requireIdentifier(tableMonthId, "Custom Table month ID");

  await requireMonthlyDefinition(
    organizationId,
    tableDefinitionId
  );

  const month = await findCustomTableMonthById(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

  if (!month) {
    throw new Error(
      "Custom Table month was not found in this organization."
    );
  }

  return month;
}

function requireMonthEditable(month: CustomTableMonth): void {
  if (month.isFinalized) {
    throw new Error(
      "This Custom Table month is finalized and cannot be edited."
    );
  }
}

async function requireOwnedRow(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
): Promise<{
  month: CustomTableMonth;
  row: CustomTableRow;
}> {
  const month = await requireOwnedMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

  const row = await findCustomTableRowById(
    organizationId,
    tableMonthId,
    rowId
  );

  if (!row) {
    throw new Error(
      "Custom Table row was not found in this monthly instance."
    );
  }

  return { month, row };
}

/* ==========================================================
   Custom Table Definitions
========================================================== */

export async function listCustomTables(
  organizationId: string
): Promise<CustomTableDefinition[]> {
  await requireCustomTableView(organizationId);

  return loadCustomTableDefinitions(organizationId);
}

export async function getCustomTable(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableDefinition> {
  await requireCustomTableView(organizationId);

  return requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );
}

export async function getCustomTableByKey(
  organizationId: string,
  tableKey: string
): Promise<CustomTableDefinition> {
  await requireCustomTableView(organizationId);

  requireIdentifier(tableKey, "Custom Table key");

  const definition = await findCustomTableDefinitionByKey(
    organizationId,
    tableKey
  );

  if (!definition) {
    throw new Error("Custom Table was not found.");
  }

  return definition;
}

export async function createCustomTable(
  input: CreateCustomTableDefinitionInput
): Promise<CustomTableDefinition> {
  await requireCustomTableProvisioning(input.organizationId);

  requireIdentifier(input.tableKey, "Custom Table key");
  requireIdentifier(input.name, "Custom Table name");

  const existing = await findCustomTableDefinitionByKey(
    input.organizationId,
    input.tableKey
  );

  if (existing) {
    throw new Error(
      "A Custom Table with this key already exists in the organization."
    );
  }

  const definition = await createCustomTableDefinition(input);

  if (input.tableKey.trim().toLowerCase() === "recruitment") {
    try {
      for (const column of RECRUITMENT_DEFAULT_COLUMNS) {
        await createCustomTableColumn({
          organizationId: definition.organizationId,
          tableDefinitionId: definition.id,
          columnKey: column.columnKey,
          label: column.label,
          dataType: column.dataType,
          position: column.position,
          isRequired: column.isRequired,
          isVisible: column.isVisible,
          isEditable: column.isEditable,
          settings: column.settings,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      throw new Error(
        `Recruitment was created, but its default columns could not be initialized: ${message}`
      );
    }
  }

  return definition;
}

export async function editCustomTable(
  organizationId: string,
  tableDefinitionId: string,
  input: UpdateCustomTableDefinitionInput
): Promise<CustomTableDefinition> {
  requireOrganizationId(organizationId);

  const context = await getAuthorizationContext(organizationId);

  if (!context) {
    throw new Error("You must be signed in to manage Custom Tables.");
  }

  if (context.isPlatformSuperAdmin) {
    await requireCustomTableProvisioning(organizationId);
  } else {
    await requireCustomTableManage(organizationId);

    const submittedKeys = Object.keys(input);
    const containsOnlyEnablement =
      submittedKeys.length === 1 &&
      submittedKeys[0] === "isEnabled" &&
      typeof input.isEnabled === "boolean";

    if (!containsOnlyEnablement) {
      throw new Error(
        "Organization Admins can only enable or disable provisioned Custom Tables. Table definitions can only be changed by a CascadEffects Platform Super Admin."
      );
    }
  }

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  if (input.name !== undefined && !input.name.trim()) {
    throw new Error("Custom Table name cannot be empty.");
  }

  return updateCustomTableDefinition(
    organizationId,
    tableDefinitionId,
    input
  );
}

export async function removeCustomTable(
  organizationId: string,
  tableDefinitionId: string
): Promise<void> {
  await requireCustomTableProvisioning(organizationId);

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  await deleteCustomTableDefinition(
    organizationId,
    tableDefinitionId
  );
}

/* ==========================================================
   Custom Table Columns
========================================================== */

export async function listCustomTableColumns(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableColumn[]> {
  await requireCustomTableView(organizationId);

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  return loadCustomTableColumns(
    organizationId,
    tableDefinitionId
  );
}

export async function addCustomTableColumn(
  input: CreateCustomTableColumnInput
): Promise<CustomTableColumn> {
  await requireCustomTableProvisioning(input.organizationId);

  await requireOwnedDefinition(
    input.organizationId,
    input.tableDefinitionId
  );

  requireIdentifier(input.columnKey, "Column key");
  requireIdentifier(input.label, "Column label");

  const existingColumns = await loadCustomTableColumns(
    input.organizationId,
    input.tableDefinitionId
  );

  if (
    existingColumns.some(
      (column) => column.columnKey === input.columnKey
    )
  ) {
    throw new Error(
      "A column with this key already exists in the Custom Table."
    );
  }

  return createCustomTableColumn(input);
}

export async function editCustomTableColumn(
  organizationId: string,
  tableDefinitionId: string,
  columnId: string,
  input: UpdateCustomTableColumnInput
): Promise<CustomTableColumn> {
  await requireCustomTableProvisioning(organizationId);

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  const columns = await loadCustomTableColumns(
    organizationId,
    tableDefinitionId
  );

  if (!columns.some((column) => column.id === columnId)) {
    throw new Error("Custom Table column was not found.");
  }

  if (input.label !== undefined && !input.label.trim()) {
    throw new Error("Column label cannot be empty.");
  }

  return updateCustomTableColumn(
    organizationId,
    tableDefinitionId,
    columnId,
    input
  );
}

export async function removeCustomTableColumn(
  organizationId: string,
  tableDefinitionId: string,
  columnId: string
): Promise<void> {
  await requireCustomTableProvisioning(organizationId);

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  const columns = await loadCustomTableColumns(
    organizationId,
    tableDefinitionId
  );

  if (!columns.some((column) => column.id === columnId)) {
    throw new Error("Custom Table column was not found.");
  }

  await deleteCustomTableColumn(
    organizationId,
    tableDefinitionId,
    columnId
  );
}

/* ==========================================================
   Monthly Instances
========================================================== */

export async function listCustomTableMonths(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableMonth[]> {
  await requireCustomTableView(organizationId);

  await requireMonthlyDefinition(
    organizationId,
    tableDefinitionId
  );

  return loadCustomTableMonths(
    organizationId,
    tableDefinitionId
  );
}

export async function getOrCreateCustomTableMonth(
  organizationId: string,
  tableDefinitionId: string,
  performanceMonth: string
): Promise<CustomTableMonth> {
  await requireCustomTableView(organizationId);

  const definition = await requireMonthlyDefinition(
    organizationId,
    tableDefinitionId
  );

  requirePerformanceMonth(performanceMonth);

  const existing = await findCustomTableMonthByPerformanceMonth(
    organizationId,
    tableDefinitionId,
    performanceMonth
  );

  if (existing) {
    return existing;
  }

  await requireCustomTableRowsEdit(organizationId);

  if (!definition.isEnabled) {
    throw new Error(
      "This Custom Table is disabled. Enable it before creating a new monthly instance."
    );
  }

  return createCustomTableMonth({
    organizationId,
    tableDefinitionId,
    performanceMonth,
  } as CreateCustomTableMonthInput);
}

export async function editCustomTableMonth(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  input: UpdateCustomTableMonthInput
): Promise<CustomTableMonth> {
  await requireCustomTableManage(organizationId);

  await requireMonthlyDefinition(
    organizationId,
    tableDefinitionId
  );

  const month = await requireOwnedMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

  // A finalized month is immutable through this service.
  // This prevents changing its snapshot or setting isFinalized
  // back to false through the month-update operation.
  // An editable month can still be finalized by setting
  // input.isFinalized to true.
  requireMonthEditable(month);

  return updateCustomTableMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    input
  );
}

/* ==========================================================
   Monthly Workspace
========================================================== */

export async function loadCustomTableWorkspace(
  organizationId: string,
  tableDefinitionId: string,
  performanceMonth: string
): Promise<CustomTableWorkspace> {
  await requireCustomTableView(organizationId);

  requirePerformanceMonth(performanceMonth);

  const definition = await requireMonthlyDefinition(
    organizationId,
    tableDefinitionId
  );

  const month = await getOrCreateCustomTableMonth(
    organizationId,
    tableDefinitionId,
    performanceMonth
  );

  const [columns, rows] = await Promise.all([
    loadCustomTableColumns(
      organizationId,
      tableDefinitionId
    ),
    loadCustomTableRows(organizationId, month.id),
  ]);

  return {
    definition,
    columns,
    month,
    rows,
  };
}

/* ==========================================================
   Monthly Operational Rows
========================================================== */

export async function listCustomTableRows(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string
): Promise<CustomTableRow[]> {
  await requireCustomTableView(organizationId);

  await requireOwnedMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

  return loadCustomTableRows(
    organizationId,
    tableMonthId
  );
}

export async function addCustomTableRow(
  input: CreateCustomTableRowInput & {
    tableDefinitionId: string;
  }
): Promise<CustomTableRow> {
  await requireCustomTableRowsEdit(input.organizationId);

  const definition = await requireMonthlyDefinition(
    input.organizationId,
    input.tableDefinitionId
  );

  if (!definition.isEnabled) {
    throw new Error("This Custom Table is disabled.");
  }

  const month = await findCustomTableMonthById(
    input.organizationId,
    input.tableDefinitionId,
    input.tableMonthId
  );

  if (!month) {
    throw new Error(
      "Custom Table month was not found in this organization."
    );
  }

  requireMonthEditable(month);

  return createCustomTableRow({
    organizationId: input.organizationId,
    tableMonthId: input.tableMonthId,
    rowData: input.rowData,
    operationalStatus: input.operationalStatus,
    isHidden: input.isHidden,
    position: input.position,
  });
}

export async function editCustomTableRow(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string,
  input: UpdateCustomTableRowInput
): Promise<CustomTableRow> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  const { month } = await requireOwnedRow(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  requireMonthEditable(month);

  return updateCustomTableRow(
    organizationId,
    tableMonthId,
    rowId,
    input
  );
}

export async function hideCustomTableRowInWorkspace(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
): Promise<CustomTableRow> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  const { month } = await requireOwnedRow(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  requireMonthEditable(month);

  return hideCustomTableRow(
    organizationId,
    tableMonthId,
    rowId
  );
}

export async function restoreCustomTableRowInWorkspace(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
): Promise<CustomTableRow> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  const { month } = await requireOwnedRow(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  requireMonthEditable(month);

  return restoreCustomTableRow(
    organizationId,
    tableMonthId,
    rowId
  );
}

export async function removeCustomTableRow(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
): Promise<void> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  const { month } = await requireOwnedRow(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  requireMonthEditable(month);

  await deleteCustomTableRow(
    organizationId,
    tableMonthId,
    rowId
  );
}

export async function reorderCustomTableRows(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowIds: string[],
  isHidden: boolean
): Promise<CustomTableRow[]> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledDefinition(
    organizationId,
    tableDefinitionId
  );

  const month = await requireOwnedMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

  requireMonthEditable(month);

  return saveCustomTableRowOrder(
    organizationId,
    tableMonthId,
    rowIds,
    isHidden
  );
}

/* ==========================================================
   Carry Forward
========================================================== */

export async function copyForwardCustomTableMonth(
  input: CopyForwardCustomTableMonthInput
): Promise<CustomTableMonth> {
  await requireCustomTableRowsEdit(input.organizationId);

  const definition = await requireMonthlyDefinition(
    input.organizationId,
    input.tableDefinitionId
  );

  if (!definition.isEnabled) {
    throw new Error("This Custom Table is disabled.");
  }

  requirePerformanceMonth(input.sourcePerformanceMonth);
  requirePerformanceMonth(input.targetPerformanceMonth);

  if (
    input.sourcePerformanceMonth >=
    input.targetPerformanceMonth
  ) {
    throw new Error(
      "The target month must be later than the source month."
    );
  }

  const sourceMonth = await findCustomTableMonthByPerformanceMonth(
    input.organizationId,
    input.tableDefinitionId,
    input.sourcePerformanceMonth
  );

  if (!sourceMonth) {
    throw new Error("The source month was not found.");
  }

  const { month: targetMonth } =
    await copyForwardCustomTableMonthAtomic({
      organizationId: input.organizationId,
      tableDefinitionId: input.tableDefinitionId,
      sourceMonthId: sourceMonth.id,
      targetPerformanceMonth: input.targetPerformanceMonth,
    });

  return targetMonth;
}

/* ==========================================================
   Persistent Current-State Operational Rows
========================================================== */

/**
 * Load persistent rows for a current-state table.
 *
 * This path is used by operational lists such as VA Roster,
 * Agenda, and Client Performance. It deliberately does not
 * create or load a monthly instance.
 */
export async function listCustomTableOperationalRows(
  organizationId: string,
  tableDefinitionId: string
): Promise<CustomTableOperationalRow[]> {
  await requireCustomTableView(organizationId);

  // Enforce organization ownership, current-state persistence,
  // and enabled status before returning operational records.
  await requireEnabledCurrentStateDefinition(
    organizationId,
    tableDefinitionId
  );

  return loadCustomTableOperationalRows(
    organizationId,
    tableDefinitionId
  );
}

/**
 * Create a persistent row in a current-state table.
 */
export async function addCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowData?: CustomTableRowData;
  operationalStatus?: CustomTableOperationalStatus;
  isHidden?: boolean;
  position?: number;
}): Promise<CustomTableOperationalRow> {
  await requireCustomTableRowsEdit(input.organizationId);

  await requireEnabledCurrentStateDefinition(
    input.organizationId,
    input.tableDefinitionId
  );

  return createCustomTableOperationalRow(input);
}

/**
 * Update a persistent current-state row after verifying that
 * it belongs to the requested organization and table.
 */
export async function editCustomTableOperationalRow(input: {
  organizationId: string;
  tableDefinitionId: string;
  rowId: string;
  rowData?: CustomTableRowData;
  operationalStatus?: CustomTableOperationalStatus;
  isHidden?: boolean;
  position?: number;
}): Promise<CustomTableOperationalRow> {
  await requireCustomTableRowsEdit(input.organizationId);

  await requireEnabledCurrentStateDefinition(
    input.organizationId,
    input.tableDefinitionId
  );

  const row = await findCustomTableOperationalRowById(
    input.organizationId,
    input.tableDefinitionId,
    input.rowId
  );

  if (!row) {
    throw new Error(
      "Persistent Custom Table row was not found in this organization."
    );
  }

  return updateCustomTableOperationalRow(input);
}

/**
 * Hide a persistent row without deleting its data.
 */
export async function hideCustomTableOperationalRowInWorkspace(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
): Promise<CustomTableOperationalRow> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledCurrentStateDefinition(
    organizationId,
    tableDefinitionId
  );

  const row = await findCustomTableOperationalRowById(
    organizationId,
    tableDefinitionId,
    rowId
  );

  if (!row) {
    throw new Error(
      "Persistent Custom Table row was not found in this organization."
    );
  }

  return hideCustomTableOperationalRow({
    organizationId,
    tableDefinitionId,
    rowId,
  });
}

/**
 * Restore a hidden persistent row.
 */
export async function restoreCustomTableOperationalRowInWorkspace(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
): Promise<CustomTableOperationalRow> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledCurrentStateDefinition(
    organizationId,
    tableDefinitionId
  );

  const row = await findCustomTableOperationalRowById(
    organizationId,
    tableDefinitionId,
    rowId
  );

  if (!row) {
    throw new Error(
      "Persistent Custom Table row was not found in this organization."
    );
  }

  return restoreCustomTableOperationalRow({
    organizationId,
    tableDefinitionId,
    rowId,
  });
}

/**
 * Permanently remove a persistent row.
 *
 * Normal operational workflows should prefer hiding rows so
 * that they can be restored later.
 */
export async function removeCustomTableOperationalRow(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
): Promise<void> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledCurrentStateDefinition(
    organizationId,
    tableDefinitionId
  );

  const row = await findCustomTableOperationalRowById(
    organizationId,
    tableDefinitionId,
    rowId
  );

  if (!row) {
    throw new Error(
      "Persistent Custom Table row was not found in this organization."
    );
  }

  await deleteCustomTableOperationalRow({
    organizationId,
    tableDefinitionId,
    rowId,
  });
}

/**
 * Persist the ordering of rows in one visibility section of a
 * current-state table. The repository validates and saves the
 * order atomically.
 */
export async function reorderCustomTableOperationalRows(
  organizationId: string,
  tableDefinitionId: string,
  rowIds: string[],
  isHidden: boolean
): Promise<CustomTableOperationalRow[]> {
  await requireCustomTableRowsEdit(organizationId);

  await requireEnabledCurrentStateDefinition(
    organizationId,
    tableDefinitionId
  );

  return saveCustomTableOperationalRowOrder({
    organizationId,
    tableDefinitionId,
    rowIds,
    isHidden,
  });
}