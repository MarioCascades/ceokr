
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

import {
  getCurrentServerUser,
} from "@/lib/auth/currentserveruser";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


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
    assignment.assignmentType !== "individual" ||
    assignment.subjectId !== user.id
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


/* ==========================================================
   Update Own Member Key Result Values
   ----------------------------------------------------------
   Members may update the Target and Current values of their
   own persistent Member Key Results.

   This action deliberately does not update:
   - Key Result title or configuration
   - Measurement or scoring settings
   - Status or visibility
   - Runtime monthly progress
   - Runtime historical snapshots
========================================================== */

export async function updateOwnMemberKeyResultValues(
  organizationId: string,
  keyResultId: string,
  values: {
    target?: unknown;
    currentValue?: unknown;
  }
): Promise<{
  keyResultId: string;
  target: unknown;
  currentValue: unknown;
}> {

  const currentUser =
    await getCurrentServerUser();

  if (!currentUser) {
    throw new Error(
      "You must be signed in to update your Key Result."
    );
  }


  const hasTarget =
    Object.prototype.hasOwnProperty.call(
      values,
      "target"
    );

  const hasCurrentValue =
    Object.prototype.hasOwnProperty.call(
      values,
      "currentValue"
    );

  if (!hasTarget && !hasCurrentValue) {
    throw new Error(
      "No Key Result values were provided."
    );
  }


  /* ========================================================
     Authenticated Server-Side Database Client
  ======================================================== */

  const supabaseServer =
    await createSupabaseServerClient();


  /* ========================================================
     Resolve The Signed-In Member's Organization Membership
  ======================================================== */

  const {
    data: membership,
    error: membershipError,
  } = await supabaseServer
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Failed to verify organization membership: ${membershipError.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "You do not belong to this organization."
    );
  }


  /* ========================================================
     Verify Key Result Ownership Through Its Objective
  ======================================================== */

  const {
    data: keyResult,
    error: keyResultError,
  } = await supabaseServer
    .from("member_key_results")
    .select("id, target, current_value, member_objective_id")
    .eq("id", keyResultId)
    .maybeSingle();

  if (keyResultError) {
    throw new Error(
      `Failed to load Key Result: ${keyResultError.message}`
    );
  }

  if (!keyResult) {
    throw new Error(
      "Key Result not found."
    );
  }


  const {
    data: objective,
    error: objectiveError,
  } = await supabaseServer
    .from("member_objectives")
    .select("id")
    .eq("id", keyResult.member_objective_id)
    .eq("organization_membership_id", membership.id)
    .maybeSingle();

  if (objectiveError) {
    throw new Error(
      `Failed to verify Key Result ownership: ${objectiveError.message}`
    );
  }

  if (!objective) {
    throw new Error(
      "You can only update Key Results belonging to your own membership."
    );
  }


  /* ========================================================
     Update Only The Supplied Values
  ======================================================== */

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (hasTarget) {
    update.target = values.target;
  }

  if (hasCurrentValue) {
    update.current_value = values.currentValue;
  }


  const {
    data: updatedKeyResult,
    error: updateError,
  } = await supabaseServer
    .from("member_key_results")
    .update(update)
    .eq("id", keyResultId)
    .eq("member_objective_id", objective.id)
    .select("id, target, current_value")
    .single();

  if (updateError) {
    throw new Error(
      `Failed to update Key Result values: ${updateError.message}`
    );
  }


  return {
    keyResultId: updatedKeyResult.id,
    target: updatedKeyResult.target,
    currentValue: updatedKeyResult.current_value,
  };
}
