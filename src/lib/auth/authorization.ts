/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Authorization
 * ----------------------------------------------------------
 * Resolves permissions for the authenticated user.
 *
 * Authorization hierarchy:
 *
 * Supabase Auth
 *      ↓
 * Application User
 *      ↓
 * ┌───────────────────────────────────────┐
 * │                                       │
 * │ Active Platform Super Admin           │
 * │                                       │
 * │ OR                                    │
 * │                                       │
 * │ Organization Membership               │
 * │      ↓                                │
 * │ Membership Roles                      │
 * │      ↓                                │
 * │ Role Permissions                      │
 * │      ↓                                │
 * │ Permission                            │
 * │                                       │
 * └───────────────────────────────────────┘
 *
 * Platform Super Admins are above the organization role
 * hierarchy.
 *
 * A Platform Super Admin does NOT need an
 * organization_memberships record for every organization
 * they administer.
 *
 * This module provides the central server-side authorization
 * boundary for the application.
 *
 * IMPORTANT:
 *
 * This module must not be imported by client components.
 *
 * It intentionally does NOT:
 *
 * - manage authentication
 * - create roles
 * - create permissions
 * - assign roles
 * - assign permissions
 * - manage platform memberships
 *
 * Those responsibilities remain in their respective
 * services and administration workflows.
 * ==========================================================
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";


/* ==========================================================
   Get Authenticated Application User
========================================================== */

/**
 * Resolves the currently authenticated Supabase Auth user
 * to the corresponding CascadEffects application user id.
 *
 * Returns:
 *
 * string
 *   Application user id.
 *
 * null
 *   No authenticated application user exists.
 */
async function getAuthenticatedApplicationUserId(): Promise<
  string | null
