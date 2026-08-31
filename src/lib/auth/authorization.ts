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
import { getCurrentServerUser } from "@/lib/auth/currentserveruser";


/* ==========================================================
   Platform Super Admin — Internal Resolution
========================================================== */

/**
 * Determines whether the supplied application User has an
 * active platform-level Super Admin membership.
 *
 * This internal helper accepts an already-resolved
 * application User id so authorization operations do not
 * repeatedly resolve Supabase Auth → application User.
 *
 * Platform Super Admin authority exists above the
 * organization membership / organization role hierarchy.
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
   Check Platform Super Admin
========================================================== */

/**
 * Determines whether the currently authenticated
 * application User has an active platform-level
 * Super Admin membership.
 *
 * Returns:
 *
 * true
 *   Active Platform Super Admin.
 *
 * false
 *   No authenticated user or no active Platform
 *   Super Admin membership.
 */
export async function isPlatformSuperAdmin(): Promise<boolean> {

  const currentUser =
    await getCurrentServerUser();

  if (!currentUser) {
    return false;
  }

  return isApplicationUserPlatformSuperAdmin(
    currentUser.id
  );
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
 * 1. Resolve authenticated application User.
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
 *
 * IMPORTANT:
 *
 * The current platform stage intentionally allows an active
 * Platform Super Admin to satisfy organization-scoped
 * permission checks.
 *
 * This is part of the Platform Authorization Foundation.
 *
 * More granular production authorization and resource
 * ownership checks remain future security work.
 */
export async function hasPermission(
  organizationId: string,
  permissionKey: string
): Promise<boolean> {

  /* ========================================================
     Validate Inputs
  ======================================================== */

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


  /* ========================================================
     Resolve Authenticated Application User
  ======================================================== */

  const currentUser =
    await getCurrentServerUser();

  if (!currentUser) {
    return false;
  }

  const applicationUserId =
    currentUser.id;


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
    await isApplicationUserPlatformSuperAdmin(
      applicationUserId
    );

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