import { supabase } from "@/lib/supabase/client";

import type {
  Role,
  CreateRoleInput,
  UpdateRoleInput,
} from "@/lib/types/domain/role";

/* ==========================================================
   List Organization Roles
========================================================== */

export async function listRoles(
  organizationId: string
): Promise<Role[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading roles:",
      error
    );

    throw new Error(
      `Failed to load roles: ${error.message}`
    );
  }

  return (data ?? []) as Role[];
}

/* ==========================================================
   Get Organization Role
========================================================== */

export async function getRole(
  roleId: string,
  organizationId: string
): Promise<Role | null> {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq(
      "id",
      roleId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading role:",
      error
    );

    throw new Error(
      `Failed to load role: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Role;
}

/* ==========================================================
   Create Role
========================================================== */

export async function createRole(
  input: CreateRoleInput
): Promise<Role> {
  const name = input.name.trim();

  if (!input.organization_id) {
    throw new Error(
      "Organization is required."
    );
  }

  if (!name) {
    throw new Error(
      "Role name is required."
    );
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      organization_id:
        input.organization_id,

      name,

      description:
        input.description?.trim() || null,

      is_active:
        input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Error creating role:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A role with this name already exists in this organization."
      );
    }

    if (error.code === "23503") {
      throw new Error(
        "The selected organization does not exist."
      );
    }

    throw new Error(
      `Failed to create role: ${error.message}`
    );
  }

  return data as Role;
}

/* ==========================================================
   Update Role
========================================================== */

export async function updateRole(
  roleId: string,
  organizationId: string,
  input: UpdateRoleInput
): Promise<Role> {
  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  const updateData: UpdateRoleInput = {
    ...input,
  };

  if (updateData.name !== undefined) {
    const name = updateData.name.trim();

    if (!name) {
      throw new Error(
        "Role name is required."
      );
    }

    updateData.name = name;
  }

  if (
    updateData.description !== undefined
  ) {
    updateData.description =
      updateData.description?.trim() || null;
  }

  const { data, error } = await supabase
    .from("roles")
    .update(updateData)
    .eq(
      "id",
      roleId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating role:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A role with this name already exists in this organization."
      );
    }

    throw new Error(
      `Failed to update role: ${error.message}`
    );
  }

  return data as Role;
}

/* ==========================================================
   Delete Role
========================================================== */

export async function deleteRole(
  roleId: string,
  organizationId: string
): Promise<void> {
  if (!organizationId) {
    throw new Error(
      "Organization is required."
    );
  }

  const { error } = await supabase
    .from("roles")
    .delete()
    .eq(
      "id",
      roleId
    )
    .eq(
      "organization_id",
      organizationId
    );

  if (error) {
    console.error(
      "Error deleting role:",
      error
    );

    throw new Error(
      `Failed to delete role: ${error.message}`
    );
  }
}