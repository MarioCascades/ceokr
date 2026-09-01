import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminPage() {
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
            Organization
        ================================================== */}

        <AdminSection
          title="Organization"
          description="Manage your organization, people, structure and access."
        >
          <AdminCard
            title="🏢 Organization"
            description="Manage organization profile, branding and configuration."
            href="/admin/organization"
          />

          <AdminCard
            title="🏛 Departments"
            description="Create, edit and manage departments."
            href="/admin/departments"
          />

          <AdminCard
            title="👥 Teams"
            description="Create and organize teams."
            href="/admin/teams"
          />

          <AdminCard
            title="👤 Users"
            description="Invite and manage users."
            href="/admin/users"
          />

          <AdminCard
            title="🔐 Roles & Permissions"
            description="Control security and user access."
            href="/admin/roles"
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
            href="/admin/performancesheets"
          />

          <AdminCard
            title="📋 Assignments"
            description="Assign published Performance Sheets to users, teams, departments or the organization."
            href="/admin/assignments"
          />

          <AdminCard
            title="🎯 Objectives"
            description="View objectives defined within your Performance Sheets."
            href="/admin/objectives"
          />

          <AdminCard
            title="📈 Key Results"
            description="View measurable outcomes defined within your Performance Sheets."
            href="/admin/keyresults"
          />

          <AdminCard
            title="🚀 Initiatives"
            description="View initiatives defined within your Performance Sheets."
            href="/admin/initiatives"
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
            href="/admin/dashboards"
          />

          <AdminCard
            title="📑 Reports"
            description="Generate and manage reports."
            href="/admin/reports"
          />
        </AdminSection>

        {/* ==================================================
            Platform
        ================================================== */}

        <AdminSection
          title="Platform"
          description="Configure platform-wide capabilities and services."
        >
          <AdminCard
            title="⚙️ Settings"
            description="Platform-wide configuration."
            href="/admin/settings"
          />

          <AdminCard
            title="🤖 AI Configuration"
            description="Configure AI assistants and automation."
            href="/admin/ai"
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

      {/* Section Header */}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Section Cards */}

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