"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Button,
} from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import {
  listOrganizations,
} from "@/services/organization.service";

import {
  findCurrentPerformanceSheet,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";


/* ==========================================================
   Types
========================================================== */

interface OrganizationPerformanceRow {
  organization: Organization;

  performanceSheet:
    PerformanceSheetRecord | null;
}


/* ==========================================================
   Performance Sheets Administration
   ----------------------------------------------------------
   One organization = one Performance Workspace.

   The Manage action opens the actual Runtime Performance
   Workspace for the organization.

   The Builder remains a separate configuration experience.
========================================================== */

export default function PerformanceSheetsPage() {

  const [
    rows,
    setRows,
  ] =
    useState<
      OrganizationPerformanceRow[]
    >(
      []
    );


  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true
    );


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );


  /* ========================================================
     Load Organizations and Performance Workspaces
  ======================================================== */

  useEffect(() => {

    let cancelled =
      false;


    async function initialize() {

      try {

        setIsLoading(
          true
        );

        setErrorMessage(
          null
        );


        /* ==================================================
           Organizations
        ================================================== */

        const organizations =
          await listOrganizations();


        if (cancelled) {
          return;
        }


        /* ==================================================
           Current Performance Workspace
           --------------------------------------------------
           Each organization has one current workspace.
        ================================================== */

        const loadedRows =
          await Promise.all(

            organizations.map(
              async (
                organization
              ) => ({

                organization,

                performanceSheet:
                  await findCurrentPerformanceSheet(
                    organization.id
                  ),

              })
            )

          );


        if (cancelled) {
          return;
        }


        setRows(
          loadedRows
        );

      } catch (
        error
      ) {

        if (cancelled) {
          return;
        }


        console.error(
          "Failed to load Performance Workspaces:",
          error
        );


        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Performance Workspaces."
        );

      } finally {

        if (!cancelled) {

          setIsLoading(
            false
          );

        }

      }

    }


    initialize();


    return () => {

      cancelled =
        true;

    };

  }, []);


  /* ========================================================
     Runtime Navigation
     --------------------------------------------------------
     Manage opens the actual organization Performance
     Workspace, where the organization's members and their
     OKR Performance Sheets are available.

     This intentionally does NOT open the Builder.
  ======================================================== */

  function getRuntimeHref(
    organizationId: string
  ) {

    return `/runtime?organizationId=${encodeURIComponent(
      organizationId
    )}`;

  }


  /* ========================================================
     Render
  ======================================================== */

  return (

    <main
      className="
        min-h-screen
        bg-gray-50
        px-8
        py-10
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
        "
      >

        {/* ==================================================
            Header
        ================================================== */}

        <AdminPageHeader

          title="Performance Sheets"

          description="
            Manage the Performance Workspace for each organization.
          "

          showOrganizationSelector={
            false
          }

        />


        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (

          <div
            className="
              rounded-lg
              border
              border-red-200
              bg-red-50
              p-4
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

          </div>

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
              Loading Performance Workspaces...
            </p>

          </section>

        )}


        {/* ==================================================
            Organization Performance Sheets
        ================================================== */}

        {!isLoading &&
          !errorMessage && (

            <section
              className="
                overflow-hidden
                rounded-xl
                border
                bg-white
                shadow-sm
              "
            >

              {/* ==================================================
                  Section Header
              ================================================== */}

              <div
                className="
                  border-b
                  p-6
                "
              >

                <h2
                  className="
                    text-xl
                    font-semibold
                  "
                >
                  Organization Performance Sheets
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Each organization has one Performance Sheet
                  that serves as the presentation framework for
                  its members&apos; OKR Performance Workspace.
                </p>

              </div>


              {/* ==================================================
                  Empty State
              ================================================== */}

              {rows.length === 0 ? (

                <div
                  className="
                    p-8
                  "
                >

                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    No organizations are available.
                  </p>

                </div>

              ) : (

                <div
                  className="
                    overflow-x-auto
                  "
                >

                  <table
                    className="
                      w-full
                      min-w-[720px]
                    "
                  >

                    <thead>

                      <tr
                        className="
                          border-b
                          bg-gray-50
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-muted-foreground
                        "
                      >

                        <th
                          className="
                            px-6
                            py-4
                          "
                        >
                          Organization
                        </th>


                        <th
                          className="
                            px-6
                            py-4
                          "
                        >
                          Performance Sheet
                        </th>


                        <th
                          className="
                            px-6
                            py-4
                          "
                        >
                          Status
                        </th>


                        <th
                          className="
                            px-6
                            py-4
                            text-right
                          "
                        >
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody
                      className="
                        divide-y
                      "
                    >

                      {rows.map(
                        (
                          row
                        ) => {

                          return (

                            <tr
                              key={
                                row.organization.id
                              }
                            >

                              {/* ==================================
                                  Organization
                              ================================== */}

                              <td
                                className="
                                  px-6
                                  py-5
                                "
                              >

                                <div>

                                  <p
                                    className="
                                      font-medium
                                    "
                                  >
                                    {
                                      row.organization
                                        .company_name
                                    }
                                  </p>


                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      text-muted-foreground
                                    "
                                  >
                                    Organization tenant
                                  </p>

                                </div>

                              </td>


                              {/* ==================================
                                  Performance Sheet
                              ================================== */}

                              <td
                                className="
                                  px-6
                                  py-5
                                "
                              >

                                {row.performanceSheet ? (

                                  <div>

                                    <p
                                      className="
                                        font-medium
                                      "
                                    >
                                      {
                                        row.performanceSheet
                                          .name
                                      }
                                    </p>


                                    <div
                                      className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        gap-x-3
                                        gap-y-1
                                        text-xs
                                        text-muted-foreground
                                      "
                                    >

                                      <span>
                                        Version{" "}
                                        {
                                          row.performanceSheet
                                            .version
                                        }
                                      </span>


                                      <span>
                                        Runtime Workspace
                                      </span>

                                    </div>

                                  </div>

                                ) : (

                                  <div>

                                    <p
                                      className="
                                        font-medium
                                        text-amber-700
                                      "
                                    >
                                      Workspace not initialized
                                    </p>


                                    <p
                                      className="
                                        mt-1
                                        text-xs
                                        text-muted-foreground
                                      "
                                    >
                                      This organization predates
                                      automatic Performance Workspace
                                      creation.
                                    </p>

                                  </div>

                                )}

                              </td>


                              {/* ==================================
                                  Status
                              ================================== */}

                              <td
                                className="
                                  px-6
                                  py-5
                                "
                              >

                                {row.performanceSheet ? (

                                  <span
                                    className="
                                      inline-flex
                                      rounded-full
                                      bg-muted
                                      px-2.5
                                      py-1
                                      text-xs
                                      font-semibold
                                      capitalize
                                      text-foreground
                                    "
                                  >
                                    {
                                      row.performanceSheet
                                        .status
                                    }
                                  </span>

                                ) : (

                                  <span
                                    className="
                                      inline-flex
                                      rounded-full
                                      bg-amber-100
                                      px-2.5
                                      py-1
                                      text-xs
                                      font-semibold
                                      text-amber-800
                                    "
                                  >
                                    Not initialized
                                  </span>

                                )}

                              </td>


                              {/* ==================================
                                  Manage Runtime
                              ================================== */}

                              <td
                                className="
                                  px-6
                                  py-5
                                  text-right
                                "
                              >

                                {row.performanceSheet ? (

                                  <Button
                                    asChild
                                    size="sm"
                                  >

                                    <Link
                                      href={
                                        getRuntimeHref(
                                          row.organization.id
                                        )
                                      }
                                    >
                                      Manage
                                    </Link>

                                  </Button>

                                ) : (

                                  <Button
                                    size="sm"
                                    disabled
                                    variant="outline"
                                  >
                                    Not Available
                                  </Button>

                                )}

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          )}

      </div>

    </main>
  );
}