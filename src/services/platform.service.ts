import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
  getCurrentServerUser,
} from "@/lib/auth/currentserveruser";


export type PlatformRole =
  | "super_admin";


export async function getCurrentPlatformRole(): Promise<
  PlatformRole | null
> {

  const user =
    await getCurrentServerUser();


  if (
    !user ||
    !user.is_active
  ) {
    return null;
  }


  const supabase =
    await createSupabaseServerClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("platform_memberships")
      .select(
        "platform_role"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "is_active",
        true
      )
      .eq(
        "platform_role",
        "super_admin"
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Error loading platform role:",
      error
    );

    throw new Error(
      `Failed to load platform role: ${error.message}`
    );
  }


  if (
    data?.platform_role ===
    "super_admin"
  ) {
    return "super_admin";
  }


  return null;
}