import { loadPublishedById } from "@/lib/repositories/performancesheetrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceObjectives,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import {
  findPerformanceInstanceKeyResults,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  findPerformanceInstanceInitiativesByKeyResult,
} from "@/lib/repositories/performanceinstanceinitiativerepository";

import {
  findKeyResultProgressByPerformanceInstance,
} from "@/lib/repositories/keyresultprogressrepository";

import {
  loadAssignment,
  loadActiveAssignment,
} from "@/lib/repositories/assignmentrepository";

import { getUser } from "@/services/user.service";

import {
  buildRuntimePerformanceObjectives,
} from "@/lib/runtime/runtimeperformance";

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

  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  let performanceInstance:
    | (typeof performanceInstances)[number]
    | undefined;

  if (subjectId) {
    const assignment =
      await loadActiveAssignment(
        organizationId,
        subjectId
      );

    if (!assignment) {
      return null;
    }

    performanceInstance =
      performanceInstances.find(
        (instance) =>
          instance.assignmentId ===
            assignment.id &&
          runtimeStatuses.includes(
            instance.status as
              (typeof runtimeStatuses)[number]
          )
      );

    if (!performanceInstance) {
      return null;
    }

    return buildRuntimeExecution(
      organizationId,
      performanceInstance,
      assignment
    );
  }

  performanceInstance =
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

  const assignment =
    await loadAssignment(
      organizationId,
      performanceInstance.assignmentId
    );

  if (!assignment) {
    return null;
  }

  return buildRuntimeExecution(
    organizationId,
    performanceInstance,
    assignment
  );
}

async function buildRuntimeExecution(
  organizationId: string,
  performanceInstance: Awaited<
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >[number],
  assignment: NonNullable<
    Awaited<ReturnType<typeof loadAssignment>>
  >
) {
  let subject:
    | RuntimeSubject
    | null = null;

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

  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    return null;
  }

  const instanceObjectives =
    await findPerformanceInstanceObjectives(
      performanceInstance.id
    );

  const instanceKeyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstance.id
    );

  const instanceInitiatives =
    await Promise.all(
      instanceKeyResults.map(
        (keyResult) =>
          findPerformanceInstanceInitiativesByKeyResult(
            keyResult.id
          )
      )
    );

  const objectives =
    buildRuntimePerformanceObjectives(
      instanceObjectives,
      instanceKeyResults,
      instanceInitiatives.flat()
    );

  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  return {
    assignment,
    subject,
    performanceSheet,
    performanceInstance,
    keyResultProgress,
    objectives,
  };
}