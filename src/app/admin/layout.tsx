"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <Suspense fallback={<AdminShellFallback />}>
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </div>
    </main>
  );
}

function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");

  function adminHref(path: string) {
    if (!organizationId) return path;

    return `${path}?organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }

  return (
    <>
      <aside className="w-60 shrink-0 border-r bg-white">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight">
            Administration
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Platform management
          </p>
        </div>

        <nav className="px-3 py-5">
          <AdminNavLink
            href={adminHref("/admin")}
            label="Overview"
          />

          <AdminNavSection title="Organization" />

          <AdminNavLink
            href={adminHref("/admin/organization")}
            label="Organization"
          />

          <AdminNavLink
            href={adminHref("/admin/departments")}
            label="Departments"
          />

          <AdminNavLink
            href={adminHref("/admin/teams")}
            label="Teams"
          />

          <AdminNavLink
            href={adminHref("/admin/users")}
            label="Users"
          />

          <AdminNavLink
            href={adminHref("/admin/roles")}
            label="Roles & Permissions"
          />

          <AdminNavSection title="Performance" />

          <AdminNavLink
            href={adminHref("/admin/performancesheets")}
            label="Performance Sheets"
          />

          <AdminNavLink
            href={adminHref("/admin/assignments")}
            label="Assignments"
          />

          <AdminNavLink
            href={adminHref("/admin/objectives")}
            label="Objectives"
          />

          <AdminNavLink
            href={adminHref("/admin/keyresults")}
            label="Key Results"
          />

          <AdminNavLink
            href={adminHref("/admin/initiatives")}
            label="Initiatives"
          />

          <AdminNavSection title="Analytics" />

          <AdminNavLink
            href={adminHref("/admin/dashboards")}
            label="Dashboards"
          />

          <AdminNavLink
            href={adminHref("/admin/reports")}
            label="Reports"
          />

          <AdminNavSection title="Platform" />

          <AdminNavLink
            href={adminHref("/admin/settings")}
            label="Settings"
          />

          <AdminNavLink
            href={adminHref("/admin/ai")}
            label="AI Configuration"
          />
        </nav>
      </aside>

      <section className="min-w-0 flex-1 bg-gray-50 p-8 lg:p-10">
        {children}
      </section>
    </>
  );
}

function AdminShellFallback() {
  return (
    <>
      <aside className="w-60 shrink-0 border-r bg-white">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight">
            Administration
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Platform management
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 bg-gray-50 p-8 lg:p-10" />
    </>
  );
}

function AdminNavSection({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-2 mt-7 px-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="mb-1 block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950"
    >
      {label}
    </Link>
  );
}