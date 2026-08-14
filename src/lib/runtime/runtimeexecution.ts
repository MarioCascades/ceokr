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

import {
  findReportingPeriodById,
} from "@/lib/repositories/reportingperiodrepository";

/* ==========================================================
   Load Runtime Execution
   ----------------------------------------------------------
   Runtime execution is resolved through the active
   Performance Instance.

   Performance Instance
        ↓
   Assignment
        ↓
   Reporting Period
        ↓
   Exact published Performance Sheet
        ↓
   Key Result Progress
========================================================== */

export async function loadRuntimeExecution(
  organizationId: string
) {
  /*
   * Find the Runtime Performance Instance
   * belonging to this organization.
   *
   * A Runtime execution remains accessible while
   * it is actively being worked, submitted, or
   * awaiting approval.
   */
  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const runtimeStatuses = [
    "in_progress",
    "submitted",
    "approved",
  ] as const;

  const performanceInstance =
    performanceInstances.find(
      (instance) =>
        runtimeStatuses.includes(
          instance.status as
            (typeof runtimeStatuses)[number]
        )
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
   * Load the Reporting Period associated with
   * this Performance Instance.
   *
   * The Performance Instance is the Runtime
   * execution anchor, so its reportingPeriodId
   * is authoritative for this execution.
   */
  const reportingPeriod =
    await findReportingPeriodById(
      organizationId,
      performanceInstance.reportingPeriodId
    );

  if (!reportingPeriod) {
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

    reportingPeriod,

    performanceSheet,

    performanceInstance,

    keyResultProgress,
  };
}