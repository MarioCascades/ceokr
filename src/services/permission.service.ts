import { supabase } from "@/lib/supabase/client";

import type {
  Permission,
  CreatePermissionInput,
} from "@/lib/types/domain/permission";

/* ==========================================================
   List Permissions
========================================================== */

export async function listPermissions(): Promise<
  Permission[]
> {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("key", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading permissions:",
      error
    );

    throw new Error(
      `Failed to load permissions: ${error.message}`
    );
  }

  return (data ?? []) as Permission[];
}

/* ==========================================================
   Get Permission
========================================================== */

export async function getPermission(
  permissionId: string
): Promise<Permission | null> {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq(
      "id",
      permissionId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading permission:",
      error
    );

    throw new Error(
      `Failed to load permission: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Permission;
}

/* ==========================================================
   Get Permission By Key
========================================================== */

export async function getPermissionByKey(
  key: string
): Promise<Permission | null> {
  const normalizedKey =
    key.trim().toLowerCase();

  if (!normalizedKey) {
    throw new Error(
      "Permission key is required."
    );
  }

  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq(
      "key",
      normalizedKey
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading permission by key:",
      error
    );

    throw new Error(
      `Failed to load permission: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Permission;
}

/* ==========================================================
   Create Permission
----------------------------------------------------------
Permissions are platform-level definitions.

This service method is provided for future platform
administration workflows. Organization administrators
should not create permissions.
========================================================== */

export async function createPermission(
  input: CreatePermissionInput
): Promise<Permission> {
  const key =
    input.key.trim().toLowerCase();

  const name =
    input.name.trim();

  if (!key) {
    throw new Error(
      "Permission key is required."
    );
  }

  if (!name) {
    throw new Error(
      "Permission name is required."
    );
  }

  const { data, error } = await supabase
    .from("permissions")
    .insert({
      key,

      name,

      description:
        input.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Error creating permission:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A permission with this key already exists."
      );
    }

    throw new Error(
      `Failed to create permission: ${error.message}`
    );
  }

  return data as Permission;
}