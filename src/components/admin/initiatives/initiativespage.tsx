import Link from "next/link";

import {
  listPerformanceSheetDefinitions,
} from "@/lib/repositories/performancesheetrepository";

import {
  getOrganization,
} from "@/services/organization.service";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

export default async function InitiativesPage() {
  const organization =
    await getOrganization();

  if (!organization) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <AdminPageHeader
          title="Initiatives"
          description="View the Initiatives defined within your Performance Sheets."
        />

        <h1 className="text-2xl font-semibold">
          No organization found
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create an organization before viewing
          Initiatives.
        </p>
      </main>
    );
  }

  const performanceSheets =
    await listPerformanceSheetDefinitions(
      organization.id
    );

  return (
    <main className="mx-auto max-w-7xl p-8">
      <AdminPageHeader
        title="Initiatives"
        description="View the Initiatives defined within your Performance Sheets."
      />

      {performanceSheets.length === 0 && (
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">
            No Performance Sheets
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a Performance Sheet in Builder
            before adding Initiatives.
          </p>

          <Link
            href="/builder?new=true"
            className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          >
            Create Performance Sheet
          </Link>
        </div>
      )}

      {performanceSheets.length > 0 && (
        <div className="space-y-8">
          {performanceSheets.map((sheet) => (
            <section
              key={sheet.id}
              className="rounded-xl border bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {sheet.name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Version {sheet.version} ·{" "}
                    {sheet.status}
                  </p>
                </div>

                <Link
                  href={`/builder?sheetId=${sheet.id}`}
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                  Open in Builder
                </Link>
              </div>

              <div className="divide-y">
                {sheet.document.objectives.map(
                  (objective, objectiveIndex) => {
                    const objectivesKeyResults =
                      objective.keyResults.filter(
                        (keyResult) =>
                          keyResult.initiatives.length > 0
                      );

                    if (
                      objectivesKeyResults.length === 0
                    ) {
                      return null;
                    }

                    return (
                      <article
                        key={objective.id}
                        className="p-6"
                      >
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Objective{" "}
                            {objectiveIndex + 1}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold">
                            {objective.title}
                          </h3>

                          {objective.description && (
                            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                              {objective.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 space-y-4">
                          {objectivesKeyResults.map(
                            (keyResult) => (
                              <div
                                key={keyResult.id}
                                className="rounded-lg border bg-slate-50 p-4"
                              >
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Key Result
                                  </p>

                                  <p className="mt-1 text-sm font-semibold">
                                    {keyResult.title}
                                  </p>
                                </div>

                                <div className="mt-4 border-t pt-3">
                                  <p className="text-xs font-medium">
                                    Initiatives
                                  </p>

                                  <div className="mt-2 space-y-2">
                                    {keyResult.initiatives.map(
                                      (initiative) => (
                                        <div
                                          key={
                                            initiative.id
                                          }
                                          className="rounded-md border bg-white p-3"
                                        >
                                          <p className="text-sm text-muted-foreground">
                                            •{" "}
                                            {
                                              initiative.text
                                            }
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}