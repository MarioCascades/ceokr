import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOrganization } from "@/services/organization.service";

type OrganizationPageProps = {
  searchParams: Promise<{
    organizationId?: string;
  }>;
};

export default async function OrganizationWorkspacePage({
  searchParams,
}: OrganizationPageProps) {
  const params = await searchParams;
  const organizationId = params.organizationId;

  const organization = organizationId
    ? await getOrganization(organizationId)
    : null;

  function workspaceHref(path: string) {
    if (!organizationId) return path;

    return `${path}?organizationId=${encodeURIComponent(
      organizationId
    )}`;
  }

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization Workspace
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
            {organization?.company_name ?? "Organization Workspace"}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Manage your organization&apos;s people, structure, performance
            system, and organization-level capabilities.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current organization
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                {organization?.company_name ?? "No organization selected"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This workspace is intended for administrators operating
                within one authorized organization.
              </p>
            </div>

            {organizationId && organization && (
              <span className="rounded-md border bg-gray-50 px-4 py-2 text-xs text-muted-foreground">
                Organization context active
              </span>
            )}
          </div>

          {!organization && (
            <div className="mt-5 rounded-lg border border-dashed bg-gray-50 p-5">
              <p className="text-sm text-muted-foreground">
                No organization context is currently available. During this
                development phase, select an organization from the main
                workspace before entering Organization Admin.
              </p>

              <Button asChild variant="outline" className="mt-4">
                <Link href="/">Return to Workspace</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Organization capabilities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These entry points reuse the platform&apos;s existing
              organization and performance capabilities. They do not create
              parallel sources of truth.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <WorkspaceCard
              title="Organization"
              description="Manage organization profile, branding, and configuration."
              href={workspaceHref("/organization/organization")}
            />
            <WorkspaceCard
              title="People & Structure"
              description="Manage departments, teams, users, and organization access."
              href={workspaceHref("/organization/users")}
            />
            <WorkspaceCard
              title="Roles & Permissions"
              description="Manage organization roles and permission assignments."
              href={workspaceHref("/organization/roles")}
            />
            <WorkspaceCard
              title="Performance Sheets"
              description="Manage organization performance sheets through the existing Builder."
              href={workspaceHref("/organization/performancesheets")}
            />
            <WorkspaceCard
              title="Assignments"
              description="Manage published performance assignments for the organization."
              href={workspaceHref("/organization/assignments")}
            />
            <WorkspaceCard
              title="Performance Definitions"
              description="View objectives, key results, and initiatives owned by the Builder."
              href={workspaceHref("/organization/objectives")}
            />
            <WorkspaceCard
              title="Dashboards"
              description="Open organization dashboard capabilities as they become available."
              href={workspaceHref("/organization/dashboards")}
            />
            <WorkspaceCard
              title="Reports"
              description="Open organization reporting capabilities without inventing unsupported data."
              href={workspaceHref("/organization/reports")}
            />
            <WorkspaceCard
              title="Settings"
              description="Open organization-level configuration."
              href={workspaceHref("/organization/settings")}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function WorkspaceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex min-h-[170px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-950">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-auto pt-6">
        <Button asChild className="w-full sm:w-auto">
          <Link href={href}>Open</Link>
        </Button>
      </div>
    </div>
  );
}
