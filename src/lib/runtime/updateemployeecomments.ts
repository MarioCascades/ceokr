import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

/* ==========================================================
   Update Runtime Employee Comments
========================================================== */

/**
 * Updates the employee-level comments for a Runtime
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
export interface UpdateEmployeeCommentsInput {
  organizationId: string;

  performanceInstanceId: string;

  employeeComments: string;
}

/* ==========================================================
   Update
========================================================== */

export async function updateRuntimeEmployeeComments(
  input: UpdateEmployeeCommentsInput
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
     Update Employee Comments
  ======================================================== */

  return updatePerformanceInstance({
    ...performanceInstance,

    employeeComments:
      input.employeeComments,
  });
}