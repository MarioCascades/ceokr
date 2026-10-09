
/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Custom Tables Domain
 * ----------------------------------------------------------
 * Defines the reusable organization-scoped Custom Tables
 * model used by operational tables such as:
 *
 * - Recruitment
 * - Agenda
 * - VA List
 * - Client Performance
 *
 * Custom Tables are independent of Member OKRs, performance
 * scoring, and Runtime execution records.
 *
 * Database tables:
 *
 * - custom_table_definitions
 * - custom_table_columns
 * - custom_table_months
 * - custom_table_rows
 * ==========================================================
 */


/* ==========================================================
   Operational Status
========================================================== */

/**
 * Standardized operational status for a table row.
 *
 * This is intentionally separate from free-form column
 * values such as Current State, Remarks, and Action Plan.
 */
export type CustomTableOperationalStatus =
  | "in_progress"
  | "on_hold"
  | "completed";


/* ==========================================================
   Custom Table Column Data Types
========================================================== */

/**
 * Supported types for configurable Custom Table columns.
 */
export type CustomTableColumnDataType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "status"
  | "select";


/* ==========================================================
   Custom Table Column Settings
========================================================== */

/**
 * Optional presentation and validation settings for a
 * configurable column.
 *
 * Select options and status colors can be stored in the
 * settings object without requiring additional database
 * columns for every future configuration option.
 */
export interface CustomTableColumnSettings {
  options?: string[];

  statusColors?: Record<string, string>;

  placeholder?: string;

  helpText?: string;

  min?: number;

  max?: number;

  [key: string]: unknown;
}


/* ==========================================================
   Custom Table Definition
========================================================== */

/**
 * Reusable table configuration belonging to one
 * organization.
 *
 * isEnabled controls whether the table is available for
 * Runtime. A separate showInRuntime setting is not used.
 */
export interface CustomTableDefinition {
  id: string;

  organizationId: string;

  tableKey: string;

  name: string;

  description: string | null;

  runtimeTabKey: string | null;

  isEnabled: boolean;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Custom Table Definition Create Input
========================================================== */

export interface CreateCustomTableDefinitionInput {
  organizationId: string;

  tableKey: string;

  name: string;

  description?: string | null;

  runtimeTabKey?: string | null;

  isEnabled?: boolean;
}


/* ==========================================================
   Custom Table Definition Update Input
========================================================== */

/**
 * Only explicitly supplied properties should be updated.
 *
 * Authorization for configuration changes must be enforced
 * by the application service layer.
 */
export interface UpdateCustomTableDefinitionInput {
  name?: string;

  description?: string | null;

  runtimeTabKey?: string | null;

  isEnabled?: boolean;
}


/* ==========================================================
   Custom Table Column
========================================================== */

/**
 * Defines a configurable column within a Custom Table.
 *
 * columnKey is the stable identifier used to access the
 * corresponding value inside CustomTableRow.rowData.
 */
export interface CustomTableColumn {
  id: string;

  organizationId: string;

  tableDefinitionId: string;

  columnKey: string;

  label: string;

  dataType: CustomTableColumnDataType;

  position: number;

  isRequired: boolean;

  isVisible: boolean;

  isEditable: boolean;

  settings: CustomTableColumnSettings;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Custom Table Column Create Input
========================================================== */

export interface CreateCustomTableColumnInput {
  organizationId: string;

  tableDefinitionId: string;

  columnKey: string;

  label: string;

  dataType?: CustomTableColumnDataType;

  position?: number;

  isRequired?: boolean;

  isVisible?: boolean;

  isEditable?: boolean;

  settings?: CustomTableColumnSettings;
}


/* ==========================================================
   Custom Table Column Update Input
========================================================== */

export interface UpdateCustomTableColumnInput {
  label?: string;

  dataType?: CustomTableColumnDataType;

  position?: number;

  isRequired?: boolean;

  isVisible?: boolean;

  isEditable?: boolean;

