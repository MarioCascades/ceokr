import type { PerformanceInstance } from "./performanceinstance";

/* ==========================================================
   Key Result Progress
========================================================== */

export type KeyResultProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

/* ==========================================================
   Key Result Progress
========================================================== */

export interface KeyResultProgress {
  id: string;

  performanceInstanceId: PerformanceInstance["id"];

  /*
   * References the immutable Builder definition.
   */
  objectiveId: string;

  keyResultId: string;

  /*
   * Current measured value.
   *
   * Examples:
   * Revenue = 4.2M
   * Sales Calls = 58
   * Status = "On Track"
   */
  currentValue: number | string;

  /*
   * Current calculated score.
   *
   * Range:
   * 0 - 100
   */
  score: number;

  /*
   * Optional confidence rating.
   *
   * Range:
   * 0 - 100
   */
  confidence?: number;

  employeeComment?: string;

  managerComment?: string;

  status: KeyResultProgressStatus;

  createdAt: string;

  updatedAt: string;
}