"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  createMemberPerformanceMonth,
} from "@/app/member/actions";

import type {
  MemberPerformanceExecution,
} from "@/lib/runtime/loadmemberperformance";

import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

import MemberAIFloater from "@/components/member/memberaifloater";


/* ==========================================================
   Props
========================================================== */

interface MemberWorkspaceProps {
  execution: MemberPerformanceExecution;
}


/* ==========================================================
   Month Helpers
========================================================== */

function formatPerformanceMonth(
  performanceMonth: string
) {

  const date =
    new Date(
      `${performanceMonth}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return performanceMonth;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}


/* ==========================================================
   Get First Day Of Month
========================================================== */

function getMonthStart(
  date: Date
): string {

  return [
    date
      .getFullYear()
      .toString()
      .padStart(4, "0"),

    (date.getMonth() + 1)
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


/* ==========================================================
   Add Months
========================================================== */

function addMonths(
  performanceMonth: string,
  amount: number
): string {

  const date =
    new Date(
      `${performanceMonth}T00:00:00Z`
    );

  date.setUTCMonth(
    date.getUTCMonth() +
      amount
  );

  return [
    date
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),

    (date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


/* ==========================================================
   Get Current Calendar Month
========================================================== */

function getCurrentPerformanceMonth(): string {

  const now =
    new Date();

  return getMonthStart(
    now
  );
}


/* ==========================================================
   Build Available Performance Months
========================================================== */

function buildPerformanceMonths(
  execution: MemberPerformanceExecution
): string[] {

  const currentMonth =
    getCurrentPerformanceMonth();

  const existingMonths =
    execution.performanceInstances
      .map(
        (instance) =>
          instance.performanceMonth
      );

  const selectedMonth =
    execution.performanceInstance
      .performanceMonth;

  const allKnownMonths =
    [
      ...existingMonths,
      selectedMonth,
    ]
      .filter(Boolean)
      .sort();

  const earliestMonth =
    allKnownMonths[0];

  if (!earliestMonth) {
    return [
      currentMonth,
    ];
  }

  const months: string[] = [];

  let cursor =
    earliestMonth;

  while (
    cursor <= currentMonth
  ) {

    months.push(
      cursor
    );

    cursor =
      addMonths(
        cursor,
        1
      );
  }

  return months.reverse();
}


/* ==========================================================
   Member Workspace
========================================================== */

export default function MemberWorkspace({
  execution,
}: MemberWorkspaceProps) {

  const [
    isChangingMonth,
    setIsChangingMonth,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );


  const performanceMonths =
    buildPerformanceMonths(
      execution
    );


  const selectedMonth =
    execution
      .performanceInstance
      .performanceMonth;


  /*
   * ==========================================================
   * Member Runtime Entry
   * ==========================================================
   *
   * This opens the existing shared Runtime for this member
   * and preserves the current organization, member, and
   * performance-month context.
   */

  const performanceWorkspaceParams =
    new URLSearchParams();

  performanceWorkspaceParams.set(
    "organizationId",
    execution.organizationId
  );

  performanceWorkspaceParams.set(
    "subjectId",
    execution.subject.id
  );

  performanceWorkspaceParams.set(
    "performanceMonth",
    selectedMonth
  );

  const performanceWorkspaceHref =
    `/runtime?${performanceWorkspaceParams.toString()}`;


  /* ========================================================
     Change Performance Month
  ======================================================== */

  async function handleMonthChange(
    performanceMonth: string
  ) {

    if (
      !performanceMonth ||
      performanceMonth ===
        selectedMonth
    ) {
      return;
    }

    setIsChangingMonth(
      true
    );

    setErrorMessage(
      null
    );

    try {

      const result =
        await createMemberPerformanceMonth(
          execution.organizationId,
          execution.subject.id,
          performanceMonth
        );


      const params =
        new URLSearchParams();

      params.set(
        "organizationId",
        execution.organizationId
      );

      params.set(
        "subjectId",
        execution.subject.id
      );

      params.set(
        "performanceMonth",
        result.performanceMonth
      );

      window.location.href =
        `/member?${params.toString()}`;

    } catch (
      error
    ) {

      console.error(
        "Failed to open performance month:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open this performance month."
      );

      setIsChangingMonth(
        false
      );
    }
  }


  return (
    <div className="min-h-screen bg-background">

      {/* ==================================================
          Member Workspace Header
      ================================================== */}

      <section className="border-b bg-card">

        <div className="mx-auto max-w-7xl px-8 py-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm text-muted-foreground">
                {
                  execution
                    .performanceSheet
                    .document
                    .organization
                    .companyName
                }
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                My Performance
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {
                  execution
                    .subject
                    .displayName
                }
              </p>

            </div>


            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end">

              <Link
                href={
                  performanceWorkspaceHref
                }
                className="
                  inline-flex h-10 items-center justify-center
                  rounded-md bg-slate-900 px-4
                  text-sm font-medium text-white
                  transition-colors
                  hover:bg-slate-800
                "
              >
                Open Performance Workspace →
              </Link>


              <div className="w-full md:w-64">

                <label
                  htmlFor="performance-month"
                  className="mb-2 block text-sm font-medium"
                >
                  Performance Month
                </label>

                <select
                  id="performance-month"
                  value={
                    selectedMonth
                  }
                  disabled={
                    isChangingMonth
                  }
                  onChange={(
                    event
                  ) =>
                    handleMonthChange(
                      event.target.value
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {
                    performanceMonths.map(
                      (
                        performanceMonth
                      ) => (

                        <option
                          key={
                            performanceMonth
                          }
                          value={
                            performanceMonth
                          }
                        >
                          {
                            formatPerformanceMonth(
                              performanceMonth
                            )
                          }
                        </option>

                      )
                    )
                  }

                </select>

                {
                  isChangingMonth && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Opening performance month...
                    </p>
                  )
                }

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          Error Message
      ================================================== */}

      {
        errorMessage && (

          <section className="mx-auto max-w-7xl px-8 pt-6">

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4">

              <p className="text-sm font-medium text-destructive">
                Unable to open performance month
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {
                  errorMessage
                }
              </p>

            </div>

          </section>

        )
      }


      {/* ==================================================
          Runtime Performance Sheet
      ================================================== */}

      <PerformanceSheet
        document={
          execution
            .performanceSheet
            .document
        }

        objectives={
          execution
            .objectives
        }

        keyResultProgress={
          execution
            .keyResultProgress
        }

        previousKeyResultValues={
          execution
            .previousKeyResultValues
        }

        organizationId={
          execution
            .organizationId
        }

        performanceInstanceId={
          execution
            .performanceInstance
            .id
        }

        performanceInstance={
          execution
            .performanceInstance
        }

        subject={
          execution
            .subject
        }

        performanceMonths={
          performanceMonths
        }

        memberMode
      />

      {/* ==================================================
          Member AI Assistant
      ================================================== */}

      <MemberAIFloater />

    </div>
  );
}