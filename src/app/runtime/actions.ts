"use server";

import {
  updateRuntimeKeyResultProgress,
} from "@/lib/runtime/updatekeyresultprogress";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

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

export async function updateRuntimeKeyResultProgressAction(
  input: UpdateRuntimeKeyResultProgressActionInput
): Promise<{
  keyResultProgress: KeyResultProgress;

  performanceInstance: PerformanceInstance;
}> {
  return updateRuntimeKeyResultProgress(input);
}