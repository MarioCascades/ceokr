
/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Service
 * ----------------------------------------------------------
 * Coordinates Client Performance workspace access,
 * organization ownership, permissions, validation,
 * and persistence.
 *
 * This is a server-side service.
 *
 * Access:
 * - CascadEffects organization only
 * - Platform Super Admin
 * - Organization users with the appropriate permissions
 *
 * Database writes are delegated to the atomic persistence
 * repository.
 * ==========================================================
 */

import "server-only";

import { requirePermission } from "@/lib/auth/authorization";
import { getAuthorizationContext } from "@/lib/auth/authorizationcontext";

import {
  loadClientPerformanceClients,
  findClientPerformanceClientById,
  findClientPerformanceSnapshot,
  loadClientPerformanceMonthlyMetrics,
  loadClientPerformanceInitiatives,
  loadClientPerformanceYearVisibility,
} from "@/lib/repositories/clientperformancerepository";

import {
  saveClientPerformanceWorkspaceAtomic,
  addClientPerformanceYearAtomic,
  setClientPerformanceYearVisibilityAtomic,
  addClientPerformanceInitiativeAtomic,
} from "@/lib/repositories/clientperformancewriterepository";

import type {
  ClientPerformanceClient,
  ClientPerformanceWorkspace,
  GetClientPerformanceWorkspaceInput,
  SaveClientPerformanceWorkspaceInput,
  ClientPerformanceSnapshotField,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Organization and Permission Constants
========================================================== */

const CASCADEFFECTS_ORGANIZATION_ID =
  "e571cd65-b7f8-4669-bb41-370806097792";

const CLIENT_PERFORMANCE_VIEW_PERMISSION =
  "custom_tables.view";

const CLIENT_PERFORMANCE_MANAGE_PERMISSION =
  "custom_tables.manage";

/* ==========================================================
   Shared Validation
========================================================== */

function requireOrganizationId(
  organizationId: string
): void {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }
}

