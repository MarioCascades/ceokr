"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  listPerformanceSheetDefinitions,
  type PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Organization,
} from "@/lib/types/organization";


/* ==========================================================
   Helpers
========================================================== */

function formatStatus(
  status: PerformanceSheetRecord["status"]
): string {

  switch (status) {

    case "draft":
      return "Draft";

    case "published":
      return "Published";

    case "archived":
      return "Archived";

    default:
      return status;
  }
}


function getStatusClasses(
  status: PerformanceSheetRecord["status"]
): string {

  switch (status) {

    case "published":
      return `
        bg-green-100
        text-green-800
      `;

    case "draft":
      return `
        bg-amber-100
        text-amber-800
      `;

    case "archived":
    default:
      return `
        bg-gray-100
        text-gray-700
      `;
  }
}


function formatUpdatedAt(
  value: string
): string {

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    date
  );
}


/* ==========================================================
   Organization Admin Performance Sheets
   ----------------------------------------------------------
   This page manages reusable Performance Sheet definitions.

   Builder owns:
      Performance Sheet definitions
      Objectives
      Key Results
      Initiatives
      Validation
      Publishing
      Revisions

   Assignments owns:
      Published Performance Sheet assignments

   Runtime owns:
      Period-specific performance execution

   This page intentionally does NOT render member Runtime
   performance.
========================================================== */