> {

  const supabaseServer =
    await createSupabaseServerClient();

  const {
    data: {
      user: authUser,
    },
    error: authError,
  } = await supabaseServer.auth.getUser();

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

  const {
    data,
    error,
  } = await supabaseServer
    .from("users")
    .select("id")
    .eq(
      "auth_user_id",
      authUser.id
    )
    .maybeSingle();

  if (error) {

    console.error(
      "Error loading application user:",
      error
    );

    throw new Error(
      `Failed to load application user: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data.id;
}


/* ==========================================================
   Check Platform Super Admin
========================================================== */

/**
 * Determines whether the authenticated application user
 * has an active platform-level Super Admin membership.
 *
 * Platform Super Admin authority exists ABOVE the
 * organization membership / organization role hierarchy.
 *
 * A Super Admin therefore does not require an
 * organization_memberships record for the organization
 * being administered.
 */
export async function isPlatformSuperAdmin(): Promise<boolean> {

  const applicationUserId =
    await getAuthenticatedApplicationUserId();

  if (!applicationUserId) {
    return false;
  }

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
   Require Platform Super Admin
========================================================== */

/**
 * Requires the authenticated user to have active
 * platform-level Super Admin authority.
 *
 * Intended for platform administration operations such as:
 *
 * - organization administration
 * - platform user administration
 * - platform configuration
 * - future platform-level administration
 *
 * This is intentionally separate from organization
 * permission checks.
 */
export async function requirePlatformSuperAdmin(): Promise<void> {

  const allowed =
    await isPlatformSuperAdmin();

  if (!allowed) {

    throw new Error(
      "Platform Super Admin access is required."
    );
  }
}


/* ==========================================================
   Organization Permission
========================================================== */

/**
 * Determines whether the authenticated user can perform
 * an organization-scoped action.
 *
 * Authorization order:
 *
 * 1. Resolve authenticated application user.
 *
 * 2. Check active Platform Super Admin authority.
 *
 * 3. If Super Admin:
 *      Grant organization-scoped administrative authority.
 *
 * 4. Otherwise resolve organization membership.
 *
 * 5. Resolve membership roles.
 *
 * 6. Resolve active roles.
 *
 * 7. Resolve role permissions.
 *
 * 8. Resolve the requested permission.
 *
 * Platform Super Admins operate above the organization
 * membership boundary and therefore do not need membership
 * in the requested organization.
 */
export async function hasPermission(
  organizationId: string,
  permissionKey: string
): Promise<boolean> {

  if (!organizationId) {

    throw new Error(
      "Organization is required."
    );
  }

  const normalizedPermissionKey =
    permissionKey
      .trim()
      .toLowerCase();

  if (!normalizedPermissionKey) {

    throw new Error(
      "Permission key is required."
    );
  }

  const applicationUserId =
    await getAuthenticatedApplicationUserId();

  if (!applicationUserId) {
    return false;
  }


  /* ========================================================
     Platform Authority
  ======================================================== */

  /*
   * Platform Super Admins exist above organization roles.
   *
   * They do not require an organization membership in the
   * organization they are administering.
   *
   * At the current platform stage, an active Super Admin is
   * therefore authorized for organization-scoped permissions.
   */

  const platformSuperAdmin =
    await isPlatformSuperAdmin();

  if (platformSuperAdmin) {
    return true;
  }


  /* ========================================================
     Organization Membership
  ======================================================== */

  /*
   * Non-platform users must belong to the requested
   * organization.
   */

  const supabaseServer =
    await createSupabaseServerClient();

  const {
    data: membership,
    error: membershipError,
  } = await supabaseServer
    .from("organization_memberships")
    .select("id")
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
    return false;
  }


  /* ========================================================
     Membership Roles
  ======================================================== */

  const {
    data: membershipRoles,
    error: membershipRoleError,
  } = await supabaseServer
    .from("membership_roles")
    .select(
      "role_id"
    )
    .eq(
      "organization_membership_id",
      membership.id
    )
    .eq(
      "organization_id",
      organizationId
    );

  if (membershipRoleError) {

    console.error(
      "Error loading membership roles:",
      membershipRoleError
    );

    throw new Error(
      `Failed to load membership roles: ${membershipRoleError.message}`
    );
  }

  if (
    !membershipRoles ||
    membershipRoles.length === 0
  ) {
    return false;
  }


  /* ========================================================
     Roles
  ======================================================== */

  for (
    const membershipRole
    of membershipRoles
  ) {

    const {
      data: role,
      error: roleError,
    } = await supabaseServer
      .from("roles")
      .select(
        "id, is_active"
      )
      .eq(
        "id",
        membershipRole.role_id
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

    if (roleError) {

      console.error(
        "Error loading role:",
        roleError
      );

      throw new Error(
        `Failed to load role: ${roleError.message}`
      );
    }

    if (!role) {
      continue;
    }

    if (!role.is_active) {
      continue;
    }


    /* ======================================================
       Role Permissions
    ====================================================== */

    const {
      data: rolePermissions,
      error: rolePermissionError,
    } = await supabaseServer
      .from("role_permissions")
      .select(
        "permission_id"
      )
      .eq(
        "role_id",
        role.id
      );

    if (rolePermissionError) {

      console.error(
        "Error loading role permissions:",
        rolePermissionError
      );

      throw new Error(
        `Failed to load role permissions: ${rolePermissionError.message}`
      );
    }

    if (
      !rolePermissions ||
      rolePermissions.length === 0
    ) {
      continue;
    }


    /* ======================================================
       Permission Catalog
    ====================================================== */

    for (
      const rolePermission
      of rolePermissions
    ) {

      const {
        data: permission,
        error: permissionError,
      } = await supabaseServer
        .from("permissions")
        .select(
          "id, key"
        )
        .eq(
          "id",
          rolePermission.permission_id
        )
        .eq(
          "key",
          normalizedPermissionKey
        )
        .maybeSingle();

      if (permissionError) {

        console.error(
          "Error loading permission:",
          permissionError
        );

        throw new Error(
          `Failed to load permission: ${permissionError.message}`
        );
      }

      if (permission) {
        return true;
      }
    }
  }

  return false;
}


/* ==========================================================
   Require Organization Permission
========================================================== */

/**
 * Requires the authenticated user to have the requested
 * organization-scoped permission.
 *
 * Platform Super Admins satisfy this requirement through
 * their platform-level authority.
 */
export async function requirePermission(
  organizationId: string,
  permissionKey: string
): Promise<void> {

  const allowed =
    await hasPermission(
      organizationId,
      permissionKey
    );

  if (!allowed) {

    throw new Error(
      "You do not have permission to perform this action."
    );
  }
}