import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceKeyResults,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  createPerformanceInstanceInitiative,
  deletePerformanceInstanceInitiative,
  findPerformanceInstanceInitiativesByKeyResult,
  updatePerformanceInstanceInitiative,
} from "@/lib/repositories/performanceinstanceinitiativerepository";

import type {
  PerformanceInstanceInitiative,
} from "@/lib/domain/performanceinstanceinitiative";

/* ==========================================================
   Constants
========================================================== */

const MAX_INITIATIVES_PER_KEY_RESULT = 3;

/* ==========================================================
   Create
========================================================== */

export interface CreateRuntimePerformanceInstanceInitiativeInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceKeyResultId: string;

  text: string;
}

export async function createRuntimePerformanceInstanceInitiative(
  input:
    CreateRuntimePerformanceInstanceInitiativeInput
): Promise<PerformanceInstanceInitiative> {
  const text =
    input.text.trim();

  if (!text) {
    throw new Error(
      "Initiative text is required."
    );
  }

  /*
   * First establish that the Performance Instance
   * belongs to the selected Organization.
   */
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
   * Establish that the selected Key Result
   * belongs to this Performance Instance.
   */
  const keyResults =
    await findPerformanceInstanceKeyResults(
      input.performanceInstanceId
    );

  const keyResult =
    keyResults.find(
      (item) =>
        item.id ===
        input.performanceInstanceKeyResultId
    );

  if (!keyResult) {
    throw new Error(
      "Key Result does not belong to the Performance Instance."
    );
  }

  /*
   * Load the existing Initiatives for this
   * specific Key Result.
   */
  const existingInitiatives =
    await findPerformanceInstanceInitiativesByKeyResult(
      input.performanceInstanceKeyResultId
    );

  /*
   * Hard product rule:
   *
   * A Key Result can have a maximum of
   * three Initiatives.
   */
  if (
    existingInitiatives.length >=
    MAX_INITIATIVES_PER_KEY_RESULT
  ) {
    throw new Error(
      "A Key Result can have a maximum of 3 Initiatives."
    );
  }

  /*
   * Member-created Initiatives do not originate
   * from a Builder Initiative.
   */
  return createPerformanceInstanceInitiative({
    performanceInstanceKeyResultId:
      input.performanceInstanceKeyResultId,

    sourceInitiativeId:
      undefined,

    text,

    position:
      existingInitiatives.length + 1,
  });
}

/* ==========================================================
   Update
========================================================== */

export interface UpdateRuntimePerformanceInstanceInitiativeInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceKeyResultId: string;

  initiativeId: string;

  text: string;
}

export async function updateRuntimePerformanceInstanceInitiative(
  input:
    UpdateRuntimePerformanceInstanceInitiativeInput
): Promise<PerformanceInstanceInitiative> {
  const text =
    input.text.trim();

  if (!text) {
    throw new Error(
      "Initiative text is required."
    );
  }

  /*
   * Verify Performance Instance ownership.
   */
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
   * Verify the Key Result belongs to this
   * Performance Instance.
   */
  const keyResults =
    await findPerformanceInstanceKeyResults(
      input.performanceInstanceId
    );

  const keyResult =
    keyResults.find(
      (item) =>
        item.id ===
        input.performanceInstanceKeyResultId
    );

  if (!keyResult) {
    throw new Error(
      "Key Result does not belong to the Performance Instance."
    );
  }

  /*
   * Verify the Initiative belongs to this
   * specific Key Result.
   */
  const initiatives =
    await findPerformanceInstanceInitiativesByKeyResult(
      input.performanceInstanceKeyResultId
    );

  const initiative =
    initiatives.find(
      (item) =>
        item.id ===
        input.initiativeId
    );

  if (!initiative) {
    throw new Error(
      "Initiative does not belong to the Key Result."
    );
  }

  return updatePerformanceInstanceInitiative({
    performanceInstanceKeyResultId:
      input.performanceInstanceKeyResultId,

    initiativeId:
      input.initiativeId,

    text,
  });
}

/* ==========================================================
   Delete
========================================================== */

export async function deleteRuntimePerformanceInstanceInitiative(
  organizationId: string,

  performanceInstanceId: string,

  performanceInstanceKeyResultId: string,

  initiativeId: string
): Promise<void> {
  /*
   * Verify Performance Instance ownership.
   */
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

  /*
   * Verify the Key Result belongs to this
   * Performance Instance.
   */
  const keyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstanceId
    );

  const keyResult =
    keyResults.find(
      (item) =>
        item.id ===
        performanceInstanceKeyResultId
    );

  if (!keyResult) {
    throw new Error(
      "Key Result does not belong to the Performance Instance."
    );
  }

  /*
   * Verify the Initiative belongs to this
   * Key Result before deleting it.
   */
  const initiatives =
    await findPerformanceInstanceInitiativesByKeyResult(
      performanceInstanceKeyResultId
    );

  const initiative =
    initiatives.find(
      (item) =>
        item.id ===
        initiativeId
    );

  if (!initiative) {
    throw new Error(
      "Initiative does not belong to the Key Result."
    );
  }

  await deletePerformanceInstanceInitiative(
    performanceInstanceKeyResultId,

    initiativeId
  );
}