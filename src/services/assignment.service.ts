import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

import {
  loadAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  createPerformanceExecution,
} from "@/lib/runtime/createperformanceexecution";

import {
  initializePerformanceInstance,
} from "@/lib/runtime/initializeperformanceinstance";

import {
  loadPublishedById,
} from "@/lib/repositories/performancesheetrepository";


/* ==========================================================
   Create Performance Execution From Assignment
========================================================== */

export async function createPerformanceExecutionFromAssignment(
  organizationId: string,
  assignmentId: string
): Promise<PerformanceInstance> {
  const assignment =
    await loadAssignment(
      organizationId,
      assignmentId
    );


  if (!assignment) {
    throw new Error(
      "Assignment not found."
    );
  }


  if (
    assignment.status !==
    "active"
  ) {
    throw new Error(
      "Only active assignments can create performance executions."
    );
  }


  /* ========================================================
     Load Exact Published Performance Sheet
  ======================================================== */

  /*
   * The assignment must use the exact
   * published Performance Sheet version
   * that was assigned.
   */
  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );


  if (!performanceSheet) {
    throw new Error(
      "The published Performance Sheet assigned to this assignment could not be found."
    );
  }


  /* ========================================================
     Prevent Duplicate Active Executions
  ======================================================== */

  const existingInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );


  const existingExecution =
    existingInstances.find(
      (instance) =>
        instance.assignmentId ===
          assignment.id &&
        (
          instance.status ===
            "not_started" ||
          instance.status ===
            "in_progress" ||
          instance.status ===
            "submitted" ||
          instance.status ===
            "approved"
        )
    );


  if (existingExecution) {

    /*
     * The Performance Instance already exists.
     *
     * Runtime initialization is intentionally
     * idempotent, so calling it again is safe.
     *
     * If Key Result Progress already exists,
     * initializePerformanceInstance() will not
     * create duplicates.
     *
     * If progress does not exist yet, it will
     * create the required Runtime records.
     */
    await initializePerformanceInstance(
      existingExecution,
      performanceSheet.document
    );


    return existingExecution;
  }


  /* ========================================================
     Create Performance Execution
  ======================================================== */

  const performanceInstance =
    await createPerformanceExecution(
      {
        organizationId,

        assignmentId:
          assignment.id,

        performanceSheetId:
          performanceSheet.id,

        reportingPeriodId:
          assignment.reportingPeriodId,

        overallScore:
          0,

        progress:
          0,

        status:
          "in_progress",

        employeeComments:
          undefined,

        managerComments:
          undefined,

        startedAt:
          new Date().toISOString(),

        submittedAt:
          undefined,

        approvedAt:
          undefined,

        completedAt:
          undefined,
      },

      performanceSheet.document
    );


  return performanceInstance;
}