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
 * │      ↓                                       │
 * │ Role Permissions                             │
 * │      ↓                                       │
 * │ Global Permissions                           │
 * │                                              │
 * └──────────────────────────────────────────────┘
 *
 * Platform Super Admins exist above the organization
 * role hierarchy.
 *
 * A Platform Super Admin does NOT require an
 * organization_memberships record for every organization
 * they administer.
 *
 * This module provides the central server-side authorization
 * boundary for organization-scoped permission checks.
 *
 * IMPORTANT:
 *
 * This module must not be imported by Client Components.
 *
 * It intentionally does NOT:
 *
 * - manage authentication
 * - create roles
 * - create permissions
 * - assign roles
 * - assign permissions
 * - manage platform memberships
 * - mutate application data
 *
 * Those responsibilities remain in their respective
 * services and administration workflows.
 * ==========================================================
 */

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
  getAuthorizationContext,
  type AuthorizationContext,
} from "@/lib/auth/authorizationcontext";


/* ==========================================================
   Organization Permission Context
========================================================== */

/**
 * Resolves the server-side authorization context for the
 * requested Organization.
 *
 * This is the reusable security context used by the
 * authorization layer.
 *
 * Platform Super Admins receive a valid context without
 * requiring organization membership.
 *
 * Organization users receive a valid context only when
 * they have membership in the requested Organization.
 */
export async function getOrganizationAuthorizationContext(
  organizationId: string
): Promise<AuthorizationContext | null> {

  return getAuthorizationContext(
    organizationId
  );
}


/* ==========================================================
   Permission Check
========================================================== */

/**
 * Determines whether the authenticated user can perform
 * an organization-scoped action.
 *
 * Authorization order:
 *
 * 1. Resolve server-side AuthorizationContext.
 *
 * 2. If no context exists:
 *      return false.
 *
 * 3. If Platform Super Admin:
 *      authorize the organization-scoped action.
 *
 * 4. Otherwise:
 *      resolve Membership Roles.
 *
 * 5. Resolve active Organization Roles.
 *
 * 6. Resolve Role Permissions.
 *
 * 7. Resolve the requested Global Permission.
 *
 * The AuthorizationContext is always established server-side
 * from the authenticated request session.
 *
 * Callers must not construct or supply their own context.
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
     Authorization Context
  ======================================================== */

  /*
   * AuthorizationContext is resolved entirely on the server
   * from the authenticated request.
   *
   * This prevents callers from supplying arbitrary:
   *
   * - user ids
   * - membership ids
   * - organization ids
   * - platform authority
   */
  const authorizationContext =
    await getAuthorizationContext(
      organizationId
    );

  if (!authorizationContext) {
    return false;
  }


  /* ========================================================
     Platform Authority
  ======================================================== */

  /*
   * Platform Super Admin authority exists above the
   * organization role hierarchy.
   *
   * At the current platform stage, an active Platform Super
   * Admin satisfies organization-scoped permission checks.
   *
   * The requested organizationId remains part of the
   * authorization context even though membershipId is null.
   */

  if (
    authorizationContext.isPlatformSuperAdmin
  ) {
    return true;
  }


  /* ========================================================
     Organization Membership
  ======================================================== */

  /*
   * A non-platform authorization context must contain an
   * organization membership.
   *
   * This should already be guaranteed by
   * getAuthorizationContext(), but the explicit check keeps
   * the permission boundary defensive.
   */

  if (
    !authorizationContext.membershipId
  ) {
    return false;
  }


  /* ========================================================
     Supabase Server Client
  ======================================================== */

  const supabaseServer =
    await createSupabaseServerClient();


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
      authorizationContext.membershipId
    )
    .eq(
      "organization_id",
      authorizationContext.organizationId
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
     Organization Roles
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
        authorizationContext.organizationId
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
       Global Permission Catalog
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


  /* ========================================================
     Permission Denied
  ======================================================== */

  return false;
}


/* ==========================================================
   Require Permission
========================================================== */

/**
 * Requires the authenticated user to have the requested
 * organization-scoped permission.
 *
 * Platform Super Admins satisfy the requirement through
 * their platform-level authority.
 *
 * Organization users must satisfy the requested permission
 * through their organization membership and assigned roles.
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