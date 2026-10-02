"use client";

import Link from "next/link";

import {
  calculateRuntimeKeyResultScore,
} from "@/lib/runtime/keyresultscoring";

import type {
  MemberOKRPerformance,
} from "@/lib/member/loadmemberokrperformance";


/* ==========================================================
   Props
========================================================== */

interface MemberPerformanceTab {
  id: string;

  label: string;
}


interface MemberOKRPerformanceProps {
  performance:
    MemberOKRPerformance;

  memberTabs?:
    MemberPerformanceTab[];
}


/* ==========================================================
   Helpers
========================================================== */

function formatValue(
  value: unknown
): string {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "object"
  ) {

    try {

      return JSON.stringify(
        value
      );

    } catch {

      return "—";

    }

  }

  return String(
    value
  );
}


function formatWeight(
  weight: number | undefined
): string {

  if (
    weight === undefined
  ) {
    return "Display Only";
  }

  if (
    weight === 0
  ) {
    return "Display Only";
  }

  return `${weight}%`;
}


function calculateScore(
  currentValue: unknown,
  target: unknown,
  scoringMethod:
    | "percent_into_period"
    | "percentage_of_target"
    | "display_only"
    | undefined,
  performanceMonth: string,
  weight: number | undefined
): number | null {

  /*
   * A zero-weight Key Result is explicitly
   * display-only and therefore has no score.
   */

  if (
    weight === 0 ||
    scoringMethod === "display_only"
  ) {
    return null;
  }

  const current =
    typeof currentValue === "number" ||
    typeof currentValue === "string"
      ? currentValue
      : null;

  const targetValue =
    typeof target === "number" ||
    typeof target === "string"
      ? target
      : null;

  if (
    current === null ||
    targetValue === null
  ) {
    return null;
  }

  return calculateRuntimeKeyResultScore(
    current,
    targetValue,
    scoringMethod,
    performanceMonth
  );
}


/* ==========================================================
   Component
========================================================== */