  settings?: CustomTableColumnSettings;
}


/* ==========================================================
   Custom Table Column Snapshot
========================================================== */

/**
 * Historical representation of a column configuration.
 *
 * Monthly instances retain their own snapshot so historical
 * tables can be rendered using the column configuration
 * that applied to that month.
 *
 * The snapshot does not replace the reusable column
 * definition used by future months.
 */
export interface CustomTableColumnSnapshot {
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


/* ==========================================================
   Custom Table Month
========================================================== */

/**
 * Monthly instance of a reusable Custom Table.
 *
 * performanceMonth represents the first calendar day of
 * the month, formatted as YYYY-MM-DD.
 *
 * Each month has independent operational rows and a
 * historical snapshot of its column configuration.
 */
export interface CustomTableMonth {
  id: string;

  organizationId: string;

  tableDefinitionId: string;

  performanceMonth: string;

  columnsSnapshot: CustomTableColumnSnapshot[];

  isFinalized: boolean;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Custom Table Month Create Input
========================================================== */

export interface CreateCustomTableMonthInput {
  organizationId: string;

  tableDefinitionId: string;

  performanceMonth: string;

  columnsSnapshot?: CustomTableColumnSnapshot[];

  isFinalized?: boolean;
}


/* ==========================================================
   Custom Table Month Update Input
========================================================== */

/**
 * Finalization and month editing restrictions must be
 * enforced by the service layer.
 */
export interface UpdateCustomTableMonthInput {
  columnsSnapshot?: CustomTableColumnSnapshot[];

  isFinalized?: boolean;
}


/* ==========================================================
   Custom Table Row Data
========================================================== */

/**
 * Editable cell values for an operational row.
 *
 * Keys correspond to configured columnKey values.
 *
 * Example:
 *
 * {
 *   role: "Remote VA",
 *   role_details: "Sales CRM Virtual Assistant",
 *   action_plan: "Endorse candidates",
 *   remarks: "Waiting for client feedback",
 *   future_task: "Follow up Friday",
 *   current_state: "Client interview pending"
 * }
 *
 * The standardized operational status is stored separately
 * in CustomTableRow.operationalStatus.
 */
export type CustomTableRowData = Record<string, unknown>;


/* ==========================================================
   Custom Table Row
========================================================== */

/**
 * An operational record belonging to one organization and
 * one monthly Custom Table instance.
 *
 * Row identity remains stable when its position changes.
 *
 * Hidden rows remain stored and can be restored without
 * deleting or recreating the record.
 */
export interface CustomTableRow {
  id: string;

  organizationId: string;

  tableMonthId: string;

  rowData: CustomTableRowData;

  operationalStatus: CustomTableOperationalStatus;

  isHidden: boolean;

  position: number;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Custom Table Row Create Input
========================================================== */

export interface CreateCustomTableRowInput {
  organizationId: string;

  tableMonthId: string;

  rowData?: CustomTableRowData;

  operationalStatus?: CustomTableOperationalStatus;

  isHidden?: boolean;

  position?: number;
}


/* ==========================================================
   Custom Table Row Update Input
========================================================== */

/**
 * Partial row updates allow the service layer to persist
 * only the properties being changed.
 *
 * The service layer must verify organization ownership,
 * row membership in the requested monthly instance,
 * permissions, and month finalization before writing.
 */
export interface UpdateCustomTableRowInput {
  rowData?: CustomTableRowData;

  operationalStatus?: CustomTableOperationalStatus;

  isHidden?: boolean;

  position?: number;
}


/* ==========================================================
   Custom Table Row Reordering
========================================================== */

/**
 * Supported explicit ordering operations.
 *
 * Ordering applies within the relevant monthly table and
 * visibility section. It must not change row identity.
 */
export type CustomTableRowMoveAction =
  | "top"
  | "up"
  | "down"
  | "bottom";


/**
 * Request to move one row within its monthly table.
 */
export interface MoveCustomTableRowInput {
  organizationId: string;

  tableMonthId: string;

  rowId: string;

