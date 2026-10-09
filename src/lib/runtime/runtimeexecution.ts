
import { loadPublishedById } from "@/lib/repositories/performancesheetrepository";

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
  loadMemberOKRs,
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

  roleTitle: string | null;

  roleDescription: string | null;
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
   Previous Month Performance

   New Runtime records resolve history by memberId.

   Legacy Assignment-based records remain supported while
   historical data is being migrated.
========================================================== */

async function loadPreviousKeyResultPerformance(
  performanceInstances:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByOrganization
      >
    >,

  currentPerformanceInstance:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByOrganization
      >
    >[number]
): Promise<{
  values: Record<string, string | number>;
  scores: Record<string, number>;
}> {

  const previousMonth =
    addMonths(
      currentPerformanceInstance.performanceMonth,
      -1
    );


  const previousPerformanceInstance =
    performanceInstances.find(
      (instance) => {

        /*
         * New Runtime:
         *
         * organization_id
         * + member_id
         * + performance_month
         */
        if (
          currentPerformanceInstance.memberId &&
          instance.memberId
        ) {

          return (
            instance.memberId ===
              currentPerformanceInstance.memberId
            &&
            instance.performanceMonth ===
              previousMonth
          );
        }


        /*
         * Legacy Runtime compatibility:
         *
         * assignment_id
         * + performance_month
         */
        if (
          currentPerformanceInstance.assignmentId &&
          instance.assignmentId
        ) {

          return (
            instance.assignmentId ===
              currentPerformanceInstance.assignmentId
            &&
            instance.performanceMonth ===
              previousMonth
          );
        }

        return false;
      }
    );


  if (
    !previousPerformanceInstance
  ) {

    return {
      values: {},
      scores: {},
    };
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
    Record<
      string,
      string | number
    > = {};


  const scores:
    Record<
      string,
      number
    > = {};


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
          item.performanceInstanceKeyResultId ===
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


    if (
      progress &&
      progress.score !==
        undefined &&
      progress.score !==
        null
    ) {

      scores[
        keyResult.sourceKeyResultId
      ] =
        progress.score;
    }
  }


  return {
    values,
    scores,
  };
}


/* ==========================================================
   Legacy Member Instance Compatibility

   Existing Assignment-backed Runtime records remain
   readable while the newer member-based Runtime records
   become the current source.
========================================================== */

