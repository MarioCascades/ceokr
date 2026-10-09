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
========================================================== */


/* ==========================================================
   Load Organization Navigation
========================================================== */

export async function loadRuntimeNavigationTabs(
  organizationId: string
): Promise<RuntimeNavigationTab[]> {
  return findRuntimeNavigationTabsByOrganization(
    organizationId
  );
}


/* ==========================================================
   Load Navigation Tab By Id
========================================================== */

export async function loadRuntimeNavigationTab(
  organizationId: string,
  tabId: string
): Promise<RuntimeNavigationTab | null> {
  return findRuntimeNavigationTabById(
    organizationId,
    tabId
  );
}


/* ==========================================================
   Load Navigation Tab By Key
========================================================== */

export async function loadRuntimeNavigationTabByKey(
  organizationId: string,
  tabKey: string
): Promise<RuntimeNavigationTab | null> {
  return findRuntimeNavigationTabByKey(
    organizationId,
    tabKey
  );
}


/* ==========================================================
   Create Navigation Tab
========================================================== */

export async function createRuntimeNavigationConfiguration(
  input: CreateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  return createRuntimeNavigationTab(
    input
  );
}


/* ==========================================================
   Update Navigation Tab
========================================================== */

export async function updateRuntimeNavigationConfiguration(
  organizationId: string,
  tabId: string,
  input: UpdateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  return updateRuntimeNavigationTab(
    organizationId,
    tabId,
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
  await deleteRuntimeNavigationTab(
    organizationId,
    tabId
  );
}