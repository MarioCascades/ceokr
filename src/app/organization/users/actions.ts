"use server";

import {
  getUser,
} from "@/services/user.service";

import {
  loadActiveAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  getOrCreatePerformanceExecutionForMonth,
} from "@/services/assignment.service";

import {
  loadMemberPerformance,
} from "@/lib/runtime/loadmemberperformance";

import type {
  MemberPerformanceExecution,
} from "@/lib/runtime/loadmemberperformance";

/* ==========================================================
   Load Or Create Member OKR Workspace
   ----------------------------------------------------------
   Organization Administration entry point for managing a
   member's Objectives, Key Results, and Initiatives.

   This does not create a new OKR data model.

   It resolves the existing:

   User
      ↓
   Active Individual Assignment
      ↓
   Monthly Performance Instance
      ↓
   Runtime Objective / KR / Initiative snapshots
========================================================== */

export interface LoadOrCreateMemberOKRWorkspaceInput {
  organizationId: string;
  subjectId: string;
  performanceMonth: string;
}

export async function loadOrCreateMemberOKRWorkspace(
  input: LoadOrCreateMemberOKRWorkspaceInput
): Promise<MemberPerformanceExecution> {
  const user = await getUser(
    input.subjectId
  );

  if (!user) {
    throw new Error(
      "Member not found."
    );
  }

  if (!user.is_active) {
    throw new Error(
      "Inactive members cannot have OKRs managed."
    );
  }

  const assignment =
    await loadActiveAssignment(
      input.organizationId,
      user.id
    );

  if (!assignment) {
    throw new Error(
      "This member does not have an active Performance Sheet assignment."
    );
  }

  if (
    assignment.assignmentType !==
      "individual" ||
    assignment.subjectId !==
      user.id
  ) {
    throw new Error(
      "The member's active assignment is not an individual assignment."
    );
  }

  /*
   * Create the monthly Performance Instance when
   * one does not already exist.
   *
   * The existing performance execution architecture
   * initializes the instance from the exact published
   * Performance Sheet assigned to this member.
   */
  await getOrCreatePerformanceExecutionForMonth(
    input.organizationId,
    assignment.id,
    input.performanceMonth
  );

  const execution =
    await loadMemberPerformance(
      user,
      input.organizationId,
      input.performanceMonth
    );

  if (!execution) {
    throw new Error(
      "The member Performance Instance could not be loaded."
    );
  }

  return execution;
}