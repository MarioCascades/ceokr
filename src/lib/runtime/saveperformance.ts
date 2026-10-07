import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceKeyResults,
  updatePerformanceInstanceKeyResult,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  findKeyResultProgressByPerformanceInstance,
  updateKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";


/* ==========================================================
   Runtime Performance Sheet Draft
========================================================== */

export interface SaveRuntimePerformanceKeyResultInput {
  /*
   * This value is retained in the Runtime draft contract
   * for compatibility with the existing UI.
   *
   * Runtime persistence does NOT use this field as the
   * authoritative relationship.
   *
   * The authoritative Runtime Key Result is resolved through:
   *
   *   progressId
   *     -> KeyResultProgress
   *     -> performanceInstanceKeyResultId
   */
  keyResultId: string;

  progressId: string;

  target: unknown;

  currentValue: number | string;

  score: number;

  employeeComment?: string;

  managerComment?: string;
}


export interface SaveRuntimePerformanceSheetInput {
  organizationId: string;

  performanceInstanceId: string;

  employeeComments?: string;

  keyResults:
    SaveRuntimePerformanceKeyResultInput[];
}


/* ==========================================================
   Save Runtime Performance Sheet
========================================================== */

/**
 * Persists the complete Runtime Performance Sheet from
 * one global Save operation.
 *
 * Runtime owns:
 *
 * - Key Result target
 * - Current Value
 * - Score
 * - Employee comments
 * - Manager comments
 * - Performance Instance overall score
 * - Performance Instance progress
 * - Performance Instance status
 *
 * The Performance Instance is automatically marked
 * completed after a successful save.
 *
 * Completed Performance Instances remain editable.
 *
 * Runtime Key Result ownership is resolved through the
 * Performance Instance Key Result snapshot referenced by
 * KeyResultProgress.performanceInstanceKeyResultId.
 */
