
/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Domain
 * ----------------------------------------------------------
 * Defines the organization-scoped Client Performance
 * workspaces used exclusively by the CascadEffects tenant.
 *
 * Persistence is handled by the dedicated Client Performance
 * database tables. This domain is separate from generic
 * Custom Table rows, Member OKRs, and Runtime performance
 * execution records.
 *
 * Database tables:
 *
 * - client_performance_clients
 * - client_performance_snapshots
 * - client_performance_monthly_metrics
 * - client_performance_initiatives
 * - client_performance_year_visibility
 * ==========================================================
 */

import type {
  CustomTableColumnDataType,
  CustomTableColumnSettings,
} from "./customtable";

/* ==========================================================
   Client Identity
========================================================== */

/**
 * Stable client identifier within the organization.
 *
 * clientKey is a permanent machine-readable key. Display
 * names may change without changing client identity.
 */
export interface ClientPerformanceClient {
  id: string;

  organizationId: string;

  customTableDefinitionId: string;

  clientKey: string;

  displayName: string;

  position: number;

  isEnabled: boolean;

  snapshotFields: ClientPerformanceSnapshotField[];

  lastUpdatedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

/**
 * Input for creating a client workspace.
 *
 * The service layer must validate the organization,
 * definition ownership, permissions, and unique client key.
 */
export interface CreateClientPerformanceClientInput {
  organizationId: string;

  customTableDefinitionId: string;

  clientKey: string;

  displayName: string;

  position?: number;

  isEnabled?: boolean;

  snapshotFields: ClientPerformanceSnapshotField[];
}

/**
 * Partial updates for client workspace configuration.
 *
 * Client identity and organization ownership are immutable
 * through ordinary update operations.
 */
export interface UpdateClientPerformanceClientInput {
  displayName?: string;

  position?: number;

  isEnabled?: boolean;

  snapshotFields?: ClientPerformanceSnapshotField[];
}

/* ==========================================================
   Snapshot Field Configuration
========================================================== */

/**
 * Snapshot field configuration.
 *
 * This follows the existing Custom Tables column
 * conventions while remaining independently stored in the
 * Client Performance domain.
 *
 * columnKey is the stable key used to access the field's
 * value in ClientPerformanceSnapshotData.
 */
export interface ClientPerformanceSnapshotField {
  id: string;

  columnKey: string;

  label: string;

  dataType: CustomTableColumnDataType;

  position: number;

  isRequired: boolean;

  isVisible: boolean;

  isEditable: boolean;

  settings: CustomTableColumnSettings;
}

/**
 * Snapshot values are stored separately from the field
 * configuration and keyed by the configured columnKey.
 *
 * Partial values are supported so an empty workspace or
 * partially completed snapshot can be saved safely.
 */
export type ClientPerformanceSnapshotData = Record<
  string,
  unknown
>;

/**
 * One persistent snapshot per client workspace.
 */
export interface ClientPerformanceSnapshot {
  clientId: string;

  organizationId: string;

  snapshotData: ClientPerformanceSnapshotData;

  createdAt: string;

  updatedAt: string;
}

/**
 * Partial snapshot update.
 *
 * The service layer must merge supplied values with
 * existing values rather than replacing unrelated fields.
 */
export interface UpdateClientPerformanceSnapshotInput {
  snapshotData: Partial<ClientPerformanceSnapshotData>;
}

/* ==========================================================
   Monthly Metrics
========================================================== */

/**
 * One monthly performance record for a client.
 *
 * The database enforces one record per client, year,
 * and month.
 */
export interface ClientPerformanceMonthlyMetric {
  id: string;

  clientId: string;

  organizationId: string;

  performanceYear: number;

  performanceMonth: number;

  production: number | null;

  collection: number | null;

  starts: number | null;

  daysWorked: number | null;

  avgProdPerDay: number | null;

  createdAt: string;

  updatedAt: string;
}

/**
 * Input for creating a monthly metric record.
 *
 * Null values represent intentionally blank metrics.
 * The service layer validates year and month boundaries.
 */
export interface CreateClientPerformanceMonthlyMetricInput {
  clientId: string;

  organizationId: string;

  performanceYear: number;

  performanceMonth: number;

  production?: number | null;

  collection?: number | null;

  starts?: number | null;

