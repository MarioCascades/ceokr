import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

import MemberOKRPerformance from "@/components/member/memberokrperformance";

import RuntimeNavigation from "@/components/runtime/shared/runtimenavigation";

import RuntimeOverview from "@/components/runtime/shared/runtimeoverview";

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
  loadMemberOKRPerformance,
} from "@/lib/member/loadmemberokrperformance";


interface RuntimePageProps {
  searchParams: Promise<{
    organizationId?: string;

    subjectId?: string;

    performanceMonth?: string;
  }>;
}


/* ==========================================================
   Helpers
========================================================== */

function getCurrentPerformanceMonth(): string {

  const now =
    new Date();

  const year =
    now.getUTCFullYear();

  const month =
    String(
      now.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}`;
}


/* ==========================================================
   Runtime Page
========================================================== */

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
     Performance Month
     --------------------------------------------------------
     The Workspace itself must be able to render before a
     member has been selected.

     Therefore the month is independent of Runtime Execution.
  ======================================================== */

  const performanceMonth =
    params.performanceMonth ||
    getCurrentPerformanceMonth();


  /* ========================================================
     Organization Members + Dashboard
     --------------------------------------------------------
     Organization membership is the authoritative source
     for Performance Workspace navigation.
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


  /* ========================================================
     Active Performance Members
     --------------------------------------------------------
     Every active organization member is automatically
     available in the Performance Workspace.

     No Assignment or Performance Instance is required
     merely to appear as a Performance tab.
  ======================================================== */

  const activeMembers =
    members.filter(
      (record) =>
        record.user.is_active !== false
    );


  /* ========================================================
     Organization Performance Workspace
     --------------------------------------------------------
     This MUST render before Runtime Execution is required.

     The Workspace exists at the organization level.

     Member selection happens through RuntimeNavigation.
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
            performanceMonth
          }

          performanceMonths={
            [performanceMonth]
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
     Selected Member Runtime
     --------------------------------------------------------
     Once a member is selected, attempt the existing Runtime
     execution path.
  ======================================================== */

  const runtimeExecution =
    await loadRuntimeExecution(
      organization.id,

      params.subjectId,

      performanceMonth
    );


  /* ========================================================
     New Member OKR Performance
     --------------------------------------------------------
     If the selected member does not have the old Runtime
     Performance Instance, use the new Member OKR domain.

     This removes Assignment / Performance Instance as a
     requirement for the new Member Performance experience.
  ======================================================== */

  if (!runtimeExecution) {

    const memberOKRPerformance =
      await loadMemberOKRPerformance(
        organization.id,

        params.subjectId,

        performanceMonth
      );


    if (
      memberOKRPerformance
    ) {

      return (
        <main className="min-h-screen bg-background">

          <RuntimeNavigation

            organizationId={
              organization.id
            }

            members={
              activeMembers
            }

            selectedSubjectId={
              params.subjectId
            }

            performanceMonth={
              performanceMonth
            }

            performanceMonths={
              [performanceMonth]
            }

          />


          <MemberOKRPerformance
            performance={
              memberOKRPerformance
            }
          />

        </main>
      );
    }


    return (
      <main className="mx-auto max-w-5xl p-8">

        <h1 className="text-2xl font-semibold">
          Performance Sheet not configured
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This member does not currently have a
          configured Member OKR Sheet.
        </p>

      </main>
    );
  }


  /* ========================================================
     Existing Runtime Member Performance
     --------------------------------------------------------
     Historical Runtime execution remains untouched.
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