import { supabase } from "@/lib/supabase/client";

import type {
  MembershipRole,
  CreateMembershipRoleInput,
} from "@/lib/types/domain/membershiprole";

/* ==========================================================
   List Membership Roles
========================================================== */

export async function listMembershipRoles(
  organizationMembershipId: string,
  organizationId: string
): Promise<MembershipRole[]> {
  if (!organizationMembershipId) {
    throw new Error(
      "Organization membership is required."
    );
  }

  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  const { data, error } = await supabase
    .from("membership_roles")
    .select("*")
    .eq(
      "organization_membership_id",
      organizationMembershipId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading membership roles:",
      error
    );

    throw new Error(
      `Failed to load membership roles: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as MembershipRole[];
}

/* ==========================================================
   Assign Role To Membership
========================================================== */

export async function createMembershipRole(
  input: CreateMembershipRoleInput
): Promise<MembershipRole> {
  if (!input.organization_membership_id) {
    throw new Error(
      "Organization membership is required."
    );
  }

  if (!input.role_id) {
    throw new Error(
      "Role is required."
    );
  }

  if (!input.organization_id) {
    throw new Error(
      "Organization is required."
    );
  }

  /*
   * Verify the membership belongs to the
   * requested organization.
   */
  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq(
      "id",
      input.organization_membership_id
    )
    .eq(
      "organization_id",
      input.organization_id
    )
    .maybeSingle();

  if (membershipError) {
    console.error(
      "Error verifying organization membership:",
      membershipError
    );

    throw new Error(
      `Failed to verify organization membership: ${membershipError.message}`
    );
  }

  if (!membership) {
    throw new Error(
      "The selected membership does not belong to this organization."
    );
  }

  /*
   * Verify the role belongs to the same
   * organization.
   */
  const {
    data: role,
    error: roleError,
  } = await supabase
    .from("roles")
    .select("id")
    .eq(
      "id",
      input.role_id
    )
    .eq(
      "organization_id",
      input.organization_id
    )
    .maybeSingle();

  if (roleError) {
    console.error(
      "Error verifying role:",
      roleError
    );

    throw new Error(
      `Failed to verify role: ${roleError.message}`
    );
  }

  if (!role) {
    throw new Error(
      "The selected role does not belong to this organization."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("membership_roles")
    .insert({
      organization_membership_id:
        input.organization_membership_id,

      role_id:
        input.role_id,

      organization_id:
        input.organization_id,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Error assigning role:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "This role is already assigned to the membership."
      );
    }

    throw new Error(
      `Failed to assign role: ${error.message}`
    );
  }

  return data as MembershipRole;
}

/* ==========================================================
   Remove Role From Membership
========================================================== */

export async function deleteMembershipRole(
  membershipRoleId: string,
  organizationId: string
): Promise<void> {
  if (!membershipRoleId) {
    throw new Error(
      "Membership role is required."
    );
  }

  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  const {
    data: membershipRole,
    error: lookupError,
  } = await supabase
    .from("membership_roles")
    .select(
      `
        id,
        organization_membership_id,
        role_id
      `
    )
    .eq(
      "id",
      membershipRoleId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Error verifying membership role:",
      lookupError
    );

    throw new Error(
      `Failed to verify membership role: ${lookupError.message}`
    );
  }

  if (!membershipRole) {
    throw new Error(
      "The selected membership role does not belong to this organization."
    );
  }

  const {
    error,
  } = await supabase
    .from("membership_roles")
    .delete()
    .eq(
      "id",
      membershipRoleId
    )
    .eq(
      "organization_id",
      organizationId
    );

  if (error) {
    console.error(
      "Error removing membership role:",
      error
    );

    throw new Error(
      `Failed to remove membership role: ${error.message}`
    );
  }
}