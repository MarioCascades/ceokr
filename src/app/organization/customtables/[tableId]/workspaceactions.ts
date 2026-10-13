
"use server";

import { revalidatePath } from "next/cache";

import {
  loadCustomTableWorkspace,
  addCustomTableRow,
  editCustomTableRow,
  hideCustomTableRowInWorkspace,
  restoreCustomTableRowInWorkspace,
  reorderCustomTableRows,
  copyForwardCustomTableMonth,
  listCustomTableOperationalRows,
  addCustomTableOperationalRow,
  editCustomTableOperationalRow,
  hideCustomTableOperationalRowInWorkspace,
  restoreCustomTableOperationalRowInWorkspace,
  removeCustomTableOperationalRow,
  reorderCustomTableOperationalRows,
} from "@/services/customtableservice";

import type {
  CopyForwardCustomTableMonthInput,
  CreateCustomTableRowInput,
  UpdateCustomTableRowInput,
} from "@/lib/types/domain/customtable";

type WorkspaceActionContext = {
  organizationId: string;
  tableDefinitionId: string;
};

type WorkspaceRowContext = WorkspaceActionContext & {
  tableMonthId: string;
  rowId: string;
};

type OperationalRowContext = WorkspaceActionContext & {
  rowId: string;
};

type AddOperationalRowInput = Parameters<
  typeof addCustomTableOperationalRow
>[0];

type EditOperationalRowInput = Omit<
  Parameters<typeof editCustomTableOperationalRow>[0],
  "organizationId" | "tableDefinitionId" | "rowId"
>;

