/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Authorization Context
 * ----------------------------------------------------------
 * Resolves the server-side authorization context for an
 * explicitly requested Organization.
 *
 * Authorization hierarchy:
 *
 * Supabase Auth
 *      ↓
 * Application User
 *      ↓
 * ┌──────────────────────────────────────────────┐
 * │                                              │
 * │ Active Platform Super Admin                  │
 * │                                              │
 * │ OR                                           │
 * │                                              │
 * │ Organization Membership                      │
 * │      ↓                                       │
 * │ Membership Roles                             │
 * │      ↓                                       │
 * │ Organization Roles                           │
 * │                                              │
 * └──────────────────────────────────────────────┘
 *
 * This module establishes authorization CONTEXT.
 *
 * It does NOT:
 *
 * - perform resource ownership authorization
 * - create roles
 * - create permissions
 * - assign roles
 * - assign permissions
 * - manage platform memberships
 * - mutate application data
 *
 * Those responsibilities remain in their respective
 * services and authorization workflows.
 *
 * IMPORTANT:
 *
 * This module is SERVER-SIDE infrastructure.
 *
 * It must not be imported by Client Components.
 * ==========================================================
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentServerUser } from "@/lib/auth/currentserveruser";

import type {
  User,
} from "@/lib/types/domain/user";


/* ==========================================================
   Authorization Context
========================================================== */

/**
 * Represents the authenticated user's authorization context
 * for a specific Organization.
 *
 * Platform Super Admins may have:
 *
 * membershipId = null
 *
 * because they do not require an Organization Membership
 * for organizations they administer.
 *
 * Organization users have:
 *
 * membershipId = Organization Membership id
 */
export type AuthorizationContext = {

  user: User;

  userId: string;

  organizationId: string;

  membershipId: string | null;

  isPlatformSuperAdmin: boolean;

};


/* ==========================================================
   Internal Platform Authority Resolution
========================================================== */

/**
 * Determines whether an application User has an active
 * Platform Super Admin membership.
 *
 * This helper intentionally accepts an application User id
 * rather than resolving the authenticated identity again.
 */
async function isApplicationUserPlatformSuperAdmin(
  applicationUserId: string
): Promise<boolean> {

  const supabaseServer =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabaseServer
    .from("platform_memberships")
    .select("id")
    .eq(
      "user_id",
      applicationUserId
    )
    .eq(
      "platform_role",
      "super_admin"
    )
    .eq(
      "is_active",
      true
    )
    .maybeSingle();

  if (error) {

    console.error(
      "Error loading platform membership:",
      error
    );

    throw new Error(
      `Failed to load platform membership: ${error.message}`
    );
  }

  return !!data;
}


/* ==========================================================
   Get Authorization Context
========================================================== */

/**
 * Resolves the authorization context for the currently
 * authenticated application User and an explicitly requested
 * Organization.
 *
 * Authorization flow:
 *
 * 1. Validate Organization.
 *
 * 2. Resolve authenticated application User.
 *
 * 3. Check Platform Super Admin authority.
 *
 * 4. If Platform Super Admin:
 *      Return organization context without membership.
 *
 * 5. Otherwise resolve Organization Membership.
 *
 * 6. If no membership exists:
 *      Return null.
 *
 * This function establishes authorization context only.
 *
 * Permission evaluation remains the responsibility of the
 * authorization layer.
 */
export async function getAuthorizationContext(
  organizationId: string
): Promise<AuthorizationContext | null> {

  /* ========================================================
     Validate Organization
  ======================================================== */

  if (!organizationId) {

    throw new Error(
      "Organization is required."
    );
  }


  /* ========================================================
     Resolve Authenticated Application User
  ======================================================== */

  const currentUser =
    await getCurrentServerUser();

  if (!currentUser) {
    return null;
  }

  const applicationUserId =
    currentUser.id;


  /* ========================================================
     Platform Authority
  ======================================================== */

  /*
   * Platform Super Admin authority exists above the
   * Organization Membership hierarchy.
   *
   * Therefore a Platform Super Admin does not need an
   * organization_memberships record for the requested
   * organization.
   */

  const platformSuperAdmin =
    await isApplicationUserPlatformSuperAdmin(
      applicationUserId
    );

  if (platformSuperAdmin) {

    return {

      user: currentUser,

      userId: applicationUserId,

      organizationId,

      membershipId: null,

      isPlatformSuperAdmin: true,

    };
  }


  /* ========================================================
     Organization Membership
  ======================================================== */

  /*
   * Non-platform users must have an Organization Membership
   * for the requested Organization.
   */

  const supabaseServer =
    await createSupabaseServerClient();

  const {
    data: membership,
    error: membershipError,
  } = await supabaseServer
    .from("organization_memberships")
    .select(
      "id, organization_id"
    )
    .eq(
      "user_id",
      applicationUserId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .maybeSingle();

  if (membershipError) {

    console.error(
      "Error loading organization membership:",
      membershipError
    );

    throw new Error(
      `Failed to load organization membership: ${membershipError.message}`
    );
  }

  if (!membership) {
    return null;
  }


  /* ========================================================
     Return Organization Authorization Context
  ======================================================== */

  return {

    user: currentUser,

    userId: applicationUserId,

    organizationId,

    membershipId: membership.id,

    isPlatformSuperAdmin: false,

  };
}


/* ==========================================================
   Require Authorization Context
========================================================== */

/**
 * Requires the authenticated user to have a valid
 * authorization context for the requested Organization.
 *
 * Platform Super Admins satisfy the requirement without an
 * Organization Membership.
 *
 * Organization users must have an Organization Membership.
 *
 * This function does not yet evaluate a specific Permission.
 */
export async function requireAuthorizationContext(
  organizationId: string
): Promise<AuthorizationContext> {

  const context =
    await getAuthorizationContext(
      organizationId
    );

  if (!context) {

    throw new Error(
      "You are not authorized to access this organization."
    );
  }

  return context;
}
