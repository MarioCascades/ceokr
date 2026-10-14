
import type { PerformanceInstance } from "@/lib/domain/performanceinstance";
import type { MemberObjective } from "@/lib/domain/memberokr";

import {
  createPerformanceInstanceObjective,
  findPerformanceInstanceObjectives,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import {
  createPerformanceInstanceKeyResult,
  findPerformanceInstanceKeyResults,
  updatePerformanceInstanceKeyResult,
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

   Member OKRs own employee performance definitions.
   Runtime owns monthly execution and historical records.

   Existing Runtime KR configuration is synchronized from
   Member OKRs, but progress, scores, and comments are not
   overwritten by this configuration update.

   IMPORTANT:
   Configuration synchronization must only be invoked for
   the active month's Runtime instance. Historical snapshots
   must retain their original configuration.
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
    existingKeyResults
      .filter(
        (keyResult) =>
          keyResult.sourceKeyResultId
      )
      .map((keyResult) => [
        keyResult.sourceKeyResultId!,
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

    if (objective.isHidden) {
      continue;
    }

    const activeKeyResults =
      objective.keyResults.filter(
        (keyResult) => !keyResult.isHidden
      );

    if (activeKeyResults.length === 0) {
      continue;
    }

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
      keyResultPosition < activeKeyResults.length;
      keyResultPosition++
    ) {
      const keyResult =
        activeKeyResults[keyResultPosition];

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
              keyResult.scoringMethod,
            position:
              keyResultPosition,
          });

        keyResultBySourceId.set(
          keyResult.id,
          instanceKeyResult
        );
      } else {
        const configurationChanged =
          instanceKeyResult.title !==
            keyResult.title ||
          String(instanceKeyResult.target ?? "") !==
            String(keyResult.target ?? "") ||
          instanceKeyResult.weight !==
            keyResult.weight ||
          instanceKeyResult.measurementType !==
            keyResult.measurementType ||
          instanceKeyResult.scoringMethod !==
            keyResult.scoringMethod;

        if (configurationChanged) {
          instanceKeyResult =
            await updatePerformanceInstanceKeyResult({
              performanceInstanceId:
                performanceInstance.id,
              keyResultId:
                instanceKeyResult.id,
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
            });

          keyResultBySourceId.set(
            keyResult.id,
            instanceKeyResult
          );
        }
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
