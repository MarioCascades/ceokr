import { supabase } from "@/lib/supabase/client";

import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
} from "@/lib/types/domain/team";

/* ==========================================================
   Get Teams
========================================================== */

export async function getTeams(
  organizationId: string
): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading teams:",
      error
    );

    throw new Error(
      `Failed to load teams: ${error.message}`
    );
  }

  return (data ?? []) as Team[];
}

/* ==========================================================
   Get Team
========================================================== */

export async function getTeam(
  teamId: string,
  organizationId: string
): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading team:",
      error
    );

    throw new Error(
      `Failed to load team: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Team;
}

/* ==========================================================
   Create Team
========================================================== */

export async function createTeam(
  input: CreateTeamInput
): Promise<Team> {
  const name = input.name.trim();

  if (!name) {
    throw new Error(
      "Team name is required."
    );
  }

  if (!input.department_id) {
    throw new Error(
      "Department is required."
    );
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({
      organization_id:
        input.organization_id,

      department_id:
        input.department_id,

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
      "Error creating team:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A team with this name already exists in this department."
      );
    }

    if (error.code === "23503") {
      throw new Error(
        "The selected department does not belong to this organization."
      );
    }

    throw new Error(
      `Failed to create team: ${error.message}`
    );
  }

  return data as Team;
}

/* ==========================================================
   Update Team
========================================================== */

export async function updateTeam(
  teamId: string,
  organizationId: string,
  input: UpdateTeamInput
): Promise<Team> {
  const updateData: UpdateTeamInput = {
    ...input,
  };

  if (updateData.name !== undefined) {
    const name = updateData.name.trim();

    if (!name) {
      throw new Error(
        "Team name is required."
      );
    }

    updateData.name = name;
  }

  if (updateData.department_id !== undefined) {
    if (!updateData.department_id) {
      throw new Error(
        "Department is required."
      );
    }
  }

  if (updateData.description !== undefined) {
    updateData.description =
      updateData.description?.trim() || null;
  }

  const { data, error } = await supabase
    .from("teams")
    .update(updateData)
    .eq("id", teamId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating team:",
      error
    );

    if (error.code === "23505") {
      throw new Error(
        "A team with this name already exists in this department."
      );
    }

    if (error.code === "23503") {
      throw new Error(
        "The selected department does not belong to this organization."
      );
    }

    throw new Error(
      `Failed to update team: ${error.message}`
    );
  }

  return data as Team;
}

/* ==========================================================
   Delete Team
========================================================== */

export async function deleteTeam(
  teamId: string,
  organizationId: string
): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("organization_id", organizationId);

  if (error) {
    console.error(
      "Error deleting team:",
      error
    );

    throw new Error(
      `Failed to delete team: ${error.message}`
    );
  }
}