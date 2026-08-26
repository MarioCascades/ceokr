"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  listPerformanceSheetDefinitions,
  findPerformanceSheetVersions,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

/* ==========================================================
   Version History State
========================================================== */

type VersionHistoryMap = Record<
  string,
  PerformanceSheetRecord[]
>;

/* ==========================================================
   Performance Sheet Management Page
========================================================== */

export default function PerformanceSheetsPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<PerformanceSheetRecord[]>([]);

  const [
    versionHistory,
    setVersionHistory,
  ] = useState<VersionHistoryMap>({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isLoadingHistory,
    setIsLoadingHistory,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [
    historyErrorMessage,
    setHistoryErrorMessage,
  ] = useState<string | null>(null);

  /* ========================================================
     Initialize
  ======================================================== */

  useEffect(() => {
    async function initialize() {
      try {
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization();

        if (!existingOrganization) {
          setErrorMessage(
            "No organization has been configured yet."
          );

          return;
        }

        setOrganization(
          existingOrganization
        );

        const records =
          await listPerformanceSheetDefinitions(
            existingOrganization.id
          );

        setPerformanceSheets(
          records
        );

        /*
         * Load the preserved versions for each
         * logical Performance Sheet.
         *
         * This is intentionally loaded after
         * the management list so the primary
         * management view remains simple.
         */
        setIsLoadingHistory(true);
        setHistoryErrorMessage(null);

        const historyEntries =
          await Promise.all(
            records.map(
              async (sheet) => {
                const versions =
                  await findPerformanceSheetVersions(
                    existingOrganization.id,
                    sheet.sheet_key
                  );

                return [
                  sheet.sheet_key,
                  versions,
                ] as const;
              }
            )
          );

        const historyMap: VersionHistoryMap =
          {};

        for (const [
          sheetKey,
          versions,
        ] of historyEntries) {
          historyMap[sheetKey] =
            versions;
        }

        setVersionHistory(
          historyMap
        );
      } catch (error) {
        console.error(
          "Failed to load performance sheets:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load performance sheets."
        );
      } finally {
        setIsLoadingHistory(false);
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  /* ========================================================
     Render
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex flex-col gap-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold">
                Performance Sheets
              </h1>

              <p className="mt-2 text-muted-foreground">
                Manage Performance Sheet definitions,
                versions and Builder access.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
            >
              <Link href="/admin">
                Back to Administration
              </Link>
            </Button>

          </div>

          {/* ==================================================
              Management Navigation
          ================================================== */}

          <nav
            aria-label="Performance Sheet management navigation"
            className="flex flex-wrap gap-2"
          >
            <Button
              asChild
              variant="secondary"
            >
              <Link href="/admin/performancesheets">
                Performance Sheets
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
            >
              <Link href="/builder">
                Builder
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
            >
              <Link href="/admin">
                Administration
              </Link>
            </Button>
          </nav>

        </div>

        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ==================================================
            Loading
        ================================================== */}

        {isLoading && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading Performance Sheets...
            </p>
          </section>
        )}

        {/* ==================================================
            Organization
        ================================================== */}

        {!isLoading &&
          organization && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    {organization.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Performance Sheet Definitions
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {performanceSheets.length}{" "}
                  {performanceSheets.length === 1
                    ? "sheet"
                    : "sheets"}
                </div>

              </div>

            </section>
          )}

        {/* ==================================================
            Performance Sheets
        ================================================== */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            {/* ==================================================
                Section Header
            ================================================== */}

            <div className="flex items-center justify-between gap-4 border-b p-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Performance Sheet Definitions
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage reusable Performance Sheet definitions
                  through the Builder.
                </p>
              </div>

              <Button asChild>
                <Link href="/builder?new=true">
                  Create Performance Sheet
                </Link>
              </Button>

            </div>

            {/* ==================================================
                History Error
            ================================================== */}

            {historyErrorMessage && (
              <div className="border-b border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {historyErrorMessage}
                </p>
              </div>
            )}

            {/* ==================================================
                Empty State
            ================================================== */}

            {performanceSheets.length === 0 ? (
              <div className="p-6">

                <p className="text-sm text-muted-foreground">
                  No Performance Sheets have been
                  created yet.
                </p>

                <div className="mt-4">
                  <Button asChild>
                    <Link href="/builder?new=true">
                      Create Performance Sheet
                    </Link>
                  </Button>
                </div>

              </div>
            ) : (
              /* ==================================================
                 Performance Sheet Definitions
              ================================================== */

              <div className="divide-y">

                {performanceSheets.map(
                  (sheet) => {
                    const versions =
                      versionHistory[
                        sheet.sheet_key
                      ] ?? [];

                    return (
                      <div
                        key={sheet.sheet_key}
                        className="p-6"
                      >

                        {/* ==================================================
                            Definition Header
                        ================================================== */}

                        <div className="flex items-center justify-between gap-6">

                          <div className="min-w-0">

                            <h3 className="font-semibold">
                              {sheet.name}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">

                              <span>
                                Current Version{" "}
                                {sheet.version}
                              </span>

                              <span>
                                {formatStatus(
                                  sheet.status
                                )}
                              </span>

                              <span>
                                Updated{" "}
                                {formatDate(
                                  sheet.updated_at
                                )}
                              </span>

                            </div>

                          </div>

                          {/* ==================================================
                              Current Version Action
                          ================================================== */}

                          <div className="flex shrink-0 gap-2">

                            <Button
                              asChild
                            >
                              <Link
                                href={`/builder?sheetId=${encodeURIComponent(
                                  sheet.id
                                )}`}
                              >
                                Open Builder
                              </Link>
                            </Button>

                          </div>

                        </div>

                        {/* ==================================================
                            Version History
                        ================================================== */}

                        <div className="mt-6 rounded-lg border bg-gray-50">

                          <div className="border-b px-4 py-3">

                            <h4 className="text-sm font-semibold">
                              Version History
                            </h4>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Preserved versions of this
                              Performance Sheet.
                            </p>

                          </div>

                          {isLoadingHistory ? (
                            <div className="px-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                Loading version history...
                              </p>
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="px-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                No version history is available.
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y">

                              {versions.map(
                                (version) => (
                                  <div
                                    key={version.id}
                                    className="flex items-center justify-between gap-6 px-4 py-4"
                                  >

                                    <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">

                                      <span className="text-sm font-medium">
                                        Version{" "}
                                        {version.version}
                                      </span>

                                      <span className="text-sm text-muted-foreground">
                                        {formatStatus(
                                          version.status
                                        )}
                                      </span>

                                      <span className="text-sm text-muted-foreground">
                                        Updated{" "}
                                        {formatDate(
                                          version.updated_at
                                        )}
                                      </span>

                                    </div>

                                    <Button
                                      asChild
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Link
                                        href={`/builder?sheetId=${encodeURIComponent(
                                          version.id
                                        )}`}
                                      >
                                        Open
                                      </Link>
                                    </Button>

                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

/* ==========================================================
   Helpers
========================================================== */

function formatStatus(
  status: PerformanceSheetRecord["status"]
): string {
  switch (status) {
    case "draft":
      return "Draft";

    case "published":
      return "Published";

    case "archived":
      return "Archived";

    default:
      return status;
  }
}

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
}