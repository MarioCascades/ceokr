import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

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

interface RuntimePageProps {
  searchParams: Promise<{
    organizationId?: string;

    subjectId?: string;
  }>;
}

export default async function RuntimePage({
  searchParams,
}: RuntimePageProps) {

  const params =
    await searchParams;


  /* ========================================================
     Organization
  ======================================================== */

  const organization =
    await getOrganization(
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
     Runtime + Members + Dashboard
  ======================================================== */

  const [
    runtimeExecution,

    members,

    dashboard,
  ] = await Promise.all([

    loadRuntimeExecution(
      organization.id,

      params.subjectId
    ),

    listUserManagementRecords(
      organization.id
    ),

    loadDashboard(
      organization.id
    ),

  ]);


  /* ========================================================
     Runtime Execution Missing
  ======================================================== */

  if (!runtimeExecution) {
    return (
      <main className="mx-auto max-w-5xl p-8">

        <h1 className="text-2xl font-semibold">
          Performance execution not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          No performance execution is available
          for this organization and selected member.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Make sure the organization has an active
          assignment with a monthly Performance Instance
          generated from a published Performance Sheet.
        </p>

      </main>
    );
  }


  /* ========================================================
     Active Members
  ======================================================== */

  const activeMembers =
    members.filter(
      (record) =>
        record.user.is_active !== false
    );


  /* ========================================================
     Runtime Product
  ======================================================== */

  return (
    <PerformanceSheet

      document={
        runtimeExecution
          .performanceSheet
          .document
      }


      objectives={
        runtimeExecution
          .objectives
      }


      keyResultProgress={
        runtimeExecution
          .keyResultProgress
      }


      organizationId={
        organization.id
      }


      performanceInstanceId={
        runtimeExecution
          .performanceInstance
          .id
      }


      performanceInstance={
        runtimeExecution
          .performanceInstance
      }


      subject={
        runtimeExecution
          .subject
      }


      members={
        activeMembers
      }


      dashboard={
        dashboard
      }


      previousKeyResultValues={
        runtimeExecution
          .previousKeyResultValues
      }

    />
  );
}