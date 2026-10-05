import Link from "next/link";
import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";

import { getOrganization } from "@/services/organization.service";

import {
  loadOrganizationObjectiveTemplates,
  loadOrganizationKeyResultTemplates,
  loadAllObjectiveTemplates,
  loadAllKeyResultTemplates,
  deleteOrganizationOKRTemplateObjective,
  deleteOrganizationOKRTemplateKeyResult,
} from "@/lib/repositories/okrtemplaterepository";


/* ==========================================================
   Organization Template Delete Action
========================================================== */

async function deleteOrganizationTemplateAction(
  formData: FormData
) {
  "use server";

  const organizationId =
    String(
      formData.get("organizationId") ?? ""
    );

  const templateType =
    String(
      formData.get("templateType") ?? ""
    );

  const templateId =
    String(
      formData.get("templateId") ?? ""
    );

  if (
    !organizationId ||
    !templateId
  ) {
    throw new Error(
      "Organization template information is required."
    );
  }

  if (
    templateType === "objective"
  ) {
    await deleteOrganizationOKRTemplateObjective(
      organizationId,
      templateId
    );
  } else if (
    templateType === "keyResult"
  ) {
    await deleteOrganizationOKRTemplateKeyResult(
      organizationId,
      templateId
    );
  } else {
    throw new Error(
      "Invalid organization template type."
    );
  }

  revalidatePath(
    "/organization/okrtemplates"
  );
}


