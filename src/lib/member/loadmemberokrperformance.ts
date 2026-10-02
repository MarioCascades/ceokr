/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Load Member OKR Performance
 * ----------------------------------------------------------
 * Member-facing performance presentation source.
 *
 * Ownership:
 *
 * Organization
 *      ↓
 * Organization Membership
 *      ↓
 * Member OKRs
 *      ↓
 * Published Performance Sheet
 *
 * IMPORTANT:
 *
 * This loader intentionally does NOT use Assignment.
 *
 * Runtime monthly execution remains separate and continues
 * to use the existing Runtime architecture until the Runtime
 * migration milestone.
 *
 * This module combines:
 *
 * - the authoritative Member OKR data
 * - the organization's published presentation configuration
 * - the selected member identity
 *
 * It does not create a second performance data model.
 * ==========================================================
 */

import {
  getUser,
} from "@/services/user.service";

import {
  loadOrganizationMembershipForMember,
  loadMemberOKRs,
} from "@/lib/repositories/memberokrrepository";

import {
  loadLatestPublishedForOrganization,
} from "@/lib/repositories/performancesheetrepository";

import type {
  User,
} from "@/lib/types/domain/user";

import type {
  MemberObjective,
} from "@/lib/domain/memberokr";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";


/* ==========================================================
   Types
========================================================== */

export interface MemberOKRPerformance {

  organizationId: string;

  membershipId: string;

  subject: User;

  objectives: MemberObjective[];

  performanceSheet:
    PerformanceSheetRecord | null;

  performanceMonth: string;

}


/* ==========================================================
   Current Performance Month
========================================================== */

function getCurrentPerformanceMonth(): string {

  const now =
    new Date();

  return [
    now
      .getFullYear()
      .toString()
      .padStart(
        4,
        "0"
      ),

    (now.getMonth() + 1)
      .toString()
      .padStart(
        2,
        "0"
      ),

    "01",
  ].join("-");
}


/* ==========================================================
   Load Member OKR Performance
========================================================== */

export async function loadMemberOKRPerformance(
  organizationId: string,
  subjectId: string,
  performanceMonth?: string
): Promise<
  MemberOKRPerformance | null
> {

  /* ========================================================
     Load Member
  ======================================================== */

  const user =
    await getUser(
      subjectId
    );

  if (!user) {
    return null;
  }

  if (!user.is_active) {
    return null;
  }


  /* ========================================================
     Resolve Organization Membership
  ======================================================== */

  const membership =
    await loadOrganizationMembershipForMember(
      organizationId,
      user.id
    );

  if (!membership) {
    return null;
  }


  /* ========================================================
     Load Authoritative Member OKRs
  ======================================================== */

  const objectives =
    await loadMemberOKRs(
      organizationId,
      membership.id
    );


  /* ========================================================
     Load Published Presentation Configuration
  ======================================================== */

  const performanceSheet =
    await loadLatestPublishedForOrganization(
      organizationId
    );


  /* ========================================================
     Return Composed Member Experience
  ======================================================== */

  return {
    organizationId,

    membershipId:
      membership.id,

    subject:
      user,

    objectives,

    performanceSheet,

    performanceMonth:
      performanceMonth ??
      getCurrentPerformanceMonth(),
  };
}