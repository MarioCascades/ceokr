import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceObjectives,
  createPerformanceInstanceObjective,
  deletePerformanceInstanceObjective,
  updatePerformanceInstanceObjective,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

/* ==========================================================
   Create
========================================================== */

export interface CreatePerformanceInstanceObjectiveInput {
  organizationId: string;

  performanceInstanceId: string;

  title: string;

  description?: string;
}

export async function createRuntimePerformanceInstanceObjective(
  input:
    CreatePerformanceInstanceObjectiveInput
): Promise<PerformanceInstanceObjective> {
  const title =
    input.title.trim();

  if (!title) {
    throw new Error(
      "Objective title is required."
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
   * Member-created Objectives do not have a Builder
   * source Objective.
   */
  const existingObjectives =
    await findPerformanceInstanceObjectives(
      input.performanceInstanceId
    );

  return createPerformanceInstanceObjective({
    performanceInstanceId:
      input.performanceInstanceId,

    sourceObjectiveId:
      undefined,

    title,

    description:
      input.description?.trim() ||
      undefined,

    /*
     * Weight is intentionally not member-managed yet.
     * New Objectives begin without an explicit weight.
     */
    weight:
      undefined,

    position:
      existingObjectives.length + 1,
  });
}

/* ==========================================================
   Update
========================================================== */

export interface UpdateRuntimePerformanceInstanceObjectiveInput {
  organizationId: string;

  performanceInstanceId: string;

  objectiveId: string;

  title: string;

  description?: string;

  position: number;
}

export async function updateRuntimePerformanceInstanceObjective(
  input:
    UpdateRuntimePerformanceInstanceObjectiveInput
): Promise<PerformanceInstanceObjective> {
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

  return updatePerformanceInstanceObjective({
    performanceInstanceId:
      input.performanceInstanceId,

    objectiveId:
      input.objectiveId,

    title:
      input.title,

    description:
      input.description,

    position:
      input.position,
  });
}

/* ==========================================================
   Delete
========================================================== */

export async function deleteRuntimePerformanceInstanceObjective(
  organizationId: string,

  performanceInstanceId: string,

  objectiveId: string
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

  await deletePerformanceInstanceObjective(
    performanceInstanceId,

    objectiveId
  );
}
