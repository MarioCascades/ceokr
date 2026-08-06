import type { PerformanceSheet } from "./performancesheet";

/* ==========================================================
   Assignment
========================================================== */

export type AssignmentType =
  | "individual"
  | "team"
  | "department";

export type AssignmentStatus =
  | "draft"
  | "active"
  | "completed"
  | "cancelled";

/* ==========================================================
   Assignment
========================================================== */

export interface Assignment {
  id: string;

  organizationId: string;

  performanceSheetId: PerformanceSheet["id"];

  reportingPeriodId: string;

  /*
   * Defines what kind of entity is receiving
   * this assignment.
   */
  assignmentType: AssignmentType;

  /*
   * References the assigned entity.
   *
   * individual -> User ID
   * team       -> Team ID
   * department -> Department ID
   */
  subjectId: string;

  status: AssignmentStatus;

  /*
   * User who created the assignment.
   */
  assignedBy: string;

  assignedAt: string;

  activatedAt?: string;

  completedAt?: string;
}