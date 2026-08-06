import type { PerformanceSheet } from "./performancesheet";
import type { ReportingPeriod } from "./reportingperiod";

/* ==========================================================
   Assignment Types
========================================================== */

export type AssignmentType =
  | "individual"
  | "team"
  | "department"
  | "organization";

/* ==========================================================
   Assignment Status
========================================================== */

export type AssignmentStatus =
  | "draft"
  | "active"
  | "completed"
  | "cancelled";

/* ==========================================================
   Assignment
========================================================== */

export interface Assignment {
  /**
   * Unique identifier.
   */
  id: string;

  /**
   * Owning organization.
   */
  organizationId: string;

  /**
   * Published Performance Sheet being assigned.
   */
  performanceSheetId: PerformanceSheet["id"];

  /**
   * Reporting Period this assignment belongs to.
   */
  reportingPeriodId: ReportingPeriod["id"];

  /**
   * Determines what type of entity
   * receives the assignment.
   */
  assignmentType: AssignmentType;

  /**
   * ID of the assigned entity.
   *
   * individual   -> User ID
   * team         -> Team ID
   * department   -> Department ID
   * organization -> Organization ID
   */
  subjectId: string;

  /**
   * Assignment lifecycle.
   */
  status: AssignmentStatus;

  /**
   * User who created the assignment.
   */
  assignedBy: string;

  /**
   * Date/time the assignment was created.
   */
  assignedAt: string;

  /**
   * Date/time the assignment became active.
   */
  activatedAt?: string;

  /**
   * Date/time the assignment was completed.
   */
  completedAt?: string;
}