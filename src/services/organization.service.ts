import { supabase } from "@/lib/supabase/client";

import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/lib/types/organization";

/* ==========================================================
   Get Organization
========================================================== */

export async function getOrganization(): Promise<
  Organization | null
> {
  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

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