/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Load Member Performance
 * ----------------------------------------------------------
 * Resolves the authenticated/development member's own
 * individual performance history and selected monthly
 * Performance Instance.
 *
 * Ownership flow:
 *
 * User
 *      ↓
 * Organization
 *      ↓
 * Active Individual Assignment
 *      ↓
 * Monthly Performance Instances
 *      ↓
 * Selected Performance Instance
 *      ↓
 * Runtime Snapshot
 *      ↓
 * Runtime Progress
 *
 * IMPORTANT:
 *
 * This module does not determine platform permissions.
 * It resolves the member's own performance resources.
 *
 * Monthly identity is based on:
 *
 * Assignment + Performance Month
 *
 * Reporting Period is intentionally not used.
 * ==========================================================
 */

import {
  loadActiveAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByAssignment,
  findPerformanceInstanceByAssignmentAndMonth,
} from "@/lib/repositories/performanceinstancerepository";

import {
  loadPublishedById,
} from "@/lib/repositories/performancesheetrepository";

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
  buildRuntimePerformanceObjectives,
} from "@/lib/runtime/runtimeperformance";

import type {
  User,
} from "@/lib/types/domain/user";


/* ==========================================================
   Types
========================================================== */

export type MemberPerformanceExecution = {

  organizationId: string;

  assignment:
    NonNullable<
      Awaited<
        ReturnType<
          typeof loadActiveAssignment
        >
      >
    >;

  performanceInstance:
    NonNullable<
      Awaited<
        ReturnType<
          typeof findPerformanceInstanceByAssignmentAndMonth
        >
      >
    >;

  performanceInstances:
    Awaited<
      ReturnType<
        typeof findPerformanceInstancesByAssignment
      >
    >;

  performanceSheet:
    NonNullable<
      Awaited<
        ReturnType<
          typeof loadPublishedById
        >
      >
    >;

  objectives:
    ReturnType<
      typeof buildRuntimePerformanceObjectives
    >;

  keyResultProgress:
    Awaited<
      ReturnType<
        typeof findKeyResultProgressByPerformanceInstance
      >
    >;

  subject: {
    type: "individual";

    id: string;

    displayName: string;

    email: string;
  };

};


/* ==========================================================
   Load Member Performance
========================================================== */

export async function loadMemberPerformance(
  user: User,

  organizationId: string,

  performanceMonth?: string
): Promise<
  MemberPerformanceExecution | null
> {

  /* ========================================================
     Active Individual Assignment
  ======================================================== */

  const assignment =
    await loadActiveAssignment(
      organizationId,
      user.id
    );

  if (!assignment) {
    return null;
  }


  /* ========================================================
     Ownership Validation
  ======================================================== */

  /*
   * The member must own the assignment.
   *
   * We intentionally do not accept an arbitrary subjectId
   * as the ownership authority.
   */

  if (
    assignment.assignmentType !==
      "individual"
    ||
    assignment.subjectId !==
      user.id
  ) {
    return null;
  }


  /* ========================================================
     Performance Instance History
  ======================================================== */

  const performanceInstances =
    await findPerformanceInstancesByAssignment(
      organizationId,
      assignment.id
    );

  if (
    performanceInstances.length ===
    0
  ) {
    return null;
  }


  /* ========================================================
     Selected Performance Instance
  ======================================================== */

  const performanceInstance =
    performanceMonth
      ? await findPerformanceInstanceByAssignmentAndMonth(
          organizationId,
          assignment.id,
          performanceMonth
        )
      : performanceInstances[0] ?? null;


  /* ========================================================
     Selected Month Must Exist
  ======================================================== */

  if (!performanceInstance) {
    return null;
  }


  /* ========================================================
     Exact Published Performance Sheet
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
     Runtime Objective Snapshots
  ======================================================== */

  const instanceObjectives =
    await findPerformanceInstanceObjectives(
      performanceInstance.id
    );


  /* ========================================================
     Runtime Key Result Snapshots
  ======================================================== */

  const instanceKeyResults =
    await findPerformanceInstanceKeyResults(
      performanceInstance.id
    );


  /* ========================================================
     Runtime Initiative Snapshots
  ======================================================== */

  const instanceInitiatives =
    (
      await Promise.all(
        instanceKeyResults.map(
          (keyResult) =>
            findPerformanceInstanceInitiativesByKeyResult(
              keyResult.id
            )
        )
      )
    ).flat();


  /* ========================================================
     Build Runtime Objectives
  ======================================================== */

  const objectives =
    buildRuntimePerformanceObjectives(
      instanceObjectives,

      instanceKeyResults,

      instanceInitiatives
    );


  /* ========================================================
     Key Result Progress
  ======================================================== */

  const keyResultProgress =
    await findKeyResultProgressByPerformanceInstance(
      performanceInstance.id
    );


  /* ========================================================
     Runtime Subject
  ======================================================== */

  const displayName =
    user.display_name?.trim()
    ||
    `${user.first_name} ${user.last_name}`.trim()
    ||
    user.email;


  /* ========================================================
     Return Member Execution
  ======================================================== */

  return {

    organizationId,

    assignment,

    performanceInstance,

    performanceInstances,

    performanceSheet,

    objectives,

    keyResultProgress,

    subject: {

      type: "individual",

      id:
        user.id,

      displayName,

      email:
        user.email,

    },

  };
}