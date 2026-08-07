import type { BuilderDocument } from "@/lib/types/builderdocument";

import {
  findKeyResultProgressByPerformanceInstance,
  createKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";

import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

/* ==========================================================
   Initialize Performance Instance
   ----------------------------------------------------------
   Creates Runtime Key Result Progress records from the
   immutable published Builder definition.

   Builder owns:
   - Objectives
   - Key Results
   - Initiatives
   - Definitions

   Runtime owns:
   - Current values
   - Scores
   - Status
   - Confidence
   - Comments
========================================================== */

export async function initializePerformanceInstance(
  performanceInstance: PerformanceInstance,
  document: BuilderDocument
) {
  /*
   * Prevent duplicate Runtime progress records if
   * initialization is called more than once.
   */
  const existingProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  const existingKeyResultIds =
    new Set(
      existingProgress.map(
        (progress) =>
          progress.keyResultId
      )
    );

  const createdProgress = [];

  /*
   * Walk the immutable published Builder definition.
   *
   * We only copy the identity of each Key Result
   * into Runtime.
   *
   * We intentionally DO NOT copy:
   *
   * - current
   * - score
   *
   * Those belong to Runtime execution.
   */
  for (const objective of document.objectives) {
    for (const keyResult of objective.keyResults) {
      if (
        existingKeyResultIds.has(
          keyResult.id
        )
      ) {
        continue;
      }

      const progress =
        await createKeyResultProgress({
          performanceInstanceId:
            performanceInstance.id,

          objectiveId:
            objective.id,

          keyResultId:
            keyResult.id,

          /*
           * Runtime starts with no measured value.
           */
          currentValue:
            "",

          /*
           * Runtime starts with a zero score.
           *
           * The score will be calculated when
           * the Key Result receives runtime data.
           */
          score:
            0,

          /*
           * No confidence assessment exists
           * when execution is first initialized.
           */
          confidence:
            undefined,

          employeeComment:
            undefined,

          managerComment:
            undefined,

          /*
           * The Key Result exists in the
           * Performance Instance but has not
           * received runtime progress yet.
           */
          status:
            "not_started",
        });

      createdProgress.push(
        progress
      );
    }
  }

  return createdProgress;
}