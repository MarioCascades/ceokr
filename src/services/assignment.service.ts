import type { Assignment } from "@/lib/domain/assignment";
import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

import {
  loadAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  createPerformanceExecution,
} from "@/lib/runtime/createperformanceexecution";

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