"use server";

import { revalidatePath } from "next/cache";
import {
  addCustomTableColumn,
  editCustomTableColumn,
  removeCustomTableColumn,
} from "@/services/customtableservice";
import type {
  CreateCustomTableColumnInput,
  UpdateCustomTableColumnInput,
} from "@/lib/types/domain/customtable";

export type CustomTableColumnActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);

  return value === "true" || value === "on" || value === "1";
}

function readPosition(formData: FormData): number | null {
  const value = readString(formData, "position");

  if (!value) {
    return 0;
  }

  const position = Number(value);

  if (!Number.isInteger(position) || position < 0) {
    return null;
  }

  return position;
}

function validateContext(formData: FormData) {
  const organizationId = readString(formData, "organizationId");
  const tableDefinitionId = readString(
    formData,
    "tableDefinitionId"
  );

  if (!organizationId || !tableDefinitionId) {
    throw new Error(
      "Organization and Custom Table identifiers are required."
    );
  }

  return { organizationId, tableDefinitionId };
}

function revalidateTable(
  organizationId: string,
  tableDefinitionId: string
) {
  revalidatePath("/organization/customtables");
  revalidatePath(
    `/organization/customtables/${tableDefinitionId}`
  );
  revalidatePath(
    `/organization/customtables/${tableDefinitionId}?organizationId=${encodeURIComponent(
      organizationId
    )}`
  );
}

export async function addCustomTableColumnAction(
  formData: FormData
): Promise<CustomTableColumnActionResult> {
  try {
    const { organizationId, tableDefinitionId } =
      validateContext(formData);

    const columnKey = readString(formData, "columnKey");
    const label = readString(formData, "label");
    const dataType = readString(formData, "dataType");
    const position = readPosition(formData);

    if (!columnKey) {
      throw new Error("Column key is required.");
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(columnKey)) {
      throw new Error(
        "Column key must start with a letter and contain only letters, numbers, and underscores."
      );
    }

    if (columnKey.length > 100) {
      throw new Error("Column key cannot exceed 100 characters.");
    }

    if (!label) {
      throw new Error("Column label is required.");
    }

    if (label.length > 120) {
      throw new Error("Column label cannot exceed 120 characters.");
    }

    const allowedDataTypes = [
      "text",
      "textarea",
      "number",
      "date",
      "boolean",
      "select",
      "status",
    ];

    if (!allowedDataTypes.includes(dataType)) {
      throw new Error("Select a supported column data type.");
    }

    if (position === null) {
      throw new Error(
        "Position must be a non-negative whole number."
      );
    }

    const input: CreateCustomTableColumnInput = {
      organizationId,
      tableDefinitionId,
      columnKey,
      label,
      dataType: dataType as CreateCustomTableColumnInput["dataType"],
      position,
      isRequired: readBoolean(formData, "isRequired"),
      isVisible: readBoolean(formData, "isVisible"),
      isEditable: readBoolean(formData, "isEditable"),
      settings: {},
    };

    await addCustomTableColumn(input);

    revalidateTable(organizationId, tableDefinitionId);

    return {
      success: true,
      message: "Column added successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to add the column.",
    };
  }
}

export async function editCustomTableColumnAction(
  formData: FormData
): Promise<CustomTableColumnActionResult> {
  try {
    const { organizationId, tableDefinitionId } =
      validateContext(formData);

    const columnId = readString(formData, "columnId");
    const label = readString(formData, "label");
    const position = readPosition(formData);

    if (!columnId) {
      throw new Error("Column identifier is required.");
    }

    if (!label) {
      throw new Error("Column label is required.");
    }

    if (label.length > 120) {
      throw new Error("Column label cannot exceed 120 characters.");
    }

    if (position === null) {
      throw new Error(
        "Position must be a non-negative whole number."
      );
    }

    const dataType = readString(formData, "dataType");

    const allowedDataTypes = [
      "text",
      "textarea",
      "number",
      "date",
      "boolean",
      "select",
      "status",
    ];

    if (!allowedDataTypes.includes(dataType)) {
      throw new Error("Select a supported column data type.");
    }

    const input: UpdateCustomTableColumnInput = {
      label,
      dataType: dataType as UpdateCustomTableColumnInput["dataType"],
      position,
      isRequired: readBoolean(formData, "isRequired"),
      isVisible: readBoolean(formData, "isVisible"),
      isEditable: readBoolean(formData, "isEditable"),
    };

    await editCustomTableColumn(
      organizationId,
      tableDefinitionId,
      columnId,
      input
    );

    revalidateTable(organizationId, tableDefinitionId);

    return {
      success: true,
      message: "Column updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update the column.",
    };
  }
}

export async function removeCustomTableColumnAction(
  formData: FormData
): Promise<CustomTableColumnActionResult> {
  try {
    const { organizationId, tableDefinitionId } =
      validateContext(formData);

    const columnId = readString(formData, "columnId");

    if (!columnId) {
      throw new Error("Column identifier is required.");
    }

    await removeCustomTableColumn(
      organizationId,
      tableDefinitionId,
      columnId
    );

    revalidateTable(organizationId, tableDefinitionId);

    return {
      success: true,
      message: "Column removed successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove the column.",
    };
  }
}