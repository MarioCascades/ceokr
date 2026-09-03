import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getOrganization } from "@/services/organization.service";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    organizationId?: string;
  }>;
}) {
  const params = await searchParams;
  const organizationId = params.organizationId;

  const organization = organizationId
    ? await getOrganization(organizationId)
    : null;

  function adminHref(path: string) {
    if (!organizationId) return path;

    return `${path}?organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ==================================================
            Page Header
        ================================================== */}

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">
            Administration
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Configure and manage every aspect of your CascadEffects
            Performance Platform.
          </p>
        </div>

        {/* ==================================================
            Current Organization Context
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Currently administering
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl">
                  🏢
                </span>

                <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                  {organization?.company_name ??
                    "No organization selected"}
                </h2>
              </div>

              {!organization && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Select an organization before managing organization-specific resources.
                </p>
              )}
            </div>

            {organizationId && organization && (
              <div className="rounded-md border bg-gray-50 px-4 py-2 text-xs text-muted-foreground">
                Organization context active
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            Organization
        ================================================== */}

        <AdminSection
          title="Organization"
          description="Manage your organization, people, structure and access."
        >
          <AdminCard
            title="🏢 Organization"
            description="Manage organization profile, branding and configuration."
            href={adminHref("/admin/organization")}
          />

          <AdminCard
            title="🏛 Departments"
            description="Create, edit and manage departments."
            href={adminHref("/admin/departments")}
          />

          <AdminCard
            title="👥 Teams"
            description="Create and organize teams."
            href={adminHref("/admin/teams")}
          />

          <AdminCard
            title="👤 Users"
            description="Invite and manage users."
            href={adminHref("/admin/users")}
          />

          <AdminCard
            title="🔐 Roles & Permissions"
            description="Control security and user access."
            href={adminHref("/admin/roles")}
          />
        </AdminSection>

        {/* ==================================================
            Performance
        ================================================== */}

        <AdminSection
          title="Performance"
          description="Define, assign and manage organizational performance."
        >
          <AdminCard
            title="🧩 Performance Sheets"
            description="Manage Performance Sheet definitions, versions and Builder access."
            href={adminHref("/admin/performancesheets")}
          />

          <AdminCard
            title="📋 Assignments"
            description="Assign published Performance Sheets to users, teams, departments or the organization."
            href={adminHref("/admin/assignments")}
          />

          <AdminCard
            title="🎯 Objectives"
            description="View objectives defined within your Performance Sheets."
            href={adminHref("/admin/objectives")}
          />

          <AdminCard
            title="📈 Key Results"
            description="View measurable outcomes defined within your Performance Sheets."
            href={adminHref("/admin/keyresults")}
          />

          <AdminCard
            title="🚀 Initiatives"
            description="View initiatives defined within your Performance Sheets."
            href={adminHref("/admin/initiatives")}
          />
        </AdminSection>

        {/* ==================================================
            Analytics
        ================================================== */}

        <AdminSection
          title="Analytics"
          description="Understand organizational performance through dashboards and reports."
        >
          <AdminCard
            title="📊 Dashboards"
            description="Configure dashboards and widgets."
            href={adminHref("/admin/dashboards")}
          />

          <AdminCard
            title="📑 Reports"
            description="Generate and manage reports."
            href={adminHref("/admin/reports")}
          />
        </AdminSection>

        {/* ==================================================
            Configuration
        ================================================== */}

        <AdminSection
          title="Configuration"
          description="Configure organization-level capabilities and services."
        >
          <AdminCard
            title="⚙️ Settings"
            description="Organization-level configuration."
            href={adminHref("/admin/settings")}
          />

          <AdminCard
            title="🤖 AI Configuration"
            description="Configure AI assistants and automation."
            href={adminHref("/admin/ai")}
          />
        </AdminSection>

      </div>
    </main>
  );
}

/* ==========================================================
   Administration Section
========================================================== */

function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm lg:p-7">

      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>

    </section>
  );
}

/* ==========================================================
   Admin Card
========================================================== */

function AdminCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex min-h-[190px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

      <h3 className="text-lg font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-auto pt-6">
        <Button
          asChild
          className="w-full sm:w-auto"
        >
          <Link href={href}>
            Open
          </Link>
        </Button>
      </div>

    </div>
  );
}