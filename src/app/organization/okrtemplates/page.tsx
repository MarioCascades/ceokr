import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getOrganization } from "@/services/organization.service";

import {
  loadOrganizationObjectiveTemplates,
  loadOrganizationKeyResultTemplates,
} from "@/lib/repositories/okrtemplaterepository";

type OrganizationOKRTemplatesPageProps = {
  searchParams: Promise<{
    organizationId?: string;
  }>;
};

export default async function OrganizationOKRTemplatesPage({
  searchParams,
}: OrganizationOKRTemplatesPageProps) {
  const params =
    await searchParams;

  const organizationId =
    params.organizationId;

  if (!organizationId) {
    return (
      <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">

          <section className="rounded-2xl border border-gray-300 bg-white p-8 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
              OKR Templates
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Select an organization before managing organization-specific
              OKR templates.
            </p>

            <div className="mt-6">
              <Button asChild>
                <Link href="/organization">
                  ← Back to Organization Workspace
                </Link>
              </Button>
            </div>

          </section>

        </div>
      </main>
    );
  }

  const organization =
    await getOrganization(
      organizationId
    );

  const [
    objectiveTemplates,
    keyResultTemplates,
  ] = await Promise.all([
    loadOrganizationObjectiveTemplates(
      organizationId
    ),
    loadOrganizationKeyResultTemplates(
      organizationId
    ),
  ]);

  const organizationName =
    organization?.company_name ??
    "Organization";

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* ==================================================
            Header
        ================================================== */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {organizationName}
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
              OKR Templates
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Manage reusable Objective and Key Result Templates
              for your organization.
            </p>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <Button
              asChild
              variant="outline"
            >
              <Link
                href={`/organization?organizationId=${encodeURIComponent(
                  organizationId
                )}`}
              >
                ← Organization Workspace
              </Link>
            </Button>

          </div>

        </header>

        {/* ==================================================
            Template Model
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">

          <div className="max-w-4xl">

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization Template Library
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Your organization&apos;s reusable OKR building blocks
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Organization Templates are independent reusable
              definitions owned by this organization. They can be
              used as starting points when creating Member OKRs.
              Changes to a template do not change existing Member
              OKRs.
            </p>

          </div>

        </section>

        {/* ==================================================
            Summary
        ================================================== */}

        <section className="grid gap-4 md:grid-cols-2">

          <TemplateSummaryCard
            title="Objective Templates"
            count={
              objectiveTemplates.length
            }
            description="Reusable Objective definitions owned by this organization."
          />

          <TemplateSummaryCard
            title="Key Result Templates"
            count={
              keyResultTemplates.length
            }
            description="Reusable Key Result definitions owned by this organization."
          />

        </section>

        {/* ==================================================
            Objective Templates
        ================================================== */}

        <TemplateSection
          title="Objective Templates"
          description="Reusable Objective definitions available within this organization."
          actionHref={`/organization/okrtemplates/new?type=objective&organizationId=${encodeURIComponent(
            organizationId
          )}`}
          actionLabel="Create Objective Template"
        >

          {objectiveTemplates.length === 0 ? (
            <EmptyTemplateState
              title="No Objective Templates yet"
              description="Create your first organization Objective Template to begin building reusable OKR content."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {objectiveTemplates.map(
                (template) => (
                  <TemplateCard
                    key={
                      template.id
                    }
                    title={
                      template.title
                    }
                    description={
                      template.description
                    }
                    metadata={`Weight: ${template.weight}%`}
                  />
                )
              )}

            </div>
          )}

        </TemplateSection>

        {/* ==================================================
            Key Result Templates
        ================================================== */}

        <TemplateSection
          title="Key Result Templates"
          description="Reusable Key Result definitions available within this organization."
          actionHref={`/organization/okrtemplates/new?type=keyResult&organizationId=${encodeURIComponent(
            organizationId
          )}`}
          actionLabel="Create Key Result Template"
        >

          {keyResultTemplates.length === 0 ? (
            <EmptyTemplateState
              title="No Key Result Templates yet"
              description="Create your first organization Key Result Template to begin building reusable OKR content."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {keyResultTemplates.map(
                (template) => (
                  <TemplateCard
                    key={
                      template.id
                    }
                    title={
                      template.title
                    }
                    description={`${template.measurementType} • ${template.scoringMethod}`}
                    metadata={`Weight: ${template.weight}% • Status: ${template.status}`}
                  />
                )
              )}

            </div>
          )}

        </TemplateSection>

      </div>

    </main>
  );
}

/* ==========================================================
   Template Summary Card
========================================================== */

function TemplateSummaryCard({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
        {count}
      </p>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

    </section>
  );
}

/* ==========================================================
   Template Section
========================================================== */

function TemplateSection({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm lg:p-7">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
            {title}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>

        </div>

        <Button
          asChild
          className="shrink-0"
        >
          <Link href={actionHref}>
            {actionLabel}
          </Link>
        </Button>

      </div>

      {children}

    </section>
  );
}

/* ==========================================================
   Empty Template State
========================================================== */

function EmptyTemplateState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

      <h3 className="text-lg font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

    </div>
  );
}

/* ==========================================================
   Template Card
========================================================== */

function TemplateCard({
  title,
  description,
  metadata,
}: {
  title: string;
  description?: string;
  metadata: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="text-lg font-semibold text-gray-950">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}

      <p className="mt-auto pt-5 text-xs font-medium text-muted-foreground">
        {metadata}
      </p>

    </div>
  );
}