import type { CSSProperties } from "react";

import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";
import IndieOrthoOverallPracticePerformance, {
  type PracticePerformanceMetric,
} from "@/components/runtime/indieortho/indieorthooverallpracticeperformance";
import CustomTableMonthlyWorkspace from "@/components/organization/customtablemonthlyworkspace";
import CustomTableOperationalWorkspace from "@/components/organization/customtableoperationalworkspace";
import AgendaOperationalWorkspace from "@/components/organization/agendaoperationalworkspace";
import RuntimeNavigation from "@/components/runtime/shared/runtimenavigation";
import RuntimeOverview from "@/components/runtime/shared/runtimeoverview";

import { hasPermission } from "@/lib/auth/authorization";
import { loadRuntimeExecution } from "@/lib/runtime/runtimeexecution";
import { getOrganization } from "@/services/organization.service";
import { listUserManagementRecords } from "@/services/user.service";
import { loadDashboard } from "@/services/dashboard.service";

import {
  listCustomTables,
  listCustomTableColumns,
  listCustomTableMonths,
  loadCustomTableWorkspace,
  listCustomTableOperationalRows,
} from "@/services/customtableservice";

function OrgAdminReturnBar({
  organizationId,
  visible,
}: {
  organizationId: string;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 -mx-4 flex justify-end border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <a
        href={`/admin?organizationId=${encodeURIComponent(organizationId)}`}
        className="inline-flex items-center rounded-md bg-[#082550] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#123969] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082550] focus-visible:ring-offset-2"
      >
        Back to Org Admin Page
      </a>
    </div>
  );
}

interface RuntimePageProps {
  searchParams: Promise<{
    organizationId?: string;
    subjectId?: string;
    performanceMonth?: string;
    runtimeTab?: string;
  }>;
}

type MonthlyWorkspace = Awaited<
  ReturnType<typeof loadCustomTableWorkspace>
>;

type PersistentRows = Awaited<
  ReturnType<typeof listCustomTableOperationalRows>
>;

type TableColumns = Awaited<
  ReturnType<typeof listCustomTableColumns>
>;

interface OperationalTableResult {
  tableId: string;
  tableKey: string;
  tableName: string;
  persistenceMode: "monthly" | "current_state";
  columns: TableColumns;
  monthlyWorkspace: MonthlyWorkspace | null;
  persistentRows: PersistentRows;
  error: string | null;
}

