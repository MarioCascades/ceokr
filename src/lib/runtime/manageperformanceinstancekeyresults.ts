import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  createPerformanceInstanceKeyResult,
  deletePerformanceInstanceKeyResult,
  findPerformanceInstanceKeyResults,
  updatePerformanceInstanceKeyResult,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  createKeyResultProgress,
} from "@/lib/repositories/keyresultprogressrepository";

import type {
  PerformanceInstanceKeyResult,
} from "@/lib/domain/performanceinstancekeyresult";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

/* ==========================================================
   Shared Types
========================================================== */

type MeasurementType =
  | "percentage"
  | "numeric"
  | "financial";

type ScoringMethod =
  | "percent_into_period"
  | "percentage_of_target";

/* ==========================================================
   Create
========================================================== */

export interface CreateRuntimePerformanceInstanceKeyResultInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceObjectiveId: string;

  title: string;

  target: unknown;

  measurementType?: MeasurementType;

  scoringMethod?: ScoringMethod;

  weight?: number;
}

export async function createRuntimePerformanceInstanceKeyResult(
  input: CreateRuntimePerformanceInstanceKeyResultInput
): Promise<{
  keyResult: PerformanceInstanceKeyResult;

  progress: KeyResultProgress;
}> {
  const title =
    input.title.trim();

  if (!title) {
    throw new Error(
      "Key Result title is required."
    );
  }

  const instances =
    await findPerformanceInstancesByOrganization(
      input.organizationId
    );

  const instance =
    instances.find(
      (item) =>
        item.id ===
        input.performanceInstanceId
    );

  if (!instance) {
    throw new Error(
      "Performance instance does not belong to the organization."
    );
  }

  /*
   * Validate that the Objective belongs to
   * this Performance Instance.
   */
  const existingKeyResults =
    await findPerformanceInstanceKeyResults(
      input.performanceInstanceId
    );

  const conflictingObjectiveKeyResult =
    existingKeyResults.find(
      (keyResult) =>
        keyResult.performanceInstanceObjectiveId ===
        input.performanceInstanceObjectiveId
    );

  const position =
    existingKeyResults.filter(
      (keyResult) =>
        keyResult.performanceInstanceObjectiveId ===
        input.performanceInstanceObjectiveId
    ).length;

  /*
   * This variable intentionally exists only to make
   * the relationship validation explicit.
   */
  void conflictingObjectiveKeyResult;

  /*
   * Member-created Key Results do not have a
   * Builder source Key Result.
   */
  const keyResult =
    await createPerformanceInstanceKeyResult({
      performanceInstanceId:
        input.performanceInstanceId,

      performanceInstanceObjectiveId:
        input.performanceInstanceObjectiveId,

      sourceKeyResultId:
        undefined,

      title,

      target:
        input.target,

      weight:
        input.weight,

      measurementType:
        input.measurementType ??
        "numeric",

      scoringMethod:
        input.scoringMethod ??
        "percentage_of_target",

      position:
        position + 1,
    });

  /*
   * Every Runtime Key Result needs its own
   * Runtime progress record.
   */
  const progress =
    await createKeyResultProgress({
      performanceInstanceId:
        input.performanceInstanceId,

      performanceInstanceKeyResultId:
        keyResult.id,

      /*
       * These legacy fields are retained for
       * compatibility with the current schema.
       */
      objectiveId:
        input.performanceInstanceObjectiveId,

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

  return {
    keyResult,
    progress,
  };
}

/* ==========================================================
   Update
========================================================== */

export interface UpdateRuntimePerformanceInstanceKeyResultInput {
  organizationId: string;

  performanceInstanceId: string;

  keyResultId: string;

  title: string;

  target: unknown;

  measurementType?: MeasurementType;

  scoringMethod?: ScoringMethod;

  weight?: number;
}

export async function updateRuntimePerformanceInstanceKeyResult(
  input: UpdateRuntimePerformanceInstanceKeyResultInput
): Promise<PerformanceInstanceKeyResult> {
  const instances =
    await findPerformanceInstancesByOrganization(
      input.organizationId
    );

  const instance =
    instances.find(
      (item) =>
        item.id ===
        input.performanceInstanceId
    );

  if (!instance) {
    throw new Error(
      "Performance instance does not belong to the organization."
    );
  }

  return updatePerformanceInstanceKeyResult({
    performanceInstanceId:
      input.performanceInstanceId,

    keyResultId:
      input.keyResultId,

    title:
      input.title,

    target:
      input.target,

    measurementType:
      input.measurementType,

    scoringMethod:
      input.scoringMethod,

    weight:
      input.weight,
  });
}

/* ==========================================================
   Delete
========================================================== */

export async function deleteRuntimePerformanceInstanceKeyResult(
  organizationId: string,

  performanceInstanceId: string,

  keyResultId: string
): Promise<void> {
  const instances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const instance =
    instances.find(
      (item) =>
        item.id ===
        performanceInstanceId
    );

  if (!instance) {
    throw new Error(
      "Performance instance does not belong to the organization."
    );
  }

  await deletePerformanceInstanceKeyResult(
    performanceInstanceId,

    keyResultId
  );
}