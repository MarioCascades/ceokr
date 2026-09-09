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
   * References the Performance Instance snapshot Key Result.
   *
   * This is the Runtime source of truth for the Key Result
   * being measured.
   */
  performanceInstanceKeyResultId: string;

  /*
   * Legacy Builder source identifiers.
   *
   * These are retained temporarily for compatibility with
   * existing Runtime code and historical records.
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