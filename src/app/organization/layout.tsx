"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <Suspense fallback={<OrganizationShellFallback />}>
          <OrganizationShell>
            {children}
          </OrganizationShell>
        </Suspense>
      </div>
    </main>
  );
}

/* ==========================================================
   Organization Workspace Shell
========================================================== */

function OrganizationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();

  const organizationId =
    searchParams.get("organizationId");

  function organizationHref(path: string) {
    if (!organizationId) {
      return path;
    }

    return `${path}?organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }

  return (
    <>
      {/* ==================================================
          Sidebar
      ================================================== */}

      <aside className="w-60 shrink-0 border-r bg-white">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight">
            Organization Workspace
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Organization management
          </p>
        </div>

        <nav className="px-3 py-5">

          {/* ==================================================
              Overview
          ================================================== */}

          <OrganizationNavLink
            href={organizationHref(
              "/organization"
            )}
            label="Overview"
          />

          {/* ==================================================
              Organization
          ================================================== */}

          <OrganizationNavSection
            title="Organization"
          />

          <OrganizationNavLink
            href={organizationHref(
              "/organization/organization"
            )}
            label="Organization"
          />

          <OrganizationNavLink
            href={organizationHref(
              "/organization/setup"
            )}
            label="Setup"
          />

          {/* ==================================================
              Performance
          ================================================== */}

          <OrganizationNavSection
            title="Performance"
          />

          <OrganizationNavLink
            href={organizationHref(
              "/organization/performancesheets"
            )}
            label="Performance Sheets"
          />

          <OrganizationNavItem
            label="Assignments"
            comingSoon
          />

          {/* ==================================================
              People & Structure
          ================================================== */}

          <OrganizationNavSection
            title="People & Structure"
          />

          <OrganizationNavLink
            href={organizationHref(
              "/organization/departments"
            )}
            label="Departments"
          />

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
            label="Users"
          />

          <OrganizationNavLink
            href={organizationHref(
              "/organization/roles"
            )}
            label="Roles & Permissions"
          />

          {/* ==================================================
              Analytics
          ================================================== */}

          <OrganizationNavSection
            title="Analytics"
          />

          <OrganizationNavItem
            label="Dashboards"
            comingSoon
          />

          <OrganizationNavItem
            label="Reports"
            comingSoon
          />

          {/* ==================================================
              Configuration
          ================================================== */}

          <OrganizationNavSection
            title="Configuration"
          />

          <OrganizationNavItem
            label="Settings"
            comingSoon
          />

          <OrganizationNavItem
            label="AI"
            comingSoon
          />

        </nav>
      </aside>

      {/* ====================================================
          Main Content
      ==================================================== */}

      <section className="min-w-0 flex-1 bg-gray-50 p-8 lg:p-10">
        {children}
      </section>
    </>
  );
}

/* ==========================================================
   Navigation Link
========================================================== */

function OrganizationNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="mb-1 block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
    >
      {label}
    </Link>
  );
}

/* ==========================================================
   Navigation Section
========================================================== */

function OrganizationNavSection({
  title,
}: {
  title: string;
}) {
  return (
    <div className="px-3 pb-2 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

/* ==========================================================
   Coming Soon Navigation Item
========================================================== */

function OrganizationNavItem({
  label,
  comingSoon = false,
}: {
  label: string;
  comingSoon?: boolean;
}) {
  return (
    <div
      className="mb-1 flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
      aria-disabled="true"
    >
      <span>{label}</span>

      {comingSoon && (
        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-400">
          Soon
        </span>
      )}
    </div>
  );
}

/* ==========================================================
   Loading Fallback
========================================================== */

function OrganizationShellFallback() {
  return (
    <>
      <aside className="w-60 shrink-0 border-r bg-white">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight">
            Organization Workspace
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Organization management
          </p>
        </div>

        <nav className="px-3 py-5">
          <div className="h-8 rounded-md bg-gray-100" />

          <div className="mt-6 h-4 w-24 rounded bg-gray-100" />

          <div className="mt-3 h-8 rounded-md bg-gray-100" />

          <div className="mt-1 h-8 rounded-md bg-gray-100" />
        </nav>
      </aside>

      <section className="min-w-0 flex-1 bg-gray-50 p-8 lg:p-10">
        <div className="h-8 w-64 rounded bg-white" />
      </section>
    </>
  );
}