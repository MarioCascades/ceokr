"use server";

import {
  updateRuntimeKeyResultProgress,
} from "@/lib/runtime/updatekeyresultprogress";

import {
  updateRuntimeEmployeeComments,
} from "@/lib/runtime/updateemployeecomments";

import {
  updateRuntimeManagerComments,
} from "@/lib/runtime/updatemanagercomments";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

/* ==========================================================
   Update Runtime Key Result Progress
========================================================== */

export interface UpdateRuntimeKeyResultProgressActionInput {
  organizationId: string;

  performanceInstanceId: string;

  keyResultProgressId: string;

  currentValue: number | string;

  score: number;

  confidence?: number;

  employeeComment?: string;

  managerComment?: string;

  status: KeyResultProgress["status"];
}

/* ==========================================================
   Update Key Result Progress
========================================================== */

export async function updateRuntimeKeyResultProgressAction(
  input: UpdateRuntimeKeyResultProgressActionInput
): Promise<{
  keyResultProgress: KeyResultProgress;

  performanceInstance: PerformanceInstance;
}> {
  return updateRuntimeKeyResultProgress(
    input
  );
}

/* ==========================================================
   Update Runtime Employee Comments
========================================================== */

export interface UpdateRuntimeEmployeeCommentsActionInput {
  organizationId: string;

  performanceInstanceId: string;

  employeeComments: string;
}

/* ==========================================================
   Update Employee Comments
========================================================== */

export async function updateRuntimeEmployeeCommentsAction(
  input: UpdateRuntimeEmployeeCommentsActionInput
): Promise<PerformanceInstance> {
  return updateRuntimeEmployeeComments(
    input
  );
}

/* ==========================================================
   Update Runtime Manager Comments
========================================================== */

export interface UpdateRuntimeManagerCommentsActionInput {
  organizationId: string;

  performanceInstanceId: string;

  managerComments: string;
}

/* ==========================================================
   Update Manager Comments
========================================================== */

export async function updateRuntimeManagerCommentsAction(
  input: UpdateRuntimeManagerCommentsActionInput
): Promise<PerformanceInstance> {
  return updateRuntimeManagerComments(
    input
  );
}