import type { BuilderDocument } from "@/lib/types/builderdocument";

import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

import {
  createPerformanceInstanceObjective,
  findPerformanceInstanceObjectives,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import {
  createPerformanceInstanceKeyResult,
  findPerformanceInstanceKeyResults,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  createPerformanceInstanceInitiative,
  findPerformanceInstanceInitiativesByKeyResult,
} from "@/lib/repositories/performanceinstanceinitiativerepository";

import {
  findKeyResultProgressByPerformanceInstance,
  createKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";

/* ==========================================================
   Initialize Performance Instance
   ----------------------------------------------------------
   Creates the immutable Runtime snapshot of the published
   Builder definition.

   Builder owns:
   - Objectives
   - Key Results
   - Initiatives
   - Definitions

   Runtime Instance owns:
   - Snapshot of Objectives
   - Snapshot of Key Results
   - Snapshot of Initiatives

   Runtime Progress owns:
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
   * Load existing snapshot records and Runtime progress.
   *
   * Initialization must be safe to run more than once.
   */
  const existingObjectives =
    await findPerformanceInstanceObjectives(
      performanceInstance.id
    );

  const existingKeyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstance.id
    );

  const existingProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  const objectiveBySourceId =
    new Map(
      existingObjectives.map(
        (objective) => [
          objective.sourceObjectiveId,
          objective,
        ]
      )
    );

  const keyResultBySourceId =
    new Map(
      existingKeyResults.map(
        (keyResult) => [
          keyResult.sourceKeyResultId,
          keyResult,
        ]
      )
    );

  const progressBySourceKeyResultId =
    new Map(
      existingProgress.map(
        (progress) => [
          progress.keyResultId,
          progress,
        ]
      )
    );

  const createdProgress = [];

  /*
   * Walk the published Builder definition.
   */
  for (
    let objectivePosition = 0;
    objectivePosition <
    document.objectives.length;
    objectivePosition++
  ) {
    const objective =
      document.objectives[
        objectivePosition
      ];

    /*
     * Create or reuse the instance Objective snapshot.
     */
    let instanceObjective =
      objectiveBySourceId.get(
        objective.id
      );

    if (!instanceObjective) {
      instanceObjective =
        await createPerformanceInstanceObjective({
          performanceInstanceId:
            performanceInstance.id,

          sourceObjectiveId:
            objective.id,

          title:
            objective.title,

          description:
            objective.description,

          weight:
            objective.weight,

          position:
            objectivePosition,
        });

      objectiveBySourceId.set(
        objective.id,
        instanceObjective
      );
    }

    /*
     * Walk the Objective's Key Results.
     */
    for (
      let keyResultPosition = 0;
      keyResultPosition <
      objective.keyResults.length;
      keyResultPosition++
    ) {
      const keyResult =
        objective.keyResults[
          keyResultPosition
        ];

      /*
       * Create or reuse the instance Key Result
       * snapshot.
       */
      let instanceKeyResult =
        keyResultBySourceId.get(
          keyResult.id
        );

      if (!instanceKeyResult) {
        instanceKeyResult =
          await createPerformanceInstanceKeyResult({
            performanceInstanceId:
              performanceInstance.id,

            performanceInstanceObjectiveId:
              instanceObjective.id,

            sourceKeyResultId:
              keyResult.id,

            title:
              keyResult.title,

            target:
              keyResult.target,

            weight:
              keyResult.weight,

            measurementType:
              keyResult.measurementType,

            scoringMethod:
              keyResult.scoringMethod,

            position:
              keyResultPosition,
          });

        keyResultBySourceId.set(
          keyResult.id,
          instanceKeyResult
        );
      }

      /*
       * Builder documents created before initiatives
       * existed may not have an initiatives array.
       *
       * Treat that as an empty collection.
       */
      const initiatives =
        keyResult.initiatives ??
        [];

      /*
       * Load existing Initiative snapshots.
       */
      const existingInitiatives =
        await findPerformanceInstanceInitiativesByKeyResult(
          instanceKeyResult.id
        );

      const existingInitiativeIds =
        new Set(
          existingInitiatives.map(
            (initiative) =>
              initiative.sourceInitiativeId
          )
        );

      /*
       * Create only missing Initiative snapshots.
       */
      for (
        let initiativePosition = 0;
        initiativePosition <
        initiatives.length;
        initiativePosition++
      ) {
        const initiative =
          initiatives[
            initiativePosition
          ];

        if (
          existingInitiativeIds.has(
            initiative.id
          )
        ) {
          continue;
        }

        await createPerformanceInstanceInitiative({
          performanceInstanceKeyResultId:
            instanceKeyResult.id,

          sourceInitiativeId:
            initiative.id,

          text:
            initiative.text,

          position:
            initiativePosition,
        });
      }

      /*
       * Runtime progress is linked to the instance
       * Key Result snapshot.
       *
       * Existing progress is never overwritten.
       */
      const existing =
        progressBySourceKeyResultId.get(
          keyResult.id
        );

      if (existing) {
        continue;
      }

      const progress =
        await createKeyResultProgress({
          performanceInstanceId:
            performanceInstance.id,

          performanceInstanceKeyResultId:
            instanceKeyResult.id,

          /*
           * Retained temporarily for compatibility
           * with existing Runtime code.
           */
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
           */
          score:
            0,

          confidence:
            undefined,

          employeeComment:
            undefined,

          managerComment:
            undefined,

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