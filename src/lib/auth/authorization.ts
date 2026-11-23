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
  isApplicationUserPlatformSuperAdmin,
  type AuthorizationContext,
} from "@/lib/auth/authorizationcontext";
import {
  getCurrentServerAuth,
} from "@/lib/auth/currentserveruser";


/* ==========================================================
   Permission Result
========================================================== */

type PermissionResolution = {

  context: AuthorizationContext;

  allowed: boolean;

};


/* ==========================================================
   Resolve Permission
========================================================== */

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

  if (context.isPlatformSuperAdmin) {

    return {

      context,

      allowed: true,

    };
  }


  /* ========================================================
     Organization Membership
  ======================================================== */

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
 * The existing application-user lookup intentionally retains
 * its original auth_user_id-only condition. It is not changed
 * to the active-user lookup used by Authorization Context.
 *
 * Supabase Auth identity and the active platform membership
 * result are shared with other authorization paths through
 * request-scoped React caches.
 */
export async function requirePlatformSuperAdmin(): Promise<void> {

  const {
    supabaseServer,
    authUser,
  } = await getCurrentServerAuth();

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

  const platformSuperAdmin =
    await isApplicationUserPlatformSuperAdmin(
      applicationUser.id
    );

  if (!platformSuperAdmin) {

    throw new Error(
      "Platform Super Admin access is required."
    );
  }
}


/* ==========================================================
   Require Authorization Context
========================================================== */

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
