
import { getUser } from "@/services/user.service";

import {
  loadOrganizationMembershipForMember,
  loadMemberOKRs,
} from "@/lib/repositories/memberokrrepository";

import {
  loadLatestPublishedForOrganization,
  saveBuilderDocument,
  publishPerformanceSheet,
} from "@/lib/repositories/performancesheetrepository";

import {
  createPerformanceInstance,
  findPerformanceInstanceByMemberAndMonth,
} from "@/lib/repositories/performanceinstancerepository";

import type { PerformanceInstance } from "@/lib/domain/performanceinstance";

import {
  initializeMemberPerformanceInstance,
} from "@/lib/runtime/initializememberperformanceinstance";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  initialBuilderDocument,
} from "@/lib/builder/builderdefaults";

function normalizePerformanceMonth(
  performanceMonth: string
): string {
  const value = performanceMonth.trim();
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);

  if (!match) {
    throw new Error(
      "Performance month must use YYYY-MM or YYYY-MM-DD format."
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    throw new Error(
      "Performance month contains an invalid month."
    );
  }

  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-01`;
}

function validatePerformanceMonth(
  performanceMonth: string
): string {
  const normalizedMonth =
    normalizePerformanceMonth(
      performanceMonth
    );

  const now = new Date();

  const currentMonth =
    `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-01`;

  if (
    normalizedMonth >
    currentMonth
  ) {
    throw new Error(
      "Future performance months cannot be created."
    );
  }

  return normalizedMonth;
}

/* ==========================================================
   Ensure Organization Performance Workspace
   ----------------------------------------------------------
   There is one shared Performance Workspace per organization.

   Existing workspaces are reused without changing their
   document. If no workspace exists, create the initial empty
   workspace for the exact organization and publish it.

   This does not create, replace, or modify Member OKRs.
========================================================== */

async function ensurePublishedPerformanceWorkspace(
  organizationId: string
) {
  const normalizedOrganizationId =
    organizationId.trim();

  if (!normalizedOrganizationId) {
    throw new Error(
      "Organization ID is required to load the Performance Workspace."
    );
  }

  const organization =
    await getOrganization(
      normalizedOrganizationId
    );

  if (
    !organization ||
    organization.id !== normalizedOrganizationId
  ) {
    throw new Error(
      "The requested organization could not be found."
    );
  }

  let performanceSheet =
    await loadLatestPublishedForOrganization(
      normalizedOrganizationId
    );

  if (!performanceSheet) {
    const initialDocument = {
      ...initialBuilderDocument,
      organization: {
        ...initialBuilderDocument.organization,
        companyName: organization.company_name,
        logoUrl: organization.logo_url ?? "",
      },
    };

    performanceSheet =
      await saveBuilderDocument(
        normalizedOrganizationId,
        initialDocument
      );
  }

  if (
    performanceSheet.organization_id !==
    normalizedOrganizationId
  ) {
    throw new Error(
      "The Performance Workspace does not belong to the requested organization."
    );
  }

  if (
    performanceSheet.status !== "published"
  ) {
    performanceSheet =
      await publishPerformanceSheet(
        normalizedOrganizationId,
        performanceSheet.id
      );
  }

  if (
    performanceSheet.status !== "published"
  ) {
    throw new Error(
      "The organization's Performance Workspace could not be published."
    );
  }

  return performanceSheet;
}

/* ==========================================================
   Get Or Create Member Performance Execution
   ----------------------------------------------------------
   Current Runtime identity:

   organization_id
   + member_id
   + performance_month

   Assignment is intentionally not used to establish member
   participation or select the Performance Sheet.

   Existing Assignment-based Runtime records remain available
   through the legacy compatibility path.
========================================================== */

export async function getOrCreateMemberPerformanceExecutionForMonth(
  organizationId: string,
  memberId: string,
  performanceMonth: string
): Promise<PerformanceInstance> {
  const normalizedOrganizationId =
    organizationId.trim();

  if (!normalizedOrganizationId) {
    throw new Error(
      "Organization ID is required."
    );
  }

  const user =
    await getUser(memberId);

  if (
    !user ||
    !user.is_active
  ) {
    throw new Error(
      "Active member could not be found."
    );
  }

  const membership =
    await loadOrganizationMembershipForMember(
      normalizedOrganizationId,
      memberId
    );

  if (!membership) {
    throw new Error(
      "The member does not belong to this organization."
    );
  }

  const normalizedMonth =
    validatePerformanceMonth(
      performanceMonth
    );

  const existing =
    await findPerformanceInstanceByMemberAndMonth(
      normalizedOrganizationId,
      memberId,
      normalizedMonth
    );

  const objectives =
    await loadMemberOKRs(
      normalizedOrganizationId,
      membership.id
    );

  if (existing) {
    await initializeMemberPerformanceInstance(
      existing,
      objectives
    );

    return existing;
  }

  const performanceSheet =
    await ensurePublishedPerformanceWorkspace(
      normalizedOrganizationId
    );

  const performanceInstance =
    await createPerformanceInstance({
      organizationId:
        normalizedOrganizationId,

      assignmentId:
        undefined,

      memberId,

      performanceSheetId:
        performanceSheet.id,

      performanceMonth:
        normalizedMonth,

      overallScore:
        0,

      progress:
        0,

      status:
        "in_progress",

      employeeComments:
        undefined,

      managerComments:
        undefined,

      startedAt:
        new Date().toISOString(),

      submittedAt:
        undefined,

      approvedAt:
        undefined,

      completedAt:
        undefined,
    });

  await initializeMemberPerformanceInstance(
    performanceInstance,
    objectives
  );

  return performanceInstance;
}
