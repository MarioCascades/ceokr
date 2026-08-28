/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current Organization Context
 * ----------------------------------------------------------
 * Resolves the organization associated with an explicitly
 * selected Organization Membership.
 *
 * Authentication:
 *
 * Supabase Auth
 *      ↓
 * Current Application User
 *      ↓
 * Organization Membership
 *      ↓
 * Organization
 *
 * The membership establishes that the authenticated user
 * belongs to the organization.
 *
 * The organization itself remains the authoritative
 * organization domain model.
 *
 * This utility does NOT perform authorization.
 * Permissions and roles are handled separately.
 * ==========================================================
 */

import { supabase } from "@/lib/supabase/client";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  OrganizationMembership,
} from "@/lib/types/domain/organizationmembership";

/* ==========================================================
   Get Organization By Membership
========================================================== */

export async function getOrganizationByMembership(
  membership: OrganizationMembership
): Promise<Organization | null> {
  if (!membership) {
    throw new Error(
      "Organization membership is required."
    );
  }

  if (!membership.organization_id) {
    throw new Error(
      "Organization membership does not contain an organization."
    );
  }

  /*
   * Verify that the authenticated Supabase user exists.
   */
  const {
    data: {
      user: authUser,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "Error loading authenticated user:",
      authError
    );

    throw new Error(
      `Failed to load authenticated user: ${authError.message}`
    );
  }

  if (!authUser) {
    return null;
  }

  /*
   * Resolve the Auth user to the application User.
   */
  const {
    data: applicationUser,
    error: userError,
  } = await supabase
    .from("users")
    .select("id")
    .eq(
      "auth_user_id",
      authUser.id
    )
    .maybeSingle();

  if (userError) {
    console.error(
      "Error loading application user:",
      userError
    );

    throw new Error(
      `Failed to load application user: ${userError.message}`
    );
  }

  if (!applicationUser) {
    return null;
  }

  /*
   * Verify that the supplied membership actually belongs
   * to the authenticated application user.
   *
   * This prevents a caller from simply supplying another
   * user's organization membership.
   */
  const {
    data: verifiedMembership,
    error: membershipError,
  } = await supabase
    .from("organization_memberships")
    .select("id, organization_id")
    .eq(
      "id",
      membership.id
    )
    .eq(
      "user_id",
      applicationUser.id
    )
    .eq(
      "organization_id",
      membership.organization_id
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

  if (!verifiedMembership) {
    return null;
  }

  /*
   * Resolve the organization associated with the verified
   * membership.
   */
  const {
    data,
    error,
  } = await supabase
    .from("organization")
    .select("*")
    .eq(
      "id",
      verifiedMembership.organization_id
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading organization:",
      error
    );

    throw new Error(
      `Failed to load organization: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Organization;
}