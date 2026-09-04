"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import AdminOrganizationSelector from "@/components/admin/shared/adminorganizationselector";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  showOrganizationSelector?: boolean;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
  showOrganizationSelector = true,
}: AdminPageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * ---------------------------------------------------------
   * Workspace Context
   * ---------------------------------------------------------
   *
   * /admin/*
   *   Super Admin administration workspace
   *
   * /organization/*
   *   Organization workspace
   */

  const isOrganizationWorkspace =
    pathname?.startsWith("/organization") ?? false;

  /*
   * ---------------------------------------------------------
   * Navigation Context
   * ---------------------------------------------------------
   *
   * from=admin indicates that the Organization Workspace
   * was entered from the Super Admin administration context.
   *
   * IMPORTANT:
   *
   * This is navigation context only.
   *
   * It is NOT an authorization mechanism.
   *
   * Authentication and authorization will eventually be
   * enforced by the platform security model and RLS.
   */

  const enteredFromAdministration =
    searchParams.get("from") === "admin";

  /*
   * ---------------------------------------------------------
   * Organization Context
   * ---------------------------------------------------------
   *
   * Organization context is preserved through the query
   * string while authentication/RLS is not yet implemented.
   */

  const organizationId =
    searchParams.get("organizationId");

  /*
   * ---------------------------------------------------------
   * Organization Overview
   * ---------------------------------------------------------
   *
   * Intentionally removes from=admin.
   *
   * Once the user returns to the Organization Workspace
   * overview, they are inside the normal organization
   * workspace context.
   */

  const organizationOverviewHref =
    organizationId
      ? `/organization?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/organization";

  /*
   * ---------------------------------------------------------
   * Administration
   * ---------------------------------------------------------
   *
   * Preserve organization context when returning to the
   * Super Admin administration workspace.
   */

  const administrationHref =
    organizationId
      ? `/admin?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/admin";

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        {/* ===================================================
            Page Title
        =================================================== */}

        <div>
          <h1 className="text-3xl font-semibold">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* ===================================================
            Header Controls
        =================================================== */}

        <div className="flex flex-wrap items-end justify-end gap-3">

          {/* =================================================
              Super Admin Organization Selector
          =================================================

          The platform organization selector belongs to the
          Super Admin workspace.

          It must NOT appear inside the Organization Workspace.
          ================================================= */}

          {showOrganizationSelector &&
            !isOrganizationWorkspace && (
              <Suspense
                fallback={
                  <div className="min-w-[220px] rounded-md border px-3 py-2 text-sm text-muted-foreground">
                    Loading organization…
                  </div>
                }
              >
                <AdminOrganizationSelector />
              </Suspense>
            )}

          {/* =================================================
              Navigation + Page Actions
          ================================================= */}

          <div className="flex flex-wrap items-center gap-3">

            {/* ===============================================
                Organization Workspace
            =============================================== */}

            {isOrganizationWorkspace ? (
              <>
                {/* =============================================
                    Super Admin Return Path

                    Only shown when the workspace was explicitly
                    entered from the administration context.
                ============================================= */}

                {enteredFromAdministration && (
                  <Link
                    href={administrationHref}
                    className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
                  >
                    Back to Administration
                  </Link>
                )}

                {/* =============================================
                    Organization Workspace Overview
                ============================================= */}

                <Link
                  href={organizationOverviewHref}
                  className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
                >
                  Back to Overview
                </Link>
              </>
            ) : (
              /* ===============================================
                 Super Admin Administration Workspace
              =============================================== */

              <AdminBackToAdministration />
            )}

            {/* =================================================
                Page-Specific Actions
            ================================================= */}

            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Super Admin
   Back to Administration
============================================================ */

function AdminBackToAdministration() {
  const searchParams = useSearchParams();

  const organizationId =
    searchParams.get("organizationId");

  const href = organizationId
    ? `/admin?organizationId=${encodeURIComponent(
        organizationId
      )}`
    : "/admin";

  return (
    <Link
      href={href}
      className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
    >
      Back to Administration
    </Link>
  );
}