export default function MemberOKRPerformance({
  performance,
  memberTabs,
}: MemberOKRPerformanceProps) {

  const {
    subject,
    objectives,
    performanceSheet,
    performanceMonth,
  } =
    performance;


  const document =
    performanceSheet?.document;


  return (
    <main className="min-h-screen bg-background">

      {memberTabs && memberTabs.length > 0 && (
        <section className="border-b bg-white">

          <div className="mx-auto max-w-7xl px-4 py-3">

            <div className="flex items-center gap-2 overflow-x-auto">

              {
                memberTabs.map(
                  (
                    memberTab
                  ) => {

                    const active =
                      memberTab.id ===
                      subject.id;


                    return (

                      <Link
                        key={
                          memberTab.id
                        }

                        href={
                          `/member?organizationId=${encodeURIComponent(
                            performance.organizationId
                          )}&subjectId=${encodeURIComponent(
                            memberTab.id
                          )}${
                            performance.performanceMonth
                              ? `&performanceMonth=${encodeURIComponent(
                                  performance.performanceMonth
                                )}`
                              : ""
                          }`
                        }

                        className={
                          `shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-white text-foreground hover:bg-muted"
                          }`
                        }
                      >

                        {
                          memberTab.label
                        }

                      </Link>

                    );

                  }
                )
              }

            </div>

          </div>

        </section>
      )}


      {/* ==================================================
          Header
      ================================================== */}

      <section className="border-b bg-card">

        <div className="mx-auto max-w-7xl px-8 py-8">

          <div className="flex flex-col gap-2">

            <p className="text-sm font-medium text-muted-foreground">

              {
                document?.performanceHeader
                  ?.subtitle ||
                "Performance"
              }

            </p>


            <h1 className="text-3xl font-bold tracking-tight">

              {
                document?.performanceHeader
                  ?.title ||
                "My Performance"
              }

            </h1>


            <p className="text-sm text-muted-foreground">

              {
                subject.display_name?.trim() ||
                `${subject.first_name} ${subject.last_name}`.trim()
              }

            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          Performance Month
      ================================================== */}

      <section className="border-b bg-background">

        <div className="mx-auto max-w-7xl px-8 py-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                Performance Month

              </p>


              <p className="mt-1 text-sm font-medium">

                {
                  new Intl.DateTimeFormat(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }
                  ).format(
                    new Date(
                      `${performanceMonth}T00:00:00Z`
                    )
                  )
                }

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          Objectives
      ================================================== */}

      <section className="mx-auto max-w-7xl px-8 py-8">

        {
          objectives.length === 0 ? (

            <div className="rounded-xl border bg-card p-8">

              <h2 className="text-lg font-semibold">
                No OKRs configured
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                No Objectives, Key Results, or Initiatives
                have been configured for this member yet.
              </p>

            </div>

          ) : (

            <div className="space-y-8">

              {
                objectives.map(
                  (
                    objective,
                    objectiveIndex
                  ) => (

                    <section
                      key={
                        objective.id
                      }
                      className="rounded-xl border bg-card"
                    >

                      {/* ==================================
                          Objective Header
                      ================================== */}

                      <div className="border-b px-6 py-5">

                        <div className="flex items-start justify-between gap-6">

                          <div>

                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                              Objective {
                                objectiveIndex + 1
                              }

                            </p>


                            <h2 className="mt-1 text-xl font-semibold">

                              {
                                objective.title
                              }

                            </h2>


                            {
                              objective.description && (

                                <p className="mt-2 text-sm text-muted-foreground">

                                  {
                                    objective.description
                                  }

                                </p>

                              )
                            }

                          </div>


                          <div className="text-right">

                            <p className="text-xs text-muted-foreground">
                              Weight
                            </p>

                            <p className="mt-1 text-sm font-semibold">

                              {
                                formatWeight(
                                  objective.weight
                                )
                              }

                            </p>

                          </div>

                        </div>

                      </div>


                      {/* ==================================
                          Key Results
                      ================================== */}

                      <div className="divide-y">

                        {
                          objective.keyResults.map(
                            (
                              keyResult,
                              keyResultIndex
                            ) => {

                              const score =
                                calculateScore(
                                  keyResult.currentValue,
                                  keyResult.target,
                                  keyResult.scoringMethod,
                                  performanceMonth,
                                  keyResult.weight
                                );


                              return (

                                <div
                                  key={
                                    keyResult.id
                                  }
                                  className="px-6 py-6"
                                >

                                  <div className="flex flex-col gap-5">

                                    <div className="flex items-start justify-between gap-6">

                                      <div>

                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                                          Key Result {
                                            keyResultIndex + 1
                                          }

                                        </p>


                                        <h3 className="mt-1 text-base font-semibold">

                                          {
                                            keyResult.title
                                          }

                                        </h3>

                                      </div>


                                      <div className="text-right">

                                        <p className="text-xs text-muted-foreground">
                                          Weight
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">

                                          {
                                            formatWeight(
                                              keyResult.weight
                                            )
                                          }

                                        </p>

                                      </div>

                                    </div>


                                    {/* ==================================
                                        Metrics
                                    ================================== */}

                                    <div className="grid gap-4 md:grid-cols-4">

                                      <div className="rounded-lg border p-4">

                                        <p className="text-xs text-muted-foreground">
                                          Target
                                        </p>

                                        <p className="mt-1 font-medium">

                                          {
                                            formatValue(
                                              keyResult.target
                                            )
                                          }

                                        </p>

                                      </div>


                                      <div className="rounded-lg border p-4">

                                        <p className="text-xs text-muted-foreground">
                                          Current
                                        </p>

                                        <p className="mt-1 font-medium">

                                          {
                                            formatValue(
                                              keyResult.currentValue
                                            )
                                          }

                                        </p>

                                      </div>


                                      <div className="rounded-lg border p-4">

                                        <p className="text-xs text-muted-foreground">
                                          Score
                                        </p>

                                        <p className="mt-1 font-medium">

                                          {
                                            score === null
                                              ? "Display Only"
                                              : `${score.toFixed(1)}%`
                                          }

                                        </p>

                                      </div>


                                      <div className="rounded-lg border p-4">

                                        <p className="text-xs text-muted-foreground">
                                          Measurement
                                        </p>

                                        <p className="mt-1 font-medium capitalize">

                                          {
                                            keyResult.measurementType
                                              ?.replace(
                                                "_",
                                                " "
                                              ) ||
                                            "Not configured"
                                          }

                                        </p>

                                      </div>

                                    </div>


                                    {/* ==================================
                                        Initiatives
                                    ================================== */}

                                    {
                                      keyResult.initiatives.length > 0 && (

                                        <div>

                                          <p className="text-sm font-medium">
                                            Initiatives
                                          </p>


                                          <div className="mt-3 space-y-2">

                                            {
                                              keyResult.initiatives.map(
                                                (
                                                  initiative,
                                                  initiativeIndex
                                                ) => (

                                                  <div
                                                    key={
                                                      initiative.id
                                                    }
                                                    className="rounded-lg bg-muted/40 px-4 py-3 text-sm"
                                                  >

                                                    <span className="mr-2 text-muted-foreground">

                                                      {
                                                        initiativeIndex + 1
                                                      }.

                                                    </span>

                                                    {
                                                      initiative.text
                                                    }

                                                  </div>

                                                )
                                              )
                                            }

                                          </div>

                                        </div>

                                      )
                                    }

                                  </div>

                                </div>

                              );

                            }
                          )
                        }

                      </div>

                    </section>

                  )
                )
              }

            </div>

          )

        }

      </section>

    </main>
  );
}