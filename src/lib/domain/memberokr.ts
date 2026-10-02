/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Member OKR Domain
 * ----------------------------------------------------------
 * Persistent employee performance data.
 *
 * Ownership:
 *
 * Organization Membership
 *        ↓
 * Member Objective
 *        ↓
 * Member Key Result
 *        ↓
 * Member Initiative
 *
 * IMPORTANT:
 *
 * This is NOT Runtime.
 *
 * Runtime owns monthly execution and historical snapshots.
 *
 * This domain owns the member's persistent Objectives,
 * Key Results, and Initiatives.
 *
 * Performance Builder does not own these records.
 * Assignment does not own these records.
 * ==========================================================
 */

/* ==========================================================
   Member Objective
========================================================== */

export interface MemberObjective {
  id: string;

  organizationMembershipId: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;

  createdAt: string;

  updatedAt: string;

  keyResults: MemberKeyResult[];
}

/* ==========================================================
   Member Key Result
========================================================== */

export type MemberKeyResultMeasurementType =
  | "percentage"
  | "numeric"
  | "financial";

export type MemberKeyResultScoringMethod =
  | "percent_into_period"
  | "percentage_of_target"
  | "display_only";

export type MemberKeyResultStatus =
  | "active"
  | "completed"
  | "cancelled";

export interface MemberKeyResult {
  id: string;

  memberObjectiveId: string;

  title: string;

  target: unknown;

  currentValue: unknown;

  weight?: number;

  measurementType?: MemberKeyResultMeasurementType;

  scoringMethod?: MemberKeyResultScoringMethod;

  status: MemberKeyResultStatus;

  position: number;

  createdAt: string;

  updatedAt: string;

  initiatives: MemberInitiative[];
}

/* ==========================================================
   Member Initiative
========================================================== */

export interface MemberInitiative {
  id: string;

  memberKeyResultId: string;

  text: string;

  position: number;

  createdAt: string;

  updatedAt: string;
}

/* ==========================================================
   Create Objective
========================================================== */

export interface CreateMemberObjectiveInput {
  organizationMembershipId: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;
}

/* ==========================================================
   Update Objective
========================================================== */

export interface UpdateMemberObjectiveInput {
  objectiveId: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;
}

/* ==========================================================
   Create Key Result
========================================================== */

export interface CreateMemberKeyResultInput {
  memberObjectiveId: string;

  title: string;

  target?: unknown;

  currentValue?: unknown;

  weight?: number;

  measurementType?:
    | MemberKeyResultMeasurementType;

  scoringMethod?:
    | MemberKeyResultScoringMethod;

  status?: MemberKeyResultStatus;

  position?: number;
}

/* ==========================================================
   Update Key Result
========================================================== */

export interface UpdateMemberKeyResultInput {
  keyResultId: string;

  title: string;

  target?: unknown;

  currentValue?: unknown;

  weight?: number;

  measurementType?:
    | MemberKeyResultMeasurementType;

  scoringMethod?:
    | MemberKeyResultScoringMethod;

  status?: MemberKeyResultStatus;

  position?: number;
}

/* ==========================================================
   Create Initiative
========================================================== */

export interface CreateMemberInitiativeInput {
  memberKeyResultId: string;

  text: string;

  position?: number;
}

/* ==========================================================
   Update Initiative
========================================================== */

export interface UpdateMemberInitiativeInput {
  initiativeId: string;

  text: string;

  position?: number;
}