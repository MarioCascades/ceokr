
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
  CreateCustomTableRowInput,
  UpdateCustomTableRowInput,
  CustomTableWorkspace,
  CopyForwardCustomTableMonthInput,
} from "@/lib/types/domain/customtable";

import { RECRUITMENT_DEFAULT_COLUMNS } from "@/lib/types/domain/customtable";

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

async function requireOwnedMonth(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string
): Promise<CustomTableMonth> {
  requireIdentifier(tableMonthId, "Custom Table month ID");

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
  await requireCustomTableManage(input.organizationId);

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
  await requireCustomTableManage(organizationId);

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
  await requireCustomTableManage(organizationId);

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
  await requireCustomTableManage(input.organizationId);

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
  await requireCustomTableManage(organizationId);

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
  await requireCustomTableManage(organizationId);

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

  await requireOwnedDefinition(
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

  const definition = await requireOwnedDefinition(
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

  await requireOwnedDefinition(
    organizationId,
    tableDefinitionId
  );

  await requireOwnedMonth(
    organizationId,
    tableDefinitionId,
    tableMonthId
  );

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

  const definition = await requireOwnedDefinition(
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
   Operational Rows
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

  const definition = await requireOwnedDefinition(
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

  const definition = await requireOwnedDefinition(
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

  const existingTarget = await findCustomTableMonthByPerformanceMonth(
    input.organizationId,
    input.tableDefinitionId,
    input.targetPerformanceMonth
  );

  if (existingTarget) {
    return existingTarget;
  }

  const sourceRows = await loadCustomTableRows(
    input.organizationId,
    sourceMonth.id
  );

  const targetMonth = await createCustomTableMonth({
    organizationId: input.organizationId,
    tableDefinitionId: input.tableDefinitionId,
    performanceMonth: input.targetPerformanceMonth,
  } as CreateCustomTableMonthInput);

  const rowsToCarryForward = sourceRows.filter(
    (row) =>
      !row.isHidden &&
      row.operationalStatus !== "completed"
  );

  for (
    let position = 0;
    position < rowsToCarryForward.length;
    position += 1
  ) {
    const sourceRow = rowsToCarryForward[position];

    await createCustomTableRow({
      organizationId: input.organizationId,
      tableMonthId: targetMonth.id,
      rowData: { ...sourceRow.rowData },
      operationalStatus: sourceRow.operationalStatus,
      isHidden: false,
      position,
    });
  }

  return targetMonth;
}
