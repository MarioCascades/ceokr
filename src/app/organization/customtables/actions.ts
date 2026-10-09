"use server";

import { revalidatePath } from "next/cache";
import { createCustomTable } from "@/services/customtableservice";
import type {
  CreateCustomTableDefinitionInput,
  CustomTableDefinition,
} from "@/lib/types/domain/customtable";

export type CreateCustomTableActionResult =
  | {
      success: true;
      table: CustomTableDefinition;
    }
  | {
      success: false;
      error: string;
    };

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function isValidKey(value: string): boolean {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value);
}

function readString(
  formData: FormData,
  key: string
): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function createCustomTableAction(
  formData: FormData
): Promise<CreateCustomTableActionResult> {
  try {
    const organizationId = readString(
      formData,
      "organizationId"
    );

    const name = readString(formData, "name");
    const tableKey = normalizeKey(
      readString(formData, "tableKey")
    );
    const description = readString(
      formData,
      "description"
    );
    const submittedRuntimeTabKey = readString(
      formData,
      "runtimeTabKey"
    );

    const runtimeTabKey = submittedRuntimeTabKey
      ? normalizeKey(submittedRuntimeTabKey)
      : tableKey;

    const isEnabledValue = formData.get("isEnabled");
    const isEnabled =
      isEnabledValue === "true" ||
      isEnabledValue === "on" ||
      isEnabledValue === "1";

    if (!organizationId) {
      return {
        success: false,
        error: "Organization is required.",
      };
    }

    if (!name) {
      return {
        success: false,
        error: "Table name is required.",
      };
    }

    if (name.length > 120) {
      return {
        success: false,
        error: "Table name cannot exceed 120 characters.",
      };
    }

    if (!tableKey || !isValidKey(tableKey)) {
      return {
        success: false,
        error:
          "Enter a valid table key using lowercase letters, numbers, hyphens, or underscores.",
      };
    }

    if (tableKey.length > 100) {
      return {
        success: false,
        error: "Table key cannot exceed 100 characters.",
      };
    }

    if (!runtimeTabKey || !isValidKey(runtimeTabKey)) {
      return {
        success: false,
        error:
          "Enter a valid Runtime tab key using lowercase letters, numbers, hyphens, or underscores.",
      };
    }

    if (runtimeTabKey.length > 100) {
      return {
        success: false,
        error:
          "Runtime tab key cannot exceed 100 characters.",
      };
    }

    if (description.length > 1000) {
      return {
        success: false,
        error: "Description cannot exceed 1,000 characters.",
      };
    }

    const input: CreateCustomTableDefinitionInput = {
      organizationId,
      name,
      tableKey,
      description,
      runtimeTabKey,
      isEnabled,
    };

    // The service enforces the custom_tables.manage permission
    // and checks whether the table key already exists.
    const table = await createCustomTable(input);

    revalidatePath("/organization/customtables");
    revalidatePath(
      `/organization/customtables/${table.id}`
    );
    revalidatePath("/runtime");

    return {
      success: true,
      table,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create the Custom Table. Please try again.",
    };
  }
}