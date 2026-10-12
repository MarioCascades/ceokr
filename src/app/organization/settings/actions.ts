
"use server";

import { listCustomTables } from "@/services/customtableservice";

/**
 * Returns the organization-owned Custom Tables needed to configure
 * Runtime navigation.
 *
 * Authorization is enforced by the Custom Tables service.
 * This action exposes only the fields needed by the navigation UI.
 */
export async function listRuntimeNavigationCustomTablesAction(
  organizationId: string
) {
  const normalizedOrganizationId = organizationId?.trim();

  if (!normalizedOrganizationId) {
    throw new Error("Organization is required.");
  }

  const tables = await listCustomTables(normalizedOrganizationId);

  return tables.map((table) => ({
    id: table.id,
    tableKey: table.tableKey,
    runtimeTabKey: table.runtimeTabKey,
    name: table.name,
    isEnabled: table.isEnabled,
  }));
}
