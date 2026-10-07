import type { PerformanceInstance } from "@/lib/domain/performanceinstance";
import type { KeyResultProgress } from "@/lib/domain/keyresultprogress";

import {
  findKeyResultProgressById,
  findKeyResultProgressByPerformanceInstance,
  updateKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

export interface UpdateKeyResultProgressInput {
  organizationId: string;
  performanceInstanceId: string;
  keyResultProgressId: string;
  currentValue: number | string;
  score: number;
  employeeComment?: string;
  managerComment?: string;
  status: KeyResultProgress["status"];
}

export async function updateRuntimeKeyResultProgress(
  input: UpdateKeyResultProgressInput
): Promise<{
  keyResultProgress: KeyResultProgress;
  performanceInstance: PerformanceInstance;
}> {
  const performanceInstance = await findPerformanceInstanceById(
    input.organizationId,
    input.performanceInstanceId
  );

  if (!performanceInstance) {
    throw new Error("Performance Instance not found.");
  }

  const existingProgress = await findKeyResultProgressById(
    input.keyResultProgressId
  );

  if (!existingProgress) {
    throw new Error("Key Result Progress not found.");
  }

  if (
    existingProgress.performanceInstanceId !== performanceInstance.id
  ) {
    throw new Error(
      "Key Result Progress does not belong to the specified Performance Instance."
    );
  }

  if (input.score < 0 || input.score > 100) {
    throw new Error("Score must be between 0 and 100.");
  }

  const updatedProgress = await updateKeyResultProgress({
    ...existingProgress,
    currentValue: input.currentValue,
    score: input.score,
    confidence: existingProgress.confidence,
    employeeComment: input.employeeComment,
    managerComment: input.managerComment,
    status: input.status,
  });

  /*
   * Keep the existing aggregate calculations for callers that still use
   * this service directly.
   *
   * IMPORTANT:
   * Performance Instance status is intentionally NOT recalculated here.
   *
   * The Runtime Performance Sheet global Save is now the single owner of
   * the Performance Instance lifecycle status. A successful global Save
   * sets the Performance Instance to "completed", while keeping the sheet
   * fully editable afterward.
   */
  const progressRecords =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  let overallScore = 0;

  if (progressRecords.length > 0) {
    const totalScore = progressRecords.reduce(
      (total, progress) => total + progress.score,
      0
    );

    overallScore = totalScore / progressRecords.length;
  }

  let progressPercentage = 0;

  if (progressRecords.length > 0) {
    const completedCount = progressRecords.filter(
      (progress) => progress.status === "completed"
    ).length;

    progressPercentage =
      (completedCount / progressRecords.length) * 100;
  }

  /*
   * Preserve the current Performance Instance status.
   *
   * This prevents an individual Key Result save from changing a
   * Performance Instance from "completed" back to "in_progress".
   */
  const updatedPerformanceInstance = await updatePerformanceInstance({
    ...performanceInstance,
    overallScore,
    progress: progressPercentage,
    status: performanceInstance.status,
  });

  return {
    keyResultProgress: updatedProgress,
    performanceInstance: updatedPerformanceInstance,
  };
}