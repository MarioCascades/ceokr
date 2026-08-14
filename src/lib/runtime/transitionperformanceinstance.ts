import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import {
  findPerformanceInstanceById,
  updatePerformanceInstance,
} from "@/lib/repositories/performanceinstancerepository";

/* ==========================================================
   Runtime Performance Instance Lifecycle
========================================================== */

export type PerformanceInstanceTransition =
  | "start"
  | "submit"
  | "approve"
  | "complete";

/* ==========================================================
   Transition
========================================================== */

/**
 * Controls the Runtime Performance Instance lifecycle.
 *
 * Valid transitions:
 *
 * not_started → in_progress
 * in_progress → submitted
 * submitted → approved
 * approved → completed
 *
 * Builder definitions remain immutable.
 *
 * Runtime owns:
 *
 * - lifecycle status
 * - lifecycle timestamps
 */
export async function transitionPerformanceInstance(
  organizationId: string,
  performanceInstanceId: string,
  transition: PerformanceInstanceTransition
): Promise<PerformanceInstance> {
  /* ========================================================
     Load Performance Instance
  ======================================================== */

  const performanceInstance =
    await findPerformanceInstanceById(
      organizationId,
      performanceInstanceId
    );

  if (!performanceInstance) {
    throw new Error(
      "Performance Instance not found."
    );
  }

  /* ========================================================
     Determine Target Status
  ======================================================== */

  let nextStatus:
    PerformanceInstance["status"];

  switch (transition) {
    case "start":
      if (
        performanceInstance.status !==
        "not_started"
      ) {
        throw new Error(
          "Only a not_started Performance Instance can be started."
        );
      }

      nextStatus = "in_progress";
      break;

    case "submit":
      if (
        performanceInstance.status !==
        "in_progress"
      ) {
        throw new Error(
          "Only an in_progress Performance Instance can be submitted."
        );
      }

      nextStatus = "submitted";
      break;

    case "approve":
      if (
        performanceInstance.status !==
        "submitted"
      ) {
        throw new Error(
          "Only a submitted Performance Instance can be approved."
        );
      }

      nextStatus = "approved";
      break;

    case "complete":
      if (
        performanceInstance.status !==
        "approved"
      ) {
        throw new Error(
          "Only an approved Performance Instance can be completed."
        );
      }

      nextStatus = "completed";
      break;

    default:
      throw new Error(
        "Invalid Performance Instance transition."
      );
  }

  /* ========================================================
     Lifecycle Timestamps
  ======================================================== */

  const now =
    new Date().toISOString();

  let startedAt =
    performanceInstance.startedAt;

  let submittedAt =
    performanceInstance.submittedAt;

  let approvedAt =
    performanceInstance.approvedAt;

  let completedAt =
    performanceInstance.completedAt;

  switch (transition) {
    case "start":
      startedAt = now;
      break;

    case "submit":
      submittedAt = now;
      break;

    case "approve":
      approvedAt = now;
      break;

    case "complete":
      completedAt = now;
      break;
  }

  /* ========================================================
     Persist Runtime Lifecycle State
  ======================================================== */

  return updatePerformanceInstance({
    ...performanceInstance,

    status:
      nextStatus,

    startedAt,

    submittedAt,

    approvedAt,

    completedAt,
  });
}