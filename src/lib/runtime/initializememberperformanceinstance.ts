import type { PerformanceInstance } from "@/lib/domain/performanceinstance";
import type { MemberObjective } from "@/lib/domain/memberokr";

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
   Initialize Member Performance Instance
   ----------------------------------------------------------
   Creates the monthly Runtime snapshot from the authoritative
   Member OKR domain.

   Member OKRs own:
   - Objectives
   - Key Results
   - Initiatives

   Runtime owns:
   - monthly snapshots
   - current values
   - scores
   - comments
   - execution state

   The Performance Builder is intentionally not involved in
   creating employee-specific Runtime content.
========================================================== */

export async function initializeMemberPerformanceInstance(
  performanceInstance: PerformanceInstance,
  objectives: MemberObjective[]
) {
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

  const objectiveBySourceId = new Map(
    existingObjectives.map((objective) => [
      objective.sourceObjectiveId,
      objective,
    ])
  );

  const keyResultBySourceId = new Map(
    existingKeyResults.map((keyResult) => [
      keyResult.sourceKeyResultId,
      keyResult,
    ])
  );

  const progressBySourceKeyResultId = new Map(
    existingProgress.map((progress) => [
      progress.keyResultId,
      progress,
    ])
  );

  const createdProgress = [];

  for (
    let objectivePosition = 0;
    objectivePosition < objectives.length;
    objectivePosition++
  ) {
    const objective = objectives[objectivePosition];

    let instanceObjective =
      objectiveBySourceId.get(objective.id);

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

    for (
      let keyResultPosition = 0;
      keyResultPosition < objective.keyResults.length;
      keyResultPosition++
    ) {
      const keyResult =
        objective.keyResults[keyResultPosition];

      let instanceKeyResult =
        keyResultBySourceId.get(keyResult.id);

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
              keyResult.scoringMethod ===
              "display_only"
                ? undefined
                : keyResult.scoringMethod,

            position:
              keyResultPosition,
          });

        keyResultBySourceId.set(
          keyResult.id,
          instanceKeyResult
        );
      }

      const initiatives =
        keyResult.initiatives ?? [];

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

      for (
        let initiativePosition = 0;
        initiativePosition < initiatives.length;
        initiativePosition++
      ) {
        const initiative =
          initiatives[initiativePosition];

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

          objectiveId:
            objective.id,

          keyResultId:
            keyResult.id,

          currentValue:
            "",

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

      createdProgress.push(progress);
    }
  }

  return createdProgress;
}