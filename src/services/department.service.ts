import { supabase } from "@/lib/supabase/client";

import type {
  Department,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/lib/types/domain/department";

/* ==========================================================
   Get Departments
========================================================== */

export async function getDepartments(
  organizationId: string
): Promise<Department[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading departments:",
      error
    );

    throw new Error(
      `Failed to load departments: ${error.message}`
    );
  }

  return (data ?? []) as Department[];
}

/* ==========================================================
   Get Department
========================================================== */

export async function getDepartment(
  departmentId: string,
  organizationId: string
): Promise<Department | null> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", departmentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading department:",
      error
    );

    throw new Error(
      `Failed to load department: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Department;
}

/* ==========================================================
   Create Department
========================================================== */

export async function createDepartment(
  input: CreateDepartmentInput
): Promise<Department> {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Department name is required."
    );
  }

  const { data, error } = await supabase
    .from("departments")
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
      "Error creating department:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A department with this name already exists."
      );
    }

    throw new Error(
      `Failed to create department: ${error.message}`
    );
  }

  return data as Department;
}

/* ==========================================================
   Update Department
========================================================== */

export async function updateDepartment(
  departmentId: string,
  organizationId: string,
  input: UpdateDepartmentInput
): Promise<Department> {
  const updateData: UpdateDepartmentInput = {
    ...input,
  };

  if (updateData.name !== undefined) {
    const name = updateData.name.trim();

    if (!name) {
      throw new Error(
        "Department name is required."
      );
    }

    updateData.name = name;
  }

  if (updateData.description !== undefined) {
    updateData.description =
      updateData.description?.trim() || null;
  }

  const { data, error } = await supabase
    .from("departments")
    .update(updateData)
    .eq("id", departmentId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating department:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A department with this name already exists."
      );
    }

    throw new Error(
      `Failed to update department: ${error.message}`
    );
  }

  return data as Department;
}

/* ==========================================================
   Delete Department
========================================================== */

export async function deleteDepartment(
  departmentId: string,
  organizationId: string
): Promise<void> {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", departmentId)
    .eq("organization_id", organizationId);

  if (error) {
    console.error(
      "Error deleting department:",
      error
    );

    throw new Error(
      `Failed to delete department: ${error.message}`
    );
  }
}