import Link from "next/link";

import CustomTablesWorkspace from "@/components/organization/customtablesworkspace";
import { hasPermission } from "@/lib/auth/authorization";
import {
  listCustomTables,
  listCustomTableColumns,
} from "@/services/customtableservice";
import type { CustomTableListItem } from "@/lib/types/domain/customtable";

type OrganizationCustomTablesPageProps = {
  searchParams: Promise<{
    organizationId?: string;
  }>;
};

export default async function OrganizationCustomTablesPage({
  searchParams,
}: OrganizationCustomTablesPageProps) {
  const query = await searchParams;
  const organizationId = query.organizationId?.trim();

  if (!organizationId) {
    return (
      <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
              Custom Tables
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </header>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-amber-950">
              Organization context required
            </h2>

            <p className="mt-2 text-sm text-amber-900">
              Select an organization from the main workspace before
              accessing its Custom Tables.
            </p>

            <Link
              href="/organization"
              className="mt-4 inline-flex rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
            >
              Return to Organization Workspace
            </Link>
          </section>

          <CustomTablesHelpPanel />
        </div>
      </main>
    );
  }

  const [definitions, canManage] = await Promise.all([
    listCustomTables(organizationId),
    hasPermission(organizationId, "custom_tables.manage"),
  ]);

  const tables: CustomTableListItem[] = await Promise.all(
    definitions.map(async (definition) => {
      const columns = await listCustomTableColumns(
        organizationId,
        definition.id
      );

      return {
        id: definition.id,
        organizationId: definition.organizationId,
        tableKey: definition.tableKey,
        name: definition.name,
        description: definition.description,
        runtimeTabKey: definition.runtimeTabKey,
        isEnabled: definition.isEnabled,
        columnCount: columns.length,
      };
    })
  );

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
              Custom Tables
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </div>

          <Link
            href="/organization"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            Back to Organization Workspace
          </Link>
        </header>

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Operations
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Provisioned Operational Tables
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                This workspace displays the Custom Tables provisioned
                for the selected organization. Table definitions and
                column configurations are managed by authorized
                CascadEffects platform personnel.
              </p>
            </div>

            <span className="w-fit rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              Organization-scoped
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Provisioned Tables
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Access the operational tables assigned to this
                organization. Other organizations may have different
                tables and configurations.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Runtime Availability
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Authorized organization administrators can manage
                availability for provisioned tables. Table
                provisioning and column configuration remain
                restricted to CascadEffects platform personnel.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Monthly Records
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Work with month-specific operational records while
                preserving historical records and eligible
                carry-forward data.
              </p>
            </div>
          </div>
        </section>

        {tables.length === 0 && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-lg font-semibold text-blue-950">
              No operational tables have been provisioned
            </h2>

            <p className="mt-2 max-w-3xl text-sm text-blue-900">
              There are currently no Custom Tables assigned to this
              organization. Please contact your CascadEffects IT
              administrator to request provisioning of the required
              operational tables.
            </p>
          </section>
        )}

        <CustomTablesWorkspace
          organizationId={organizationId}
          tables={tables}
          canManage={canManage}
        />

        <CustomTablesHelpPanel />
      </div>
    </main>
  );
}

function CustomTablesHelpPanel() {
  return (
    <aside
      aria-labelledby="custom-tables-help-title"
      className="fixed bottom-5 right-5 z-40 w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-gray-300 bg-white shadow-xl"
    >
      <div className="flex items-start gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              d="M9.6 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5M12 17h.01"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="custom-tables-help-title"
            className="text-sm font-semibold text-gray-950"
          >
            Need help with Custom Tables?
          </h2>

          <p className="mt-2 text-sm leading-5 text-gray-600">
            Use this workspace to access provisioned operational
            tables and manage their Runtime availability.
          </p>

          <div className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">
                Missing a table?
              </span>{" "}
              Contact your CascadEffects IT administrator to request
              provisioning.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                Need a column or configuration change?
              </span>{" "}
              These changes are handled by authorized CascadEffects
              platform personnel.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                Working with historical records?
              </span>{" "}
              Select the relevant month within the operational table
              to review its monthly workspace.
            </p>
          </div>

          <Link
            href="/organization"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            Return to Organization Workspace
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}