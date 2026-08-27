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

import {
  getUser,
} from "@/services/user.service";

/* ==========================================================
   Runtime Subject
   ----------------------------------------------------------
   Represents the entity currently executing the Performance
   Instance.

   The Builder document remains immutable.

   Runtime resolves the actual execution subject from the
   Assignment.
========================================================== */

export interface RuntimeSubject {
  type: "individual";

  id: string;

  displayName: string;

  email: string;
}

/* ==========================================================
   Load Runtime Execution
   ----------------------------------------------------------
   Runtime execution is resolved through the active
   Performance Instance.

   Performance Instance
        ↓
   Assignment
        ↓
   Runtime Subject
        ↓
   Reporting Period
        ↓
   Exact published Performance Sheet
        ↓
   Key Result Progress

   The Performance Sheet remains the immutable definition.

   Assignment determines who or what is executing it.
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
   * Resolve the Runtime subject.
   *
   * The current Runtime header is employee-oriented,
   * so Individual assignments resolve to the assigned
   * User.
   *
   * Team, Department, and Organization presentation will
   * be handled separately when their Runtime UX is defined.
   */
  let subject: RuntimeSubject | null =
    null;

  if (
    assignment.assignmentType ===
    "individual"
  ) {
    const user =
  await getUser(
    assignment.subjectId
  );

    if (!user) {
      return null;
    }

    const displayName =
      user.display_name?.trim() ||
      `${user.first_name} ${user.last_name}`.trim() ||
      user.email;

    subject = {
      type: "individual",

      id: user.id,

      displayName,

      email: user.email,
    };
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

    subject,

    reportingPeriod,

    performanceSheet,

    performanceInstance,

    keyResultProgress,
  };
}