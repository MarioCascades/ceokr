import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

import RuntimeNavigation from "@/components/runtime/shared/runtimenavigation";

import RuntimeOverview from "@/components/runtime/shared/runtimeoverview";

import {
  loadRuntimeExecution,
} from "@/lib/runtime/runtimeexecution";

import {
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

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

    performanceMonth?: string;
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
     Runtime + Members + Assignments + Instances + Dashboard
  ======================================================== */

  const [
    runtimeExecution,

    members,

    assignments,

    performanceInstances,

    dashboard,

  ] = await Promise.all([

    loadRuntimeExecution(
      organization.id,

      params.subjectId,

      params.performanceMonth
    ),

    listUserManagementRecords(
      organization.id
    ),

    findAssignmentsByOrganization(
      organization.id
    ),

    findPerformanceInstancesByOrganization(
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
     Runtime Performance Subjects

     Only active individual assignments that have at least
     one Performance Instance are eligible for Runtime
     subject navigation.
  ======================================================== */

  const individualAssignmentIds =
    new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.assignmentType ===
              "individual" &&
            assignment.status ===
              "active"
        )
        .map(
          (assignment) =>
            assignment.id
        )
    );


  const performanceAssignmentIds =
    new Set(
      performanceInstances
        .filter(
          (instance) =>
            individualAssignmentIds.has(
              instance.assignmentId
            )
        )
        .map(
          (instance) =>
            instance.assignmentId
        )
    );


  const performanceSubjectIds =
    new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.assignmentType ===
              "individual" &&
            assignment.status ===
              "active" &&
            performanceAssignmentIds.has(
              assignment.id
            ) &&
            Boolean(
              assignment.subjectId
            )
        )
        .map(
          (assignment) =>
            assignment.subjectId
        )
    );


  /* ========================================================
     Active Performance Members

     User Management remains the authoritative source for
     user/member details.

     Runtime eligibility comes from Assignment +
     Performance Instance state.
  ======================================================== */

  const activeMembers =
    members.filter(
      (record) =>
        record.user.is_active !== false &&
        performanceSubjectIds.has(
          record.user.id
        )
    );


  /* ========================================================
     Organization Dashboard
  ======================================================== */

  if (!params.subjectId) {

    return (
      <main
        className="
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

          organizationId={
            organization.id
          }

          members={
            activeMembers
          }

          performanceMonth={
            runtimeExecution
              .performanceInstance
              .performanceMonth
          }

          performanceMonths={
            runtimeExecution
              .performanceMonths
          }

        />


        <RuntimeOverview

          dashboard={
            dashboard
          }

        />

      </main>
    );
  }


  /* ========================================================
     Individual Member Performance
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


      organization={
        organization
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


      performanceMonths={
        runtimeExecution
          .performanceMonths
      }

    />
  );
}