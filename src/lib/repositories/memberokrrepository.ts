import { supabase } from "@/lib/supabase/client";

import type {
  OrganizationMembership,
} from "@/lib/types/domain/organizationmembership";

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
  MemberKeyResultMeasurementType,
  MemberKeyResultScoringMethod,
  MemberKeyResultStatus,
} from "@/lib/domain/memberokr";

/* ==========================================================
   Constants
========================================================== */

const MAX_MEMBER_INITIATIVES = 3;

/* ==========================================================
   Database Records
========================================================== */

interface MemberObjectiveRecord {
  id: string;

  organization_membership_id: string;

  title: string;

  description: string | null;

  weight: number | null;

  position: number;

  created_at: string;

  updated_at: string;
}

interface MemberKeyResultRecord {
  id: string;

  member_objective_id: string;

  title: string;

  target: unknown;

  current_value: unknown;

  weight: number | null;

  measurement_type:
    | MemberKeyResultMeasurementType
    | null;

  scoring_method:
    | MemberKeyResultScoringMethod
    | null;

  status: MemberKeyResultStatus;

  position: number;

  created_at: string;

  updated_at: string;
}

interface MemberInitiativeRecord {
  id: string;

  member_key_result_id: string;

  text: string;

  position: number;

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Membership
========================================================== */

/**
 * Resolves the authoritative Organization Membership for a
 * user inside a specific Organization.
 *
 * Member OKRs must always be connected through this
 * relationship.
 */
export async function loadOrganizationMembershipForMember(
  organizationId: string,
  userId: string
): Promise<OrganizationMembership | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "organization_memberships"
      )
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load organization membership: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as OrganizationMembership;
}

/* ==========================================================
   Membership Validation
========================================================== */

async function requireMembership(
  organizationId: string,
  membershipId: string
): Promise<OrganizationMembership> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "organization_memberships"
      )
      .select("*")
      .eq(
        "id",
        membershipId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate organization membership: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "The member does not belong to this organization."
    );
  }

  return data as OrganizationMembership;
}

/* ==========================================================
   Validation Helpers
========================================================== */

function requireTitle(
  value: string,
  label: string
): string {
  const title =
    value.trim();

  if (!title) {
    throw new Error(
      `${label} is required.`
    );
  }

  return title;
}

function validateWeight(
  weight: number | undefined,
  label: string
): number | null {
  if (
    weight === undefined ||
    weight === null
  ) {
    return null;
  }

  if (
    !Number.isFinite(
      weight
    )
  ) {
    throw new Error(
      `${label} weight must be a valid number.`
    );
  }

  if (
    weight < 0 ||
    weight > 100
  ) {
    throw new Error(
      `${label} weight must be between 0 and 100.`
    );
  }

  return weight;
}

function validatePosition(
  position: number | undefined
): number | null {
  if (
    position === undefined
  ) {
    return null;
  }

  if (
    !Number.isInteger(
      position
    ) ||
    position < 0
  ) {
    throw new Error(
      "Position must be a non-negative whole number."
    );
  }

  return position;
}

/* ==========================================================
   Objective Mapper
========================================================== */

function mapObjective(
  record: MemberObjectiveRecord
): MemberObjective {
  return {
    id:
      record.id,

    organizationMembershipId:
      record.organization_membership_id,

    title:
      record.title,

    description:
      record.description ??
      undefined,

    weight:
      record.weight ??
      undefined,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,

    keyResults: [],
  };
}

/* ==========================================================
   Key Result Mapper
========================================================== */

function mapKeyResult(
  record: MemberKeyResultRecord
): MemberKeyResult {
  return {
    id:
      record.id,

    memberObjectiveId:
      record.member_objective_id,

    title:
      record.title,

    target:
      record.target,

    currentValue:
      record.current_value,

    weight:
      record.weight ??
      undefined,

    measurementType:
      record.measurement_type ??
      undefined,

    scoringMethod:
      record.scoring_method ??
      undefined,

    status:
      record.status,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,

    initiatives: [],
  };
}

/* ==========================================================
   Initiative Mapper
========================================================== */

