/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Authorization
 * ----------------------------------------------------------
 * Central server-side authorization boundary.
 *
 * Authorization hierarchy:
 *
 * Supabase Auth
 *      ↓
 * Current Server User
 *      ↓
 * Authorization Context
 *      ↓
 * ┌──────────────────────────────────────────────┐
 * │                                              │
 * │ Active Platform Super Admin                  │
 * │                                              │
 * │ OR                                           │
 * │                                              │
 * │ Active Organization Membership               │
 * │      ↓                                       │
 * │ Membership Roles                             │
 * │      ↓                                       │
 * │ Organization Roles                           │
 * │      ↓                                       │
 * │ Role Permissions                             │
 * │      ↓                                       │
 * │ Permission                                   │
 * │                                              │
 * └──────────────────────────────────────────────┘
 *
 * Platform Super Admins exist above the organization
 * membership / role hierarchy.
 *
 * A Platform Super Admin does NOT require an
 * organization_memberships record for the organization
 * being administered.
 *
 * IMPORTANT:
 *
 * This module is SERVER-SIDE infrastructure.
 *
 * It must not be imported by Client Components.
 *
 * This module does NOT:
 *
 * - authenticate users
 * - create users
 * - create roles
 * - create permissions
 * - assign roles
 * - assign permissions
 * - manage platform memberships
 * - perform resource ownership checks
 * - mutate application data
 *
 * Those responsibilities remain in their respective
 * services and workflows.
 * ==========================================================
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthorizationContext,
  type AuthorizationContext,
} from "@/lib/auth/authorizationcontext";


/* ==========================================================
   Permission Result
========================================================== */

/**
 * Represents the result of resolving a permission.
 *
 * Keeping this internal allows the public authorization
 * helpers to remain simple while preserving the ability
 * to expand authorization behavior later.
 */
type PermissionResolution = {

  context: AuthorizationContext;

  allowed: boolean;

};


/* ==========================================================
   Resolve Permission
========================================================== */

/**
 * Resolves whether the currently authenticated user has a
 * specific permission within the requested Organization.
 *
 * Authorization flow:
 *
 * 1. Resolve Authorization Context.
 *
 * 2. If no context exists:
 *      deny access.
 *
 * 3. If Platform Super Admin:
 *      allow organization-scoped authority.
 *
 * 4. Otherwise resolve Membership Roles.
 *
 * 5. Resolve active Organization Roles.
 *
 * 6. Resolve Role Permissions.
 *
 * 7. Resolve the requested Permission.
 *
 * The Authorization Context is intentionally resolved first
 * so authenticated identity and organization membership are
 * established by one central server-side boundary.
 */
async function resolvePermission(
  organizationId: string,
  permissionKey: string
): Promise<PermissionResolution | null> {

  /* ========================================================
     Validate Organization
  ======================================================== */

  if (!organizationId) {

    throw new Error(
      "Organization is required."
    );
  }


  /* ========================================================
     Normalize Permission
  ======================================================== */

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

  const context =
    await getAuthorizationContext(
      organizationId
    );

  if (!context) {
    return null;
  }


  /* ========================================================
     Platform Authority
  ======================================================== */

  /*
   * Platform Super Admin authority exists above the
   * organization role hierarchy.
   *
   * An active Platform Super Admin therefore satisfies
   * organization-scoped authorization without requiring
   * an organization membership.
   *
   * Resource ownership remains a separate concern.
   */

  if (context.isPlatformSuperAdmin) {

    return {

      context,

      allowed: true,

    };
  }


  /* ========================================================
     Organization Membership
  ======================================================== */

  /*
   * The Authorization Context guarantees that a membership
   * exists for a non-platform user.
   *
   * membershipId is therefore required here.
   */

  if (!context.membershipId) {

    return {

      context,

      allowed: false,

    };
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
      context.membershipId
    )
    .eq(
      "organization_id",
      context.organizationId
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

    return {

      context,

      allowed: false,

    };
  }


  /* ========================================================
     Organization Roles
  ======================================================== */

  const roleIds =
    membershipRoles
      .map(
        (membershipRole) =>
          membershipRole.role_id
      )
      .filter(
        (roleId): roleId is string =>
          Boolean(roleId)
      );

  if (roleIds.length === 0) {

    return {

      context,

      allowed: false,

    };
  }


  const {
    data: roles,
    error: roleError,
  } = await supabaseServer
    .from("roles")
    .select(
      "id, is_active"
    )
    .eq(
      "organization_id",
      context.organizationId
    )
    .in(
      "id",
      roleIds
    );

  if (roleError) {

    console.error(
      "Error loading organization roles:",
      roleError
    );

    throw new Error(
      `Failed to load organization roles: ${roleError.message}`
    );
  }

  if (
    !roles ||
    roles.length === 0
  ) {

    return {

      context,

      allowed: false,

    };
  }


  /* ========================================================
     Active Role IDs
  ======================================================== */

  const activeRoleIds =
    roles
      .filter(
        (role) =>
          role.is_active
      )
      .map(
        (role) =>
          role.id
      );

  if (activeRoleIds.length === 0) {

    return {

      context,

      allowed: false,

    };
  }


  /* ========================================================
     Role Permissions
  ======================================================== */

  const {
    data: rolePermissions,
    error: rolePermissionError,
  } = await supabaseServer
    .from("role_permissions")
    .select(
      "role_id, permission_id"
    )
    .in(
      "role_id",
      activeRoleIds
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

    return {

      context,

      allowed: false,

    };
  }


  /* ========================================================
     Permission IDs
  ======================================================== */

  const permissionIds =
    rolePermissions
      .map(
        (rolePermission) =>
          rolePermission.permission_id
      )
      .filter(
        (permissionId): permissionId is string =>
          Boolean(permissionId)
      );

  if (permissionIds.length === 0) {

    return {

      context,

      allowed: false,

    };
  }


  /* ========================================================
     Permission Catalog
  ======================================================== */

  const {
    data: permissions,
    error: permissionError,
  } = await supabaseServer
    .from("permissions")
    .select(
      "id, key"
    )
    .in(
      "id",
      permissionIds
    );

  if (permissionError) {

    console.error(
      "Error loading permissions:",
      permissionError
    );

    throw new Error(
      `Failed to load permissions: ${permissionError.message}`
    );
  }


  /* ========================================================
     Requested Permission
  ======================================================== */

  const permissionExists =
    Boolean(
      permissions?.some(
        (permission) =>
          permission.key
            .trim()
            .toLowerCase() ===
          normalizedPermissionKey
      )
    );


  return {

    context,

    allowed: permissionExists,

  };
}


