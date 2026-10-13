import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCustomTable,
  listCustomTableColumns,
  listCustomTableMonths,
  listCustomTableOperationalRows,
  loadCustomTableWorkspace,
} from "@/services/customtableservice";

import { hasPermission } from "@/lib/auth/authorization";

import CustomTableColumnManager from "@/components/organization/customtablecolumnmanager";
import CustomTableMonthlyWorkspace from "@/components/organization/customtablemonthlyworkspace";
import CustomTableOperationalWorkspace from "@/components/organization/customtableoperationalworkspace";

type CustomTableConfigurationPageProps = {
  params: Promise<{
    tableId: string;
  }>;
  searchParams: Promise<{
    organizationId?: string;
    performanceMonth?: string;
  }>;
};

function getCurrentPerformanceMonth(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-01`;
}

function normalizePerformanceMonth(
  value: string | undefined
): string {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return getCurrentPerformanceMonth();
  }

  return `${value}-01`;
}

export default async function CustomTableConfigurationPage({
  params,
  searchParams,
}: CustomTableConfigurationPageProps) {
  const [{ tableId }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const organizationId = query.organizationId?.trim();
  const normalizedTableId = tableId?.trim();

  if (!organizationId || !normalizedTableId) {
    notFound();
  }

  const table = await getCustomTable(
    organizationId,
    normalizedTableId
  );

  if (!table) {
    notFound();
  }

  const [columns, canEditRows] = await Promise.all([
    listCustomTableColumns(organizationId, table.id),
    hasPermission(organizationId, "custom_tables.rows.edit"),
  ]);

  const workspaceHref =
    `/organization/customtables?organizationId=${encodeURIComponent(
      organizationId
    )}`;

  const performanceMonth = normalizePerformanceMonth(
    query.performanceMonth
  );

  let monthlyWorkspace = null;
  let operationalRows: Awaited<
    ReturnType<typeof listCustomTableOperationalRows>
  > = [];

  let workspaceUnavailableReason:
    | "disabled"
    | "missing-month"
    | null = null;

  if (!table.isEnabled) {
    workspaceUnavailableReason = "disabled";
  } else if (table.persistenceMode === "current_state") {
    operationalRows = await listCustomTableOperationalRows(
      organizationId,
      table.id
    );
  } else {
    const existingMonths = await listCustomTableMonths(
      organizationId,
      table.id
    );

    const monthExists = existingMonths.some(
      (month) => month.performanceMonth === performanceMonth
    );

    if (monthExists || canEditRows) {
      monthlyWorkspace = await loadCustomTableWorkspace(
        organizationId,
        table.id,
        performanceMonth
      );
    } else {
      workspaceUnavailableReason = "missing-month";
    }
  }

  const isCurrentStateTable =
    table.persistenceMode === "current_state";

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={workspaceHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
            >
              <span aria-hidden="true">←</span>
              Back to Custom Tables
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Organization Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {table.name}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              {table.description ||
                (isCurrentStateTable
                  ? "Review this provisioned operational table and manage its persistent records according to your permissions."
                  : "Review this provisioned operational table and manage its monthly records according to your permissions.")}
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              table.isEnabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                table.isEnabled
                  ? "bg-green-600"
                  : "bg-gray-500"
              }`}
            />

            {table.isEnabled ? "Enabled" : "Disabled"}
          </span>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            label="Table Key"
            value={table.tableKey}
            description="Stable application identifier"
          />

          <InfoCard
            label="Configured Columns"
            value={String(columns.length)}
            description="Fields provisioned for this table"
          />

          <InfoCard
            label="Persistence Mode"
            value={
              isCurrentStateTable
                ? "Current State"
                : "Monthly"
            }
            description={
              isCurrentStateTable
                ? "Records persist in one operational list"
                : "Records are organized by performance month"
            }
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-950">
              Configured Fields
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the fields provisioned for this table. Table
              definitions and column configuration are managed by
              authorized CascadEffects platform personnel.
            </p>
          </div>

          <div className="mt-6">
            <CustomTableColumnManager
              organizationId={organizationId}
              tableDefinitionId={table.id}
              columns={columns}
              canManage={false}
            />
          </div>
        </section>

        {!table.isEnabled ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-amber-900">
              Workspace Unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              This Custom Table is disabled. It must be enabled
              before its operational records can be accessed through
              this workspace.
            </p>
          </section>
        ) : isCurrentStateTable ? (
          <CustomTableOperationalWorkspace
            organizationId={organizationId}
            tableDefinitionId={table.id}
            tableName={table.name}
            columns={columns}
            initialRows={operationalRows}
            canEditRows={canEditRows}
          />
        ) : monthlyWorkspace ? (
          <CustomTableMonthlyWorkspace
            organizationId={organizationId}
            tableDefinitionId={table.id}
            initialWorkspace={monthlyWorkspace}
            canEditRows={canEditRows}
          />
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-950">
              No Monthly Records Yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              There are no records for{" "}
              {performanceMonth.slice(0, 7)}. A user with permission
              to edit operational records can initialize this month.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-semibold text-gray-950">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}