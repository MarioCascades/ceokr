import type { CSSProperties } from "react";

import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";
import CustomTableMonthlyWorkspace from "@/components/organization/customtablemonthlyworkspace";
import RuntimeNavigation from "@/components/runtime/shared/runtimenavigation";
import RuntimeOverview from "@/components/runtime/shared/runtimeoverview";

import {
  hasPermission,
} from "@/lib/auth/authorization";

import {
  loadRuntimeExecution,
} from "@/lib/runtime/runtimeexecution";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

import {
  loadDashboard,
} from "@/services/dashboard.service";

import {
  listCustomTables,
  listCustomTableMonths,
  loadCustomTableWorkspace,
} from "@/services/customtableservice";

interface RuntimePageProps {
  searchParams: Promise<{
    organizationId?: string;
    subjectId?: string;
    performanceMonth?: string;
    runtimeTab?: string;
  }>;
}

function getCurrentPerformanceMonth(): string {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

function toPerformanceMonthDate(
  month: string
): string {
  if (/^\d{4}-\d{2}$/.test(month)) {
    return `${month}-01`;
  }

  return month;
}

export default async function RuntimePage({
  searchParams,
}: RuntimePageProps) {
  const params = await searchParams;

  /* ========================================================
     Organization
  ======================================================== */

  const organization = await getOrganization(
    params.organizationId
  );

  if (!organization) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Organization not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested organization could not be found.
        </p>
      </main>
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
    params.performanceMonth ||
    getCurrentPerformanceMonth();

  const performanceMonthDate =
    toPerformanceMonthDate(performanceMonth);

  /* ========================================================
     Organization Members + Dashboard
  ======================================================== */

  const [
    members,
    dashboard,
  ] = await Promise.all([
    listUserManagementRecords(
      organization.id
    ),
    loadDashboard(
      organization.id
    ),
  ]);

  const activeMembers = members.filter(
    (record) =>
      record.user.is_active !== false
  );

  /* ========================================================
     Custom Tables and Runtime Navigation

     Load enabled Custom Tables for the existing Runtime
     navigation, including on the Dashboard and Member views.

     Table visibility in Runtime is governed by isEnabled.
     Viewing tables and editing rows remain permission-based.
  ======================================================== */

  let customTables: Awaited<
    ReturnType<typeof listCustomTables>
  > = [];

  let canViewCustomTables = false;
  let canEditCustomTableRows = false;

  try {
    canViewCustomTables = await hasPermission(
      organization.id,
      "custom_tables.view"
    );

    canEditCustomTableRows = await hasPermission(
      organization.id,
      "custom_tables.rows.edit"
    );

    if (canViewCustomTables) {
      const organizationTables =
        await listCustomTables(
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

  const operationalTables =
    customTables.map(
      (table) => ({
        id: table.id,
        tableKey: table.tableKey,
        runtimeTabKey:
          table.runtimeTabKey ||
          table.tableKey,
        name: table.name,
      })
    );

  const runtimeNavigationProps = {
    organizationId: organization.id,
    members: activeMembers,
    performanceMonth,
    performanceMonths: [performanceMonth],
    operationalTables,
  };

  /* ========================================================
     Operational Custom Table Workspace

     A Runtime operational tab is resolved against enabled
     tables available to the current user.

     View-only users may access an existing monthly workspace.
     Creating a missing month requires row-edit permission.
  ======================================================== */

  if (params.runtimeTab) {
    const selectedTable = customTables.find(
      (table) =>
        table.runtimeTabKey ===
          params.runtimeTab ||
        table.tableKey ===
          params.runtimeTab ||
        table.id ===
          params.runtimeTab
    );

    let workspace = null;
    let workspaceMessage = "";

    if (!canViewCustomTables) {
      workspaceMessage =
        "You do not have permission to view operational tables.";
    } else if (!selectedTable) {
      workspaceMessage =
        "This operational table is unavailable or has been disabled.";
    } else {
      try {
        const months = await listCustomTableMonths(
          organization.id,
          selectedTable.id
        );

        const monthExists = months.some(
          (month) =>
            month.performanceMonth ===
            performanceMonthDate
        );

        if (
          monthExists ||
          canEditCustomTableRows
        ) {
          workspace = await loadCustomTableWorkspace(
            organization.id,
            selectedTable.id,
            performanceMonthDate
          );
        } else {
          workspaceMessage =
            "There is no workspace for this month yet. You need row-edit permission to create one.";
        }
      } catch (error) {
        workspaceMessage =
          error instanceof Error
            ? error.message
            : "The operational workspace could not be loaded.";
      }
    }

    return (
      <main
        style={runtimeBrandStyle}
        className="
          ce-runtime-theme
          mx-auto
          min-h-screen
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
        <RuntimeNavigation
          {...runtimeNavigationProps}
          selectedSubjectId={
            params.subjectId
          }
          selectedRuntimeTab={
            selectedTable
              ? selectedTable.runtimeTabKey ||
                selectedTable.tableKey
              : params.runtimeTab
          }
        />

        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Operational Workspace
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {selectedTable?.name ?? "Custom Table"}
          </h1>

          {selectedTable?.description && (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {selectedTable.description}
            </p>
          )}
        </section>

        {workspace && selectedTable ? (
          <CustomTableMonthlyWorkspace
            organizationId={organization.id}
            tableDefinitionId={selectedTable.id}
            initialWorkspace={workspace}
            canEditRows={canEditCustomTableRows}
          />
        ) : (
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
        )}
      </main>
    );
  }

  /* ========================================================
     Organization Dashboard

     The Dashboard remains available before a member is
     selected. Operational tabs are supplied to the same
     Runtime navigation component.
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
        <RuntimeNavigation
          {...runtimeNavigationProps}
        />

        <RuntimeOverview
          dashboard={dashboard}
        />
      </main>
    );
  }

  /* ========================================================
     Selected Member Runtime

     Runtime Execution remains the source of truth for the
     member Performance Sheet. The legacy Member OKR page is
     intentionally not used as a fallback.
  ======================================================== */

  const runtimeExecution =
    await loadRuntimeExecution(
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
        <RuntimeNavigation
          {...runtimeNavigationProps}
          selectedSubjectId={
            params.subjectId
          }
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
                <span className="font-medium">
                  Member:
                </span>{" "}
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

     PerformanceSheet currently owns its Runtime navigation.
     Keep the existing single-navigation behavior here.
  ======================================================== */

  return (
    <div
      style={runtimeBrandStyle}
      className="ce-runtime-theme min-h-screen"
    >
      <PerformanceSheet
        document={
          runtimeExecution.performanceSheet.document
        }
        objectives={
          runtimeExecution.objectives
        }
        keyResultProgress={
          runtimeExecution.keyResultProgress
        }
        organizationId={organization.id}
        organization={organization}
        performanceInstanceId={
          runtimeExecution.performanceInstance.id
        }
        performanceInstance={
          runtimeExecution.performanceInstance
        }
        subject={runtimeExecution.subject}
        members={activeMembers}
        dashboard={dashboard}
        previousKeyResultValues={
          runtimeExecution.previousKeyResultValues
        }
        performanceMonths={
          runtimeExecution.performanceMonths
        }
        operationalTables={operationalTables}
      />
    </div>
  );
}