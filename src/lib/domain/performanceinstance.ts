import type { Assignment } from "./assignment";

/* ==========================================================
   Performance Instance
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
  id: string;

  assignmentId: Assignment["id"];

  /*
   * Overall weighted performance score.
   *
   * Range:
   * 0 - 100
   */
  overallScore: number;

  /*
   * Overall completion percentage.
   *
   * Range:
   * 0 - 100
   */
  progress: number;

  status: PerformanceInstanceStatus;

  employeeComments?: string;

  managerComments?: string;

  createdAt: string;

  submittedAt?: string;

  approvedAt?: string;

  completedAt?: string;
}