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
   * This is navigation context only, not authorization.
   */

  const enteredFromAdministration =
    searchParams.get("from") === "admin";

  /*
   * ---------------------------------------------------------
   * Organization Context
   * ---------------------------------------------------------
   *
   * Organization-specific navigation must preserve an
   * explicitly supplied organization ID.
   */

  const organizationId =
    searchParams.get("organizationId")?.trim() ?? "";

  const hasOrganizationContext =
    organizationId.length > 0;

  /*
   * ---------------------------------------------------------
   * Navigation Destinations
   * ---------------------------------------------------------
   *
   * Do not fall back to an organization or administration
   * URL that silently drops the current organization ID.
   */

  const organizationOverviewHref =
    hasOrganizationContext
      ? `/organization?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/organization?error=missing_organization_id";

  const administrationHref =
    hasOrganizationContext
      ? `/admin?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/admin?error=missing_organization_id";

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
                    aria-disabled={!hasOrganizationContext}
                    onClick={(event) => {
                      if (!hasOrganizationContext) {
                        event.preventDefault();
                      }
                    }}
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
                  aria-disabled={!hasOrganizationContext}
                  onClick={(event) => {
                    if (!hasOrganizationContext) {
                      event.preventDefault();
                    }
                  }}
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
                aria-disabled={!hasOrganizationContext}
                onClick={(event) => {
                  if (!hasOrganizationContext) {
                    event.preventDefault();
                  }
                }}
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