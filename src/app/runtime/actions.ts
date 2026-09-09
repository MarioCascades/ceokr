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

import {
  transitionPerformanceInstance,
} from "@/lib/runtime/transitionperformanceinstance";

import {
  createRuntimePerformanceInstanceKeyResult,
  updateRuntimePerformanceInstanceKeyResult,
  deleteRuntimePerformanceInstanceKeyResult,
} from "@/lib/runtime/manageperformanceinstancekeyresults";

import {
  createRuntimePerformanceInstanceObjective,
  updateRuntimePerformanceInstanceObjective,
  deleteRuntimePerformanceInstanceObjective,
} from "@/lib/runtime/manageperformanceinstanceobjectives";

import {
  createRuntimePerformanceInstanceInitiative,
  updateRuntimePerformanceInstanceInitiative,
  deleteRuntimePerformanceInstanceInitiative,
} from "@/lib/runtime/manageperformanceinstanceinitiatives";

import type {
  PerformanceInstanceTransition,
} from "@/lib/runtime/transitionperformanceinstance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  PerformanceInstanceKeyResult,
} from "@/lib/domain/performanceinstancekeyresult";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

import type {
  PerformanceInstanceInitiative,
} from "@/lib/domain/performanceinstanceinitiative";

/* ==========================================================
   Runtime Key Result Progress
========================================================== */

export interface UpdateRuntimeKeyResultProgressActionInput {
  organizationId: string;

  performanceInstanceId: string;

  keyResultProgressId: string;

  currentValue: number | string;

  score: number;

  employeeComment?: string;

  managerComment?: string;

  status: KeyResultProgress["status"];
}

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
   Runtime Objective Management
========================================================== */

export interface CreateRuntimePerformanceInstanceObjectiveActionInput {
  organizationId: string;

  performanceInstanceId: string;

  title: string;

  description?: string;
}

export async function createRuntimePerformanceInstanceObjectiveAction(
  input: CreateRuntimePerformanceInstanceObjectiveActionInput
): Promise<PerformanceInstanceObjective> {
  return createRuntimePerformanceInstanceObjective(
    input
  );
}

export interface UpdateRuntimePerformanceInstanceObjectiveActionInput {
  organizationId: string;

  performanceInstanceId: string;

  objectiveId: string;

  title: string;

  description?: string;
}

export async function updateRuntimePerformanceInstanceObjectiveAction(
  input: UpdateRuntimePerformanceInstanceObjectiveActionInput
): Promise<PerformanceInstanceObjective> {
  return updateRuntimePerformanceInstanceObjective(
    input
  );
}

export async function deleteRuntimePerformanceInstanceObjectiveAction(
  organizationId: string,

  performanceInstanceId: string,

  objectiveId: string
): Promise<void> {
  return deleteRuntimePerformanceInstanceObjective(
    organizationId,
    performanceInstanceId,
    objectiveId
  );
}

/* ==========================================================
   Runtime Key Result Management
========================================================== */

export interface CreateRuntimePerformanceInstanceKeyResultActionInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceObjectiveId: string;

  title: string;

  target: unknown;

  measurementType?:
    | "percentage"
    | "numeric"
    | "financial";

  scoringMethod?:
    | "percent_into_period"
    | "percentage_of_target";

  weight?: number;
}

export async function createRuntimePerformanceInstanceKeyResultAction(
  input: CreateRuntimePerformanceInstanceKeyResultActionInput
): Promise<{
  keyResult: PerformanceInstanceKeyResult;

  progress: KeyResultProgress;
}> {
  return createRuntimePerformanceInstanceKeyResult(
    input
  );
}

export interface UpdateRuntimePerformanceInstanceKeyResultActionInput {
  organizationId: string;

  performanceInstanceId: string;

  keyResultId: string;

  title: string;

  target: unknown;

  measurementType?:
    | "percentage"
    | "numeric"
    | "financial";

  scoringMethod?:
    | "percent_into_period"
    | "percentage_of_target";

  weight?: number;
}

export async function updateRuntimePerformanceInstanceKeyResultAction(
  input: UpdateRuntimePerformanceInstanceKeyResultActionInput
): Promise<PerformanceInstanceKeyResult> {
  return updateRuntimePerformanceInstanceKeyResult(
    input
  );
}

export async function deleteRuntimePerformanceInstanceKeyResultAction(
  organizationId: string,

  performanceInstanceId: string,

  keyResultId: string
): Promise<void> {
  return deleteRuntimePerformanceInstanceKeyResult(
    organizationId,

    performanceInstanceId,

    keyResultId
  );
}

/* ==========================================================
   Runtime Initiative Management
========================================================== */

export interface CreateRuntimePerformanceInstanceInitiativeActionInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceKeyResultId: string;

  text: string;
}

export async function createRuntimePerformanceInstanceInitiativeAction(
  input: CreateRuntimePerformanceInstanceInitiativeActionInput
): Promise<PerformanceInstanceInitiative> {
  return createRuntimePerformanceInstanceInitiative(
    input
  );
}

export interface UpdateRuntimePerformanceInstanceInitiativeActionInput {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceKeyResultId: string;

  initiativeId: string;

  text: string;
}

export async function updateRuntimePerformanceInstanceInitiativeAction(
  input: UpdateRuntimePerformanceInstanceInitiativeActionInput
): Promise<PerformanceInstanceInitiative> {
  return updateRuntimePerformanceInstanceInitiative(
    input
  );
}

export async function deleteRuntimePerformanceInstanceInitiativeAction(
  organizationId: string,

  performanceInstanceId: string,

  performanceInstanceKeyResultId: string,

  initiativeId: string
): Promise<void> {
  return deleteRuntimePerformanceInstanceInitiative(
    organizationId,

    performanceInstanceId,

    performanceInstanceKeyResultId,

    initiativeId
  );
}

/* ==========================================================
   Employee Comments
========================================================== */

export interface UpdateRuntimeEmployeeCommentsActionInput {
  organizationId: string;

  performanceInstanceId: string;

  employeeComments: string;
}

export async function updateRuntimeEmployeeCommentsAction(
  input: UpdateRuntimeEmployeeCommentsActionInput
): Promise<PerformanceInstance> {
  return updateRuntimeEmployeeComments(
    input
  );
}

/* ==========================================================
   Manager Comments
========================================================== */

export interface UpdateRuntimeManagerCommentsActionInput {
  organizationId: string;

  performanceInstanceId: string;

  managerComments: string;
}

export async function updateRuntimeManagerCommentsAction(
  input: UpdateRuntimeManagerCommentsActionInput
): Promise<PerformanceInstance> {
  return updateRuntimeManagerComments(
    input
  );
}

/* ==========================================================
   Performance Instance Lifecycle
========================================================== */

export interface TransitionPerformanceInstanceActionInput {
  organizationId: string;

  performanceInstanceId: string;

  transition: PerformanceInstanceTransition;
}

export async function transitionPerformanceInstanceAction(
  input: TransitionPerformanceInstanceActionInput
): Promise<PerformanceInstance> {
  return transitionPerformanceInstance(
    input.organizationId,

    input.performanceInstanceId,

    input.transition
  );
}