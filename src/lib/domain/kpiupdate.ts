import type { KeyResultProgress } from "./keyresultprogress";

/* ==========================================================
   KPI Update
========================================================== */

export interface KPIUpdate {
  id: string;

  /*
   * The Key Result Progress record that
   * this update belongs to.
   */
  keyResultProgressId: KeyResultProgress["id"];

  /*
   * Previous recorded value.
   */
  previousValue?: number | string;

  /*
   * New recorded value.
   */
  currentValue: number | string;

  /*
   * Calculated score after the update.
   *
   * Range:
   * 0 - 100
   */
  score: number;

  /*
   * Optional confidence percentage.
   *
   * Range:
   * 0 - 100
   */
  confidence?: number;

  /*
   * Optional update comment.
   */
  comment?: string;

  /*
   * User that submitted this update.
   */
  updatedBy: string;

  createdAt: string;
}