import "server-only";

import { requirePermission } from "@/lib/auth/authorization";

import {
  createRuntimeNavigationTab,
  deleteRuntimeNavigationTab,
  findRuntimeNavigationTabById,
  findRuntimeNavigationTabByKey,
  findRuntimeNavigationTabsByOrganization,
  updateRuntimeNavigationTab,
} from "@/lib/repositories/runtimenavigationtabrepository";

import type {
  RuntimeNavigationTab,
  CreateRuntimeNavigationTabInput,
  UpdateRuntimeNavigationTabInput,
} from "@/lib/types/domain/runtimenavigationtab";

/* ==========================================================
   Runtime Navigation Service
   ----------------------------------------------------------
   Organization-level Runtime navigation configuration.
   ----------------------------------------------------------
   The service layer coordinates Runtime navigation behavior
   while persistence remains owned by the repository.
   All operations require server-side authorization before
   accessing the privileged repository.
========================================================== */

/* ==========================================================
   Validation
========================================================== */

function requireOrganizationId(organizationId: string): string {
  const normalizedOrganizationId = organizationId?.trim();

  if (!normalizedOrganizationId) {
    throw new Error("Organization is required.");
  }

  return normalizedOrganizationId;
}

function requireTabId(tabId: string): string {
  const normalizedTabId = tabId?.trim();

  if (!normalizedTabId) {
    throw new Error("Runtime Navigation tab is required.");
  }

  return normalizedTabId;
}

/* ==========================================================
   Load Organization Navigation
========================================================== */

export async function loadRuntimeNavigationTabs(
  organizationId: string
): Promise<RuntimeNavigationTab[]> {
  const normalizedOrganizationId =
    requireOrganizationId(organizationId);

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.view"
  );

  return findRuntimeNavigationTabsByOrganization(
    normalizedOrganizationId
  );
}

/* ==========================================================
   Load Navigation Tab By Id
========================================================== */

export async function loadRuntimeNavigationTab(
  organizationId: string,
  tabId: string
): Promise<RuntimeNavigationTab | null> {
  const normalizedOrganizationId =
    requireOrganizationId(organizationId);

  const normalizedTabId = requireTabId(tabId);

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.view"
  );

  return findRuntimeNavigationTabById(
    normalizedOrganizationId,
    normalizedTabId
  );
}

/* ==========================================================
   Load Navigation Tab By Key
========================================================== */

export async function loadRuntimeNavigationTabByKey(
  organizationId: string,
  tabKey: string
): Promise<RuntimeNavigationTab | null> {
  const normalizedOrganizationId =
    requireOrganizationId(organizationId);

  const normalizedTabKey = tabKey?.trim();

  if (!normalizedTabKey) {
    throw new Error("Runtime Navigation tab key is required.");
  }

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.view"
  );

  return findRuntimeNavigationTabByKey(
    normalizedOrganizationId,
    normalizedTabKey
  );
}

/* ==========================================================
   Create Navigation Tab
========================================================== */

export async function createRuntimeNavigationConfiguration(
  input: CreateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  const organizationId = requireOrganizationId(
    input.organizationId
  );

  await requirePermission(
    organizationId,
    "custom_tables.manage"
  );

  return createRuntimeNavigationTab({
    ...input,
    organizationId,
  });
}

/* ==========================================================
   Update Navigation Tab
========================================================== */

export async function updateRuntimeNavigationConfiguration(
  organizationId: string,
  tabId: string,
  input: UpdateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  const normalizedOrganizationId =
    requireOrganizationId(organizationId);

  const normalizedTabId = requireTabId(tabId);

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.manage"
  );

  return updateRuntimeNavigationTab(
    normalizedOrganizationId,
    normalizedTabId,
    input
  );
}

/* ==========================================================
   Delete Navigation Tab
========================================================== */

export async function removeRuntimeNavigationConfiguration(
  organizationId: string,
  tabId: string
): Promise<void> {
  const normalizedOrganizationId =
    requireOrganizationId(organizationId);

  const normalizedTabId = requireTabId(tabId);

  await requirePermission(
    normalizedOrganizationId,
    "custom_tables.manage"
  );

  await deleteRuntimeNavigationTab(
    normalizedOrganizationId,
    normalizedTabId
  );
}