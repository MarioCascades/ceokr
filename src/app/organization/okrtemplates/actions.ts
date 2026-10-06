"use server";

import { revalidatePath } from "next/cache";

import {
  loadOrganizationMembershipForMember,
  loadMemberOKRs,
  createMemberObjective,
  createMemberKeyResult,
  createMemberInitiative,
  deleteMemberKeyResult,
} from "@/lib/repositories/memberokrrepository";

import {
  loadOrganizationObjectiveTemplateById,
  loadOrganizationKeyResultTemplateById,
} from "@/lib/repositories/okrtemplaterepository";

export interface TemplateAssignmentMemberObjective {
  id: string;
  title: string;
}

export async function loadMemberObjectivesForTemplateAssignment(
  organizationId: string,
  userId: string
): Promise<TemplateAssignmentMemberObjective[]> {
  const membership =
    await loadOrganizationMembershipForMember(
      organizationId,
      userId
    );

  if (!membership) {
    throw new Error(
      "The selected member does not belong to this organization."
    );
  }

  const objectives =
    await loadMemberOKRs(
      organizationId,
      membership.id
    );

  return objectives.map((objective) => ({
    id: objective.id,
    title: objective.title,
  }));
}

export async function applyOrganizationObjectiveTemplateToMember(
  organizationId: string,
  templateId: string,
  userId: string
): Promise<void> {
  const template =
    await loadOrganizationObjectiveTemplateById(
      organizationId,
      templateId
    );

  if (!template) {
    throw new Error(
      "The Organization Objective Template could not be found."
    );
  }

  const membership =
    await loadOrganizationMembershipForMember(
      organizationId,
      userId
    );

  if (!membership) {
    throw new Error(
      "The selected member does not belong to this organization."
    );
  }

  await createMemberObjective(
    organizationId,
    {
      organizationMembershipId: membership.id,
      title: template.title,
      description: template.description,
      weight: template.weight,
      position: template.position,
    }
  );

  revalidatePath("/organization/okrtemplates");
  revalidatePath("/organization/users");
  revalidatePath("/member");
}

export async function applyOrganizationKeyResultTemplateToMember(
  organizationId: string,
  templateId: string,
  userId: string,
  memberObjectiveId: string
): Promise<void> {
  const template =
    await loadOrganizationKeyResultTemplateById(
      organizationId,
      templateId
    );

  if (!template) {
    throw new Error(
      "The Organization Key Result Template could not be found."
    );
  }

  const membership =
    await loadOrganizationMembershipForMember(
      organizationId,
      userId
    );

  if (!membership) {
    throw new Error(
      "The selected member does not belong to this organization."
    );
  }

  let createdKeyResultId: string | null = null;

  try {
    const createdKeyResult =
      await createMemberKeyResult(
        organizationId,
        membership.id,
        {
          memberObjectiveId,
          title: template.title,
          target: template.target,
          weight: template.weight,
          measurementType: template.measurementType,
          scoringMethod: template.scoringMethod,
          status: "active",
        }
      );

    createdKeyResultId =
      createdKeyResult.id;

    for (const initiative of template.initiatives) {
      await createMemberInitiative(
        organizationId,
        membership.id,
        {
          memberKeyResultId: createdKeyResult.id,
          text: initiative.text,
          position: initiative.position,
        }
      );
    }
  } catch (error) {
    if (createdKeyResultId) {
      try {
        await deleteMemberKeyResult(
          organizationId,
          membership.id,
          createdKeyResultId
        );
      } catch {
        /* Preserve the original assignment error. */
      }
    }

    throw error;
  }

  revalidatePath("/organization/okrtemplates");
  revalidatePath("/organization/users");
  revalidatePath("/member");
}

