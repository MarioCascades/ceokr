import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">

        {/* ==================================================
            Administration Sidebar
        ================================================== */}

        <aside className="w-60 shrink-0 border-r bg-white">

          {/* Sidebar Header */}

          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-bold tracking-tight">
              Administration
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Platform management
            </p>
          </div>

          {/* Navigation */}

          <nav className="px-3 py-5">

            {/* Organization */}

            <AdminNavLink
              href="/admin/organization"
              label="Organization"
            />

            <AdminNavLink
              href="/admin/departments"
              label="Departments"
            />

            <AdminNavLink
              href="/admin/teams"
              label="Teams"
            />

            <AdminNavLink
              href="/admin/users"
              label="Users"
            />

            <AdminNavLink
              href="/admin/roles"
              label="Roles & Permissions"
            />

            {/* Performance */}

            <div className="mb-2 mt-7 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Performance
              </p>
            </div>

            <AdminNavLink
              href="/admin/performancesheets"
              label="Performance Sheets"
            />

            <AdminNavLink
              href="/admin/assignments"
              label="Assignments"
            />

            <AdminNavLink
              href="/admin/objectives"
              label="Objectives"
            />

            <AdminNavLink
              href="/admin/key-results"
              label="Key Results"
            />

            <AdminNavLink
              href="/admin/initiatives"
              label="Initiatives"
            />

            {/* Analytics */}

            <div className="mb-2 mt-7 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Analytics
              </p>
            </div>

            <AdminNavLink
              href="/admin/dashboards"
              label="Dashboards"
            />

            <AdminNavLink
              href="/admin/reports"
              label="Reports"
            />

            {/* Platform */}

            <div className="mb-2 mt-7 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Platform
              </p>
            </div>

            <AdminNavLink
              href="/admin/settings"
              label="Settings"
            />

          </nav>

        </aside>

        {/* ==================================================
            Administration Content
        ================================================== */}

        <section className="min-w-0 flex-1 bg-gray-50 p-8 lg:p-10">
          {children}
        </section>

      </div>
    </main>
  );
}

/* ==========================================================
   Administration Navigation Link
========================================================== */

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
      className="
        mb-1
        block
        rounded-md
        px-3
        py-2
        text-sm
        font-medium
        text-gray-700
        transition-colors
        hover:bg-gray-100
        hover:text-gray-950
      "
    >
      {label}
    </Link>
  );
}