function requireIdentifier(
  value: string,
  label: string
): void {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`);
  }
}

function requirePerformanceYear(
  performanceYear: number
): void {
  if (
    !Number.isInteger(performanceYear) ||
    performanceYear < 2000 ||
    performanceYear > 9999
  ) {
    throw new Error("A valid performance year is required.");
  }
}

function requireCascadEffectsOrganization(
  organizationId: string
): void {
  requireOrganizationId(organizationId);

  if (
    organizationId !==
    CASCADEFFECTS_ORGANIZATION_ID
  ) {
    throw new Error(
      "Client Performance is only available to the CascadEffects organization."
    );
  }
}

/* ==========================================================
   Authorization
========================================================== */

/**
 * Uses the platform's central authorization system.
 *
 * requirePermission already recognizes active Platform
 * Super Admin authority. Organization users must have
 * the requested organization permission.
 */
async function requireClientPerformanceAccess(
  organizationId: string,
  permission: string
): Promise<void> {
  requireCascadEffectsOrganization(organizationId);

  await requirePermission(
    organizationId,
    permission
  );
}

async function requireClientPerformanceManage(
  organizationId: string
): Promise<void> {
  await requireClientPerformanceAccess(
    organizationId,
    CLIENT_PERFORMANCE_MANAGE_PERMISSION
  );
}

/**
 * Confirms that the selected client belongs to the
 * CascadEffects organization.
 *
 * Disabled clients are allowed for administrative
 * operations. Runtime visibility is checked separately.
 */
async function requireClientPerformanceClient(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceClient> {
  requireIdentifier(clientId, "Client ID");

  const client =
    await findClientPerformanceClientById(
      organizationId,
      clientId
    );

  if (!client) {
    throw new Error(
      "Client Performance workspace was not found."
    );
  }

  return client;
}

/* ==========================================================
   Client Listing
========================================================== */

/**
 * List enabled clients for Runtime.
 *
 * Administrators may request disabled clients for
 * management and restoration.
 */
export async function listClientPerformanceClients(
  organizationId: string,
  options?: {
    includeDisabled?: boolean;
  }
): Promise<ClientPerformanceClient[]> {
  const includeDisabled =
    options?.includeDisabled === true;

  if (includeDisabled) {
    await requireClientPerformanceManage(
      organizationId
    );
  } else {
    await requireClientPerformanceAccess(
      organizationId,
      CLIENT_PERFORMANCE_VIEW_PERMISSION
    );
  }

  const clients =
    await loadClientPerformanceClients(
      organizationId
    );

  if (includeDisabled) {
    return clients;
  }

  return clients.filter(
    (client) => client.isEnabled
  );
}

/* ==========================================================
   Workspace Loading
========================================================== */

export async function getClientPerformanceWorkspace(
  organizationId: string,
  input: GetClientPerformanceWorkspaceInput,
  options?: {
    includeDisabled?: boolean;
  }
): Promise<ClientPerformanceWorkspace> {
  requireIdentifier(
    input.clientId,
    "Client ID"
  );

  const includeDisabled =
    options?.includeDisabled === true;

  if (includeDisabled) {
    await requireClientPerformanceManage(
      organizationId
    );
  } else {
    await requireClientPerformanceAccess(
      organizationId,
      CLIENT_PERFORMANCE_VIEW_PERMISSION
    );
  }

  const client =
    await findClientPerformanceClientById(
      organizationId,
      input.clientId
    );

  if (!client) {
    throw new Error(
      "Client Performance workspace was not found."
    );
  }

  if (
    !client.isEnabled &&
    !includeDisabled
  ) {
    throw new Error(
      "This Client Performance workspace is disabled."
    );
  }

  const [
    snapshot,
    monthlyMetrics,
    initiatives,
    yearVisibility,
  ] = await Promise.all([
    findClientPerformanceSnapshot(
      organizationId,
      client.id
    ),

    loadClientPerformanceMonthlyMetrics(
      organizationId,
      client.id
    ),

    loadClientPerformanceInitiatives(
      organizationId,
      client.id
    ),

    loadClientPerformanceYearVisibility(
      organizationId,
      client.id
    ),
  ]);

  if (!snapshot) {
    throw new Error(
      "The Client Performance workspace has not been fully provisioned."
    );
  }

  return {
    client,
    snapshot,
    monthlyMetrics,
    initiatives,
    yearVisibility,
  };
}

/* ==========================================================
   Administrative Workspace Loading
========================================================== */

export async function getClientPerformanceWorkspaceForAdmin(
  organizationId: string,
  input: GetClientPerformanceWorkspaceInput
): Promise<ClientPerformanceWorkspace> {
  return getClientPerformanceWorkspace(
    organizationId,
    input,
    {
      includeDisabled: true,
    }
  );
}

/* ==========================================================
   Snapshot Validation
========================================================== */

/**
 * Validate supplied snapshot keys against the configured
 * client fields.
 *
 * Unknown fields and non-editable fields are rejected.
 * Hidden fields are not automatically considered
 * non-editable; editability is controlled separately.
 */
function validateSnapshotChanges(
  fields: ClientPerformanceSnapshotField[],
  snapshotData: Record<string, unknown>
): void {
  const fieldMap = new Map(
    fields.map((field) => [
      field.columnKey,
      field,
    ])
  );

  for (const [key, value] of Object.entries(snapshotData)) {
    const field = fieldMap.get(key);

    if (!field) {
      throw new Error(
        `Snapshot field "${key}" is not configured for this client.`
      );
    }

    if (!field.isEditable) {
      throw new Error(
        `Snapshot field "${field.label}" is not editable.`
      );
    }

    if (value === null || value === undefined) {
      continue;
    }

    switch (field.dataType) {
      case "text":
      case "status":
      case "select":
        if (typeof value !== "string") {
          throw new Error(
            `Snapshot field "${field.label}" must contain text.`
          );
        }
        break;

      case "number":
        if (
          typeof value !== "number" ||
          !Number.isFinite(value)
        ) {
          throw new Error(
            `Snapshot field "${field.label}" must contain a valid number.`
          );
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          throw new Error(
            `Snapshot field "${field.label}" must contain a boolean value.`
          );
        }
        break;

      case "date":
        if (
          typeof value !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          throw new Error(
            `Snapshot field "${field.label}" must use YYYY-MM-DD format.`
          );
        }
        break;

      default:
        throw new Error(
          `Snapshot field "${field.label}" uses an unsupported data type.`
        );
    }
  }
}

/* ==========================================================
   Workspace Save Validation
========================================================== */

/**
 * Ensure every submitted metric and initiative belongs
 * to the selected workspace.
 *
 * The database transaction performs the same ownership
 * check again before writing.
 */
function validateWorkspaceRecordOwnership(
  workspace: ClientPerformanceWorkspace,
  input: SaveClientPerformanceWorkspaceInput
): void {
  const metricIds = new Set(
    workspace.monthlyMetrics.map(
      (metric) => metric.id
    )
  );

  const initiativeIds = new Set(
    workspace.initiatives.map(
      (initiative) => initiative.id
    )
  );

  for (const item of input.monthlyMetrics ?? []) {
    if (!metricIds.has(item.id)) {
      throw new Error(
        "A monthly metric does not belong to the selected client workspace."
      );
    }
  }

  for (const item of input.initiatives ?? []) {
    if (!initiativeIds.has(item.id)) {
      throw new Error(
        "An initiative does not belong to the selected client workspace."
      );
    }
  }
}

/* ==========================================================
   Atomic Workspace Save
========================================================== */

/**
 * Save one or more workspace sections atomically.
 *
 * Only users with custom_tables.manage may save.
 *
 * The service validates:
 * - organization ownership
 * - enabled client status
 * - snapshot field configuration
 * - snapshot editability
 * - monthly metric ownership
 * - initiative ownership
 *
 * The database transaction performs the final ownership
 * checks and advances Last Updated only after success.
 */
export async function saveClientPerformanceWorkspace(
  organizationId: string,
  input: SaveClientPerformanceWorkspaceInput
): Promise<string> {
  requireIdentifier(
    input.clientId,
    "Client ID"
  );

  await requireClientPerformanceManage(
    organizationId
  );

  const client =
    await findClientPerformanceClientById(
      organizationId,
      input.clientId
    );

  if (!client) {
    throw new Error(
      "Client Performance workspace was not found."
    );
  }

  if (!client.isEnabled) {
    throw new Error(
      "This Client Performance workspace is disabled."
    );
  }

  const workspace =
    await getClientPerformanceWorkspace(
      organizationId,
      {
        clientId: input.clientId,
      }
    );

  if (input.snapshot) {
    validateSnapshotChanges(
      client.snapshotFields,
      input.snapshot.snapshotData
    );
  }

  validateWorkspaceRecordOwnership(
    workspace,
    input
  );

  return saveClientPerformanceWorkspaceAtomic(
    organizationId,
    input
  );
}

/* ==========================================================
   Initiative Creation
========================================================== */

/**
 * Creates a blank initiative tracker row.
 *
 * Requires Client Performance management permission.
 * The database operation validates organization ownership,
 * appends the row, and updates Last Updated after success.
 */
export async function addClientPerformanceInitiative(
  organizationId: string,
  clientId: string
): Promise<string> {
  await requireClientPerformanceManage(
    organizationId
  );

  const client =
    await requireClientPerformanceClient(
      organizationId,
      clientId
    );

  if (!client.isEnabled) {
    throw new Error(
      "This Client Performance workspace is disabled."
    );
  }

  return addClientPerformanceInitiativeAtomic(
    organizationId,
    clientId
  );
}

/* ==========================================================
   Performance Year Management
========================================================== */

/**
 * Appends the next available performance year.
 *
 * The database function creates twelve blank monthly
 * records and initializes the year as visible.
 *
 * Requires Client Performance management permission.
 */
export async function addClientPerformanceYear(
  organizationId: string,
  clientId: string
): Promise<number> {
  await requireClientPerformanceManage(
    organizationId
  );

  await requireClientPerformanceClient(
    organizationId,
    clientId
  );

  return addClientPerformanceYearAtomic(
    organizationId,
    clientId
  );
}

/**
 * Hides a performance year for all organization users.
 *
 * Existing monthly records are retained.
 * This operation does not update the client's
 * Last Updated timestamp.
 */
export async function hideClientPerformanceYear(
  organizationId: string,
  clientId: string,
  performanceYear: number
): Promise<string> {
  requirePerformanceYear(performanceYear);

  await requireClientPerformanceManage(
    organizationId
  );

  await requireClientPerformanceClient(
    organizationId,
    clientId
  );

  return setClientPerformanceYearVisibilityAtomic(
    organizationId,
    clientId,
    performanceYear,
    true
  );
}

/**
 * Restores a previously hidden performance year.
 *
 * Existing monthly records are retained.
 * This operation does not update the client's
 * Last Updated timestamp.
 */
export async function restoreClientPerformanceYear(
  organizationId: string,
  clientId: string,
  performanceYear: number
): Promise<string> {
  requirePerformanceYear(performanceYear);

  await requireClientPerformanceManage(
    organizationId
  );

  await requireClientPerformanceClient(
    organizationId,
    clientId
  );

  return setClientPerformanceYearVisibilityAtomic(
    organizationId,
    clientId,
    performanceYear,
    false
  );
}

/* ==========================================================
   Administrative Authorization
========================================================== */

/**
 * Explicit authorization entry point for future
 * administrative operations such as:
 *
 * - enabling or disabling clients
 * - changing snapshot field configuration
 * - adding or hiding years
 * - restoring hidden years
 */
export async function authorizeClientPerformanceManage(
  organizationId: string
): Promise<void> {
  await requireClientPerformanceManage(
    organizationId
  );
}

/* ==========================================================
   Platform Super Admin Context
========================================================== */

/**
 * Exposes the existing platform authorization context
 * for administrative workflows that need to distinguish
 * Platform Super Admin from Organization Administrators.
 */
export async function getClientPerformanceAdminContext(
  organizationId: string
): Promise<{
  isPlatformSuperAdmin: boolean;
  userId: string;
}> {
  requireCascadEffectsOrganization(
    organizationId
  );

  const context =
    await getAuthorizationContext(
      organizationId
    );

  if (!context) {
    throw new Error(
      "You are not authorized to access Client Performance."
    );
  }

  await requireClientPerformanceManage(
    organizationId
  );

  return {
    isPlatformSuperAdmin:
      context.isPlatformSuperAdmin,
    userId: context.userId,
  };
}
