import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

/* ==========================================================
   Update Runtime Manager Comments
========================================================== */

/**
 * Updates the manager-level comments for a Runtime
 * Performance Instance.
 *
 * Builder definitions remain immutable.
 *
 * Runtime owns:
 *
 * - employeeComments
 * - managerComments
 * - overallScore
 * - progress
 * - status
 */

export interface UpdateManagerCommentsInput {
  organizationId: string;

  performanceInstanceId: string;

  managerComments: string;
}

/* ==========================================================
   Update
========================================================== */

export async function updateRuntimeManagerComments(
  input: UpdateManagerCommentsInput
): Promise<PerformanceInstance> {
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
     Update Manager Comments
  ======================================================== */

  return updatePerformanceInstance({
    ...performanceInstance,

    managerComments:
      input.managerComments,
  });
}