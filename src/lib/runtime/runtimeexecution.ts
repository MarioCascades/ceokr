import {
  loadLatestPublishedForOrganization,
} from "@/lib/repositories/performancesheetrepository";

import {
  findPerformanceInstancesByOrganization,
  findPerformanceInstancesByMember,
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
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import { getUser } from "@/services/user.service";

import {
  getOrCreatePerformanceExecutionForMonth,
} from "@/services/assignment.service";

import {
  getOrCreateMemberPerformanceExecutionForMonth,
} from "@/services/memberperformanceexecution";

import {
  loadOrganizationMembershipForMember,
} from "@/lib/repositories/memberokrrepository";

import {
  buildRuntimePerformanceObjectives,
} from "@/lib/runtime/runtimeperformance";


/* ==========================================================
   Runtime Subject
========================================================== */

export interface RuntimeSubject {
  type: "individual";
  id: string;
  displayName: string;
  email: string;
}


/* ==========================================================
   Month Helpers
========================================================== */

function getCurrentPerformanceMonth(): string {
  const now = new Date();

  return [
    now.getUTCFullYear().toString().padStart(4, "0"),
    (now.getUTCMonth() + 1).toString().padStart(2, "0"),
    "01",
  ].join("-");
}

function addMonths(
  performanceMonth: string,
  amount: number
): string {
  const date = new Date(`${performanceMonth}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return performanceMonth;
  }

  date.setUTCMonth(date.getUTCMonth() + amount);

  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    "01",
  ].join("-");
}


/* ==========================================================
   Previous Month Performance
   ----------------------------------------------------------
   New Runtime records resolve history by memberId.
   Legacy Assignment-based records remain supported while
   historical data is being migrated.
========================================================== */

async function loadPreviousKeyResultPerformance(
  performanceInstances: Awaited<
    ReturnType<typeof findPerformanceInstancesByOrganization>
  >,
  currentPerformanceInstance: Awaited<
    ReturnType<typeof findPerformanceInstancesByOrganization>
  >[number]
): Promise<{
  values: Record<string, string | number>;
  scores: Record<string, number>;
}> {
  const previousMonth = addMonths(
    currentPerformanceInstance.performanceMonth,
    -1
  );

  const previousPerformanceInstance = performanceInstances.find(
    (instance) => {
      if (
        currentPerformanceInstance.memberId &&
        instance.memberId
      ) {
        return (
          instance.memberId === currentPerformanceInstance.memberId &&
          instance.performanceMonth === previousMonth
        );
      }

      if (
        currentPerformanceInstance.assignmentId &&
        instance.assignmentId
      ) {
        return (
          instance.assignmentId === currentPerformanceInstance.assignmentId &&
          instance.performanceMonth === previousMonth
        );
      }

      return false;
    }
  );

  if (!previousPerformanceInstance) {
    return { values: {}, scores: {} };
  }

  const previousKeyResults =
    await findPerformanceInstanceKeyResults(
      previousPerformanceInstance.id
    );

  const previousProgress =
    await findKeyResultProgressByPerformanceInstance(
      previousPerformanceInstance.id
    );

  const values: Record<string, string | number> = {};
  const scores: Record<string, number> = {};

  for (const keyResult of previousKeyResults) {
    if (!keyResult.sourceKeyResultId) {
      continue;
    }

    const progress = previousProgress.find(
      (item) => item.keyResultId === keyResult.id
    );

    if (
      progress &&
      progress.currentValue !== undefined &&
      progress.currentValue !== null &&
      progress.currentValue !== ""
    ) {
      values[keyResult.sourceKeyResultId] = progress.currentValue;
    }

    if (
      progress &&
      progress.score !== undefined &&
      progress.score !== null
    ) {
      scores[keyResult.sourceKeyResultId] = progress.score;
    }
  }

  return { values, scores };
}


/* ==========================================================
   Legacy Member Instance Compatibility
========================================================== */

async function loadLegacyMemberInstances(
  organizationId: string,
  memberId: string
) {
  const assignments = await findAssignmentsByOrganization(
    organizationId
  );

  const memberAssignmentIds = new Set(
    assignments
      .filter(
        (assignment) =>
          assignment.assignmentType === "individual" &&
          assignment.subjectId === memberId &&
          assignment.status !== "cancelled"
      )
      .map((assignment) => assignment.id)
  );

  if (memberAssignmentIds.size === 0) {
    return [];
  }

  const allInstances = await findPerformanceInstancesByOrganization(
    organizationId
  );

  return allInstances.filter(
    (instance) =>
      Boolean(instance.assignmentId) &&
      memberAssignmentIds.has(instance.assignmentId as string)
  );
}


/* ==========================================================
   Runtime Execution Loader
========================================================== */

export async function loadRuntimeExecution(
  organizationId: string,
  subjectId?: string,
  performanceMonth?: string
) {
  const selectedMonth =
    performanceMonth ?? getCurrentPerformanceMonth();


  /* ========================================================
     Individual / Subject Runtime

     Current members enter Runtime through:

     Organization Membership
             ↓
     Member OKRs
             ↓
     Monthly Performance Instance

     Assignment is NOT required for a member to participate.
     Existing Assignment-based instances remain readable as
     historical compatibility records.
  ======================================================== */

  if (subjectId) {
    const user = await getUser(subjectId);

    if (!user || !user.is_active) {
      return null;
    }

    const membership = await loadOrganizationMembershipForMember(
      organizationId,
      subjectId
    );

    if (!membership) {
      return null;
    }

    const directMemberInstances =
      await findPerformanceInstancesByMember(
        organizationId,
        subjectId
      );

    const legacyMemberInstances =
      await loadLegacyMemberInstances(
        organizationId,
        subjectId
      );

    const combinedInstances = [
      ...directMemberInstances,
      ...legacyMemberInstances.filter(
        (legacy) =>
          !directMemberInstances.some(
            (current) => current.id === legacy.id
          )
      ),
    ];

    /*
     * Prefer an existing monthly record. This prevents a historical
     * Assignment-backed month from being duplicated during the transition.
     * After the migration is applied, individual historical records have
     * member_id populated and are returned by the direct member query.
     */
    let selectedInstance =
      combinedInstances.find(
        (instance) =>
          instance.performanceMonth === selectedMonth
      );

    if (!selectedInstance) {
      selectedInstance =
        await getOrCreateMemberPerformanceExecutionForMonth(
          organizationId,
          subjectId,
          selectedMonth
        );

      combinedInstances.push(selectedInstance);
    }

    const performanceInstances =
      await findPerformanceInstancesByOrganization(
        organizationId
      );

    const displayName =
      user.display_name?.trim() ||
      `${user.first_name} ${user.last_name}`.trim() ||
      user.email;

    const subject: RuntimeSubject = {
      type: "individual",
      id: user.id,
      displayName,
      email: user.email,
    };

    return buildRuntimeExecution(
      organizationId,
      selectedInstance,
      undefined,
      performanceInstances,
      combinedInstances,
      subject
    );
  }


  /* ========================================================
     Organization Runtime

     Organization-level execution remains Assignment-backed
     for now because the current product migration is focused
     on individual Member Runtime ownership.
  ======================================================== */

  const assignments = await findAssignmentsByOrganization(
    organizationId
  );

  const organizationAssignments = assignments.filter(
    (assignment) =>
      assignment.assignmentType === "organization" &&
      assignment.status === "active"
  );

  if (organizationAssignments.length === 0) {
    return null;
  }

  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const organizationAssignmentIds = new Set(
    organizationAssignments.map(
      (assignment) => assignment.id
    )
  );

  const organizationInstances = performanceInstances.filter(
    (instance) =>
      Boolean(instance.assignmentId) &&
      organizationAssignmentIds.has(instance.assignmentId as string)
  );

  let performanceInstance = organizationInstances.find(
    (instance) =>
      instance.performanceMonth === selectedMonth
  );

  const organizationAssignment =
    organizationAssignments.find(
      (assignment) =>
        assignment.id === performanceInstance?.assignmentId
    ) ?? organizationAssignments[0];

  if (!performanceInstance && organizationAssignment) {
    performanceInstance =
      await getOrCreatePerformanceExecutionForMonth(
        organizationId,
        organizationAssignment.id,
        selectedMonth
      );

    organizationInstances.push(performanceInstance);
    performanceInstances.push(performanceInstance);
  }

  if (!performanceInstance) {
    return null;
  }

  const assignment = organizationAssignments.find(
    (item) => item.id === performanceInstance!.assignmentId
  );

  if (!assignment) {
    return null;
  }

  return buildRuntimeExecution(
    organizationId,
    performanceInstance,
    assignment,
    performanceInstances,
    organizationInstances
  );
}


/* ==========================================================
   Build Runtime Execution
========================================================== */

async function buildRuntimeExecution(
  organizationId: string,
  performanceInstance: Awaited<
    ReturnType<typeof findPerformanceInstancesByOrganization>
  >[number],
  assignment?: NonNullable<
    Awaited<ReturnType<typeof loadAssignment>>
  >,
  performanceInstances: Awaited<
    ReturnType<typeof findPerformanceInstancesByOrganization>
  > = [],
  memberInstances: Awaited<
    ReturnType<typeof findPerformanceInstancesByOrganization>
  > = [],
  subjectOverride?: RuntimeSubject
) {
  let subject: RuntimeSubject | null = subjectOverride ?? null;

  if (!subject && assignment?.assignmentType === "individual") {
    const user = await getUser(assignment.subjectId);

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
  await loadLatestPublishedForOrganization(
    organizationId
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

  const instanceInitiatives = await Promise.all(
    instanceKeyResults.map(
      (keyResult) =>
        findPerformanceInstanceInitiativesByKeyResult(
          keyResult.id
        )
    )
  );

  const objectives = buildRuntimePerformanceObjectives(
    instanceObjectives,
    instanceKeyResults,
    instanceInitiatives.flat()
  );

  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );

  const previousKeyResultPerformance =
    await loadPreviousKeyResultPerformance(
      performanceInstances,
      performanceInstance
    );

  const performanceMonths = Array.from(
    new Set(
      memberInstances.map(
        (instance) => instance.performanceMonth
      )
    )
  ).sort((a, b) => b.localeCompare(a));

  return {
    assignment,
    subject,
    performanceSheet,
    performanceInstance,
    performanceMonths,
    keyResultProgress,
    objectives,
    previousKeyResultValues:
      previousKeyResultPerformance.values,
    previousKeyResultScores:
      previousKeyResultPerformance.scores,
  };
}