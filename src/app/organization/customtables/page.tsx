import Link from "next/link";

import CustomTablesWorkspace from "@/components/organization/customtablesworkspace";
import CustomTableCreateForm from "@/components/organization/customtablecreateform";
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
              Manage reusable operational tables for your
              organization. Configure table columns, control
              Runtime availability, and organize operational
              records without changing the existing OKR system.
            </p>
          </header>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-amber-950">
              Organization context required
            </h2>

            <p className="mt-2 text-sm text-amber-900">
              Select an organization from the main workspace
              before managing its Custom Tables.
            </p>

            <Link
              href="/organization"
              className="mt-4 inline-flex rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
            >
              Return to Organization Workspace
            </Link>
          </section>
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
              Manage reusable operational tables for your
              organization. Configure table columns, control
              Runtime availability, and organize operational
              records without changing the existing OKR system.
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
                Table Administration
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Operational Tables
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Create and configure reusable tables for
                Recruitment, Agenda, VA List, Client Performance,
                and future operational workflows.
              </p>
            </div>

            <span className="w-fit rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              Organization-scoped
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Table Definitions
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Define table names, descriptions, columns,
                field types, and configuration.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Runtime Availability
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Control which enabled operational tables are
                available through the existing Runtime
                navigation.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-950">
                Monthly Records
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Maintain month-specific records, preserve
                historical data, and carry eligible open records
                into a new month.
              </p>
            </div>
          </div>
        </section>

        {canManage && (
          <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:p-7">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Configuration
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Create a Custom Table
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Add a reusable operational table for this
                organization. You can configure its columns
                after creation.
              </p>
            </div>

            <CustomTableCreateForm
              organizationId={organizationId}
            />
          </section>
        )}

        <CustomTablesWorkspace
          organizationId={organizationId}
          tables={tables}
          canManage={canManage}
        />
      </div>
    </main>
  );
}