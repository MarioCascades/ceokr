import {
  redirect,
} from "next/navigation";

import {
  getCurrentServerUser,
} from "@/lib/auth/currentserveruser";

import {
  requirePlatformSuperAdmin,
} from "@/lib/auth/authorization";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import SuperAdminLaunchpad from "@/components/platform/superadminlaunchpad";


export const dynamic =
  "force-dynamic";


export default async function SuperAdminPage() {

  await requirePlatformSuperAdmin();


  const user =
    await getCurrentServerUser();


  if (!user) {
    redirect("/login");
  }


  const supabase =
    await createSupabaseServerClient();


  /* ========================================================
     Organizations
     ======================================================== */

  const {
    data: organizations,
    error: organizationsError,
  } =
    await supabase
      .from("organization")
      .select(
        "id, company_name"
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (organizationsError) {

    throw new Error(
      `Failed to load organizations: ${organizationsError.message}`
    );
  }


  /* ========================================================
     Display Name
     ======================================================== */

  const displayName =
    user.display_name?.trim() ||
    `${user.first_name} ${user.last_name}`.trim() ||
    user.email;


  /* ========================================================
     Launchpad
     ======================================================== */

  return (
    <SuperAdminLaunchpad

      displayName={
        displayName
      }

      organizations={
        organizations ?? []
      }

    />
  );
}