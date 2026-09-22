/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Update Performance Instance Objective
 * ----------------------------------------------------------
 * Updates an Objective belonging to a Performance Instance.
 *
 * This operates on the Runtime instance copy, not the
 * reusable Builder definition.
 * ==========================================================
 */

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  updatePerformanceInstanceObjective as updateRepositoryObjective,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

/* ==========================================================
   Input
========================================================== */

export interface UpdatePerformanceInstanceObjectiveInput {
  organizationId: string;

  performanceInstanceId: string;

  objectiveId: string;

  title: string;

  description?: string;

  position: number;
}

/* ==========================================================
   Update
========================================================== */

export async function updatePerformanceInstanceObjective(
  input: UpdatePerformanceInstanceObjectiveInput
): Promise<PerformanceInstanceObjective> {
  const organizationId =
    input.organizationId.trim();

  const performanceInstanceId =
    input.performanceInstanceId.trim();

  const objectiveId =
    input.objectiveId.trim();

  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  if (!performanceInstanceId) {
    throw new Error(
      "Performance instance is required."
    );
  }

  if (!objectiveId) {
    throw new Error(
      "Objective is required."
    );
  }

  if (!input.title.trim()) {
    throw new Error(
      "Objective title is required."
    );
  }

  /* ========================================================
     Validate Performance Instance Ownership
  ======================================================== */

  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const performanceInstance =
    performanceInstances.find(
      (instance) =>
        instance.id ===
        performanceInstanceId
    );

  if (!performanceInstance) {
    throw new Error(
      "Performance instance does not belong to the organization."
    );
  }

  /* ========================================================
     Update Runtime Objective
  ======================================================== */

  return updateRepositoryObjective({
    performanceInstanceId,

    objectiveId,

    title:
      input.title,

    description:
      input.description,

    position:
      input.position,
  });
}