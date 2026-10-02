"use server";

import {
  getUser,
} from "@/services/user.service";

import {
  loadOrganizationMembershipForMember,
  loadMemberOKRs,
  createMemberObjective,
  updateMemberObjective,
  deleteMemberObjective,
  createMemberKeyResult,
  updateMemberKeyResult,
  deleteMemberKeyResult,
  createMemberInitiative,
  updateMemberInitiative,
  deleteMemberInitiative,
} from "@/lib/repositories/memberokrrepository";

import type {
  MemberObjective,
  MemberKeyResult,
  MemberInitiative,
  CreateMemberObjectiveInput,
  UpdateMemberObjectiveInput,
  CreateMemberKeyResultInput,
  UpdateMemberKeyResultInput,
  CreateMemberInitiativeInput,
  UpdateMemberInitiativeInput,
} from "@/lib/domain/memberokr";


/* ==========================================================
   Member OKR Workspace
   ----------------------------------------------------------
   Organization Administration entry point for managing a
   member's persistent Objectives, Key Results, and
   Initiatives.

   Persistent ownership:

   User
      ↓
   Organization Membership
      ↓
   Member Objective
      ↓
   Member Key Result
      ↓
   Member Initiative

   IMPORTANT:

   This action intentionally does NOT:

   - load an Assignment
   - require an Assignment
   - create a Performance Instance
   - load Runtime snapshots
   - modify Runtime data
   - resolve a Performance Sheet assignment

   Runtime remains responsible for monthly execution and
   historical snapshots.

   The Member OKR domain is the persistent source of truth
   for the member's Objectives, Key Results, and Initiatives.
========================================================== */


/* ==========================================================
   Load Member OKR Workspace Input
========================================================== */

export interface LoadMemberOKRWorkspaceInput {
  organizationId: string;

  subjectId: string;
}


/* ==========================================================
   Member OKR Workspace
========================================================== */

export interface MemberOKRWorkspace {
  organizationId: string;

  membershipId: string;

  subject: {
    type: "individual";

    id: string;

    displayName: string;

    email: string;
  };

  objectives: MemberObjective[];
}


/* ==========================================================
   Load Member OKR Workspace
========================================================== */

export async function loadMemberOKRWorkspace(
  input: LoadMemberOKRWorkspaceInput
): Promise<MemberOKRWorkspace> {

  /* ========================================================
     Load Application User
  ======================================================== */

  const user =
    await getUser(
      input.subjectId
    );

  if (!user) {
    throw new Error(
      "Member not found."
    );
  }


  /* ========================================================
     Active Member Validation
  ======================================================== */

  if (!user.is_active) {
    throw new Error(
      "Inactive members cannot have OKRs managed."
    );
  }


  /* ========================================================
     Resolve Organization Membership
     --------------------------------------------------------
     Organization Membership is the authoritative relationship
     between the User and the selected Organization.
  ======================================================== */

  const membership =
    await loadOrganizationMembershipForMember(
      input.organizationId,
      user.id
    );

  if (!membership) {
    throw new Error(
      "This member does not belong to the selected organization."
    );
  }


  /* ========================================================
     Load Persistent Member OKRs
  ======================================================== */

  const objectives =
    await loadMemberOKRs(
      input.organizationId,
      membership.id
    );


  /* ========================================================
     Resolve Display Name
  ======================================================== */

  const displayName =
    user.display_name?.trim()
    ||
    `${user.first_name} ${user.last_name}`.trim()
    ||
    user.email;


  /* ========================================================
     Return Member OKR Workspace
  ======================================================== */

  return {
    organizationId:
      input.organizationId,

    membershipId:
      membership.id,

    subject: {
      type:
        "individual",

      id:
        user.id,

      displayName,

      email:
        user.email,
    },

    objectives,
  };
}


/* ==========================================================
   Create Member Objective
========================================================== */

export async function createMemberObjectiveAction(
  organizationId: string,
  input: CreateMemberObjectiveInput
): Promise<MemberObjective> {
  return createMemberObjective(
    organizationId,
    input
  );
}


/* ==========================================================
   Update Member Objective
========================================================== */

export async function updateMemberObjectiveAction(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberObjectiveInput
): Promise<MemberObjective> {
  return updateMemberObjective(
    organizationId,
    membershipId,
    input
  );
}


/* ==========================================================
   Delete Member Objective
========================================================== */

export async function deleteMemberObjectiveAction(
  organizationId: string,
  membershipId: string,
  objectiveId: string
): Promise<void> {
  return deleteMemberObjective(
    organizationId,
    membershipId,
    objectiveId
  );
}


/* ==========================================================
   Create Member Key Result
========================================================== */

export async function createMemberKeyResultAction(
  organizationId: string,
  membershipId: string,
  input: CreateMemberKeyResultInput
): Promise<MemberKeyResult> {
  return createMemberKeyResult(
    organizationId,
    membershipId,
    input
  );
}


/* ==========================================================
   Update Member Key Result
========================================================== */

export async function updateMemberKeyResultAction(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberKeyResultInput
): Promise<MemberKeyResult> {
  return updateMemberKeyResult(
    organizationId,
    membershipId,
    input
  );
}


/* ==========================================================
   Delete Member Key Result
========================================================== */

export async function deleteMemberKeyResultAction(
  organizationId: string,
  membershipId: string,
  keyResultId: string
): Promise<void> {
  return deleteMemberKeyResult(
    organizationId,
    membershipId,
    keyResultId
  );
}


/* ==========================================================
   Create Member Initiative
========================================================== */

export async function createMemberInitiativeAction(
  organizationId: string,
  membershipId: string,
  input: CreateMemberInitiativeInput
): Promise<MemberInitiative> {
  return createMemberInitiative(
    organizationId,
    membershipId,
    input
  );
}


/* ==========================================================
   Update Member Initiative
========================================================== */

export async function updateMemberInitiativeAction(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberInitiativeInput
): Promise<MemberInitiative> {
  return updateMemberInitiative(
    organizationId,
    membershipId,
    input
  );
}


/* ==========================================================
   Delete Member Initiative
========================================================== */

export async function deleteMemberInitiativeAction(
  organizationId: string,
  membershipId: string,
  initiativeId: string
): Promise<void> {
  return deleteMemberInitiative(
    organizationId,
    membershipId,
    initiativeId
  );
}