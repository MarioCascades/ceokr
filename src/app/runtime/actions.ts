
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
  saveRuntimePerformanceSheet,
} from "@/lib/runtime/saveperformance";

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

import {
  saveClientPerformanceWorkspace,
  addClientPerformanceYear,
  hideClientPerformanceYear,
  restoreClientPerformanceYear,
  addClientPerformanceInitiative,
} from "@/services/clientperformanceservice";

import type {
  PerformanceInstanceTransition,
} from "@/lib/runtime/transitionperformanceinstance";

import type {
  SaveRuntimePerformanceSheetInput,
} from "@/lib/runtime/saveperformance";

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

import type {
  SaveClientPerformanceWorkspaceInput,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Runtime Performance Sheet Save
========================================================== */

/**
 * This is the single server action used by the global
 * Runtime Performance Sheet Save button.
 *
 * The Performance Sheet owns the save operation.
 *
 * Individual Key Result rows may still expose their existing
 * configuration/editing functionality, but persistence of the
 * employee's Runtime performance values is handled here.
 */
export interface SaveRuntimePerformanceSheetActionInput
  extends SaveRuntimePerformanceSheetInput {}


export async function saveRuntimePerformanceSheetAction(
  input: SaveRuntimePerformanceSheetActionInput
): Promise<{
  performanceInstance: PerformanceInstance;
  keyResultProgress: KeyResultProgress[];
}> {
  const result =
    await saveRuntimePerformanceSheet(
      input
    );

  return {
    performanceInstance:
      result.performanceInstance,

    keyResultProgress:
      result.keyResultProgress,
  };
}


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

  position: number;
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
    | "percentage_of_target"
    | "display_only";

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
    | "percentage_of_target"
    | "display_only";

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


/* ==========================================================
   Client Performance Workspace Save
========================================================== */

/**
 * Saves the Client Performance workspace.
 *
 * Authorization, organization validation, workspace
 * ownership validation, and persistence are handled
 * by the Client Performance service.
 */
export interface SaveClientPerformanceWorkspaceActionInput {
  organizationId: string;

  workspace: SaveClientPerformanceWorkspaceInput;
}


export async function saveClientPerformanceWorkspaceAction(
  input: SaveClientPerformanceWorkspaceActionInput
): Promise<string> {
  return saveClientPerformanceWorkspace(
    input.organizationId,
    input.workspace
  );
}


/* ==========================================================
   Client Performance Initiative Creation
========================================================== */

/**
 * Creates a blank initiative tracker row.
 *
 * Authorization, organization validation, and client
 * ownership validation are handled by the service.
 */
export interface AddClientPerformanceInitiativeActionInput {
  organizationId: string;

  clientId: string;
}


export async function addClientPerformanceInitiativeAction(
  input: AddClientPerformanceInitiativeActionInput
): Promise<string> {
  return addClientPerformanceInitiative(
    input.organizationId,
    input.clientId
  );
}


/* ==========================================================
   Client Performance Year Management
========================================================== */

/**
 * Adds the next available performance year to a
 * Client Performance workspace.
 *
 * Authorization and organization validation are handled
 * by the Client Performance service.
 */
export interface AddClientPerformanceYearActionInput {
  organizationId: string;

  clientId: string;
}


export async function addClientPerformanceYearAction(
  input: AddClientPerformanceYearActionInput
): Promise<number> {
  return addClientPerformanceYear(
    input.organizationId,
    input.clientId
  );
}


/**
 * Hides a performance year for all organization users.
 *
 * Existing monthly records are retained.
 */
export interface HideClientPerformanceYearActionInput {
  organizationId: string;

  clientId: string;

  performanceYear: number;
}


export async function hideClientPerformanceYearAction(
  input: HideClientPerformanceYearActionInput
): Promise<string> {
  return hideClientPerformanceYear(
    input.organizationId,
    input.clientId,
    input.performanceYear
  );
}


/**
 * Restores a previously hidden performance year.
 *
 * Existing monthly records are retained.
 */
export interface RestoreClientPerformanceYearActionInput {
  organizationId: string;

  clientId: string;

  performanceYear: number;
}


export async function restoreClientPerformanceYearAction(
  input: RestoreClientPerformanceYearActionInput
): Promise<string> {
  return restoreClientPerformanceYear(
    input.organizationId,
    input.clientId,
    input.performanceYear
  );
}