function mapInitiative(
  record: MemberInitiativeRecord
): MemberInitiative {
  return {
    id:
      record.id,

    memberKeyResultId:
      record.member_key_result_id,

    text:
      record.text,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/* ==========================================================
   Load Member OKRs
========================================================== */

export async function loadMemberOKRs(
  organizationId: string,
  membershipId: string
): Promise<MemberObjective[]> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const {
    data:
      objectiveData,
    error:
      objectiveError,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .select("*")
      .eq(
        "organization_membership_id",
        membershipId
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

  if (objectiveError) {
    throw new Error(
      `Failed to load member objectives: ${objectiveError.message}`
    );
  }

  const objectives =
    (
      (objectiveData ?? []) as
        MemberObjectiveRecord[]
    ).map(
      mapObjective
    );

  if (
    objectives.length ===
    0
  ) {
    return [];
  }

  const objectiveIds =
    objectives.map(
      (objective) =>
        objective.id
    );

  const {
    data:
      keyResultData,
    error:
      keyResultError,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .select("*")
      .in(
        "member_objective_id",
        objectiveIds
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

  if (keyResultError) {
    throw new Error(
      `Failed to load member Key Results: ${keyResultError.message}`
    );
  }

  const keyResults =
    (
      (keyResultData ?? []) as
        MemberKeyResultRecord[]
    ).map(
      mapKeyResult
    );

  if (
    keyResults.length ===
    0
  ) {
    return objectives;
  }

  const keyResultIds =
    keyResults.map(
      (keyResult) =>
        keyResult.id
    );

  const {
    data:
      initiativeData,
    error:
      initiativeError,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .select("*")
      .in(
        "member_key_result_id",
        keyResultIds
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

  if (initiativeError) {
    throw new Error(
      `Failed to load member Initiatives: ${initiativeError.message}`
    );
  }

  const initiatives =
    (
      (initiativeData ?? []) as
        MemberInitiativeRecord[]
    ).map(
      mapInitiative
    );

  const initiativesByKeyResult =
    new Map<
      string,
      MemberInitiative[]
    >();

  for (
    const initiative
    of initiatives
  ) {
    const existing =
      initiativesByKeyResult.get(
        initiative.memberKeyResultId
      ) ??
      [];

    existing.push(
      initiative
    );

    initiativesByKeyResult.set(
      initiative.memberKeyResultId,
      existing
    );
  }

  const keyResultsByObjective =
    new Map<
      string,
      MemberKeyResult[]
    >();

  for (
    const keyResult
    of keyResults
  ) {
    keyResult.initiatives =
      initiativesByKeyResult.get(
        keyResult.id
      ) ??
      [];

    const existing =
      keyResultsByObjective.get(
        keyResult.memberObjectiveId
      ) ??
      [];

    existing.push(
      keyResult
    );

    keyResultsByObjective.set(
      keyResult.memberObjectiveId,
      existing
    );
  }

  for (
    const objective
    of objectives
  ) {
    objective.keyResults =
      keyResultsByObjective.get(
        objective.id
      ) ??
      [];
  }

  return objectives;
}

/* ==========================================================
   Create Objective
========================================================== */

export async function createMemberObjective(
  organizationId: string,
  input: CreateMemberObjectiveInput
): Promise<MemberObjective> {
  await requireMembership(
    organizationId,
    input.organizationMembershipId
  );

  const title =
    requireTitle(
      input.title,
      "Objective title"
    );

  const weight =
    validateWeight(
      input.weight,
      "Objective"
    );

  const position =
    validatePosition(
      input.position
    );

  const finalPosition =
    position ??
    await getNextObjectivePosition(
      input.organizationMembershipId
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .insert({
        organization_membership_id:
          input.organizationMembershipId,

        title,

        description:
          input.description?.trim() ||
          null,

        weight,

        position:
          finalPosition,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create member Objective: ${error.message}`
    );
  }

  return mapObjective(
    data as MemberObjectiveRecord
  );
}

/* ==========================================================
   Update Objective
========================================================== */

export async function updateMemberObjective(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberObjectiveInput
): Promise<MemberObjective> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const title =
    requireTitle(
      input.title,
      "Objective title"
    );

  const weight =
    validateWeight(
      input.weight,
      "Objective"
    );

  const position =
    validatePosition(
      input.position
    );

  const update: Record<
    string,
    unknown
  > = {
    title,

    description:
      input.description?.trim() ||
      null,

    weight,
  };

  if (
    position !==
    null
  ) {
    update.position =
      position;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .update({
        ...update,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        input.objectiveId
      )
      .eq(
        "organization_membership_id",
        membershipId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update member Objective: ${error.message}`
    );
  }

  return mapObjective(
    data as MemberObjectiveRecord
  );
}

/* ==========================================================
   Delete Objective
========================================================== */

export async function deleteMemberObjective(
  organizationId: string,
  membershipId: string,
  objectiveId: string
): Promise<void> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const {
    error,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .delete()
      .eq(
        "id",
        objectiveId
      )
      .eq(
        "organization_membership_id",
        membershipId
      );

  if (error) {
    throw new Error(
      `Failed to delete member Objective: ${error.message}`
    );
  }
}

/* ==========================================================
   Create Key Result
========================================================== */

export async function createMemberKeyResult(
  organizationId: string,
  membershipId: string,
  input: CreateMemberKeyResultInput
): Promise<MemberKeyResult> {
  await requireMembership(
    organizationId,
    membershipId
  );

  await requireObjectiveOwnership(
    organizationId,
    membershipId,
    input.memberObjectiveId
  );

  const title =
    requireTitle(
      input.title,
      "Key Result title"
    );

  const weight =
    validateWeight(
      input.weight,
      "Key Result"
    );

  const position =
    validatePosition(
      input.position
    );

  const finalPosition =
    position ??
    await getNextKeyResultPosition(
      input.memberObjectiveId
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .insert({
        member_objective_id:
          input.memberObjectiveId,

        title,

        target:
          input.target ??
          null,

        current_value:
          input.currentValue ??
          null,

        weight,

        measurement_type:
          input.measurementType ??
          null,

        scoring_method:
          input.scoringMethod ??
          null,

        status:
          input.status ??
          "active",

        position:
          finalPosition,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create member Key Result: ${error.message}`
    );
  }

  return mapKeyResult(
    data as MemberKeyResultRecord
  );
}

/* ==========================================================
   Update Key Result
========================================================== */

export async function updateMemberKeyResult(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberKeyResultInput
): Promise<MemberKeyResult> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const objectiveId =
    await requireKeyResultOwnership(
      organizationId,
      membershipId,
      input.keyResultId
    );

  const title =
    requireTitle(
      input.title,
      "Key Result title"
    );

  const weight =
    validateWeight(
      input.weight,
      "Key Result"
    );

  const position =
    validatePosition(
      input.position
    );

  const update: Record<
    string,
    unknown
  > = {
    title,

    target:
      input.target ??
      null,

    current_value:
      input.currentValue ??
      null,

    weight,

    measurement_type:
      input.measurementType ??
      null,

    scoring_method:
      input.scoringMethod ??
      null,

    status:
      input.status ??
      "active",

    updated_at:
      new Date().toISOString(),
  };

  if (
    position !==
    null
  ) {
    update.position =
      position;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .update(update)
      .eq(
        "id",
        input.keyResultId
      )
      .eq(
        "member_objective_id",
        objectiveId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update member Key Result: ${error.message}`
    );
  }

  return mapKeyResult(
    data as MemberKeyResultRecord
  );
}

/* ==========================================================
   Delete Key Result
========================================================== */

export async function deleteMemberKeyResult(
  organizationId: string,
  membershipId: string,
  keyResultId: string
): Promise<void> {
  await requireMembership(
    organizationId,
    membershipId
  );

  await requireKeyResultOwnership(
    organizationId,
    membershipId,
    keyResultId
  );

  const {
    error,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .delete()
      .eq(
        "id",
        keyResultId
      );

  if (error) {
    throw new Error(
      `Failed to delete member Key Result: ${error.message}`
    );
  }
}

/* ==========================================================
   Create Initiative
========================================================== */

export async function createMemberInitiative(
  organizationId: string,
  membershipId: string,
  input: CreateMemberInitiativeInput
): Promise<MemberInitiative> {
  await requireMembership(
    organizationId,
    membershipId
  );

  await requireKeyResultOwnership(
    organizationId,
    membershipId,
    input.memberKeyResultId
  );

  await ensureInitiativeCapacity(
    input.memberKeyResultId
  );

  const text =
    requireTitle(
      input.text,
      "Initiative"
    );

  const position =
    validatePosition(
      input.position
    );

  const finalPosition =
    position ??
    await getNextInitiativePosition(
      input.memberKeyResultId
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .insert({
        member_key_result_id:
          input.memberKeyResultId,

        text,

        position:
          finalPosition,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create member Initiative: ${error.message}`
    );
  }

  return mapInitiative(
    data as MemberInitiativeRecord
  );
}

/* ==========================================================
   Update Initiative
========================================================== */

export async function updateMemberInitiative(
  organizationId: string,
  membershipId: string,
  input: UpdateMemberInitiativeInput
): Promise<MemberInitiative> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const keyResultId =
    await requireInitiativeOwnership(
      organizationId,
      membershipId,
      input.initiativeId
    );

  const text =
    requireTitle(
      input.text,
      "Initiative"
    );

  const position =
    validatePosition(
      input.position
    );

  const update: Record<
    string,
    unknown
  > = {
    text,

    updated_at:
      new Date().toISOString(),
  };

  if (
    position !==
    null
  ) {
    update.position =
      position;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .update(update)
      .eq(
        "id",
        input.initiativeId
      )
      .eq(
        "member_key_result_id",
        keyResultId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update member Initiative: ${error.message}`
    );
  }

  return mapInitiative(
    data as MemberInitiativeRecord
  );
}

/* ==========================================================
   Delete Initiative
========================================================== */

export async function deleteMemberInitiative(
  organizationId: string,
  membershipId: string,
  initiativeId: string
): Promise<void> {
  await requireMembership(
    organizationId,
    membershipId
  );

  await requireInitiativeOwnership(
    organizationId,
    membershipId,
    initiativeId
  );

  const {
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .delete()
      .eq(
        "id",
        initiativeId
      );

  if (error) {
    throw new Error(
      `Failed to delete member Initiative: ${error.message}`
    );
  }
}

/* ==========================================================
   Ownership Helpers
========================================================== */

async function requireObjectiveOwnership(
  organizationId: string,
  membershipId: string,
  objectiveId: string
): Promise<void> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .select("id")
      .eq(
        "id",
        objectiveId
      )
      .eq(
        "organization_membership_id",
        membershipId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate member Objective: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "The Objective does not belong to this member."
    );
  }
}

async function requireKeyResultOwnership(
  organizationId: string,
  membershipId: string,
  keyResultId: string
): Promise<string> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .select(
        "id, member_objective_id"
      )
      .eq(
        "id",
        keyResultId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate member Key Result: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Key Result not found."
    );
  }

  const {
    data:
      objective,
    error:
      objectiveError,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .select("id")
      .eq(
        "id",
        data.member_objective_id
      )
      .eq(
        "organization_membership_id",
        membershipId
      )
      .maybeSingle();

  if (objectiveError) {
    throw new Error(
      `Failed to validate Key Result ownership: ${objectiveError.message}`
    );
  }

  if (!objective) {
    throw new Error(
      "The Key Result does not belong to this member."
    );
  }

  return data.member_objective_id;
}

async function requireInitiativeOwnership(
  organizationId: string,
  membershipId: string,
  initiativeId: string
): Promise<string> {
  await requireMembership(
    organizationId,
    membershipId
  );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .select(
        "id, member_key_result_id"
      )
      .eq(
        "id",
        initiativeId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate member Initiative: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Initiative not found."
    );
  }

  await requireKeyResultOwnership(
    organizationId,
    membershipId,
    data.member_key_result_id
  );

  return data.member_key_result_id;
}

/* ==========================================================
   Initiative Capacity
========================================================== */

async function ensureInitiativeCapacity(
  keyResultId: string
): Promise<void> {
  const {
    count,
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "member_key_result_id",
        keyResultId
      );

  if (error) {
    throw new Error(
      `Failed to validate Initiative capacity: ${error.message}`
    );
  }

  if (
    (count ?? 0) >=
    MAX_MEMBER_INITIATIVES
  ) {
    throw new Error(
      "A Key Result can have at most 3 Initiatives."
    );
  }
}

/* ==========================================================
   Position Helpers
========================================================== */

async function getNextObjectivePosition(
  membershipId: string
): Promise<number> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_objectives"
      )
      .select("position")
      .eq(
        "organization_membership_id",
        membershipId
      )
      .order(
        "position",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to determine Objective position: ${error.message}`
    );
  }

  return (
    data?.position ??
    -1
  ) + 1;
}

async function getNextKeyResultPosition(
  objectiveId: string
): Promise<number> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_key_results"
      )
      .select("position")
      .eq(
        "member_objective_id",
        objectiveId
      )
      .order(
        "position",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to determine Key Result position: ${error.message}`
    );
  }

  return (
    data?.position ??
    -1
  ) + 1;
}

async function getNextInitiativePosition(
  keyResultId: string
): Promise<number> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "member_initiatives"
      )
      .select("position")
      .eq(
        "member_key_result_id",
        keyResultId
      )
      .order(
        "position",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to determine Initiative position: ${error.message}`
    );
  }

  return (
    data?.position ??
    -1
  ) + 1;
}