  daysWorked?: number | null;

  avgProdPerDay?: number | null;
}

/**
 * Partial metric updates preserve fields not supplied
 * by the caller.
 */
export interface UpdateClientPerformanceMonthlyMetricInput {
  production?: number | null;

  collection?: number | null;

  starts?: number | null;

  daysWorked?: number | null;

  avgProdPerDay?: number | null;
}

/* ==========================================================
   Key Initiatives Tracker
========================================================== */

/**
 * Additional spreadsheet data retained without assigning
 * an invented meaning or label to the extra column.
 */
export type ClientPerformanceInitiativeAdditionalData =
  Record<string, unknown>;

/**
 * One initiative belonging to a client workspace.
 */
export interface ClientPerformanceInitiative {
  id: string;

  clientId: string;

  organizationId: string;

  title: string;

  description: string;

  completionMonth: string | null;

  additionalData: ClientPerformanceInitiativeAdditionalData;

  notes: string;

  position: number;

  createdAt: string;

  updatedAt: string;
}

/**
 * Input for creating an initiative.
 */
export interface CreateClientPerformanceInitiativeInput {
  clientId: string;

  organizationId: string;

  title?: string;

  description?: string;

  completionMonth?: string | null;

  additionalData?: ClientPerformanceInitiativeAdditionalData;

  notes?: string;

  position?: number;
}

/**
 * Partial initiative updates preserve unrelated fields.
 */
export interface UpdateClientPerformanceInitiativeInput {
  title?: string;

  description?: string;

  completionMonth?: string | null;

  additionalData?: ClientPerformanceInitiativeAdditionalData;

  notes?: string;

  position?: number;
}

/* ==========================================================
   Performance Year Visibility
========================================================== */

/**
 * Shared organization-level visibility setting for one
 * client's performance year.
 *
 * This is not a personal preference. A hidden year is
 * hidden for all users of the organization.
 */
export interface ClientPerformanceYearVisibility {
  clientId: string;

  organizationId: string;

  performanceYear: number;

  isHidden: boolean;

  createdAt: string;

  updatedAt: string;
}

/**
 * Input for changing a year's shared visibility.
 */
export interface UpdateClientPerformanceYearVisibilityInput {
  clientId: string;

  organizationId: string;

  performanceYear: number;

  isHidden: boolean;
}

/* ==========================================================
   Workspace
========================================================== */

/**
 * Complete workspace data required to render one client.
 *
 * The workspace contains the current snapshot, monthly
 * history, initiatives, and year visibility settings.
 */
export interface ClientPerformanceWorkspace {
  client: ClientPerformanceClient;

  snapshot: ClientPerformanceSnapshot;

  monthlyMetrics: ClientPerformanceMonthlyMetric[];

  initiatives: ClientPerformanceInitiative[];

  yearVisibility: ClientPerformanceYearVisibility[];
}

/**
 * Request to load a client workspace.
 *
 * Organization identity must be resolved and authorized
 * by the server. It must not be trusted from client input.
 */
export interface GetClientPerformanceWorkspaceInput {
  clientId: string;
}

/* ==========================================================
   Workspace Save
========================================================== */

/**
 * One logical workspace save request.
 *
 * Every supplied section is optional so individual sections
 * can be edited without resetting unrelated data.
 *
 * The service layer must persist the request atomically.
 * Last Updated must change only after successful persistence.
 */
export interface SaveClientPerformanceWorkspaceInput {
  clientId: string;

  snapshot?: UpdateClientPerformanceSnapshotInput;

  monthlyMetrics?: Array<{
    id: string;
    changes: UpdateClientPerformanceMonthlyMetricInput;
  }>;

  initiatives?: Array<{
    id: string;
    changes: UpdateClientPerformanceInitiativeInput;
  }>;
}

/* ==========================================================
   Year Management
========================================================== */

/**
 * Request to append a new performance year.
 *
 * The service layer determines the next year, prevents
 * duplicates, and creates all twelve monthly records
 * within one transaction.
 */
export interface AddClientPerformanceYearInput {
  clientId: string;
}

/**
 * Request to provision the initial performance years.
 *
 * This is intended for controlled initial setup.
 * It must not overwrite existing records.
 */
export interface ProvisionClientPerformanceYearsInput {
  clientId: string;

  years: number[];
}
