import Link from "next/link";

import {
  listPerformanceSheetDefinitions,
} from "@/lib/repositories/performancesheetrepository";

import {
  getOrganization,
} from "@/services/organization.service";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

export default async function KeyResultsPage() {
  const organization =
    await getOrganization();

  if (!organization) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <AdminPageHeader
          title="Key Results"
          description="View the Key Results defined within your Performance Sheets."
        />

        <h1 className="text-2xl font-semibold">
          No organization found
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create an organization before managing
          Key Results.
        </p>
      </main>
    );
  }

  const performanceSheets =
    await listPerformanceSheetDefinitions(
      organization.id
    );

  const sheetsWithKeyResults =
    performanceSheets.filter(
      (sheet) =>
        sheet.document.objectives.some(
          (objective) =>
            objective.keyResults.length > 0
        )
    );

  return (
    <main className="mx-auto max-w-7xl p-8">
      <AdminPageHeader
        title="Key Results"
        description="View the Key Results defined within your Performance Sheets."
      />

      {performanceSheets.length === 0 && (
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">
            No Performance Sheets
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a Performance Sheet in Builder
            before adding Key Results.
          </p>

          <Link
            href="/builder?new=true"
            className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          >
            Create Performance Sheet
          </Link>
        </div>
      )}

      {performanceSheets.length > 0 &&
        sheetsWithKeyResults.length === 0 && (
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">
              No Key Results Defined
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Your Performance Sheets exist, but
              no Key Results have been defined yet.
            </p>

            <Link
              href={`/builder?sheetId=${performanceSheets[0].id}`}
              className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
            >
              Open Builder
            </Link>
          </div>
        )}

      {sheetsWithKeyResults.length > 0 && (
        <div className="space-y-8">
          {sheetsWithKeyResults.map(
            (sheet) => (
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
                    (
                      objective,
                      objectiveIndex
                    ) => {
                      const keyResults =
                        objective.keyResults;

                      if (
                        keyResults.length === 0
                      ) {
                        return null;
                      }

                      return (
                        <article
                          key={objective.id}
                          className="p-6"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Objective{" "}
                                {objectiveIndex +
                                  1}
                              </p>

                              <h3 className="mt-1 text-lg font-semibold">
                                {objective.title}
                              </h3>

                              {objective.description && (
                                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                                  {
                                    objective.description
                                  }
                                </p>
                              )}
                            </div>

                            <div className="text-right text-sm">
                              <p>
                                Weight:{" "}
                                <span className="font-medium">
                                  {
                                    objective.weight
                                  }
                                  %
                                </span>
                              </p>

                              <p className="mt-1 text-muted-foreground">
                                {
                                  keyResults.length
                                }{" "}
                                Key Result
                                {keyResults.length !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-lg border bg-slate-50 p-4">
                            <h4 className="text-sm font-semibold">
                              Key Results
                            </h4>

                            <div className="mt-3 space-y-3">
                              {keyResults.map(
                                (keyResult) => (
                                  <div
                                    key={
                                      keyResult.id
                                    }
                                    className="rounded-md border bg-white p-4"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {
                                            keyResult.title
                                          }
                                        </p>

                                        {keyResult.target && (
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            Target:{" "}
                                            {
                                              keyResult.target
                                            }
                                          </p>
                                        )}

                                        {keyResult.current && (
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            Current:{" "}
                                            {
                                              keyResult.current
                                            }
                                          </p>
                                        )}

                                        {keyResult.score && (
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            Score:{" "}
                                            {
                                              keyResult.score
                                            }
                                          </p>
                                        )}
                                      </div>

                                      <span className="shrink-0 text-xs text-muted-foreground">
                                        Weight:{" "}
                                        {
                                          keyResult.weight
                                        }
                                        %
                                      </span>
                                    </div>

                                    {keyResult
                                      .initiatives
                                      .length >
                                      0 && (
                                      <div className="mt-3 border-t pt-3">
                                        <p className="text-xs font-medium">
                                          Initiatives
                                        </p>

                                        <ul className="mt-1 space-y-1">
                                          {keyResult.initiatives.map(
                                            (
                                              initiative
                                            ) => (
                                              <li
                                                key={
                                                  initiative.id
                                                }
                                                className="text-xs text-muted-foreground"
                                              >
                                                •{" "}
                                                {
                                                  initiative.text
                                                }
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </main>
  );
}