export async function saveRuntimePerformanceSheet(
  input: SaveRuntimePerformanceSheetInput
): Promise<{
  performanceInstance: PerformanceInstance;

  keyResultProgress: KeyResultProgress[];
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
     Load Runtime Key Results
  ======================================================== */

  const keyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstance.id
    );


  /* ========================================================
     Build Runtime Key Result Map
  ======================================================== */

  /*
   * These are Performance Instance Key Result snapshots.
   *
   * Their IDs are the authoritative Runtime Key Result IDs
   * for this Performance Instance.
   */
  const keyResultMap =
    new Map(
      keyResults.map(
        (keyResult) => [
          keyResult.id,
          keyResult,
        ]
      )
    );


  /* ========================================================
     Load Runtime Progress
  ======================================================== */

  const progressRecords =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );


  const progressMap =
    new Map(
      progressRecords.map(
        (progress) => [
          progress.id,
          progress,
        ]
      )
    );


  /* ========================================================
     Save Key Result Drafts
  ======================================================== */

  const savedProgress:
    KeyResultProgress[] = [];


  for (
    const draft of input.keyResults
  ) {

    /* ======================================================
       Resolve Progress
    ====================================================== */

    const progress =
      progressMap.get(
        draft.progressId
      );


    if (!progress) {

      throw new Error(
        `Key Result Progress ${draft.progressId} was not found.`
      );

    }


    if (
      progress.performanceInstanceId !==
      performanceInstance.id
    ) {

      throw new Error(
        "Key Result Progress does not belong to the Performance Instance."
      );

    }


    /* ======================================================
       Resolve Runtime Key Result
    ====================================================== */

    /*
     * IMPORTANT:
     *
     * Do NOT resolve the Runtime Key Result from:
     *
     *   draft.keyResultId
     *
     * or:
     *
     *   progress.keyResultId
     *
     * Those fields can represent the legacy/source
     * relationship.
     *
     * Runtime persistence must follow the actual snapshot
     * relationship stored on the progress record:
     *
     *   performanceInstanceKeyResultId
     */
    const runtimeKeyResultId =
      progress.performanceInstanceKeyResultId;


    if (!runtimeKeyResultId) {

      throw new Error(
        `Key Result Progress ${progress.id} is missing its Runtime Performance Instance Key Result relationship.`
      );

    }


    const keyResult =
      keyResultMap.get(
        runtimeKeyResultId
      );


    if (!keyResult) {

      throw new Error(
        `Runtime Key Result ${runtimeKeyResultId} does not belong to this Performance Instance.`
      );

    }


    /* ======================================================
       Validate Progress Relationship
    ====================================================== */

    /*
     * The progress record is already tied to the Runtime
     * Key Result through performanceInstanceKeyResultId.
     *
     * We intentionally do not validate progress.keyResultId
     * against the Runtime Key Result ID because keyResultId
     * is a legacy/source-compatible field.
     */


    /* ======================================================
       Validate Score
    ====================================================== */

    if (
      !Number.isFinite(
        draft.score
      )
    ) {

      throw new Error(
        `Invalid score for Key Result "${keyResult.title}".`
      );

    }


    if (
      draft.score < 0 ||
      draft.score > 100
    ) {

      throw new Error(
        `Key Result "${keyResult.title}" must have a score between 0 and 100.`
      );

    }


    /* ======================================================
       Save Target
    ====================================================== */

    await updatePerformanceInstanceKeyResult({

      performanceInstanceId:
        performanceInstance.id,

      /*
       * IMPORTANT:
       *
       * Use the Runtime Performance Instance Key Result ID
       * resolved from KeyResultProgress.
       */
      keyResultId:
        runtimeKeyResultId,

      title:
        keyResult.title,

      target:
        draft.target,

      measurementType:
        keyResult.measurementType,

      scoringMethod:
        keyResult.scoringMethod,

      weight:
        keyResult.weight,
    });


    /* ======================================================
       Save Runtime Progress
    ====================================================== */

    const updatedProgress =
      await updateKeyResultProgress({

        ...progress,

        currentValue:
          draft.currentValue,

        score:
          draft.score,

        confidence:
          progress.confidence,

        employeeComment:
          draft.employeeComment,

        managerComment:
          draft.managerComment,

        /*
         * The global Save represents a completed
         * Performance Instance save.
         *
         * This does NOT lock the Performance Instance.
         * It only records the saved Runtime state.
         */
        status:
          "completed",
      });


    savedProgress.push(
      updatedProgress
    );

  }


  /* ========================================================
     Reload Progress
  ======================================================== */

  /*
   * Reload after writes so the returned state represents
   * the actual persisted Runtime data rather than only the
   * local draft values.
   */
  const persistedProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );


  /*
   * If the sheet contains progress records that were not
   * represented in the draft payload, preserve them rather
   * than accidentally deleting or overwriting them.
   */
  const progressById =
    new Map(
      persistedProgress.map(
        (progress) => [
          progress.id,
          progress,
        ]
      )
    );


  for (
    const progress of savedProgress
  ) {

    progressById.set(
      progress.id,
      progress
    );

  }


  const finalProgress =
    Array.from(
      progressById.values()
    );


  /* ========================================================
     Calculate Overall Score
  ======================================================== */

  let overallScore = 0;


  if (
    finalProgress.length > 0
  ) {

    const totalScore =
      finalProgress.reduce(
        (
          total,
          progress
        ) =>
          total +
          progress.score,
        0
      );


    overallScore =
      totalScore /
      finalProgress.length;

  }


  /* ========================================================
     Calculate Progress
  ======================================================== */

  const progressPercentage =
    finalProgress.length > 0
      ? 100
      : 0;


  /* ========================================================
     Save Performance Instance
  ======================================================== */

  const updatedPerformanceInstance =
    await updatePerformanceInstance({

      ...performanceInstance,

      employeeComments:
        input.employeeComments ??
        performanceInstance.employeeComments,

      overallScore,

      progress:
        progressPercentage,

      /*
       * Status is automatic.
       *
       * A successful global Save marks the
       * Performance Instance completed.
       *
       * The instance remains editable because
       * Runtime does not use completion as a
       * locking mechanism.
       */
      status:
        "completed",
    });


  /* ========================================================
     Return Persisted Runtime State
  ======================================================== */

  return {

    performanceInstance:
      updatedPerformanceInstance,

    keyResultProgress:
      finalProgress,

  };

}