/* ==========================================================
   Has Permission
========================================================== */

/**
 * Determines whether the currently authenticated user has
 * the requested organization-scoped permission.
 *
 * Returns false when:
 *
 * - the user is not authenticated
 * - the user does not belong to the organization
 * - the user has no active roles
 * - the user has no matching permission
 *
 * Platform Super Admins are authorized through their
 * platform-level authority.
 */
export async function hasPermission(
  organizationId: string,
  permissionKey: string
): Promise<boolean> {

  const resolution =
    await resolvePermission(
      organizationId,
      permissionKey
    );

  if (!resolution) {
    return false;
  }

  return resolution.allowed;
}


/* ==========================================================
   Require Permission
========================================================== */

/**
 * Requires the currently authenticated user to have the
 * requested organization-scoped permission.
 *
 * Throws when authorization fails.
 *
 * Intended for server-side:
 *
 * - API routes
 * - Server Actions
 * - server services
 * - administrative workflows
 *
 * Resource ownership must still be validated separately.
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


/* ==========================================================
   Require Platform Super Admin
========================================================== */

/**
 * Requires the authenticated user to have active
 * Platform Super Admin authority.
 *
 * This remains separate from organization permission
 * evaluation because Platform Super Admin is a platform-level
 * authority rather than an organization role.
 */
export async function requirePlatformSuperAdmin(): Promise<void> {

  const supabaseServer =
    await createSupabaseServerClient();


  /* ========================================================
     Authorization Context Is Not Appropriate Here
  ======================================================== */

  /*
   * Platform authority is global and does not require an
   * organizationId.
   *
   * Therefore this function resolves the authenticated
   * application User directly through the existing server
   * authorization infrastructure.
   */

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

    throw new Error(
      "Platform Super Admin access is required."
    );
  }


  /* ========================================================
     Application User
  ======================================================== */

  const {
    data: applicationUser,
    error: userError,
  } = await supabaseServer
    .from("users")
    .select(
      "id"
    )
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

    throw new Error(
      "Platform Super Admin access is required."
    );
  }


  /* ========================================================
     Platform Membership
  ======================================================== */

  const {
    data: platformMembership,
    error: platformMembershipError,
  } = await supabaseServer
    .from("platform_memberships")
    .select(
      "id"
    )
    .eq(
      "user_id",
      applicationUser.id
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

  if (platformMembershipError) {

    console.error(
      "Error loading platform membership:",
      platformMembershipError
    );

    throw new Error(
      `Failed to load platform membership: ${platformMembershipError.message}`
    );
  }

  if (!platformMembership) {

    throw new Error(
      "Platform Super Admin access is required."
    );
  }
}


/* ==========================================================
   Require Authorization Context
========================================================== */

/**
 * Requires the authenticated user to have a valid
 * authorization context for the requested Organization.
 *
 * This is useful when a server operation needs authenticated
 * organization context but does not yet require a specific
 * permission.
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