function requireValue(value: string, label: string): void {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`);
  }
}

function validateWorkspaceContext(
  context: WorkspaceActionContext
): void {
  requireValue(context.organizationId, "Organization ID");
  requireValue(context.tableDefinitionId, "Custom Table ID");
}

function validateRowContext(context: WorkspaceRowContext): void {
  validateWorkspaceContext(context);
  requireValue(context.tableMonthId, "Table month ID");
  requireValue(context.rowId, "Row ID");
}

function validateOperationalRowContext(
  context: OperationalRowContext
): void {
  validateWorkspaceContext(context);
  requireValue(context.rowId, "Operational row ID");
}

function revalidateWorkspace(
  organizationId: string,
  tableDefinitionId: string
): void {
  const query = `organizationId=${encodeURIComponent(
    organizationId
  )}`;

  revalidatePath("/organization/customtables");

  revalidatePath(
    `/organization/customtables/${encodeURIComponent(
      tableDefinitionId
    )}?${query}`
  );

  revalidatePath("/runtime");
}

/*
 * MONTHLY WORKSPACE ACTIONS
 *
 * Recruitment continues to use month-specific records, historical
 * workspaces, finalization rules, and carry-forward functionality.
 */

export async function loadCustomTableWorkspaceAction(
  organizationId: string,
  tableDefinitionId: string,
  performanceMonth: string
) {
  const context = {
    organizationId,
    tableDefinitionId,
  };

  validateWorkspaceContext(context);
  requireValue(performanceMonth, "Performance month");

  return loadCustomTableWorkspace(
    organizationId,
    tableDefinitionId,
    performanceMonth
  );
}

export async function addCustomTableRowAction(
  input: CreateCustomTableRowInput & {
    tableDefinitionId: string;
  }
) {
  validateWorkspaceContext({
    organizationId: input.organizationId,
    tableDefinitionId: input.tableDefinitionId,
  });

  requireValue(input.tableMonthId, "Table month ID");

  const row = await addCustomTableRow(input);

  revalidateWorkspace(
    input.organizationId,
    input.tableDefinitionId
  );

  return row;
}

export async function editCustomTableRowAction(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string,
  input: UpdateCustomTableRowInput
) {
  const context = {
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId,
  };

  validateRowContext(context);

  const row = await editCustomTableRow(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId,
    input
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function hideCustomTableRowAction(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
) {
  const context = {
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId,
  };

  validateRowContext(context);

  const row = await hideCustomTableRowInWorkspace(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function restoreCustomTableRowAction(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowId: string
) {
  const context = {
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId,
  };

  validateRowContext(context);

  const row = await restoreCustomTableRowInWorkspace(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowId
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function reorderCustomTableRowsAction(
  organizationId: string,
  tableDefinitionId: string,
  tableMonthId: string,
  rowIds: string[],
  isHidden: boolean
) {
  validateWorkspaceContext({
    organizationId,
    tableDefinitionId,
  });

  requireValue(tableMonthId, "Table month ID");

  if (!Array.isArray(rowIds)) {
    throw new Error("Row ordering must be an array of row IDs.");
  }

  if (rowIds.some((rowId) => !rowId?.trim())) {
    throw new Error("Row ordering contains an invalid row ID.");
  }

  if (new Set(rowIds).size !== rowIds.length) {
    throw new Error("Row ordering contains duplicate row IDs.");
  }

  const rows = await reorderCustomTableRows(
    organizationId,
    tableDefinitionId,
    tableMonthId,
    rowIds,
    isHidden
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return rows;
}

export async function copyForwardCustomTableMonthAction(
  input: CopyForwardCustomTableMonthInput
) {
  validateWorkspaceContext({
    organizationId: input.organizationId,
    tableDefinitionId: input.tableDefinitionId,
  });

  requireValue(
    input.sourcePerformanceMonth,
    "Source performance month"
  );

  requireValue(
    input.targetPerformanceMonth,
    "Target performance month"
  );

  const month = await copyForwardCustomTableMonth(input);

  revalidateWorkspace(
    input.organizationId,
    input.tableDefinitionId
  );

  return month;
}

/*
 * PERSISTENT OPERATIONAL ROW ACTIONS
 *
 * These actions operate on current-state records and deliberately
 * do not accept a tableMonthId or performance month.
 *
 * VA Roster, Agenda, and Client Performance use persistent rows.
 * Recruitment continues to use the monthly actions above.
 */

export async function listCustomTableOperationalRowsAction(
  organizationId: string,
  tableDefinitionId: string
) {
  validateWorkspaceContext({
    organizationId,
    tableDefinitionId,
  });

  return listCustomTableOperationalRows(
    organizationId,
    tableDefinitionId
  );
}

export async function addCustomTableOperationalRowAction(
  input: AddOperationalRowInput
) {
  validateWorkspaceContext({
    organizationId: input.organizationId,
    tableDefinitionId: input.tableDefinitionId,
  });

  const row = await addCustomTableOperationalRow(input);

  revalidateWorkspace(
    input.organizationId,
    input.tableDefinitionId
  );

  return row;
}

export async function editCustomTableOperationalRowAction(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string,
  input: EditOperationalRowInput
) {
  validateOperationalRowContext({
    organizationId,
    tableDefinitionId,
    rowId,
  });

  const row = await editCustomTableOperationalRow({
    ...input,
    organizationId,
    tableDefinitionId,
    rowId,
  });

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function hideCustomTableOperationalRowAction(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
) {
  validateOperationalRowContext({
    organizationId,
    tableDefinitionId,
    rowId,
  });

  const row = await hideCustomTableOperationalRowInWorkspace(
    organizationId,
    tableDefinitionId,
    rowId
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function restoreCustomTableOperationalRowAction(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
) {
  validateOperationalRowContext({
    organizationId,
    tableDefinitionId,
    rowId,
  });

  const row = await restoreCustomTableOperationalRowInWorkspace(
    organizationId,
    tableDefinitionId,
    rowId
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function removeCustomTableOperationalRowAction(
  organizationId: string,
  tableDefinitionId: string,
  rowId: string
) {
  validateOperationalRowContext({
    organizationId,
    tableDefinitionId,
    rowId,
  });

  const row = await removeCustomTableOperationalRow(
    organizationId,
    tableDefinitionId,
    rowId
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return row;
}

export async function reorderCustomTableOperationalRowsAction(
  organizationId: string,
  tableDefinitionId: string,
  rowIds: string[],
  isHidden: boolean
) {
  validateWorkspaceContext({
    organizationId,
    tableDefinitionId,
  });

  if (!Array.isArray(rowIds)) {
    throw new Error(
      "Operational row ordering must be an array of row IDs."
    );
  }

  if (rowIds.some((rowId) => !rowId?.trim())) {
    throw new Error(
      "Operational row ordering contains an invalid row ID."
    );
  }

  if (new Set(rowIds).size !== rowIds.length) {
    throw new Error(
      "Operational row ordering contains duplicate row IDs."
    );
  }

  const rows = await reorderCustomTableOperationalRows(
    organizationId,
    tableDefinitionId,
    rowIds,
    isHidden
  );

  revalidateWorkspace(
    organizationId,
    tableDefinitionId
  );

  return rows;
}
