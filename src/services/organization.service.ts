import { supabase } from "@/lib/supabase/client";

import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/lib/types/organization";

/* ==========================================================
   Get Organization
========================================================== */

export async function getOrganization(organizationId?: string): Promise<
  Organization | null
> {
  let query = supabase
    .from("organization")
    .select("*");

  if (organizationId) {
    query = query.eq("id", organizationId);
  } else {
    query = query
      .order("created_at", {
        ascending: true,
      })
      .limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error(
      "Error loading organization:",
      error
    );

    throw new Error(
      `Failed to load organization: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as Organization;
}


/* ==========================================================
   List Organizations
========================================================== */

export async function listOrganizations(): Promise<
  Organization[]
> {
  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading organizations:",
      error
    );

    throw new Error(
      `Failed to load organizations: ${error.message}`
    );
  }

  return (data ?? []) as Organization[];
}

/* ==========================================================
   Delete Organization
========================================================== */

export async function deleteOrganization(
  organizationId: string
): Promise<void> {
  const { count: membershipCount, error: membershipError } =
    await supabase
      .from("organization_memberships")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("organization_id", organizationId);

  if (membershipError) {
    console.error(
      "Error checking organization memberships:",
      membershipError
    );

    throw new Error(
      `Failed to verify organization memberships: ${membershipError.message}`
    );
  }

  if ((membershipCount ?? 0) > 0) {
    throw new Error(
      `Organization cannot be deleted because it has ${membershipCount} organization membership${
        membershipCount === 1 ? "" : "s"
      }. Remove the memberships before deleting the organization.`
    );
  }

  const { count: teamCount, error: teamError } =
    await supabase
      .from("teams")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("organization_id", organizationId);

  if (teamError) {
    console.error(
      "Error checking organization teams:",
      teamError
    );

    throw new Error(
      `Failed to verify organization teams: ${teamError.message}`
    );
  }

  if ((teamCount ?? 0) > 0) {
    throw new Error(
      `Organization cannot be deleted because it has ${teamCount} team${
        teamCount === 1 ? "" : "s"
      }. Remove the teams before deleting the organization.`
    );
  }

  const { error } = await supabase
    .from("organization")
    .delete()
    .eq("id", organizationId);

  if (error) {
    console.error(
      "Error deleting organization:",
      error
    );

    throw new Error(
      `Failed to delete organization: ${error.message}`
    );
  }
}

/* ==========================================================
   Create Organization
========================================================== */

export async function createOrganization(
  input: CreateOrganizationInput
): Promise<Organization> {
  const { data, error } = await supabase
    .from("organization")
    .insert({
      company_name: input.company_name,

      logo_url: input.logo_url ?? null,

      primary_color:
        input.primary_color ?? null,

      secondary_color:
        input.secondary_color ?? null,

      timezone:
        input.timezone ?? "UTC",

      reporting_frequency:
        input.reporting_frequency ?? "monthly",

      setup_completed:
        input.setup_completed ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Error creating organization:",
      error
    );

    throw new Error(
      `Failed to create organization: ${error.message}`
    );
  }

  return data as Organization;
}

/* ==========================================================
   Update Organization
========================================================== */

export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput
): Promise<Organization> {
  const { data, error } = await supabase
    .from("organization")
    .update(input)
    .eq("id", organizationId)
    .select()
    .single();

  if (error) {
    console.error(
      "Error updating organization:",
      error
    );

    throw new Error(
      `Failed to update organization: ${error.message}`
    );
  }

  return data as Organization;
}

/* ==========================================================
   Complete Organization Setup
========================================================== */

export async function completeOrganizationSetup(
  organizationId: string
): Promise<Organization> {
  return updateOrganization(
    organizationId,
    {
      setup_completed: true,
    }
  );
}