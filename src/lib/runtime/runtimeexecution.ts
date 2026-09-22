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
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import { getUser } from "@/services/user.service";

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

  const now =
    new Date();

  return [
    now
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),

    (now.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


function addMonths(
  performanceMonth: string,
  amount: number
): string {

  const date =
    new Date(
      `${performanceMonth}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return performanceMonth;
  }

  date.setUTCMonth(
    date.getUTCMonth() +
      amount
  );

  return [
    date
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),

    (date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


/* ==========================================================
   Previous Month Values
========================================================== */

async function loadPreviousKeyResultValues(
  performanceInstances: Awaited<
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >,

  currentPerformanceInstance: Awaited<
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >[number]
): Promise<
  Record<string, string | number>
> {

  const previousMonth =
    addMonths(
      currentPerformanceInstance.performanceMonth,
      -1
    );

  const previousPerformanceInstance =
    performanceInstances.find(
      (instance) =>
        instance.assignmentId ===
          currentPerformanceInstance.assignmentId &&
        instance.performanceMonth ===
          previousMonth
    );

  if (
    !previousPerformanceInstance
  ) {
    return {};
  }

  const previousKeyResults =
    await findPerformanceInstanceKeyResults(
      previousPerformanceInstance.id
    );

  const previousProgress =
    await findKeyResultProgressByPerformanceInstance(
      previousPerformanceInstance.id
    );

  const values:
    Record<string, string | number> =
    {};

  for (
    const keyResult of
      previousKeyResults
  ) {

    if (
      !keyResult.sourceKeyResultId
    ) {
      continue;
    }

    const progress =
      previousProgress.find(
        (item) =>
          item.keyResultId ===
          keyResult.id
      );

    if (
      progress &&
      progress.currentValue !==
        undefined &&
      progress.currentValue !==
        null &&
      progress.currentValue !==
        ""
    ) {

      values[
        keyResult.sourceKeyResultId
      ] =
        progress.currentValue;
    }
  }

  return values;
}


/* ==========================================================
   Runtime Execution Loader
========================================================== */

export async function loadRuntimeExecution(
  organizationId: string,

  subjectId?: string,

  performanceMonth?: string
) {

  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  if (
    performanceInstances.length === 0
  ) {
    return null;
  }


  /* ========================================================
     Individual / Subject Runtime
  ======================================================== */

  if (subjectId) {

    const assignment =
      await loadActiveAssignment(
        organizationId,
        subjectId
      );

    if (!assignment) {
      return null;
    }

    const assignmentInstances =
      performanceInstances.filter(
        (instance) =>
          instance.assignmentId ===
          assignment.id
      );

    if (
      assignmentInstances.length === 0
    ) {
      return null;
    }

    /*
     * Runtime normally opens the current month.
     *
     * When performanceMonth is supplied, resolve the
     * exact monthly Performance Instance requested by
     * the user.
     */
    const selectedMonth =
      performanceMonth ??
      getCurrentPerformanceMonth();

    const performanceInstance =
      assignmentInstances.find(
        (instance) =>
          instance.performanceMonth ===
          selectedMonth
      ) ??
      assignmentInstances[0];

    return buildRuntimeExecution(
      organizationId,

      performanceInstance,

      assignment,

      performanceInstances,

      assignmentInstances
    );
  }


  /* ========================================================
     Organization Runtime

     No subjectId means the user is entering the
     organization-level Performance experience.

     Resolve an organization assignment rather than
     arbitrarily selecting an individual member's
     Performance Instance.
  ======================================================== */

  const assignments =
    await findAssignmentsByOrganization(
      organizationId
    );

  const organizationAssignments =
    assignments.filter(
      (assignment) =>
        assignment.assignmentType ===
        "organization" &&
        assignment.status ===
        "active"
    );

  if (
    organizationAssignments.length === 0
  ) {
    return null;
  }

  const organizationAssignmentIds =
    new Set(
      organizationAssignments.map(
        (assignment) =>
          assignment.id
      )
    );

  const organizationInstances =
    performanceInstances.filter(
      (instance) =>
        organizationAssignmentIds.has(
          instance.assignmentId
        )
    );

  if (
    organizationInstances.length === 0
  ) {
    return null;
  }

  const selectedMonth =
    performanceMonth ??
    getCurrentPerformanceMonth();

  const performanceInstance =
    organizationInstances.find(
      (instance) =>
        instance.performanceMonth ===
        selectedMonth
    ) ??
    organizationInstances[0];

  const assignment =
    organizationAssignments.find(
      (item) =>
        item.id ===
        performanceInstance.assignmentId
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
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >[number],

  assignment: NonNullable<
    Awaited<
      ReturnType<
        typeof loadAssignment
      >
    >
  >,

  performanceInstances: Awaited<
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >,

  assignmentInstances: Awaited<
    ReturnType<
      typeof findPerformanceInstancesByOrganization
    >
  >
) {

  let subject:
    | RuntimeSubject
    | null =
    null;


  /* ========================================================
     Individual Subject
  ======================================================== */

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

      id:
        user.id,

      displayName,

      email:
        user.email,
    };
  }


  /* ========================================================
     Published Performance Sheet
  ======================================================== */

  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    return null;
  }


  /* ========================================================
     Runtime Objectives
  ======================================================== */

  const instanceObjectives =
    await findPerformanceInstanceObjectives(
      performanceInstance.id
    );


  /* ========================================================
     Runtime Key Results
  ======================================================== */

  const instanceKeyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstance.id
    );


  /* ========================================================
     Runtime Initiatives
  ======================================================== */

  const instanceInitiatives =
    await Promise.all(
      instanceKeyResults.map(
        (keyResult) =>
          findPerformanceInstanceInitiativesByKeyResult(
            keyResult.id
          )
      )
    );


  /* ========================================================
     Build Runtime Objectives
  ======================================================== */

  const objectives =
    buildRuntimePerformanceObjectives(
      instanceObjectives,
      instanceKeyResults,
      instanceInitiatives.flat()
    );


  /* ========================================================
     Runtime Key Result Progress
  ======================================================== */

  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );


  /* ========================================================
     Previous Month Values
  ======================================================== */

  const previousKeyResultValues =
    await loadPreviousKeyResultValues(
      performanceInstances,
      performanceInstance
    );


  /* ========================================================
     Available Performance Months
  ======================================================== */

  const performanceMonths =
    Array.from(
      new Set(
        assignmentInstances.map(
          (instance) =>
            instance.performanceMonth
        )
      )
    ).sort(
      (a, b) =>
        b.localeCompare(a)
    );


  /* ========================================================
     Runtime Execution
  ======================================================== */

  return {

    assignment,

    subject,

    performanceSheet,

    performanceInstance,

    performanceMonths,

    keyResultProgress,

    objectives,

    previousKeyResultValues,

  };
}