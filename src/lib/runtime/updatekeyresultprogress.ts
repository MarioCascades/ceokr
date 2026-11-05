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

import {
  findPerformanceInstanceKeyResults,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

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

  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
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
   * Recalculate Overall Score using only eligible weighted Runtime KRs.
   * Display Only KRs, zero/missing weights, and blank actual values are
   * excluded. An entered numeric zero remains a valid actual value.
   */
  const [progressRecords, keyResults] = await Promise.all([
    findKeyResultProgressByPerformanceInstance(performanceInstance.id),
    findPerformanceInstanceKeyResults(performanceInstance.id),
  ]);

  const keyResultMap = new Map(
    keyResults.map((keyResult) => [keyResult.id, keyResult])
  );

  let weightedScoreTotal = 0;
  let includedWeightTotal = 0;

  for (const progress of progressRecords) {
    const keyResult = keyResultMap.get(
      progress.performanceInstanceKeyResultId
    );

    if (!keyResult || keyResult.scoringMethod === "display_only") {
      continue;
    }

    const weight = keyResult.weight;

    if (
      typeof weight !== "number" ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      continue;
    }

    const currentValue = progress.currentValue;
    const hasActualValue =
      typeof currentValue === "number"
        ? Number.isFinite(currentValue)
        : typeof currentValue === "string" && currentValue.trim().length > 0;

    if (!hasActualValue || !Number.isFinite(progress.score)) {
      continue;
    }

    weightedScoreTotal += progress.score * weight;
    includedWeightTotal += weight;
  }

  // Keep the existing required numeric domain/database contract.
  const overallScore =
  includedWeightTotal > 0
    ? weightedScoreTotal / includedWeightTotal
    : 100;

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
   * An individual Key Result save must not change a completed instance
   * back to in_progress or otherwise alter its lifecycle state.
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
