import { supabase } from "@/lib/supabase/client";

import type {
  RolePermission,
  CreateRolePermissionInput,
} from "@/lib/types/domain/rolepermission";

/* ==========================================================
   List Role Permissions
========================================================== */

export async function listRolePermissions(
  roleId: string,
  organizationId: string
): Promise<RolePermission[]> {
  if (!roleId) {
    throw new Error(
      "Role is required."
    );
  }

  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  /*
   * Verify the Role belongs to the requested
   * organization before returning permissions.
   */
  const {
    data: role,
    error: roleError,
  } = await supabase
    .from("roles")
    .select("id")
    .eq(
      "id",
      roleId
    )
    .eq(
      "organization_id",
      organizationId
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
    .from("role_permissions")
    .select("*")
    .eq(
      "role_id",
      roleId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading role permissions:",
      error
    );

    throw new Error(
      `Failed to load role permissions: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as RolePermission[];
}

/* ==========================================================
   Assign Permission To Role
========================================================== */

export async function createRolePermission(
  input: CreateRolePermissionInput,
  organizationId: string
): Promise<RolePermission> {
  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  if (!input.role_id) {
    throw new Error(
      "Role is required."
    );
  }

  if (!input.permission_id) {
    throw new Error(
      "Permission is required."
    );
  }

  /*
   * Verify the Role belongs to the requested
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
      organizationId
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

  /*
   * Verify the Permission exists in the
   * global permission catalog.
   */
  const {
    data: permission,
    error: permissionError,
  } = await supabase
    .from("permissions")
    .select("id")
    .eq(
      "id",
      input.permission_id
    )
    .maybeSingle();

  if (permissionError) {
    console.error(
      "Error verifying permission:",
      permissionError
    );

    throw new Error(
      `Failed to verify permission: ${permissionError.message}`
    );
  }

  if (!permission) {
    throw new Error(
      "The selected permission does not exist."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("role_permissions")
    .insert({
      role_id:
        input.role_id,

      permission_id:
        input.permission_id,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Error assigning permission:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "This permission is already assigned to the role."
      );
    }

    throw new Error(
      `Failed to assign permission: ${error.message}`
    );
  }

  return data as RolePermission;
}

/* ==========================================================
   Remove Permission From Role
========================================================== */

export async function deleteRolePermission(
  rolePermissionId: string,
  organizationId: string
): Promise<void> {
  if (!rolePermissionId) {
    throw new Error(
      "Role permission is required."
    );
  }

  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  /*
   * Verify the relationship belongs to a Role
   * inside the requested organization.
   */
  const {
    data: rolePermission,
    error: lookupError,
  } = await supabase
    .from("role_permissions")
    .select(
      `
        id,
        role_id,
        roles!inner (
          id,
          organization_id
        )
      `
    )
    .eq(
      "id",
      rolePermissionId
    )
    .eq(
      "roles.organization_id",
      organizationId
    )
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Error verifying role permission:",
      lookupError
    );

    throw new Error(
      `Failed to verify role permission: ${lookupError.message}`
    );
  }

  if (!rolePermission) {
    throw new Error(
      "The selected role permission does not belong to this organization."
    );
  }

  const {
    error,
  } = await supabase
    .from("role_permissions")
    .delete()
    .eq(
      "id",
      rolePermissionId
    );

  if (error) {
    console.error(
      "Error removing permission:",
      error
    );

    throw new Error(
      `Failed to remove permission: ${error.message}`
    );
  }
}