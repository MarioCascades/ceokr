import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOrganization } from "@/services/organization.service";

type OrganizationPageProps = {
  searchParams: Promise<{
    organizationId?: string;
    from?: string;
  }>;
};

export default async function OrganizationWorkspacePage({
  searchParams,
}: OrganizationPageProps) {
  const params = await searchParams;

  const organizationId =
    params.organizationId;

  const fromAdmin =
    params.from === "admin";

  const organization =
    organizationId
      ? await getOrganization(
          organizationId
        )
      : null;

  function workspaceHref(
    path: string
  ) {
    if (!organizationId) {
      return path;
    }

    return `${path}?organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }

  const administrationHref =
    organizationId
      ? `/admin?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/admin";

  /*
   * ==========================================================
   * Organization Runtime
   * ==========================================================
   *
   * The Organization Admin enters the existing shared Runtime
   * using the current organization context.
   */

  const performanceWorkspaceHref =
    workspaceHref("/runtime");

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* ==================================================
            Page Header
        ================================================== */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization Workspace
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
              {organization?.company_name ??
                "Organization Workspace"}
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Administer your organization&apos;s people,
              structure, performance system, analytics,
              and configuration.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">

            <Button
              asChild
              className="shrink-0"
            >
              <Link
                href={
                  performanceWorkspaceHref
                }
              >
                Open Performance Workspace →
              </Link>
            </Button>

            {fromAdmin && (
              <Button
                asChild
                variant="outline"
                className="shrink-0"
              >
                <Link
                  href={
                    administrationHref
                  }
                >
                  ← Back to Administration
                </Link>
              </Button>
            )}

          </div>

        </header>

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
                  Select an organization from
                  the development workspace before
                  entering Organization Admin.
                </p>
              )}

            </div>

            {organizationId &&
              organization && (
                <div className="rounded-md border bg-gray-50 px-4 py-2 text-xs text-muted-foreground">
                  Organization context active
                </div>
              )}

          </div>

          {!organization && (
            <div className="mt-5 rounded-lg border border-dashed bg-gray-50 p-5">

              <p className="text-sm text-muted-foreground">
                No organization context is currently
                available. During this development phase,
                select an organization from the main
                workspace before entering Organization Admin.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <Link href="/">
                  Return to Workspace
                </Link>
              </Button>

            </div>
          )}

        </section>

        {/* ==================================================
            Organization
        ================================================== */}

        <WorkspaceSection
          title="Organization"
          description="Manage the organization itself, its people, structure, and access."
        >

          <WorkspaceCard
            title="🏢 Organization"
            description="Manage organization profile, branding, and configuration."
            href={workspaceHref(
              "/organization/organization"
            )}
          />

          <WorkspaceCard
            title="🏛 Departments"
            description="Create, edit, and manage the departments within your organization."
            href={workspaceHref(
              "/organization/departments"
            )}
          />

          <WorkspaceCard
            title="👥 Teams"
            description="Create and organize teams within your organization."
            href={workspaceHref(
              "/organization/teams"
            )}
          />

          <WorkspaceCard
            title="👤 Users / Members"
            description="Invite, manage, and organize the people who belong to your organization."
            href={workspaceHref(
              "/organization/users"
            )}
          />

          <WorkspaceCard
            title="🔐 Roles & Permissions"
            description="Manage organization roles and the permissions available to members."
            href={workspaceHref(
              "/organization/roles"
            )}
          />

        </WorkspaceSection>

        {/* ==================================================
            Performance
        ================================================== */}

        <WorkspaceSection
          title="Performance"
          description="Build, manage, assign, and administer your organization&apos;s performance system."
        >

          <WorkspaceCard
            title="🚀 Performance Workspace"
            description="Open the live organization performance experience and view performance across your organization."
            href={
              performanceWorkspaceHref
            }
          />

          <WorkspaceCard
            title="🧩 Performance Sheets"
            description="Create and manage Performance Sheets, open Builder, publish versions, and manage existing sheets."
            href={workspaceHref(
              "/organization/performancesheets"
            )}
          />

          <WorkspaceCard
            title="📋 Assignments"
            description="Assign published Performance Sheets to users, teams, departments, or the organization."
            href={workspaceHref(
              "/organization/assignments"
            )}
          />

          <WorkspaceCard
            title="🎯 Objectives"
            description="Manage objectives defined within your organization&apos;s Performance Sheets."
            href={workspaceHref(
              "/organization/objectives"
            )}
          />

          <WorkspaceCard
            title="📈 Key Results"
            description="Manage measurable outcomes defined within your organization&apos;s Performance Sheets."
            href={workspaceHref(
              "/organization/keyresults"
            )}
          />

        </WorkspaceSection>

        {/* ==================================================
            Analytics
        ================================================== */}

        <WorkspaceSection
          title="Analytics"
          description="Understand organizational performance through dashboards and reports."
        >

          <WorkspaceCard
            title="📊 Dashboards"
            description="Configure organization dashboards, charts, tables, and performance views."
            href={workspaceHref(
              "/organization/dashboards"
            )}
          />

          <WorkspaceCard
            title="📑 Reports"
            description="Review and manage organization performance reporting."
            href={workspaceHref(
              "/organization/reports"
            )}
            comingSoon
          />

        </WorkspaceSection>

        {/* ==================================================
            Configuration
        ================================================== */}

        <WorkspaceSection
          title="Configuration"
          description="Configure organization-level platform behavior and services."
        >

          <WorkspaceCard
            title="⚙️ Settings"
            description="Manage organization-level configuration and preferences."
            href={workspaceHref(
              "/organization/settings"
            )}
            comingSoon
          />

          <WorkspaceCard
            title="🤖 AI Configuration"
            description="Configure AI-assisted planning, analysis, recommendations, and reporting."
            href={workspaceHref(
              "/organization/ai"
            )}
            comingSoon
          />

        </WorkspaceSection>

      </div>

    </main>
  );
}

/* ==========================================================
   Workspace Section
========================================================== */

function WorkspaceSection({
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
   Workspace Card
========================================================== */

function WorkspaceCard({
  title,
  description,
  href,
  comingSoon = false,
}: {
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex min-h-[190px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <h3 className="text-lg font-semibold text-gray-950">
          {title}
        </h3>

        {comingSoon && (
          <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Soon
          </span>
        )}

      </div>

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