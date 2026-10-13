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
      <main className="min-h-screen bg-[#E9F4F8] px-6 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#272D2C]">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#082550]">
              CUSTOM TABLES
            </h1>

            <p className="mt-2 max-w-3xl text-[#272D2C]">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </header>

          <section className="rounded-2xl border border-[#B4C2D1] border-l-4 border-l-[#E26D5C] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#082550]">
              Organization context required
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#272D2C]">
              Select an organization from the main workspace before
              accessing its Custom Tables.
            </p>

            <Link
              href="/organization"
              className="mt-4 inline-flex rounded-lg bg-[#E26D5C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#cf5d4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082550] focus-visible:ring-offset-2"
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
    <main className="min-h-screen bg-[#E9F4F8] px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#272D2C]">
              Organization Administration
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#082550]">
              CUSTOM TABLES
            </h1>

            <p className="mt-2 max-w-3xl leading-6 text-[#272D2C]">
              Access the operational tables provisioned for your
              organization. Manage table availability and work with
              monthly operational records without changing the
              existing OKR system.
            </p>
          </div>

          <Link
            href="/organization"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#B4C2D1] bg-white px-4 py-2 text-sm font-semibold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082550] focus-visible:ring-offset-2"
          >
            Back to Organization Workspace
          </Link>
        </header>

        {/* Provisioning Overview */}

        <section className="rounded-2xl border border-[#B4C2D1] border-t-4 border-t-[#082550] bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#272D2C]">
                Organization Operations
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#082550]">
                PROVISIONED OPERATIONAL TABLES
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]">
                This workspace displays the Custom Tables provisioned
                for the selected organization. Table definitions and
                column configurations are managed by authorized
                CascadEffects platform personnel.
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-lg border border-[#B4C2D1] bg-[#E9F4F8] px-3 py-2 text-xs font-semibold text-[#082550]">
              Organization-scoped
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] p-5">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#082550]" />

              <h3 className="font-semibold text-[#082550]">
                PROVISIONED TABLES
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#272D2C]">
                Access the operational tables assigned to this
                organization. Other organizations may have different
                tables and configurations.
              </p>
            </div>

            <div className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] p-5">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#082550]" />

              <h3 className="font-semibold text-[#082550]">
                RUNTIME AVAILABILITY
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#272D2C]">
                Authorized organization administrators can manage
                availability for provisioned tables. Table
                provisioning and column configuration remain
                restricted to CascadEffects platform personnel.
              </p>
            </div>

            <div className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] p-5">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#E26D5C]" />

              <h3 className="font-semibold text-[#082550]">
                MONTHLY RECORDS
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#272D2C]">
                Work with month-specific operational records while
                preserving historical records and eligible
                carry-forward data.
              </p>
            </div>
          </div>
        </section>

        {/* Empty State */}

        {tables.length === 0 && (
          <section className="rounded-2xl border border-[#B4C2D1] border-l-4 border-l-[#E26D5C] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#082550]">
              NO OPERATIONAL TABLES HAVE BEEN PROVISIONED
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]">
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

        {/* Floating Help Panel */}

        <CustomTablesHelpPanel />
      </div>
    </main>
  );
}

function CustomTablesHelpPanel() {
  return (
    <aside
      aria-labelledby="custom-tables-help-title"
      className="fixed bottom-5 right-5 z-40 w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-[#B4C2D1] bg-[#082550] text-white shadow-xl"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Floater Icon */}

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
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
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B4C2D1]">
            Custom Tables Support
          </p>

          <h2
            id="custom-tables-help-title"
            className="mt-1 text-xs font-bold uppercase leading-5 text-white"
          >
            NEED HELP WITH CUSTOM TABLES?
          </h2>

          <p className="mt-2 text-xs leading-[1.4rem] text-[#E9F4F8]">
            Need a table enabled, a missing table provisioned, or a
            column configuration changed? Contact CascadEffects IT
            for assistance.
          </p>

          <a
            href="mailto:mario@cascadeffects.com"
            className="mt-2 inline-block break-all text-xs font-semibold text-white underline decoration-[#B4C2D1] underline-offset-2 transition hover:text-[#E26D5C]"
          >
            mario@cascadeffects.com
          </a>

          <Link
            href="/organization"
            className="mt-3 block text-xs font-semibold text-white transition hover:text-[#E26D5C]"
          >
            Return to Organization Workspace →
          </Link>
        </div>
      </div>
    </aside>
  );
}