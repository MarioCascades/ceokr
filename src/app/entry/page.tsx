
import { redirect } from "next/navigation";

import {
  getCurrentEntryContext,
} from "@/lib/auth/currententry";

import { getOrganization } from "@/services/organization.service";

import RoleEntryLaunchpad from "@/components/auth/roleentrylaunchpad";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  /* ========================================================
     Resolve Entry Context
  ======================================================== */

  let entryContext;

  try {
    entryContext = await getCurrentEntryContext();
  } catch (error) {
    console.error("Failed to resolve entry context:", error);

    redirect("/login?error=account_not_configured");
  }

  if (!entryContext) {
    redirect("/login?error=account_not_configured");
  }

  /* ========================================================
     Platform Super Admin
  ======================================================== */

  if (entryContext.actor === "super_admin") {
    redirect("/superadmin");
  }

  /* ========================================================
     Organization Context
  ======================================================== */

  const organizationId = entryContext.organizationId?.trim();
  const organizationName = entryContext.organizationName?.trim();

  if (!organizationId || !organizationName) {
    redirect("/login?error=account_not_configured");
  }

  /* ========================================================
     Validate Explicit Organization
     --------------------------------------------------------
     Never substitute a default organization when the supplied
     organization ID is missing, invalid, or unavailable.
  ======================================================== */

  let organization;

  try {
    organization = await getOrganization(organizationId);
  } catch (error) {
    console.error("Failed to validate entry organization:", error);

    redirect("/login?error=organization_unavailable");
  }

  if (!organization || organization.id !== organizationId) {
    redirect("/login?error=organization_unavailable");
  }

  /* ========================================================
     Member
     --------------------------------------------------------
     Members go directly to their Organization Performance
     experience. There is no Member launchpad.
  ======================================================== */

  if (entryContext.actor === "member") {
    redirect(
      `/runtime?organizationId=${encodeURIComponent(organizationId)}`
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
      displayName={displayName}
      organizationId={organizationId}
      organizationName={organization.company_name}
    />
  );
}
