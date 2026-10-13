
"use server";

import { requirePermission } from "@/lib/auth/authorization";
import { listCustomTables } from "@/services/customtableservice";
import {
  createRuntimeNavigationConfiguration,
  loadRuntimeNavigationTabs,
  updateRuntimeNavigationConfiguration,
} from "@/services/runtimenavigation.service";

import type {
  CreateRuntimeNavigationTabInput,
  UpdateRuntimeNavigationTabInput,
} from "@/lib/types/domain/runtimenavigationtab";

/**
 * Returns the organization-owned Custom Tables needed to configure
 * Runtime navigation.
 *
 * Authorization is enforced by the Custom Tables service.
 * Only the fields required by the navigation UI are exposed.
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

/**
 * Load Runtime Navigation for an organization.
 */
export async function loadRuntimeNavigationTabsAction(
  organizationId: string
) {
  const normalizedOrganizationId = organizationId?.trim();

  if (!normalizedOrganizationId) {
    throw new Error("Organization is required.");
  }

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.view"
  );

  return loadRuntimeNavigationTabs(normalizedOrganizationId);
}

/**
 * Create an organization Runtime Navigation entry.
 */
export async function createRuntimeNavigationConfigurationAction(
  input: CreateRuntimeNavigationTabInput
) {
  const organizationId = input.organizationId?.trim();

  if (!organizationId) {
    throw new Error("Organization is required.");
  }

  await requirePermission(
    organizationId,
    "custom_tables.manage"
  );

  return createRuntimeNavigationConfiguration({
    ...input,
    organizationId,
  });
}

/**
 * Update an existing organization Runtime Navigation entry.
 */
export async function updateRuntimeNavigationConfigurationAction(
  organizationId: string,
  tabId: string,
  input: UpdateRuntimeNavigationTabInput
) {
  const normalizedOrganizationId = organizationId?.trim();
  const normalizedTabId = tabId?.trim();

  if (!normalizedOrganizationId) {
    throw new Error("Organization is required.");
  }

  if (!normalizedTabId) {
    throw new Error("Runtime Navigation tab is required.");
  }

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.manage"
  );

  return updateRuntimeNavigationConfiguration(
    normalizedOrganizationId,
    normalizedTabId,
    input
  );
}
