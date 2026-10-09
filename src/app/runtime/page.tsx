import type { CSSProperties } from "react";

import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

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
     Organization Runtime Branding
     --------------------------------------------------------
     Organization Settings stores:

       primary_color
       secondary_color
       logo_url

     Runtime uses secondary_color as the organization's
     Accent Color because that is how the Settings UI
     presents the field.

     We explicitly expose both the source variables and
     Tailwind color tokens so organization branding can
     override the platform defaults at the Runtime boundary.
  ======================================================== */

  const runtimePrimaryColor =
    organization.primary_color ||
    "#082550";

  const runtimeAccentColor =
    organization.secondary_color ||
    "#E26D5C";

  const runtimeBrandStyle = {
    "--primary":
      runtimePrimaryColor,

    "--accent":
      runtimeAccentColor,

    "--color-primary":
      runtimePrimaryColor,

    "--color-accent":
      runtimeAccentColor,

    "--primary-foreground":
      "#FFFFFF",

    "--accent-foreground":
      "#FFFFFF",

    "--ring":
      runtimePrimaryColor,
  } as CSSProperties;


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
     Runtime Performance Sheet is now the single member
     Performance experience.

     We intentionally DO NOT fall back to the legacy
     MemberOKRPerformance component here.

     If Runtime cannot build an execution, that is a Runtime
     data/configuration issue that must be resolved by the
     Runtime execution layer rather than hidden by rendering
     the legacy Performance page.
  ======================================================== */

  const runtimeExecution =
    await loadRuntimeExecution(
      organization.id,

      params.subjectId,

      performanceMonth
    );


  /* ========================================================
     Runtime Execution Required
     -------------------------------------------------------- */

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
     Runtime Member Performance Sheet
     --------------------------------------------------------
     PerformanceSheet already renders RuntimeNavigation for
     the selected member Runtime experience.

     Keeping another RuntimeNavigation here would render the
     navigation twice.

     The selected member Performance Sheet therefore remains
     the single owner of the navigation presentation in this
     branch.
  ======================================================== */

  return (
    <div
      style={runtimeBrandStyle}
      className="
        ce-runtime-theme
        min-h-screen
      "
    >

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

    </div>
  );
}