async function loadLegacyMemberInstances(
  organizationId: string,
  memberId: string
) {

  const assignments =
    await findAssignmentsByOrganization(
      organizationId
    );


  const memberAssignmentIds =
    new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.assignmentType ===
              "individual"
            &&
            assignment.subjectId ===
              memberId
            &&
            assignment.status !==
              "cancelled"
        )
        .map(
          (assignment) =>
            assignment.id
        )
    );


  if (
    memberAssignmentIds.size ===
    0
  ) {
    return [];
  }


  const allInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );


  return allInstances.filter(
    (instance) =>
      Boolean(
        instance.assignmentId
      )
      &&
      memberAssignmentIds.has(
        instance.assignmentId as string
      )
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
    performanceMonth ??
    getCurrentPerformanceMonth();


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

  if (
    subjectId
  ) {

    const user =
      await getUser(
        subjectId
      );


    if (
      !user ||
      !user.is_active
    ) {
      return null;
    }


    /*
     * Organization Membership is the authoritative
     * relationship for current member participation.
     */
    const membership =
      await loadOrganizationMembershipForMember(
        organizationId,
        subjectId
      );


    if (
      !membership
    ) {
      return null;
    }


    /*
     * Current member-based Runtime instances.
     */
    const directMemberInstances =
      await findPerformanceInstancesByMember(
        organizationId,
        subjectId
      );


    /*
     * Historical Assignment-based Runtime instances.
     */
    const legacyMemberInstances =
      await loadLegacyMemberInstances(
        organizationId,
        subjectId
      );


    /*
     * Combine the two sources without duplicating
     * an instance that exists in both.
     */
    const combinedInstances = [
      ...directMemberInstances,

      ...legacyMemberInstances.filter(
        (legacy) =>
          !directMemberInstances.some(
            (current) =>
              current.id ===
              legacy.id
          )
      ),
    ];


    /*
     * Prefer an existing monthly record.
     *
     * This prevents a historical Assignment-backed
     * month from being duplicated during the transition.
     */
    let selectedInstance =
      combinedInstances.find(
        (instance) =>
          instance.performanceMonth ===
          selectedMonth
      );


    /*
     * Synchronize the current member-based Runtime
     * instance against the latest Member OKRs.
     *
     * The member execution service reconciles the existing
     * monthly Runtime snapshot when the instance already
     * exists. This ensures newly-created Member Key Results
     * are copied into Runtime without replacing existing
     * Runtime progress.
     *
     * Legacy Assignment-backed instances are intentionally
     * left untouched for historical compatibility.
     */
    if (
      selectedInstance?.memberId ===
      subjectId
    ) {

      selectedInstance =
        await getOrCreateMemberPerformanceExecutionForMonth(
          organizationId,

          subjectId,

          selectedMonth
        );
    }


    /*
     * No monthly instance exists yet.
     *
     * Create it through the new member-based Runtime
     * execution service.
     *
     * Assignment is intentionally NOT required.
     */
    if (
      !selectedInstance
    ) {

      selectedInstance =
        await getOrCreateMemberPerformanceExecutionForMonth(
          organizationId,

          subjectId,

          selectedMonth
        );


      combinedInstances.push(
        selectedInstance
      );
    }


    /*
     * Load all organization Runtime instances for
     * previous-month/history calculations.
     */
    const performanceInstances =
      await findPerformanceInstancesByOrganization(
        organizationId
      );


    const displayName =
      user.display_name?.trim()
      ||
      `${user.first_name} ${user.last_name}`.trim()
      ||
      user.email;


    /*
     * Organization-specific Role Title and Role Description
     * come from the authoritative organization membership.
     */
    const subject:
      RuntimeSubject = {

      type:
        "individual",

      id:
        user.id,

      displayName,

      email:
        user.email,

      roleTitle:
        membership.role_title ??
        null,

      roleDescription:
        membership.role_description ??
        null,
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

  const assignments =
    await findAssignmentsByOrganization(
      organizationId
    );


  const organizationAssignments =
    assignments.filter(
      (assignment) =>
        assignment.assignmentType ===
          "organization"
        &&
        assignment.status ===
          "active"
    );


  if (
    organizationAssignments.length ===
    0
  ) {
    return null;
  }


  const performanceInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );


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
        Boolean(
          instance.assignmentId
        )
        &&
        organizationAssignmentIds.has(
          instance.assignmentId as string
        )
    );


  let performanceInstance =
    organizationInstances.find(
      (instance) =>
        instance.performanceMonth ===
        selectedMonth
    );


  const organizationAssignment =
    organizationAssignments.find(
      (assignment) =>
        assignment.id ===
        performanceInstance?.assignmentId
    )
    ??
    organizationAssignments[0];


  if (
    !performanceInstance &&
    organizationAssignment
  ) {

    performanceInstance =
      await getOrCreatePerformanceExecutionForMonth(
        organizationId,

        organizationAssignment.id,

        selectedMonth
      );


    organizationInstances.push(
      performanceInstance
    );


    performanceInstances.push(
      performanceInstance
    );
  }


  if (
    !performanceInstance
  ) {
    return null;
  }


  const assignment =
    organizationAssignments.find(
      (item) =>
        item.id ===
        performanceInstance!.assignmentId
    );


  if (
    !assignment
  ) {
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

  performanceInstance:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByOrganization
      >
    >[number],

  assignment?:
    NonNullable<
      Awaited<
        ReturnType<
          typeof loadAssignment
        >
      >
    >,

  performanceInstances:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByOrganization
      >
    > = [],

  memberInstances:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByOrganization
      >
    > = [],

  subjectOverride?:
    RuntimeSubject
) {

  let subject:
    RuntimeSubject | null =
      subjectOverride ??
      null;


  /*
   * Legacy individual Assignment fallback.
   *
   * This remains only for historical compatibility.
   */
  if (
    !subject &&
    assignment?.assignmentType ===
      "individual"
  ) {

    const user =
      await getUser(
        assignment.subjectId
      );


    if (
      !user
    ) {
      return null;
    }


    const displayName =
      user.display_name?.trim()
      ||
      `${user.first_name} ${user.last_name}`.trim()
      ||
      user.email;


    const membership =
      await loadOrganizationMembershipForMember(
        organizationId,
        user.id
      );


    subject = {

      type:
        "individual",

      id:
        user.id,

      displayName,

      email:
        user.email,

      roleTitle:
        membership?.role_title ??
        null,

      roleDescription:
        membership?.role_description ??
        null,
    };
  }


  /* ========================================================
     Published Performance Sheet
  ======================================================== */

  const performanceSheet =
    await loadPublishedById(
      organizationId,

      performanceInstance.performanceSheetId
    );


  if (
    !performanceSheet
  ) {
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

  let objectives =
    buildRuntimePerformanceObjectives(

      instanceObjectives,

      instanceKeyResults,

      instanceInitiatives.flat()
    );


  /* ========================================================
     Current Member Runtime Visibility
  ======================================================== */

  /*
   * Member OKRs remain the source of truth for current
   * visibility. Runtime records are preserved as monthly
   * snapshots, so hiding a source item must not delete its
   * Runtime record or its historical progress.
   *
   * Apply this presentation filter only to the current month
   * of a direct member-based Runtime instance. Historical months
   * and legacy Assignment-backed instances remain unchanged.
   */

  const isCurrentMemberRuntime =
    Boolean(
      subject &&
      performanceInstance.memberId ===
        subject.id &&
      !performanceInstance.assignmentId &&
      performanceInstance.performanceMonth ===
        getCurrentPerformanceMonth()
    );

  const hiddenObjectiveIds =
    new Set<string>();

  const hiddenKeyResultIds =
    new Set<string>();

  let memberVisibilityLoaded =
    false;

  if (
    isCurrentMemberRuntime &&
    subject
  ) {

    const membership =
      await loadOrganizationMembershipForMember(
        organizationId,
        subject.id
      );

    if (membership) {

      const memberObjectives =
        await loadMemberOKRs(
          organizationId,
          membership.id
        );

      memberVisibilityLoaded =
        true;

      for (
        const memberObjective of
          memberObjectives
      ) {

        if (memberObjective.isHidden) {
          hiddenObjectiveIds.add(
            memberObjective.id
          );
        }

        for (
          const memberKeyResult of
            memberObjective.keyResults
        ) {

          if (memberKeyResult.isHidden) {
            hiddenKeyResultIds.add(
              memberKeyResult.id
            );
          }

        }

      }

      objectives =
        objectives
          .filter(
            (objective) =>
              !objective.sourceObjectiveId ||
              !hiddenObjectiveIds.has(
                objective.sourceObjectiveId
              )
          )
          .map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.filter(
                  (keyResult) =>
                    !keyResult.sourceKeyResultId ||
                    !hiddenKeyResultIds.has(
                      keyResult.sourceKeyResultId
                    )
                ),
            })
          )
          .filter(
            (objective) =>
              !objective.sourceObjectiveId ||
              objective.keyResults.length > 0
          );

    }

  }


  /* ========================================================
     Runtime Key Result Progress
  ======================================================== */

  let keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );


  /*
   * Keep progress records for hidden Runtime Key Results out of
   * the current active view as well. This only filters the data
   * returned to the UI; it does not delete or update any stored
   * progress records. Save logic can therefore preserve existing
   * progress for items that are hidden and later reactivated.
   */

  if (
    memberVisibilityLoaded
  ) {

    const visibleRuntimeKeyResultIds =
      new Set(
        objectives.flatMap(
          (objective) =>
            objective.keyResults.map(
              (keyResult) =>
                keyResult.id
            )
        )
      );

    keyResultProgress =
      keyResultProgress.filter(
        (progress) =>
          visibleRuntimeKeyResultIds.has(
            progress.performanceInstanceKeyResultId
          )
      );

  }


  /* ========================================================
     Previous Month Performance
  ======================================================== */

  const previousKeyResultPerformance =
    await loadPreviousKeyResultPerformance(

      performanceInstances,

      performanceInstance
    );


  /* ========================================================
     Available Performance Months
  ======================================================== */

  const performanceMonths =
    Array.from(
      new Set(
        memberInstances.map(
          (instance) =>
            instance.performanceMonth
        )
      )
    ).sort(
      (a, b) =>
        b.localeCompare(a)
    );


  /* ========================================================
     Return Runtime Execution
  ======================================================== */

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
