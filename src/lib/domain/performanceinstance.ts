import type { Assignment } from "./assignment";
import type { PerformanceSheet } from "./performancesheet";

/* ==========================================================
   Performance Instance Status
========================================================== */

export type PerformanceInstanceStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "completed";

/* ==========================================================
   Performance Instance
========================================================== */

export interface PerformanceInstance {
  /**
   * Unique identifier.
   */
  id: string;

  /**
   * Owning organization.
   */
  organizationId: string;

  /**
   * Assignment being executed.
   */
  assignmentId: Assignment["id"];

  /**
   * Exact published Performance Sheet version
   * being executed.
   */
  performanceSheetId: PerformanceSheet["id"];

  /**
   * Overall weighted performance score.
   *
   * Range:
   * 0 - 100
   */
  overallScore: number;

  /**
   * Overall completion percentage.
   *
   * Range:
   * 0 - 100
   */
  progress: number;

  /**
   * Performance lifecycle status.
   */
  status: PerformanceInstanceStatus;

  /**
   * Comments entered by the employee/member.
   */
  employeeComments?: string;

  /**
   * Comments entered by the manager.
   */
  managerComments?: string;

  /**
   * Date/time the instance was created.
   */
  createdAt: string;

  /**
   * Date/time performance work began.
   */
  startedAt?: string;

  /**
   * Date/time the instance was submitted.
   */
  submittedAt?: string;

  /**
   * Date/time the instance was approved.
   */
  approvedAt?: string;

  /**
   * Date/time the instance was completed.
   */
  completedAt?: string;
}