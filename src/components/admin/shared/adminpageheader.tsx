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

export default function AdminPageHeader(
  props: AdminPageHeaderProps
) {
  return (
    <Suspense
      fallback={
        <div className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {props.title}
              </h1>

              {props.description && (
                <p className="mt-2 text-muted-foreground">
                  {props.description}
                </p>
              )}
            </div>
          </div>
        </div>
      }
    >
      <AdminPageHeaderContent {...props} />
    </Suspense>
  );
}

function AdminPageHeaderContent({
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

              <Link
                href={administrationHref}
                className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
              >
                Back to Administration
              </Link>
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