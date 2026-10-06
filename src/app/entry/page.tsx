import {
  redirect,
} from "next/navigation";

import {
  getCurrentEntryContext,
} from "@/lib/auth/currententry";

import RoleEntryLaunchpad from "@/components/auth/roleentrylaunchpad";


export const dynamic =
  "force-dynamic";


export default async function EntryPage() {

  /* ========================================================
     Resolve Entry Context
  ======================================================== */

  const entryContext =
    await getCurrentEntryContext();


  if (!entryContext) {

    redirect(
      "/login?error=account_not_configured"
    );

  }


  /* ========================================================
     Platform Super Admin
  ======================================================== */

  if (
    entryContext.actor ===
    "super_admin"
  ) {

    redirect(
      "/superadmin"
    );

  }


  /* ========================================================
     Organization Context
  ======================================================== */

  if (
    !entryContext.organizationId ||
    !entryContext.organizationName
  ) {

    redirect(
      "/login?error=account_not_configured"
    );

  }


  /* ========================================================
     Member
     --------------------------------------------------------
     Members go directly to their Organization Performance
     experience. There is no Member launchpad.
  ======================================================== */

  if (
    entryContext.actor ===
    "member"
  ) {

    redirect(
      `/runtime?organizationId=${encodeURIComponent(
        entryContext.organizationId
      )}`
    );

  }


  /* ========================================================
     Display Name
     ======================================================== */

  const displayName =
    entryContext.user.display_name?.trim() ||
    `${entryContext.user.first_name} ${entryContext.user.last_name}`.trim() ||
    entryContext.user.email;


  /* ========================================================
     Organization Admin Launchpad
  ======================================================== */

  return (
    <RoleEntryLaunchpad

      displayName={
        displayName
      }

      organizationId={
        entryContext.organizationId
      }

      organizationName={
        entryContext.organizationName
      }

    />
  );

}