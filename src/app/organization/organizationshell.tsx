"use client";

import Link from "next/link";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import type { ReactNode } from "react";

import {
  useOrganizationFeatures,
} from "@/lib/organization/useorganizationfeatures";


type OrganizationShellProps = {
  children: ReactNode;
};


type OrganizationNavLinkProps = {
  href: string;
  label: string;
};


function OrganizationNavLink({
  href,
  label,
}: OrganizationNavLinkProps) {

  const pathname =
    usePathname();


  const isActive =
    pathname === href.split("?")[0];


  return (
    <Link
      href={href}
      className={[
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}


function OrganizationNavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {

  return (
    <div className="space-y-1">

      <div
        className="
          px-3
          pb-1
          pt-4
          text-[11px]
          font-semibold
          uppercase
          tracking-wider
          text-muted-foreground
        "
      >
        {title}
      </div>


      <div className="space-y-1">
        {children}
      </div>

    </div>
  );
}


export default function OrganizationShell({
  children,
}: OrganizationShellProps) {

  const searchParams =
    useSearchParams();


  const organizationId =
    searchParams.get("organizationId");


  const {
    isEnabled,
  } =
    useOrganizationFeatures();


  const departmentsEnabled =
    isEnabled(
      "departments"
    );


  /*
   * Organization Admin navigation always
   * preserves the current organization context.
   *
   * Authorization is intentionally deferred
   * until the authentication/RLS milestone.
   */

  function organizationHref(
    path: string
  ) {

    if (!organizationId) {
      return path;
    }


    const separator =
      path.includes("?")
        ? "&"
        : "?";


    return `${path}${separator}organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }


  /*
   * ==========================================================
   * Organization Runtime
   * ==========================================================
   *
   * This enters the existing shared Runtime at the
   * organization level.
   *
   * No new Runtime implementation is created here.
   */

  const performanceWorkspaceHref =
    organizationHref("/runtime");


  return (
    <div
      className="
        min-h-screen
        bg-background
      "
    >

      {/* ==================================================
          Sidebar
      ================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-30
          hidden
          w-64
          border-r
          border-border
          bg-card
          lg:flex
          lg:flex-col
        "
      >

        {/* ==================================================
            Brand
        ================================================== */}

        <div
          className="
            border-b
            border-border
            px-5
            py-5
          "
        >

          <Link
            href={organizationHref("/organization")}
            className="block"
          >

            <div
              className="
                text-lg
                font-semibold
                text-foreground
              "
            >
              CascadEffects
            </div>


            <div
              className="
                mt-0.5
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              Organization Admin
            </div>

          </Link>

        </div>


        {/* ==================================================
            Navigation
        ================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            pb-6
          "
        >

          {/* ==================================================
              Overview
          ================================================== */}

          <div className="pt-4">

            <OrganizationNavLink
              href={organizationHref(
                "/organization"
              )}
              label="Overview"
            />

          </div>


          {/* ==================================================
              Organization
          ================================================== */}

          <OrganizationNavSection
            title="Organization"
          >

            <OrganizationNavLink
              href={organizationHref(
                "/organization/organization"
              )}
              label="Organization"
            />

            {departmentsEnabled && (
              <OrganizationNavLink
                href={organizationHref(
                  "/organization/departments"
                )}
                label="Departments"
              />
            )}

            <OrganizationNavLink
              href={organizationHref(
                "/organization/teams"
              )}
              label="Teams"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/users"
              )}
              label="Users / Members"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/roles"
              )}
              label="Roles & Permissions"
            />

          </OrganizationNavSection>


          {/* ==================================================
              Performance
          ================================================== */}

          <OrganizationNavSection
            title="Performance"
          >

            <OrganizationNavLink
              href={performanceWorkspaceHref}
              label="Performance Workspace"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/performancesheets"
              )}
              label="Performance Sheets"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/assignments"
              )}
              label="Assignments"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/objectives"
              )}
              label="Objectives"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/keyresults"
              )}
              label="Key Results"
            />

          </OrganizationNavSection>


          {/* ==================================================
              Analytics
          ================================================== */}

          <OrganizationNavSection
            title="Analytics"
          >

            <OrganizationNavLink
              href={organizationHref(
                "/organization/dashboards"
              )}
              label="Dashboards"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/reports"
              )}
              label="Reports"
            />

          </OrganizationNavSection>


          {/* ==================================================
              Configuration
          ================================================== */}

          <OrganizationNavSection
            title="Configuration"
          >

            <OrganizationNavLink
              href={organizationHref(
                "/organization/settings"
              )}
              label="Settings"
            />

            <OrganizationNavLink
              href={organizationHref(
                "/organization/ai"
              )}
              label="AI Configuration"
            />

          </OrganizationNavSection>

        </nav>


        {/* ==================================================
            Footer
        ================================================== */}

        <div
          className="
            border-t
            border-border
            px-5
            py-4
          "
        >

          <div
            className="
              text-xs
              text-muted-foreground
            "
          >
            Organization-scoped workspace
          </div>

        </div>

      </aside>


      {/* ==================================================
          Main Content
      ================================================== */}

      <div className="lg:pl-64">

        {/* ==================================================
            Mobile Header
        ================================================== */}

        <header
          className="
            border-b
            border-border
            bg-card
            px-5
            py-4
            lg:hidden
          "
        >

          <Link
            href={organizationHref(
              "/organization"
            )}
            className="block"
          >

            <div
              className="
                text-lg
                font-semibold
                text-foreground
              "
            >
              CascadEffects
            </div>


            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              Organization Admin
            </div>

          </Link>

        </header>


        {/* ==================================================
            Page
        ================================================== */}

        <div className="min-h-screen">
          {children}
        </div>

      </div>

    </div>
  );
}