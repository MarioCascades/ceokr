import {
  loadPublishedById,
} from "@/lib/repositories/performancesheetrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findKeyResultProgressByPerformanceInstance,
} from "@/lib/repositories/keyresultprogressrepository";

import {
  loadAssignment,
} from "@/lib/repositories/assignmentrepository";

/* ==========================================================
   Load Runtime Execution
   ----------------------------------------------------------
   Runtime execution is resolved through the active
   Performance Instance.

   Performance Instance
        ↓
   Assignment
        ↓
   Exact published Performance Sheet
        ↓
   Key Result Progress
========================================================== */

export async function loadRuntimeExecution(
  organizationId: string
) {
  /*
   * Find the active/in-progress Performance Instance
   * belonging to this organization.
   */
  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const performanceInstance =
    performanceInstances.find(
      (instance) =>
        instance.status ===
        "in_progress"
    );

  if (!performanceInstance) {
    return null;
  }

  /*
   * Load the Assignment associated with
   * this Performance Instance.
   */
  const assignment =
    await loadAssignment(
      organizationId,
      performanceInstance.assignmentId
    );

  if (!assignment) {
    return null;
  }

  /*
   * Load the exact published Performance Sheet
   * referenced by the Assignment.
   *
   * We intentionally do NOT load the latest
   * published version for the organization.
   */
  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    return null;
  }

  /*
   * Load Runtime Key Result Progress.
   */
  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  return {
    assignment,

    performanceSheet,

    performanceInstance,

    keyResultProgress,
  };
}