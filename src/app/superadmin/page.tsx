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
     Current User Organization Memberships
     ========================================================
     
     A Platform Super Admin may administer every organization
     without being a member of those organizations.

     This query identifies only the organizations where the
     authenticated Super Admin also has an actual organization
     membership.

     No organization or user is hardcoded here.
     ======================================================== */

  const {
    data: memberships,
    error: membershipsError,
  } =
    await supabase
      .from("organization_memberships")
      .select(
        "organization_id"
      )
      .eq(
        "user_id",
        user.id
      );


  if (membershipsError) {

    throw new Error(
      `Failed to load organization memberships: ${membershipsError.message}`
    );
  }


  const memberOrganizationIds =
    (memberships ?? []).map(
      (membership) =>
        membership.organization_id
    );


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

      memberOrganizationIds={
        memberOrganizationIds
      }

      userId={
        user.id
      }

    />
  );
}