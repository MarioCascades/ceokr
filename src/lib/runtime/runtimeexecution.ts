import { loadPublishedById } from "@/lib/repositories/performancesheetrepository";
import { findPerformanceInstancesByOrganization } from "@/lib/repositories/performanceinstancerepository";
import { findKeyResultProgressByPerformanceInstance } from "@/lib/repositories/keyresultprogressrepository";
import { loadAssignment } from "@/lib/repositories/assignmentrepository";
import { getUser } from "@/services/user.service";

export interface RuntimeSubject {
  type: "individual";
  id: string;
  displayName: string;
  email: string;
}

export async function loadRuntimeExecution(
  organizationId: string,
  subjectId?: string
) {
  const runtimeStatuses = [
    "in_progress",
    "submitted",
    "approved",
  ] as const;

  /*
   * ==========================================================
   * Resolve Performance Instance
   *
   * When a subjectId is supplied, Runtime is being opened
   * for a specific individual. Resolve that person's active
   * assignment first, then find the matching performance
   * instance.
   *
   * When no subjectId is supplied, preserve the existing
   * organization-level Runtime behavior.
   * ==========================================================
   */

  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  let performanceInstance =
    undefined as
      | (typeof performanceInstances)[number]
      | undefined;

  let assignment;

  if (subjectId) {
    assignment = await import(
      "@/lib/repositories/assignmentrepository"
    ).then(
      ({ loadActiveAssignment }) =>
        loadActiveAssignment(
          organizationId,
          subjectId
        )
    );

    if (!assignment) {
      return null;
    }

    performanceInstance =
      performanceInstances.find(
        (instance) =>
          instance.assignmentId ===
            assignment!.id &&
          runtimeStatuses.includes(
            instance.status as
              (typeof runtimeStatuses)[number]
          )
      );
  } else {
    performanceInstance =
      performanceInstances.find(
        (instance) =>
          runtimeStatuses.includes(
            instance.status as
              (typeof runtimeStatuses)[number]
          )
      );
  }

  if (!performanceInstance) {
    return null;
  }

  /*
   * ==========================================================
   * Resolve Assignment
   * ==========================================================
   */

  if (!assignment) {
    assignment = await loadAssignment(
      organizationId,
      performanceInstance.assignmentId
    );
  }

  if (!assignment) {
    return null;
  }

  /*
   * ==========================================================
   * Resolve Runtime Subject
   * ==========================================================
   */

  let subject: RuntimeSubject | null = null;

  if (
    assignment.assignmentType ===
    "individual"
  ) {
    const user = await getUser(
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
   * ==========================================================
   * Resolve Published Performance Sheet
   * ==========================================================
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
   * ==========================================================
   * Resolve Key Result Progress
   * ==========================================================
   */

  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  /*
   * ==========================================================
   * Runtime Execution
   * ==========================================================
   */

  return {
    assignment,
    subject,
    performanceSheet,
    performanceInstance,
    keyResultProgress,
  };
}