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
     Display Name
  ======================================================== */

  const displayName =
    entryContext.user.display_name?.trim() ||
    `${entryContext.user.first_name} ${entryContext.user.last_name}`.trim() ||
    entryContext.user.email;


  /* ========================================================
     Organization Admin / Member Launchpad
  ======================================================== */

  return (
    <RoleEntryLaunchpad

      actor={
        entryContext.actor ===
        "organization_admin"
          ? "organization_admin"
          : "member"
      }

      displayName={
        displayName
      }

      organizationId={
        entryContext.organizationId
      }

      organizationName={
        entryContext.organizationName
      }

      userId={
        entryContext.user.id
      }

    />
  );

}