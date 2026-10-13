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
      <main className="min-h-screen bg-slate-100 px-6 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0b2347]">
              Custom Tables
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </header>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-950">
              Organization context required
            </h2>

            <p className="mt-2 text-sm text-amber-900">
              Select an organization from the main workspace before
              accessing its Custom Tables.
            </p>

            <Link
              href="/organization"
              className="mt-4 inline-flex rounded-lg border border-[#0b2347] bg-[#0b2347] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163b6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2347] focus-visible:ring-offset-2"
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
    <main className="min-h-screen bg-slate-100 px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0b2347]">
              Custom Tables
            </h1>

            <p className="mt-2 max-w-3xl leading-6 text-slate-600">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </div>

          <Link
            href="/organization"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#0b2347] shadow-sm transition hover:border-[#0b2347] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2347] focus-visible:ring-offset-2"
          >
            Back to Organization Workspace
          </Link>
        </header>

        {/* Provisioning Overview */}

        <section className="rounded-2xl border border-slate-200 border-t-4 border-t-[#0b2347] bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Organization Operations
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0b2347]">
                Provisioned Operational Tables
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                This workspace displays the Custom Tables provisioned
                for the selected organization. Table definitions and
                column configurations are managed by authorized
                CascadEffects platform personnel.
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-lg border border-[#cbd5e1] bg-slate-100 px-3 py-2 text-xs font-semibold text-[#0b2347]">
              Organization-scoped
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-[#94a3b8]">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#0b2347]" />

              <h3 className="font-semibold text-[#0b2347]">
                Provisioned Tables
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Access the operational tables assigned to this
                organization. Other organizations may have different
                tables and configurations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-[#94a3b8]">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#244b78]" />

              <h3 className="font-semibold text-[#0b2347]">
                Runtime Availability
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Authorized organization administrators can manage
                availability for provisioned tables. Table
                provisioning and column configuration remain
                restricted to CascadEffects platform personnel.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-[#94a3b8]">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#64748b]" />

              <h3 className="font-semibold text-[#0b2347]">
                Monthly Records
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Work with month-specific operational records while
                preserving historical records and eligible
                carry-forward data.
              </p>
            </div>
          </div>
        </section>

        {/* Empty State */}

        {tables.length === 0 && (
          <section className="rounded-2xl border border-[#cbd5e1] border-l-4 border-l-[#0b2347] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0b2347]">
              No operational tables have been provisioned
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              There are currently no Custom Tables assigned to this
              organization. Please contact your CascadEffects IT
              administrator to request provisioning of the required
              operational tables.
            </p>
          </section>
        )}

        {/* Existing Table Workspace */}

        <CustomTablesWorkspace
          organizationId={organizationId}
          tables={tables}
          canManage={canManage}
        />

        {/* Help Panel */}

        <CustomTablesHelpPanel />
      </div>
    </main>
  );
}

function CustomTablesHelpPanel() {
  return (
    <aside
      aria-labelledby="custom-tables-help-title"
      className="fixed bottom-5 right-5 z-40 w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-slate-200 border-t-4 border-t-[#0b2347] bg-white shadow-xl"
    >
      <div className="flex items-start gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b2347] text-white">
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
            className="text-sm font-bold text-[#0b2347]"
          >
            Need help with Custom Tables?
          </h2>

          <p className="mt-2 text-sm leading-5 text-slate-600">
            Use this workspace to access provisioned operational
            tables and manage their Runtime availability.
          </p>

          <div className="mt-3 space-y-3 text-xs leading-5 text-slate-600">
            <p>
              <span className="font-semibold text-[#0b2347]">
                Missing a table?
              </span>{" "}
              Contact your CascadEffects IT administrator to request
              provisioning.
            </p>

            <p>
              <span className="font-semibold text-[#0b2347]">
                Need a column or configuration change?
              </span>{" "}
              These changes are handled by authorized CascadEffects
              platform personnel.
            </p>

            <p>
              <span className="font-semibold text-[#0b2347]">
                Working with historical records?
              </span>{" "}
              Select the relevant month within the operational table
              to review its monthly workspace.
            </p>
          </div>

          <Link
            href="/organization"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0b2347] transition hover:text-[#315b8c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2347] focus-visible:ring-offset-2"
          >
            Return to Organization Workspace
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}