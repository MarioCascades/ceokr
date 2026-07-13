import { supabase } from "@/lib/supabase/client";
import { Organization } from "@/lib/types/organization";

export async function getOrganization(): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error loading organization:", error);
    return null;
  }

  return data as Organization;
}