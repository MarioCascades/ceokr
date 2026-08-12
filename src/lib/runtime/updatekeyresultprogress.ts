import type { PerformanceInstance } from "@/lib/domain/performanceinstance";
import type { KeyResultProgress } from "@/lib/domain/keyresultprogress";

import {
  findKeyResultProgressById,
  updateKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

/* ==========================================================
   Update Runtime Key Result Progress
========================================================== */

/**
 * Updates the Runtime state for a single Key Result.
 *
 * Builder definitions remain immutable.
 *
 * Runtime owns:
 *
 * - currentValue
 * - score
 * - confidence
 * - comments
 * - status
 *
 * The Performance Instance aggregate is recalculated
 * after the Key Result Progress is updated.
 */

export interface UpdateKeyResultProgressInput {
  organizationId: string;

  performanceInstanceId: string;

  keyResultProgressId: string;

  currentValue: number | string;

  score: number;

  confidence?: number;

  employeeComment?: string;

  managerComment?: string;

  status: KeyResultProgress["status"];
}

/* ==========================================================
   Update
========================================================== */

export async function updateRuntimeKeyResultProgress(
  input: UpdateKeyResultProgressInput
): Promise<{
  keyResultProgress: KeyResultProgress;
  performanceInstance: PerformanceInstance;
}> {
  /* ========================================================
     Load Performance Instance
  ======================================================== */

  const performanceInstance =
    await findPerformanceInstanceById(
      input.organizationId,
      input.performanceInstanceId
    );

  if (!performanceInstance) {
    throw new Error(
      "Performance Instance not found."
    );
  }

  /* ========================================================
     Load Key Result Progress
  ======================================================== */

  const existingProgress =
    await findKeyResultProgressById(
      input.keyResultProgressId
    );

  if (!existingProgress) {
    throw new Error(
      "Key Result Progress not found."
    );
  }

  /* ========================================================
     Validate Runtime Relationship
  ======================================================== */

  if (
    existingProgress.performanceInstanceId !==
    performanceInstance.id
  ) {
    throw new Error(
      "Key Result Progress does not belong to the Performance Instance."
    );
  }

  /* ========================================================
     Validate Score
  ======================================================== */

  if (
    input.score < 0 ||
    input.score > 100
  ) {
    throw new Error(
      "Key Result score must be between 0 and 100."
    );
  }

  /* ========================================================
     Validate Confidence
  ======================================================== */

  if (
    input.confidence !== undefined &&
    (
      input.confidence < 0 ||
      input.confidence > 100
    )
  ) {
    throw new Error(
      "Confidence must be between 0 and 100."
    );
  }

  /* ========================================================
     Update Key Result Progress
  ======================================================== */

  const updatedProgress =
    await updateKeyResultProgress({
      ...existingProgress,

      currentValue:
        input.currentValue,

      score:
        input.score,

      confidence:
        input.confidence,

      employeeComment:
        input.employeeComment,

      managerComment:
        input.managerComment,

      status:
        input.status,
    });

  /* ========================================================
     Load All Runtime Key Results
  ======================================================== */

  /*
   * We need the complete Runtime state in order
   * to calculate the Performance Instance aggregate.
   *
   * This intentionally operates on Runtime records,
   * not the Builder definition.
   */

  const { findKeyResultProgressByPerformanceInstance } =
    await import(
      "@/lib/repositories/keyresultprogressrepository"
    );

  const progressRecords =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  /* ========================================================
     Calculate Overall Score
  ======================================================== */

  let overallScore = 0;

  if (progressRecords.length > 0) {
    const totalScore =
      progressRecords.reduce(
        (total, progress) =>
          total + progress.score,
        0
      );

    overallScore =
      totalScore /
      progressRecords.length;
  }

  /* ========================================================
     Calculate Progress
  ======================================================== */

  let progressPercentage = 0;

  if (progressRecords.length > 0) {
    const completedCount =
      progressRecords.filter(
        (progress) =>
          progress.status ===
          "completed"
      ).length;

    progressPercentage =
      (
        completedCount /
        progressRecords.length
      ) * 100;
  }

  /* ========================================================
     Determine Performance Status
  ======================================================== */

  let performanceStatus =
    performanceInstance.status;

  if (
    progressRecords.length > 0 &&
    progressRecords.every(
      (progress) =>
        progress.status ===
        "completed"
    )
  ) {
    performanceStatus =
      "completed";
  } else {
    performanceStatus =
      "in_progress";
  }

  /* ========================================================
     Update Performance Instance
  ======================================================== */

  const updatedPerformanceInstance =
    await updatePerformanceInstance({
      ...performanceInstance,

      overallScore,

      progress:
        progressPercentage,

      status:
        performanceStatus,
    });

  /* ========================================================
     Return Runtime State
  ======================================================== */

  return {
    keyResultProgress:
      updatedProgress,

    performanceInstance:
      updatedPerformanceInstance,
  };
}