export default function OrganizationPerformanceSheetsPage() {

  const searchParams =
    useSearchParams();


  const organizationId =
    searchParams.get(
      "organizationId"
    );


  /* ========================================================
     State
  ======================================================== */

  const [
    organization,
    setOrganization,
  ] =
    useState<Organization | null>(
      null
    );


  const [
    performanceSheets,
    setPerformanceSheets,
  ] =
    useState<PerformanceSheetRecord[]>(
      []
    );


  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );


  /* ========================================================
     Load Organization + Performance Sheet Definitions
  ======================================================== */

  useEffect(() => {

    async function initialize() {

      setIsLoading(
        true
      );

      setErrorMessage(
        null
      );

      setOrganization(
        null
      );

      setPerformanceSheets(
        []
      );


      try {

        if (!organizationId) {

          setErrorMessage(
            "No organization context is available."
          );

          return;
        }


        const existingOrganization =
          await getOrganization(
            organizationId
          );


        if (!existingOrganization) {

          setErrorMessage(
            "The selected organization could not be found."
          );

          return;
        }


        setOrganization(
          existingOrganization
        );


        const definitions =
          await listPerformanceSheetDefinitions(
            existingOrganization.id
          );


        setPerformanceSheets(
          definitions
        );

      } catch (error) {

        console.error(
          "Failed to load Performance Sheet definitions:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Performance Sheet definitions."
        );

      } finally {

        setIsLoading(
          false
        );

      }

    }


    initialize();

  }, [
    organizationId,
  ]);


  /* ========================================================
     Navigation
  ======================================================== */

  const encodedOrganizationId =
    organizationId
      ? encodeURIComponent(
          organizationId
        )
      : null;


  const builderHref =
    encodedOrganizationId
      ? `/builder?organizationId=${encodedOrganizationId}&from=organization&new=true`
      : "/builder?new=true";


  const assignmentsHref =
    encodedOrganizationId
      ? `/organization/assignments?organizationId=${encodedOrganizationId}`
      : "/organization/assignments";


  const overviewHref =
    encodedOrganizationId
      ? `/organization?organizationId=${encodedOrganizationId}`
      : "/organization";


  /* ========================================================
     Render
  ======================================================== */

  return (

    <main className="min-h-screen bg-gray-50 px-8 py-10">

      <div className="mx-auto max-w-7xl space-y-8">


        {/* ==================================================
            Header
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >

          <AdminPageHeader
            title="Performance Sheets"
            description="Create, manage, validate, publish, and revise reusable Performance Sheet definitions for this organization."
            showOrganizationSelector={false}
          />


          <div
            className="
              flex
              shrink-0
              flex-wrap
              gap-2
            "
          >

            <Button
              asChild
              variant="outline"
            >

              <Link
                href={
                  overviewHref
                }
              >
                Back to Overview
              </Link>

            </Button>


            <Button
              asChild
            >

              <Link
                href={
                  builderHref
                }
              >
                Create Performance Sheet
              </Link>

            </Button>

          </div>

        </div>


        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (

          <section
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-5
            "
          >

            <p
              className="
                text-sm
                text-red-700
              "
            >
              {
                errorMessage
              }
            </p>

          </section>

        )}


        {/* ==================================================
            Loading
        ================================================== */}

        {isLoading && (

          <section
            className="
              rounded-xl
              border
              bg-white
              p-6
              shadow-sm
            "
          >

            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              Loading Performance Sheet definitions...
            </p>

          </section>

        )}


        {/* ==================================================
            Organization Context
        ================================================== */}

        {!isLoading &&
          organization && (

            <section
              className="
                rounded-xl
                border
                bg-white
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-muted-foreground
                    "
                  >
                    Organization
                  </p>


                  <h2
                    className="
                      mt-2
                      text-2xl
                      font-semibold
                      text-gray-950
                    "
                  >
                    {
                      organization.company_name
                    }
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Performance Sheet definitions
                  </p>

                </div>


                <div
                  className="
                    flex
                    gap-6
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Definitions
                    </p>


                    <p
                      className="
                        mt-1
                        text-2xl
                        font-semibold
                        text-gray-950
                      "
                    >
                      {
                        performanceSheets.length
                      }
                    </p>

                  </div>

                </div>

              </div>

            </section>

          )}


        {/* ==================================================
            Performance Sheet Definitions
        ================================================== */}

        {!isLoading &&
          organization && (
            <section
              className="
                overflow-hidden
                rounded-xl
                border
                bg-white
                shadow-sm
              "
            >

              <div
                className="
                  border-b
                  p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <div>

                    <h2
                      className="
                        text-xl
                        font-semibold
                        text-gray-950
                      "
                    >
                      Performance Sheet Definitions
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-muted-foreground
                      "
                    >
                      Each entry represents the latest version of a logical Performance Sheet definition. Historical versions remain preserved.
                    </p>

                  </div>


                  <Button
                    asChild
                    variant="outline"
                  >

                    <Link
                      href={
                        assignmentsHref
                      }
                    >
                      Manage Assignments
                    </Link>

                  </Button>

                </div>

              </div>


              {/* ==================================================
                  Empty State
              ================================================== */}

              {performanceSheets.length ===
                0 ? (

                <div
                  className="
                    p-10
                    text-center
                  "
                >

                  <h3
                    className="
                      text-lg
                      font-semibold
                      text-gray-950
                    "
                  >
                    No Performance Sheets yet
                  </h3>


                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-xl
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                  >
                    Create the first Performance Sheet for this organization. The Builder will open with the real organization context and allow you to configure the Performance Header, Objectives, Key Results, and Initiatives.
                  </p>


                  <div
                    className="
                      mt-6
                    "
                  >

                    <Button
                      asChild
                    >

                      <Link
                        href={
                          builderHref
                        }
                      >
                        Create Performance Sheet
                      </Link>

                    </Button>

                  </div>

                </div>

              ) : (

                /* ==================================================
                   Definition List
                ================================================== */

                <div
                  className="
                    divide-y
                  "
                >

                  {performanceSheets.map(
                    (
                      sheet
                    ) => {

                      const builderSheetHref =
                        encodedOrganizationId
                          ? `/builder?organizationId=${encodedOrganizationId}&from=organization&sheetId=${encodeURIComponent(
                              sheet.id
                            )}`
                          : `/builder?sheetId=${encodeURIComponent(
                              sheet.id
                            )}`;


                      const headerTitle =
                        sheet.document
                          ?.performanceHeader
                          ?.title
                          ?.trim();


                      return (

                        <div
                          key={
                            sheet.id
                          }
                          className="
                            p-6
                            transition-colors
                            hover:bg-gray-50
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              gap-5
                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >

                            {/* ==============================
                                Definition
                            ============================== */}

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-3
                                "
                              >

                                <h3
                                  className="
                                    text-lg
                                    font-semibold
                                    text-gray-950
                                  "
                                >
                                  {
                                    sheet.name
                                  }
                                </h3>


                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-semibold
                                    ${getStatusClasses(
                                      sheet.status
                                    )}
                                  `}
                                >
                                  {
                                    formatStatus(
                                      sheet.status
                                    )
                                  }
                                </span>

                              </div>


                              {headerTitle && (

                                <p
                                  className="
                                    mt-2
                                    text-sm
                                    font-medium
                                    text-gray-700
                                  "
                                >
                                  {
                                    headerTitle
                                  }
                                </p>

                              )}


                              <div
                                className="
                                  mt-3
                                  flex
                                  flex-wrap
                                  gap-x-5
                                  gap-y-2
                                  text-xs
                                  text-muted-foreground
                                "
                              >

                                <span>
                                  Version{" "}
                                  {
                                    sheet.version
                                  }
                                </span>


                                <span>
                                  Updated{" "}
                                  {
                                    formatUpdatedAt(
                                      sheet.updated_at
                                    )
                                  }
                                </span>


                                <span>
                                  Key{" "}
                                  {
                                    sheet.sheet_key
                                  }
                                </span>

                              </div>

                            </div>


                            {/* ==============================
                                Actions
                            ============================== */}

                            <div
                              className="
                                flex
                                shrink-0
                                flex-wrap
                                gap-2
                              "
                            >

                              <Button
                                asChild
                              >

                                <Link
                                  href={
                                    builderSheetHref
                                  }
                                >
                                  Open Builder
                                </Link>

                              </Button>

                            </div>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </section>
          )}

      </div>

    </main>
  );
}