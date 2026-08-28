/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current Organization Membership
 * ----------------------------------------------------------
 * Resolves the authenticated application User to their
 * organization membership.
 *
 * Authentication:
 *
 * Supabase Auth
 *      ↓
 * Current Application User
 *      ↓
 * public.organization_memberships
 *
 * This utility intentionally resolves membership only.
 * It does NOT determine authorization or permissions.
 *
 * Authorization remains a separate platform concern.
 * ==========================================================
 */

import { supabase } from "@/lib/supabase/client";

import type {
  OrganizationMembership,
} from "@/lib/types/domain/organizationmembership";

/* ==========================================================
   Get Current Organization Memberships
========================================================== */

export async function getCurrentOrganizationMemberships(): Promise<
  OrganizationMembership[]
> {
  /*
   * Get the currently authenticated Supabase Auth user.
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

  /*
   * No authenticated user means there are no memberships
   * available to the current session.
   */
  if (!authUser) {
    return [];
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

  /*
   * The authenticated user may exist in Supabase Auth
   * without an application-level user record.
   */
  if (!applicationUser) {
    return [];
  }

  /*
   * Load every organization membership belonging to the
   * authenticated application user.
   *
   * We intentionally return all memberships because the
   * platform must support users belonging to multiple
   * organizations.
   */
  const {
    data,
    error,
  } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq(
      "user_id",
      applicationUser.id
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading organization memberships:",
      error
    );

    throw new Error(
      `Failed to load organization memberships: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as OrganizationMembership[];
}