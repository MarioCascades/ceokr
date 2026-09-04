"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import { getOrganization } from "@/services/organization.service";
import {
  listPerformanceSheetDefinitions,
  findPerformanceSheetVersions,
} from "@/lib/repositories/performancesheetrepository";

import type { Organization } from "@/lib/types/organization";
import type { PerformanceSheetRecord } from "@/lib/repositories/performancesheetrepository";

type VersionHistoryMap = Record<string, PerformanceSheetRecord[]>;

export default function OrganizationPerformanceSheetsPage() {
  const searchParams = useSearchParams();

  /*
   * Organization Admin workspace is organization-scoped.
   *
   * The organizationId is currently carried through the workspace URL
   * until authentication and organization membership enforcement are
   * implemented.
   */
  const selectedOrganizationId = searchParams.get("organizationId");

  const [organization, setOrganization] = useState<Organization | null>(
    null
  );

  const [performanceSheets, setPerformanceSheets] = useState<
    PerformanceSheetRecord[]
  >([]);

  const [versionHistory, setVersionHistory] =
    useState<VersionHistoryMap>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * Preserve organization context when navigating into Builder.
   */
  const organizationQuery = selectedOrganizationId
    ? `&organizationId=${encodeURIComponent(selectedOrganizationId)}`
    : "";

  const builderHref = selectedOrganizationId
    ? `/builder?organizationId=${encodeURIComponent(
        selectedOrganizationId
      )}`
    : "/builder";

  const builderNewHref = selectedOrganizationId
    ? `/builder?new=true&organizationId=${encodeURIComponent(
        selectedOrganizationId
      )}`
    : "/builder?new=true";

  /*
   * Load the current organization and its Performance Sheet definitions.
   *
   * This page intentionally reuses the existing repository rather than
   * creating duplicate Performance Sheet data-access logic.
   */
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const existingOrganization = await getOrganization(
          selectedOrganizationId ?? undefined
        );

        if (!existingOrganization) {
          setOrganization(null);
          setPerformanceSheets([]);
          setVersionHistory({});
          setErrorMessage("No organization has been configured yet.");
          return;
        }

        setOrganization(existingOrganization);

        const records = await listPerformanceSheetDefinitions(
          existingOrganization.id
        );

        setPerformanceSheets(records);

        /*
         * Load version history for each logical Performance Sheet.
         *
         * The repository already understands sheet_key/version relationships,
         * so the Organization Admin workspace does not need to recreate that
         * logic.
         */
        setIsLoadingHistory(true);

        const historyEntries = await Promise.all(
          records.map(async (sheet) => {
            const versions = await findPerformanceSheetVersions(
              existingOrganization.id,
              sheet.sheet_key
            );

            return [sheet.sheet_key, versions] as const;
          })
        );

        const historyMap: VersionHistoryMap = {};

        for (const [sheetKey, versions] of historyEntries) {
          historyMap[sheetKey] = versions;
        }

        setVersionHistory(historyMap);
      } catch (error) {
        console.error(
          "Failed to load organization Performance Sheets:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Performance Sheets."
        );
      } finally {
        setIsLoadingHistory(false);
        setIsLoading(false);
      }
    }

    initialize();
  }, [selectedOrganizationId]);

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Performance Sheets"
          description="Manage this organization's Performance Sheet definitions, versions and Builder access."
          showOrganizationSelector={false}
        />

        {/* Local Performance Sheet navigation */}
        <nav
          aria-label="Performance Sheet management navigation"
          className="flex flex-wrap gap-2"
        >
          <Button asChild variant="secondary">
            <Link
              href={
                selectedOrganizationId
                  ? `/organization/performancesheets?organizationId=${encodeURIComponent(
                      selectedOrganizationId
                    )}`
                  : "/organization/performancesheets"
              }
            >
              Performance Sheets
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={builderHref}>Builder</Link>
          </Button>
        </nav>

        {/* Error */}
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading Performance Sheets...
            </p>
          </section>
        )}

        {/* Organization context */}
        {!isLoading && organization && (
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
                {performanceSheets.length === 1 ? "sheet" : "sheets"}
              </div>
            </div>
          </section>
        )}

        {/* Performance Sheet definitions */}
        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b p-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Performance Sheet Definitions
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage reusable Performance Sheet definitions through the
                  Builder.
                </p>
              </div>

              <Button asChild>
                <Link href={builderNewHref}>
                  Create Performance Sheet
                </Link>
              </Button>
            </div>

            {isLoadingHistory && performanceSheets.length > 0 && (
              <div className="border-b bg-gray-50 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Loading version history...
                </p>
              </div>
            )}

            {performanceSheets.length === 0 ? (
              <div className="p-6">
                <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center">
                  <h3 className="text-lg font-semibold">
                    No Performance Sheets yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                    Create the organization's first Performance Sheet
                    definition using the Builder.
                  </p>

                  <div className="mt-5">
                    <Button asChild>
                      <Link href={builderNewHref}>
                        Create Performance Sheet
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {performanceSheets.map((sheet) => {
                  const versions =
                    versionHistory[sheet.sheet_key] ?? [];

                  const openBuilderHref = `/builder?sheetId=${encodeURIComponent(
                    sheet.id
                  )}${organizationQuery}`;

                  return (
                    <div key={sheet.sheet_key} className="p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {sheet.name}
                            </h3>

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              Version {sheet.version}
                            </span>

                            <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                              {formatStatus(sheet.status)}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Updated {formatDate(sheet.updated_at)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button asChild>
                            <Link href={openBuilderHref}>
                              Open Builder
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Version history */}
                      <div className="mt-6 rounded-lg border bg-gray-50">
                        <div className="border-b px-4 py-3">
                          <h4 className="text-sm font-semibold">
                            Version History
                          </h4>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Published versions remain immutable. Create a
                            revision when changes are required.
                          </p>
                        </div>

                        {versions.length === 0 ? (
                          <div className="px-4 py-5">
                            <p className="text-sm text-muted-foreground">
                              No version history is available.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {versions.map((version) => {
                              const versionBuilderHref = `/builder?sheetId=${encodeURIComponent(
                                version.id
                              )}${organizationQuery}`;

                              return (
                                <div
                                  key={version.id}
                                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-medium">
                                        Version {version.version}
                                      </span>

                                      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium">
                                        {formatStatus(version.status)}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Updated{" "}
                                      {formatDate(version.updated_at)}
                                    </p>
                                  </div>

                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Link href={versionBuilderHref}>
                                      Open
                                    </Link>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}