/* ==========================================================
   Page
========================================================== */

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


  /* ========================================================
     Missing Organization Context
  ======================================================== */

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


  /* ========================================================
     Load Organization + Template Libraries
  ======================================================== */

  const organization =
    await getOrganization(
      organizationId
    );

  const [
    objectiveTemplates,
    keyResultTemplates,
    globalObjectiveTemplates,
    globalKeyResultTemplates,
  ] = await Promise.all([

    loadOrganizationObjectiveTemplates(
      organizationId
    ),

    loadOrganizationKeyResultTemplates(
      organizationId
    ),

    loadAllObjectiveTemplates(),

    loadAllKeyResultTemplates(),

  ]);


  const organizationName =
    organization?.company_name ??
    "Organization";


  /* ========================================================
     Determine Available Global Templates
  ======================================================== */

  const organizationObjectiveSourceIds =
    new Set(
      objectiveTemplates
        .map(
          (template) =>
            template.sourceGlobalTemplateId
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    );


  const organizationKeyResultSourceIds =
    new Set(
      keyResultTemplates
        .map(
          (template) =>
            template.sourceGlobalTemplateId
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    );


  const availableGlobalObjectiveTemplates =
    globalObjectiveTemplates.filter(
      (template) =>
        !organizationObjectiveSourceIds.has(
          template.id
        )
    );


  const availableGlobalKeyResultTemplates =
    globalKeyResultTemplates.filter(
      (template) =>
        !organizationKeyResultSourceIds.has(
          template.id
        )
    );


  /* ========================================================
     Render
  ======================================================== */

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

        </header>


        {/* ==================================================
            Template Model
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization Template Library
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
            Your organization&apos;s reusable OKR building blocks
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            Global templates are reusable master definitions. Adding one
            creates an independent organization-owned copy. Organization
            Admins can manage or delete their own copies without changing
            the global master.
          </p>

        </section>


        {/* ==================================================
            Organization Templates
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization-Owned Templates
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Your Templates
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                These are independent copies owned by this organization.
              </p>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <Button asChild>
                <Link
                  href={`/organization/okrtemplates/new?type=objective&organizationId=${encodeURIComponent(
                    organizationId
                  )}`}
                >
                  Create Objective
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
              >
                <Link
                  href={`/organization/okrtemplates/new?type=keyResult&organizationId=${encodeURIComponent(
                    organizationId
                  )}`}
                >
                  Create Key Result
                </Link>
              </Button>

            </div>

          </div>


          {/* ==================================================
              Organization Objective List
          ================================================== */}

          <div className="p-6">

            <div className="mb-4 flex items-end justify-between gap-4">

              <div>

                <h3 className="text-lg font-semibold text-gray-950">
                  Objective Templates
                </h3>

                <p className="text-sm text-muted-foreground">
                  {objectiveTemplates.length} organization-owned template
                  {objectiveTemplates.length === 1 ? "" : "s"}.
                </p>

              </div>

            </div>


            {objectiveTemplates.length === 0 ? (

              <EmptyTemplateState
                title="No Objective Templates yet"
                description="Add a Global Objective Template below or create your first organization-owned Objective Template."
              />

            ) : (

              <TemplateTable>

                <thead>
                  <tr>
                    <TableHeader>
                      Type
                    </TableHeader>

                    <TableHeader>
                      Template
                    </TableHeader>

                    <TableHeader>
                      Weight
                    </TableHeader>

                    <TableHeader>
                      Source
                    </TableHeader>

                    <TableHeader align="right">
                      Actions
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>

                  {objectiveTemplates.map(
                    (template) => (

                      <tr
                        key={template.id}
                        className="border-t border-gray-200"
                      >

                        <TableCell>
                          <TypeBadge>
                            Objective
                          </TypeBadge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-950">
                              {template.title}
                            </p>

                            {template.description && (
                              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {template.weight}%
                        </TableCell>

                        <TableCell>
                          {template.sourceGlobalTemplateId
                            ? "Global Copy"
                            : "Organization"}
                        </TableCell>

                        <TableCell align="right">

                          <div className="flex items-center justify-end gap-2">

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                            >
                              <Link
                                href={`/organization/okrtemplates/new?type=objective&organizationId=${encodeURIComponent(
                                  organizationId
                                )}`}
                              >
                                Edit
                              </Link>
                            </Button>

                            <form
                              action={
                                deleteOrganizationTemplateAction
                              }
                            >

                              <input
                                type="hidden"
                                name="organizationId"
                                value={
                                  organizationId
                                }
                              />

                              <input
                                type="hidden"
                                name="templateType"
                                value="objective"
                              />

                              <input
                                type="hidden"
                                name="templateId"
                                value={
                                  template.id
                                }
                              />

                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                Delete
                              </Button>

                            </form>

                          </div>

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </TemplateTable>

            )}

          </div>


          {/* ==================================================
              Organization Key Result List
          ================================================== */}

          <div className="border-t border-gray-200 p-6">

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-gray-950">
                Key Result Templates
              </h3>

              <p className="text-sm text-muted-foreground">
                {keyResultTemplates.length} organization-owned template
                {keyResultTemplates.length === 1 ? "" : "s"}.
              </p>

            </div>


            {keyResultTemplates.length === 0 ? (

              <EmptyTemplateState
                title="No Key Result Templates yet"
                description="Add a Global Key Result Template below or create your first organization-owned Key Result Template."
              />

            ) : (

              <TemplateTable>

                <thead>
                  <tr>
                    <TableHeader>
                      Type
                    </TableHeader>

                    <TableHeader>
                      Template
                    </TableHeader>

                    <TableHeader>
                      Measurement
                    </TableHeader>

                    <TableHeader>
                      Weight
                    </TableHeader>

                    <TableHeader>
                      Initiatives
                    </TableHeader>

                    <TableHeader>
                      Source
                    </TableHeader>

                    <TableHeader align="right">
                      Actions
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>

                  {keyResultTemplates.map(
                    (template) => (

                      <tr
                        key={template.id}
                        className="border-t border-gray-200"
                      >

                        <TableCell>
                          <TypeBadge>
                            Key Result
                          </TypeBadge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-950">
                              {template.title}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Scoring: {template.scoringMethod}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {template.measurementType}
                        </TableCell>

                        <TableCell>
                          {template.weight}%
                        </TableCell>

                        <TableCell>
                          {template.initiatives.length}
                        </TableCell>

                        <TableCell>
                          {template.sourceGlobalTemplateId
                            ? "Global Copy"
                            : "Organization"}
                        </TableCell>

                        <TableCell align="right">

                          <div className="flex items-center justify-end gap-2">

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                            >
                              <Link
                                href={`/organization/okrtemplates/new?type=keyResult&organizationId=${encodeURIComponent(
                                  organizationId
                                )}`}
                              >
                                Edit
                              </Link>
                            </Button>

                            <form
                              action={
                                deleteOrganizationTemplateAction
                              }
                            >

                              <input
                                type="hidden"
                                name="organizationId"
                                value={
                                  organizationId
                                }
                              />

                              <input
                                type="hidden"
                                name="templateType"
                                value="keyResult"
                              />

                              <input
                                type="hidden"
                                name="templateId"
                                value={
                                  template.id
                                }
                              />

                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                Delete
                              </Button>

                            </form>

                          </div>

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </TemplateTable>

            )}

          </div>

        </section>


        {/* ==================================================
            Available Global Templates
        ================================================== */}

        <section className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">

          <div className="border-b border-blue-200 p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Global Template Library
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Available Global Templates
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              These are platform-maintained master templates that have not
              yet been added to this organization.
            </p>

          </div>


          {/* ==================================================
              Available Global Objectives
          ================================================== */}

          <div className="p-6">

            <h3 className="text-lg font-semibold text-gray-950">
              Global Objective Templates
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {availableGlobalObjectiveTemplates.length} available.
            </p>


            {availableGlobalObjectiveTemplates.length === 0 ? (

              <div className="mt-4 rounded-xl border border-blue-200 bg-white p-5">

                <p className="font-medium text-gray-950">
                  No Global Objective Templates available
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  All current Global Objective Templates have already
                  been added to this organization.
                </p>

              </div>

            ) : (

              <TemplateTable className="mt-4">

                <thead>
                  <tr>
                    <TableHeader>
                      Type
                    </TableHeader>

                    <TableHeader>
                      Template
                    </TableHeader>

                    <TableHeader>
                      Weight
                    </TableHeader>

                    <TableHeader align="right">
                      Action
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>

                  {availableGlobalObjectiveTemplates.map(
                    (template) => (

                      <tr
                        key={template.id}
                        className="border-t border-gray-200"
                      >

                        <TableCell>
                          <TypeBadge>
                            Global Objective
                          </TypeBadge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-950">
                              {template.title}
                            </p>

                            {template.description && (
                              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {template.weight}%
                        </TableCell>

                        <TableCell align="right">

                          <Button
                            asChild
                            size="sm"
                          >
                            <Link
                              href={`/organization/okrtemplates/new?type=objective&organizationId=${encodeURIComponent(
                                organizationId
                              )}&sourceGlobalTemplateId=${encodeURIComponent(
                                template.id
                              )}`}
                            >
                              Add to Organization
                            </Link>
                          </Button>

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </TemplateTable>

            )}

          </div>


          {/* ==================================================
              Available Global Key Results
          ================================================== */}

          <div className="border-t border-blue-200 p-6">

            <h3 className="text-lg font-semibold text-gray-950">
              Global Key Result Templates
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {availableGlobalKeyResultTemplates.length} available.
            </p>


            {availableGlobalKeyResultTemplates.length === 0 ? (

              <div className="mt-4 rounded-xl border border-blue-200 bg-white p-5">

                <p className="font-medium text-gray-950">
                  No Global Key Result Templates available
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  All current Global Key Result Templates have already
                  been added to this organization.
                </p>

              </div>

            ) : (

              <TemplateTable className="mt-4">

                <thead>
                  <tr>
                    <TableHeader>
                      Type
                    </TableHeader>

                    <TableHeader>
                      Template
                    </TableHeader>

                    <TableHeader>
                      Measurement
                    </TableHeader>

                    <TableHeader>
                      Weight
                    </TableHeader>

                    <TableHeader>
                      Initiatives
                    </TableHeader>

                    <TableHeader align="right">
                      Action
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>

                  {availableGlobalKeyResultTemplates.map(
                    (template) => (

                      <tr
                        key={template.id}
                        className="border-t border-gray-200"
                      >

                        <TableCell>
                          <TypeBadge>
                            Global Key Result
                          </TypeBadge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-950">
                              {template.title}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Scoring: {template.scoringMethod}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {template.measurementType}
                        </TableCell>

                        <TableCell>
                          {template.weight}%
                        </TableCell>

                        <TableCell>
                          {template.initiatives.length}
                        </TableCell>

                        <TableCell align="right">

                          <Button
                            asChild
                            size="sm"
                          >
                            <Link
                              href={`/organization/okrtemplates/new?type=keyResult&organizationId=${encodeURIComponent(
                                organizationId
                              )}&sourceGlobalTemplateId=${encodeURIComponent(
                                template.id
                              )}`}
                            >
                              Add to Organization
                            </Link>
                          </Button>

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </TemplateTable>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}


/* ==========================================================
   Reusable Table
========================================================== */

function TemplateTable({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <table className="w-full min-w-[900px] text-left text-sm">
        {children}
      </table>
    </div>
  );
}


/* ==========================================================
   Table Header
========================================================== */

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}


/* ==========================================================
   Table Cell
========================================================== */

function TableCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-4 align-middle text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}


/* ==========================================================
   Type Badge
========================================================== */

function TypeBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}


/* ==========================================================
   Empty State
========================================================== */

function EmptyTemplateState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8">
      <h3 className="font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
