/* ==========================================================
   Reporting Period Types
========================================================== */

export type ReportingPeriodType =
  | "annual"
  | "quarterly"
  | "monthly"
  | "weekly"
  | "custom";

/* ==========================================================
   Reporting Period Status
========================================================== */

export type ReportingPeriodStatus =
  | "draft"
  | "active"
  | "closed"
  | "archived";

/* ==========================================================
   Reporting Period
========================================================== */

export interface ReportingPeriod {
  /**
   * Unique identifier.
   */
  id: string;

  /**
   * Owning organization.
   */
  organizationId: string;

  /**
   * Display name.
   */
  name: string;

  /**
   * Optional description.
   */
  description?: string;

  /**
   * Reporting cadence.
   */
  frequency: ReportingPeriodType;

  /**
   * Inclusive reporting period start date (ISO 8601).
   */
  startDate: string;

  /**
   * Inclusive reporting period end date (ISO 8601).
   */
  endDate: string;

  /**
   * Current lifecycle state.
   */
  status: ReportingPeriodStatus;

  /**
   * Audit timestamps.
   */
  createdAt: string;

  updatedAt: string;
}