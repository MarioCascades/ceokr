
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
}

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