  action: CustomTableRowMoveAction;
}


/* ==========================================================
   Custom Table Monthly Copy-Forward
========================================================== */

/**
 * Request to create a new monthly instance from an earlier
 * month without modifying the source month.
 *
 * The service layer determines which rows are eligible
 * for carry-forward and creates independent destination
 * records.
 */
export interface CopyForwardCustomTableMonthInput {
  organizationId: string;

  tableDefinitionId: string;

  sourcePerformanceMonth: string;

  targetPerformanceMonth: string;
}


/* ==========================================================
   Custom Table Permissions
========================================================== */

/**
 * Permission keys registered in the platform permission
 * catalog and checked by the authorization service.
 */
export type CustomTablePermissionKey =
  | "custom_tables.view"
  | "custom_tables.manage"
  | "custom_tables.rows.edit";


/* ==========================================================
   Custom Table Workspace
========================================================== */

/**
 * Combined data model for presenting a Custom Table
 * workspace without requiring each screen to reconstruct
 * the relationships between definitions, columns, months,
 * and rows independently.
 */
export interface CustomTableWorkspace {
  definition: CustomTableDefinition;

  columns: CustomTableColumn[];

  month: CustomTableMonth;

  rows: CustomTableRow[];
}


/* ==========================================================
   Custom Table List Item
========================================================== */

/**
 * Lightweight table information for organization
 * administration and Runtime navigation.
 */
export interface CustomTableListItem {
  id: string;

  organizationId: string;

  tableKey: string;

  name: string;

  description: string | null;

  runtimeTabKey: string | null;

  isEnabled: boolean;

  columnCount: number;
}


/* ==========================================================
   Recruitment Defaults
========================================================== */

/**
 * Stable keys for the initial Recruitment configuration.
 *
 * These keys correspond to row_data properties and must
 * remain consistent across monthly instances.
 */
export const RECRUITMENT_COLUMN_KEYS = [
  "role",
  "role_details",
  "action_plan",
  "remarks",
  "future_task",
  "current_state",
] as const;


export type RecruitmentColumnKey =
  (typeof RECRUITMENT_COLUMN_KEYS)[number];


/**
 * Initial column definitions for the Recruitment table.
 *
 * These defaults describe the intended configuration.
 * The service layer will persist the actual column records.
 */
export const RECRUITMENT_DEFAULT_COLUMNS: ReadonlyArray<{
  columnKey: RecruitmentColumnKey;

  label: string;

  dataType: CustomTableColumnDataType;

  position: number;

  isRequired: boolean;

  isVisible: boolean;

  isEditable: boolean;

  settings: CustomTableColumnSettings;
}> = [
  {
    columnKey: "role",
    label: "Role",
    dataType: "text",
    position: 0,
    isRequired: true,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Enter role or position",
    },
  },
  {
    columnKey: "role_details",
    label: "Role Details",
    dataType: "text",
    position: 1,
    isRequired: false,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Enter role details",
    },
  },
  {
    columnKey: "action_plan",
    label: "Action Plan",
    dataType: "text",
    position: 2,
    isRequired: false,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Enter next actions",
    },
  },
  {
    columnKey: "remarks",
    label: "Remarks",
    dataType: "text",
    position: 3,
    isRequired: false,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Enter remarks",
    },
  },
  {
    columnKey: "future_task",
    label: "Future Task",
    dataType: "text",
    position: 4,
    isRequired: false,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Enter future tasks",
    },
  },
  {
    columnKey: "current_state",
    label: "Current State",
    dataType: "text",
    position: 5,
    isRequired: false,
    isVisible: true,
    isEditable: true,
    settings: {
      placeholder: "Describe the current state",
    },
  },
];


/* ==========================================================
   Operational Status Labels
========================================================== */

/**
 * Display labels for the standardized operational status.
 */
export const CUSTOM_TABLE_STATUS_LABELS: Record<
  CustomTableOperationalStatus,
  string
> = {
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
};


/**
 * Default presentation colors for standardized status
 * badges. UI components may map these values to the
 * platform's existing design tokens.
 */
export const CUSTOM_TABLE_STATUS_COLORS: Record<
  CustomTableOperationalStatus,
  string
> = {
  in_progress: "blue",
  on_hold: "amber",
  completed: "green",
};
