"use server";

import {
  getOrCreatePerformanceExecutionForMonth,
} from "@/services/assignment.service";

import {
  loadActiveAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  getUser,
} from "@/services/user.service";


/* ==========================================================
   Create Or Open Member Performance Month
   ----------------------------------------------------------
   Member scope:
   - Individual assignment only
   - Subject must be the selected member
   - Organization comes from the current member workspace
   - Monthly Performance Instance is created only when needed
========================================================== */

export async function createMemberPerformanceMonth(
  organizationId: string,
  subjectId: string,
  performanceMonth: string
): Promise<{
  performanceMonth: string;
}> {

  /* ========================================================
     Load Member
  ======================================================== */

  const user =
    await getUser(
      subjectId
    );

  if (!user) {
    throw new Error(
      "Member not found."
    );
  }


  /* ========================================================
     Load Active Individual Assignment
  ======================================================== */

  const assignment =
    await loadActiveAssignment(
      organizationId,
      user.id
    );

  if (!assignment) {
    throw new Error(
      "Active individual assignment not found."
    );
  }


  /* ========================================================
     Validate Assignment Ownership
  ======================================================== */

  if (
    assignment.assignmentType !==
      "individual"
    ||
    assignment.subjectId !==
      user.id
  ) {
    throw new Error(
      "The selected member does not own this assignment."
    );
  }


  /* ========================================================
     Get Or Create Monthly Performance Instance
  ======================================================== */

  const performanceInstance =
    await getOrCreatePerformanceExecutionForMonth(
      organizationId,
      assignment.id,
      performanceMonth
    );


  /* ========================================================
     Return Canonical Performance Month
  ======================================================== */

  return {
    performanceMonth:
      performanceInstance.performanceMonth,
  };
}