function getCurrentPerformanceMonth(): string {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function toPerformanceMonthDate(month: string): string {
  if (/^\d{4}-\d{2}$/.test(month)) {
    return `${month}-01`;
  }

  return month;
}

function resolveRuntimeTabKey(table: {
  tableKey: string;
  runtimeTabKey?: string | null;
}): string {
  return table.runtimeTabKey?.trim() || table.tableKey;
}

function isAgendaTable(tableKey: string): boolean {
  const normalizedKey = tableKey.trim().toLowerCase();

  return (
    normalizedKey === "agenda" ||
    normalizedKey === "meeting-agenda"
  );
}

function isIndieOrthoOrganization(companyName: string): boolean {
  return companyName.trim().toLowerCase() === "indie ortho";
}

function formatPracticeMetricValue(
  value: unknown,
  measurementType: string | undefined
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  if (measurementType === "financial") {
    const numericText = text.replace(/^\$/, "").replace(/,/g, "").trim();
    const numericValue = Number(numericText);
    if (Number.isFinite(numericValue)) {
      return `$${numericValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return text.startsWith("$") ? text : `$${text}`;
  }

  if (measurementType === "percentage") {
    return text.endsWith("%") ? text : `${text}%`;
  }

  return text;
}

function getPracticeMetricKey(
  title: string
): PracticePerformanceMetric["key"] | null {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle === "total net production") {
    return "production";
  }

  if (normalizedTitle === "total net collections") {
    return "collections";
  }

  if (normalizedTitle === "# of starts") {
    return "starts";
  }

  if (normalizedTitle === "# of same day starts") {
    return "same-day-starts";
  }

  return null;
}

async function loadOperationalTableResult(
  organizationId: string,
  table: {
    id: string;
    tableKey: string;
    name: string;
    persistenceMode: "monthly" | "current_state";
  },
  performanceMonthDate: string,
  canEditRows: boolean
): Promise<OperationalTableResult> {
  try {
    if (table.persistenceMode === "current_state") {
      const [columns, persistentRows] = await Promise.all([
        listCustomTableColumns(organizationId, table.id),
        listCustomTableOperationalRows(organizationId, table.id),
      ]);

      return {
        tableId: table.id,
        tableKey: table.tableKey,
        tableName: table.name,
        persistenceMode: "current_state",
        columns,
        monthlyWorkspace: null,
        persistentRows,
        error: null,
      };
    }

    const months = await listCustomTableMonths(
      organizationId,
      table.id
    );

    const monthExists = months.some(
      (month) => month.performanceMonth === performanceMonthDate
    );

    if (!monthExists && !canEditRows) {
      return {
        tableId: table.id,
        tableKey: table.tableKey,
        tableName: table.name,
        persistenceMode: "monthly",
        columns: [],
        monthlyWorkspace: null,
        persistentRows: [],
        error:
          "There is no workspace for this month yet. You need row-edit permission to create one.",
      };
    }

    const monthlyWorkspace = await loadCustomTableWorkspace(
      organizationId,
      table.id,
      performanceMonthDate
    );

    return {
      tableId: table.id,
      tableKey: table.tableKey,
      tableName: table.name,
      persistenceMode: "monthly",
      columns: monthlyWorkspace.columns,
      monthlyWorkspace,
      persistentRows: [],
      error: null,
    };
  } catch (error) {
    return {
      tableId: table.id,
      tableKey: table.tableKey,
      tableName: table.name,
      persistenceMode: table.persistenceMode,
      columns: [],
      monthlyWorkspace: null,
      persistentRows: [],
      error:
        error instanceof Error
          ? error.message
          : "The operational workspace could not be loaded.",
    };
  }
}

export default async function RuntimePage({
  searchParams,
}: RuntimePageProps) {
  const params = await searchParams;

  /* ========================================================
     Organization
  ======================================================== */

  const organizationId = params.organizationId?.trim();

  if (!organizationId) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Organization ID required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Runtime requires an explicit organization ID. Please
          return to your organization entry point and try again.
        </p>
      </main>
    );
  }

  const organization = await getOrganization(organizationId);

  if (!organization || organization.id !== organizationId) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Organization not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested organization could not be found. Runtime
          will not switch to another organization automatically.
        </p>
      </main>
    );
  }

  /* ========================================================
     Admin Return Navigation Permission
  ======================================================== */

  let canReturnToOrgAdmin = false;

  try {
    canReturnToOrgAdmin = await hasPermission(
      organization.id,
      "users.create"
    );
  } catch (error) {
    console.error(
      "Unable to determine Organization Admin navigation permission:",
      error
    );
  }

  /* ========================================================
     Organization Runtime Branding
  ======================================================== */

  const runtimePrimaryColor =
    organization.primary_color || "#082550";

  const runtimeAccentColor =
    organization.secondary_color || "#E26D5C";

  const runtimeBrandStyle = {
    "--primary": runtimePrimaryColor,
    "--accent": runtimeAccentColor,
    "--color-primary": runtimePrimaryColor,
    "--color-accent": runtimeAccentColor,
    "--primary-foreground": "#FFFFFF",
    "--accent-foreground": "#FFFFFF",
    "--ring": runtimePrimaryColor,
  } as CSSProperties;

  /* ========================================================
     Performance Month
  ======================================================== */

  const performanceMonth =
    params.performanceMonth || getCurrentPerformanceMonth();

  const performanceMonthDate =
    toPerformanceMonthDate(performanceMonth);

  /* ========================================================
     Organization Members and Dashboard
  ======================================================== */

  const [members, dashboard] = await Promise.all([
    listUserManagementRecords(organization.id),
    loadDashboard(organization.id),
  ]);

  const activeMembers = members.filter(
    (record) => record.user.is_active !== false
  );

  /* ========================================================
     Custom Tables and Runtime Navigation
  ======================================================== */

  let customTables: Awaited<
    ReturnType<typeof listCustomTables>
  > = [];

  let canViewCustomTables = false;
  let canEditCustomTableRows = false;

  try {
    [canViewCustomTables, canEditCustomTableRows] =
      await Promise.all([
        hasPermission(
          organization.id,
          "custom_tables.view"
        ),
        hasPermission(
          organization.id,
          "custom_tables.rows.edit"
        ),
      ]);

    if (canViewCustomTables) {
      const organizationTables = await listCustomTables(
        organization.id
      );

      customTables = organizationTables.filter(
        (table) => table.isEnabled
      );
    }
  } catch (error) {
    console.error(
      "Unable to load Runtime Custom Tables:",
      error
    );

    customTables = [];
    canViewCustomTables = false;
    canEditCustomTableRows = false;
  }

  const operationalTables = customTables.map((table) => ({
    id: table.id,
    tableKey: table.tableKey,
    runtimeTabKey: resolveRuntimeTabKey(table),
    name: table.name,
  }));

  const runtimeNavigationProps = {
    organizationId: organization.id,
    members: activeMembers,
    performanceMonth,
    performanceMonths: [performanceMonth],
    operationalTables,
  };

  /* ========================================================
     Operational Custom Table Workspace
  ======================================================== */

  if (params.runtimeTab) {
    const requestedRuntimeTab = params.runtimeTab.trim();

    const selectedTable = customTables.find(
      (table) =>
        resolveRuntimeTabKey(table) === requestedRuntimeTab ||
        table.tableKey === requestedRuntimeTab ||
        table.id === requestedRuntimeTab
    );

    const resolvedRuntimeTabKey = selectedTable
      ? resolveRuntimeTabKey(selectedTable)
      : requestedRuntimeTab;

    const selectedTables = selectedTable
      ? customTables.filter(
          (table) =>
            resolveRuntimeTabKey(table) ===
            resolvedRuntimeTabKey
        )
      : [];

    /* ========================================================
       Indie Ortho Overall Practice

       This tenant-specific view is enabled only through the
       organization's enabled Custom Table configuration.
       It reads Amy's existing monthly Runtime Key Results.
    ======================================================== */

    if (
      isIndieOrthoOrganization(organization.company_name) &&
      requestedRuntimeTab === "overall-practice-performance" &&
      canViewCustomTables &&
      selectedTables.length > 0
    ) {
      const amyRecord = activeMembers.find((record) => {
        const displayName =
          record.user.display_name?.trim().toLowerCase();

        const fullName =
          `${record.user.first_name} ${record.user.last_name}`
            .trim()
            .toLowerCase();

        return (
          displayName === "amy" ||
          fullName === "amy" ||
          displayName?.startsWith("amy ") === true ||
          fullName.startsWith("amy ")
        );
      });

      const amyExecution = amyRecord
        ? await loadRuntimeExecution(
            organization.id,
            amyRecord.user.id,
            performanceMonth
          )
        : null;

      const desiredKeys = new Set<
        PracticePerformanceMetric["key"]
      >([
        "production",
        "collections",
        "starts",
        "same-day-starts",
      ]);

      const metrics: PracticePerformanceMetric[] = [];
      const matchedKeys = new Set<
        PracticePerformanceMetric["key"]
      >();

      if (amyExecution) {
        for (const objective of amyExecution.objectives) {
          for (const keyResult of objective.keyResults) {
            const metricKey = getPracticeMetricKey(
              keyResult.title
            );

            if (
              !metricKey ||
              !desiredKeys.has(metricKey) ||
              matchedKeys.has(metricKey)
            ) {
              continue;
            }

            const progress =
              amyExecution.keyResultProgress.find(
                (item) =>
                  item.performanceInstanceKeyResultId ===
                  keyResult.id
              );

            const previousValue = keyResult.sourceKeyResultId
              ? amyExecution.previousKeyResultValues[
                  keyResult.sourceKeyResultId
                ]
              : undefined;

            metrics.push({
              key: metricKey,
              title: keyResult.title,
              lastMonth: formatPracticeMetricValue(
                previousValue,
                keyResult.measurementType
              ),
              target: formatPracticeMetricValue(
                keyResult.target,
                keyResult.measurementType
              ),
              thisMonth: formatPracticeMetricValue(
                progress?.currentValue,
                keyResult.measurementType
              ),
              score: progress?.score ?? null,
            });

            matchedKeys.add(metricKey);
          }
        }
      }

      const metricOrder: PracticePerformanceMetric["key"][] = [
        "production",
        "collections",
        "starts",
        "same-day-starts",
      ];

      const orderedMetrics = metricOrder.map((key) =>
        metrics.find((metric) => metric.key === key) ?? {
          key,
          title: {
            production: "TOTAL NET PRODUCTION",
            collections: "TOTAL NET COLLECTIONS",
            starts: "# OF STARTS",
            "same-day-starts": "# OF SAME DAY STARTS",
          }[key],
          lastMonth: "",
          target: "",
          thisMonth: "",
          score: null,
        }
      );

      /*
       * Keep the existing admin-return permission check and
       * RuntimeNavigation. The special dashboard is rendered
       * only for the enabled Indie Ortho Custom Table.
       */
      return (
        <main
          style={runtimeBrandStyle}
          className="ce-runtime-theme min-h-screen w-full bg-[#E3E5E8]"
        >
          <div className="relative z-50">
            <OrgAdminReturnBar
              organizationId={organization.id}
              visible={canReturnToOrgAdmin}
            />
          </div>

          <div className="relative z-30 border-b border-black/10 bg-white shadow-sm">
            <RuntimeNavigation
              {...runtimeNavigationProps}
              selectedSubjectId={params.subjectId}
              selectedRuntimeTab={resolvedRuntimeTabKey}
            />
          </div>

          <IndieOrthoOverallPracticePerformance
            organizationId={organization.id}
            performanceMonth={performanceMonth}
            indieOrthoLogoUrl={organization.logo_url}
            metrics={orderedMetrics}
          />
        </main>
      );
    }

    let workspaceMessage = "";
    let tableResults: OperationalTableResult[] = [];

    if (!canViewCustomTables) {
      workspaceMessage =
        "You do not have permission to view operational tables.";
    } else if (selectedTables.length === 0) {
      workspaceMessage =
        "This operational table is unavailable or has been disabled.";
    } else {
      tableResults = await Promise.all(
        selectedTables.map((table) =>
          loadOperationalTableResult(
            organization.id,
            {
              id: table.id,
              tableKey: table.tableKey,
              name: table.name,
              persistenceMode: table.persistenceMode,
            },
            performanceMonthDate,
            canEditCustomTableRows
          )
        )
      );
    }

    const hasMonthlyWorkspace = tableResults.some(
      (result) => result.monthlyWorkspace !== null
    );

    return (
      <main
        style={runtimeBrandStyle}
        className="
          ce-runtime-theme
          mx-auto
          min-h-screen
          w-full
          max-w-none
          space-y-8
          px-4
          py-6
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        <OrgAdminReturnBar
          organizationId={organization.id}
          visible={canReturnToOrgAdmin}
        />

        <div
          className={`sticky ${
            canReturnToOrgAdmin ? "top-[61px]" : "top-0"
          } z-40`}
        >
          <RuntimeNavigation
            {...runtimeNavigationProps}
            selectedSubjectId={params.subjectId}
            selectedRuntimeTab={resolvedRuntimeTabKey}
          />
        </div>

        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Operational Workspace
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {selectedTables.length > 1
              ? resolvedRuntimeTabKey
              : selectedTable?.name ?? "Custom Table"}
          </h1>

          {selectedTables.length === 1 &&
            selectedTables[0].description && (
              <p className="max-w-3xl text-sm text-muted-foreground">
                {selectedTables[0].description}
              </p>
            )}

          {selectedTables.some(
            (table) => table.persistenceMode === "monthly"
          ) && (
            <p className="text-sm text-muted-foreground">
              Performance month: {performanceMonth}
            </p>
          )}
        </section>

        {workspaceMessage ? (
          <section
            role="status"
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2 className="font-semibold text-gray-950">
              Workspace unavailable
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {workspaceMessage}
            </p>
          </section>
        ) : (
          <div className="space-y-8">
            {tableResults.map((result) => {
              if (result.error) {
                return (
                  <section
                    key={result.tableId}
                    role="status"
                    className="rounded-xl border border-gray-200 bg-white p-6"
                  >
                    <h2 className="font-semibold text-gray-950">
                      {result.tableName}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      {result.error}
                    </p>
                  </section>
                );
              }

              if (result.persistenceMode === "monthly") {
                if (!result.monthlyWorkspace) {
                  return null;
                }

                return (
                  <section
                    key={result.tableId}
                    className="space-y-3"
                  >
                    {selectedTables.length > 1 && (
                      <h2 className="text-xl font-semibold">
                        {result.tableName}
                      </h2>
                    )}

                    <CustomTableMonthlyWorkspace
                      organizationId={organization.id}
                      tableDefinitionId={result.tableId}
                      initialWorkspace={result.monthlyWorkspace}
                      canEditRows={canEditCustomTableRows}
                    />
                  </section>
                );
              }

              return (
                <section
                  key={result.tableId}
                  className="space-y-3"
                >
                  {selectedTables.length > 1 && (
                    <h2 className="text-xl font-semibold">
                      {result.tableName}
                    </h2>
                  )}

                  {isAgendaTable(result.tableKey) ? (
                    <AgendaOperationalWorkspace
                      organizationId={organization.id}
                      tableDefinitionId={result.tableId}
                      tableName={result.tableName}
                      initialRows={result.persistentRows}
                      canEditRows={canEditCustomTableRows}
                    />
                  ) : (
                    <CustomTableOperationalWorkspace
                      organizationId={organization.id}
                      tableDefinitionId={result.tableId}
                      tableName={result.tableName}
                      columns={result.columns}
                      initialRows={result.persistentRows}
                      canEditRows={canEditCustomTableRows}
                    />
                  )}
                </section>
              );
            })}
          </div>
        )}

        {hasMonthlyWorkspace && (
          <p className="text-xs text-muted-foreground">
            Monthly operational data remains associated with its
            selected performance month.
          </p>
        )}
      </main>
    );
  }

  /* ========================================================
     Organization Dashboard
  ======================================================== */

  if (!params.subjectId) {
    return (
      <main
        style={runtimeBrandStyle}
        className="
          ce-runtime-theme
          mx-auto
          w-full
          max-w-[1500px]
          space-y-8
          px-4
          py-6
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        <OrgAdminReturnBar
          organizationId={organization.id}
          visible={canReturnToOrgAdmin}
        />

        <RuntimeNavigation {...runtimeNavigationProps} />

        <RuntimeOverview dashboard={dashboard} />
      </main>
    );
  }

  /* ========================================================
     Selected Member Runtime
  ======================================================== */

  const runtimeExecution = await loadRuntimeExecution(
    organization.id,
    params.subjectId,
    performanceMonth
  );

  /* ========================================================
     Runtime Execution Required
  ======================================================== */

  if (!runtimeExecution) {
    return (
      <main
        style={runtimeBrandStyle}
        className="
          ce-runtime-theme
          min-h-screen
          bg-background
        "
      >
        <OrgAdminReturnBar
          organizationId={organization.id}
          visible={canReturnToOrgAdmin}
        />

        <RuntimeNavigation
          {...runtimeNavigationProps}
          selectedSubjectId={params.subjectId}
        />

        <div className="mx-auto max-w-5xl p-8">
          <h1 className="text-2xl font-semibold">
            Performance Sheet not available
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Runtime could not create or load the Performance
            Sheet for this member and performance month.
          </p>

          <div className="mt-6 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-medium">Member:</span>{" "}
                {params.subjectId}
              </div>

              <div>
                <span className="font-medium">
                  Performance Month:
                </span>{" "}
                {performanceMonth}
              </div>

              <div>
                <span className="font-medium">
                  Organization:
                </span>{" "}
                {organization.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     Member Performance Sheet

     PerformanceSheet owns its existing Runtime navigation.
  ======================================================== */

  return (
    <div
      style={runtimeBrandStyle}
      className="ce-runtime-theme min-h-screen"
    >
      <OrgAdminReturnBar
        organizationId={organization.id}
        visible={canReturnToOrgAdmin}
      />

      <PerformanceSheet
        document={runtimeExecution.performanceSheet.document}
        objectives={runtimeExecution.objectives}
        keyResultProgress={runtimeExecution.keyResultProgress}
        organizationId={organization.id}
        organization={organization}
        performanceInstanceId={
          runtimeExecution.performanceInstance.id
        }
        performanceInstance={runtimeExecution.performanceInstance}
        subject={runtimeExecution.subject}
        members={activeMembers}
        dashboard={dashboard}
        previousKeyResultValues={
          runtimeExecution.previousKeyResultValues
        }
        performanceMonths={runtimeExecution.performanceMonths}
        operationalTables={operationalTables}
      />
    </div>
  );
}