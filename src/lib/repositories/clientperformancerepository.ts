
/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Repository
 * ----------------------------------------------------------
 * Provides server-side Supabase persistence access for
 * dedicated Client Performance domain tables.
 *
 * Authorization and business rules belong to the service
 * layer. This repository only performs database operations
 * and maps database records to domain types.
 *
 * Database tables:
 * - client_performance_clients
 * - client_performance_snapshots
 * - client_performance_monthly_metrics
 * - client_performance_initiatives
 * - client_performance_year_visibility
 * ==========================================================
 */

import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import type {
  ClientPerformanceClient,
  ClientPerformanceSnapshotField,
  ClientPerformanceSnapshot,
  ClientPerformanceMonthlyMetric,
  ClientPerformanceInitiative,
  ClientPerformanceYearVisibility,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Database Records
========================================================== */

interface ClientPerformanceClientRecord {
  id: string;
  organization_id: string;
  custom_table_definition_id: string;
  client_key: string;
  display_name: string;
  position: number;
  is_enabled: boolean;
  snapshot_fields: ClientPerformanceSnapshotField[];
  last_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientPerformanceSnapshotRecord {
  client_id: string;
  organization_id: string;
  snapshot_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ClientPerformanceMonthlyMetricRecord {
  id: string;
  client_id: string;
  organization_id: string;
  performance_year: number;
  performance_month: number;
  production: number | string | null;
  collection: number | string | null;
  starts: number | null;
  days_worked: number | string | null;
  created_at: string;
  updated_at: string;
}

interface ClientPerformanceInitiativeRecord {
  id: string;
  client_id: string;
  organization_id: string;
  title: string;
  description: string;
  completion_month: string | null;
  additional_data: Record<string, unknown>;
  notes: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface ClientPerformanceYearVisibilityRecord {
  client_id: string;
  organization_id: string;
  performance_year: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

/* ==========================================================
   Record Mapping
========================================================== */

function mapClient(
  record: ClientPerformanceClientRecord
): ClientPerformanceClient {
  return {
    id: record.id,
    organizationId: record.organization_id,
    customTableDefinitionId:
      record.custom_table_definition_id,
    clientKey: record.client_key,
    displayName: record.display_name,
    position: record.position,
    isEnabled: record.is_enabled,
    snapshotFields: record.snapshot_fields ?? [],
    lastUpdatedAt: record.last_updated_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapSnapshot(
  record: ClientPerformanceSnapshotRecord
): ClientPerformanceSnapshot {
  return {
    clientId: record.client_id,
    organizationId: record.organization_id,
    snapshotData: record.snapshot_data ?? {},
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapMonthlyMetric(
  record: ClientPerformanceMonthlyMetricRecord
): ClientPerformanceMonthlyMetric {
  return {
    id: record.id,
    clientId: record.client_id,
    organizationId: record.organization_id,
    performanceYear: record.performance_year,
    performanceMonth: record.performance_month,
    production:
      record.production === null
        ? null
        : Number(record.production),
    collection:
      record.collection === null
        ? null
        : Number(record.collection),
    starts: record.starts,
    daysWorked:
      record.days_worked === null
        ? null
        : Number(record.days_worked),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInitiative(
  record: ClientPerformanceInitiativeRecord
): ClientPerformanceInitiative {
  return {
    id: record.id,
    clientId: record.client_id,
    organizationId: record.organization_id,
    title: record.title,
    description: record.description,
    completionMonth: record.completion_month,
    additionalData: record.additional_data ?? {},
    notes: record.notes,
    position: record.position,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapYearVisibility(
  record: ClientPerformanceYearVisibilityRecord
): ClientPerformanceYearVisibility {
  return {
    clientId: record.client_id,
    organizationId: record.organization_id,
    performanceYear: record.performance_year,
    isHidden: record.is_hidden,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/* ==========================================================
   Client Workspaces
========================================================== */

/**
 * Load every Client Performance workspace belonging to
 * one organization.
 *
 * Disabled clients are included so administrators can
 * manage and reactivate them.
 */
export async function loadClientPerformanceClients(
  organizationId: string
): Promise<ClientPerformanceClient[]> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_clients")
    .select("*")
    .eq("organization_id", organizationId)
    .order("position", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Client Performance clients: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapClient(record as ClientPerformanceClientRecord)
  );
}

/**
 * Find one client workspace by ID and organization.
 *
 * The organization filter is mandatory. A client ID alone
 * must never be sufficient to retrieve another tenant's
 * workspace.
 */
export async function findClientPerformanceClientById(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceClient | null> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_clients")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Client Performance client: ${error.message}`
    );
  }

  return data
    ? mapClient(data as ClientPerformanceClientRecord)
    : null;
}

/**
 * Find a client by its stable organization-scoped key.
 */
export async function findClientPerformanceClientByKey(
  organizationId: string,
  clientKey: string
): Promise<ClientPerformanceClient | null> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_clients")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_key", clientKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find Client Performance client: ${error.message}`
    );
  }

  return data
    ? mapClient(data as ClientPerformanceClientRecord)
    : null;
}

/* ==========================================================
   Current Performance Snapshot
========================================================== */

/**
 * Load the persistent snapshot for one client.
 *
 * Returns null when the workspace has not yet been
 * provisioned with a snapshot record.
 */
export async function findClientPerformanceSnapshot(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceSnapshot | null> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_snapshots")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Client Performance snapshot: ${error.message}`
    );
  }

  return data
    ? mapSnapshot(data as ClientPerformanceSnapshotRecord)
    : null;
}

/* ==========================================================
   Monthly Metrics
========================================================== */

/**
 * Load all monthly metrics for one client.
 *
 * Hidden-year filtering is deliberately not performed here.
 * The service and presentation layers need the complete
 * history to support administration and restoration.
 */
export async function loadClientPerformanceMonthlyMetrics(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceMonthlyMetric[]> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_monthly_metrics")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("performance_year", { ascending: true })
    .order("performance_month", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Client Performance monthly metrics: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapMonthlyMetric(
      record as ClientPerformanceMonthlyMetricRecord
    )
  );
}

/* ==========================================================
   Key Initiatives Tracker
========================================================== */

/**
 * Load initiatives for one client in configured display
 * order.
 *
 * additional_data is retained without interpreting or
 * renaming unknown spreadsheet fields.
 */
export async function loadClientPerformanceInitiatives(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceInitiative[]> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_initiatives")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Client Performance initiatives: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapInitiative(
      record as ClientPerformanceInitiativeRecord
    )
  );
}

/* ==========================================================
   Performance Year Visibility
========================================================== */

/**
 * Load shared year visibility settings for one client.
 *
 * Missing visibility records represent visible years.
 * The service layer may apply that default when building
 * the workspace response.
 */
export async function loadClientPerformanceYearVisibility(
  organizationId: string,
  clientId: string
): Promise<ClientPerformanceYearVisibility[]> {
  const { data, error } = await supabaseAdmin
    .from("client_performance_year_visibility")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("performance_year", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load Client Performance year visibility: ${error.message}`
    );
  }

  return (data ?? []).map((record) =>
    mapYearVisibility(
      record as ClientPerformanceYearVisibilityRecord
    )
  );
}
