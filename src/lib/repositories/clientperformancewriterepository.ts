
/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Write Repository
 * ----------------------------------------------------------
 * Controlled database write operations for Client
 * Performance workspaces.
 *
 * PostgreSQL functions:
 * - save_client_performance_workspace_atomic
 * - add_client_performance_year
 * - set_client_performance_year_visibility
 * - add_client_performance_initiative
 *
 * Authorization belongs to the service layer.
 * ==========================================================
 */

import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import type {
  SaveClientPerformanceWorkspaceInput,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Atomic Workspace Save
========================================================== */

/**
 * Saves supplied workspace sections in one transaction.
 */
export async function saveClientPerformanceWorkspaceAtomic(
  organizationId: string,
  input: SaveClientPerformanceWorkspaceInput
): Promise<string> {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }

  if (!input.clientId?.trim()) {
    throw new Error("Client ID is required.");
  }

  const { data, error } = await supabaseAdmin.rpc(
    "save_client_performance_workspace_atomic",
    {
      p_organization_id: organizationId,
      p_client_id: input.clientId,

      p_snapshot_data:
        input.snapshot?.snapshotData ?? null,

      p_monthly_metrics:
        input.monthlyMetrics?.map((item) => ({
          id: item.id,
          changes: item.changes,
        })) ?? null,

      p_initiatives:
        input.initiatives?.map((item) => ({
          id: item.id,
          changes: item.changes,
        })) ?? null,
    }
  );

  if (error) {
    console.error(
      "Client Performance atomic save failed:",
      error
    );

    throw new Error(
      `Failed to save Client Performance workspace: ${error.message}`
    );
  }

  if (typeof data !== "string" || !data) {
    throw new Error(
      "Client Performance save completed without a valid saved timestamp."
    );
  }

  return data;
}

/* ==========================================================
   Add Next Performance Year
========================================================== */

/**
 * Appends the next available performance year.
 */
export async function addClientPerformanceYearAtomic(
  organizationId: string,
  clientId: string
): Promise<number> {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }

  if (!clientId?.trim()) {
    throw new Error("Client ID is required.");
  }

  const { data, error } = await supabaseAdmin.rpc(
    "add_client_performance_year",
    {
      p_organization_id: organizationId,
      p_client_id: clientId,
    }
  );

  if (error) {
    console.error(
      "Client Performance year creation failed:",
      error
    );

    throw new Error(
      `Failed to add Client Performance year: ${error.message}`
    );
  }

  const performanceYear = Number(data);

  if (
    !Number.isInteger(performanceYear) ||
    performanceYear < 2000 ||
    performanceYear > 9999
  ) {
    throw new Error(
      "Year creation did not return a valid performance year."
    );
  }

  return performanceYear;
}

/* ==========================================================
   Set Performance Year Visibility
========================================================== */

/**
 * Changes shared visibility for a performance year.
 */
export async function setClientPerformanceYearVisibilityAtomic(
  organizationId: string,
  clientId: string,
  performanceYear: number,
  isHidden: boolean
): Promise<string> {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }

  if (!clientId?.trim()) {
    throw new Error("Client ID is required.");
  }

  if (
    !Number.isInteger(performanceYear) ||
    performanceYear < 2000 ||
    performanceYear > 9999
  ) {
    throw new Error(
      "A valid performance year is required."
    );
  }

  if (typeof isHidden !== "boolean") {
    throw new Error(
      "Year visibility must be specified."
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "set_client_performance_year_visibility",
    {
      p_organization_id: organizationId,
      p_client_id: clientId,
      p_performance_year: performanceYear,
      p_is_hidden: isHidden,
    }
  );

  if (error) {
    console.error(
      "Client Performance year visibility update failed:",
      error
    );

    throw new Error(
      `Failed to update Client Performance year visibility: ${error.message}`
    );
  }

  if (typeof data !== "string" || !data) {
    throw new Error(
      "Year visibility update did not return a valid timestamp."
    );
  }

  return data;
}

/* ==========================================================
   Add Initiative
========================================================== */

/**
 * Creates a blank initiative tracker row.
 *
 * The database function:
 * - validates organization/client ownership
 * - locks the client workspace
 * - appends the initiative after existing rows
 * - preserves the additional_data JSON structure
 * - advances Last Updated after successful creation
 *
 * Returns the newly created initiative ID.
 */
export async function addClientPerformanceInitiativeAtomic(
  organizationId: string,
  clientId: string
): Promise<string> {
  if (!organizationId?.trim()) {
    throw new Error("Organization is required.");
  }

  if (!clientId?.trim()) {
    throw new Error("Client ID is required.");
  }

  const { data, error } = await supabaseAdmin.rpc(
    "add_client_performance_initiative",
    {
      p_organization_id: organizationId,
      p_client_id: clientId,
    }
  );

  if (error) {
    console.error(
      "Client Performance initiative creation failed:",
      error
    );

    throw new Error(
      `Failed to add Client Performance initiative: ${error.message}`
    );
  }

  if (typeof data !== "string" || !data) {
    throw new Error(
      "Initiative creation did not return a valid initiative ID."
    );
  }

  return data;
}
