"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

import {
  getTeams,
} from "@/services/team.service";

import {
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import {
  findPublishedPerformanceSheetsByOrganization,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  Assignment,
} from "@/lib/domain/assignment";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";


/* ==========================================================
   Types
========================================================== */

interface MemberPerformanceRow {
  user: UserManagementRecord;

  assignment: Assignment | null;

  performanceSheet:
    PerformanceSheetRecord | null;
}


/* ==========================================================
   Performance Sheets Page
========================================================== */

export default function PerformanceSheetsPage() {

  const searchParams =
    useSearchParams();

  const selectedOrganizationId =
    searchParams.get(
      "organizationId"
    );


  const [
    organization,
    setOrganization,
  ] =
    useState<Organization | null>(
      null
    );


  const [
    userRecords,
    setUserRecords,
  ] =
    useState<UserManagementRecord[]>(
      []
    );


  const [
    teams,
    setTeams,
  ] =
    useState<Team[]>(
      []
    );


  const [
    assignments,
    setAssignments,
  ] =
    useState<Assignment[]>(
      []
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
     Load Organization Performance Data
  ======================================================== */

  useEffect(() => {

    async function initialize() {

      try {

        setIsLoading(
          true
        );

        setErrorMessage(
          null
        );

        setOrganization(
          null
        );

        setUserRecords(
          []
        );

        setTeams(
          []
        );

        setAssignments(
          []
        );

        setPerformanceSheets(
          []
        );


        if (
          !selectedOrganizationId
        ) {

          setErrorMessage(
            "Select an organization to view member performance."
          );

          return;
        }


        const existingOrganization =
          await getOrganization(
            selectedOrganizationId
          );


        if (
          !existingOrganization
        ) {

          setErrorMessage(
            "The selected organization could not be found."
          );

          return;
        }


        setOrganization(
          existingOrganization
        );


        const [
          loadedUsers,
          loadedTeams,
          loadedAssignments,
          loadedPerformanceSheets,
        ] =
          await Promise.all([

            listUserManagementRecords(
              existingOrganization.id
            ),

            getTeams(
              existingOrganization.id
            ),

            findAssignmentsByOrganization(
              existingOrganization.id
            ),

            findPublishedPerformanceSheetsByOrganization(
              existingOrganization.id
            ),

          ]);


        setUserRecords(
          loadedUsers
        );

        setTeams(
          loadedTeams
        );

        setAssignments(
          loadedAssignments
        );

        setPerformanceSheets(
          loadedPerformanceSheets
        );

      } catch (
        error
      ) {

        console.error(
          "Failed to load organization performance:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load organization performance."
        );

      } finally {

        setIsLoading(
          false
        );

      }

    }


    initialize();

  }, [
    selectedOrganizationId,
  ]);


  /* ========================================================
     Active Individual Assignments
  ======================================================== */

  const activeIndividualAssignments =
    useMemo(() => {

      const map =
        new Map<
          string,
          Assignment
        >();


      for (
        const assignment
        of assignments
      ) {

        if (
          assignment.status !==
            "active"
        ) {
          continue;
        }


        if (
          assignment.assignmentType !==
            "individual"
        ) {
          continue;
        }


        /*
         * The Runtime currently resolves the
         * latest active individual assignment
         * for a member.
         *
         * Keep the same behavior here.
         */

        const existing =
          map.get(
            assignment.subjectId
          );


        if (
          !existing ||
          assignment.assignedAt >
            existing.assignedAt
        ) {

          map.set(
            assignment.subjectId,
            assignment
          );

        }

      }


      return map;

    }, [
      assignments,
    ]);


  /* ========================================================
     Published Performance Sheet Lookup
  ======================================================== */

  const performanceSheetById =
    useMemo(() => {

      const map =
        new Map<
          string,
          PerformanceSheetRecord
        >();


      for (
        const sheet
        of performanceSheets
      ) {

        map.set(
          sheet.id,
          sheet
        );

      }


      return map;

    }, [
      performanceSheets,
    ]);


  /* ========================================================
     Team Lookup
  ======================================================== */

  const teamById =
    useMemo(() => {

      const map =
        new Map<
          string,
          Team
        >();


      for (
        const team
        of teams
      ) {

        map.set(
          team.id,
          team
        );

      }


      return map;

    }, [
      teams,
    ]);


  /* ========================================================
     Member Performance Rows
  ======================================================== */

  const memberRows =
    useMemo<
      MemberPerformanceRow[]
    >(() => {

      return userRecords
        .filter(
  (record) =>
    record.user.is_active !==
    false
)
        .map(
          (record) => {

            const assignment =
              activeIndividualAssignments.get(
                record.user.id
              ) ??
              null;


            const performanceSheet =
              assignment
                ? performanceSheetById.get(
                    assignment.performanceSheetId
                  ) ??
                  null
                : null;


            return {
              user:
                record,

              assignment,

              performanceSheet,

            };

          }
        );

    }, [
      userRecords,
      activeIndividualAssignments,
      performanceSheetById,
    ]);


  /* ========================================================
     Group Members By Team
  ======================================================== */

  const groupedMembers =
    useMemo(() => {

      const groups =
        new Map<
          string,
          {
            id: string;
            name: string;
            members: MemberPerformanceRow[];
          }
        >();


      for (
        const row
        of memberRows
      ) {

        const teamId =
          row.user.membership?.team_id ??
          "__no_team__";


        const team =
          teamId !==
            "__no_team__"
            ? teamById.get(
                teamId
              )
            : null;


        const groupId =
          teamId;


        const groupName =
          team?.name ??
          "Members Without a Team";


        const existing =
          groups.get(
            groupId
          );


        if (existing) {

          existing.members.push(
            row
          );

        } else {

          groups.set(
            groupId,
            {
              id:
                groupId,

              name:
                groupName,

              members: [
                row,
              ],
            }
          );

        }

      }


      return Array.from(
        groups.values()
      ).sort(
        (
          first,
          second
        ) => {

          if (
            first.id ===
              "__no_team__"
          ) {
            return 1;
          }

          if (
            second.id ===
              "__no_team__"
          ) {
            return -1;
          }

          return first.name.localeCompare(
            second.name
          );

        }
      );

    }, [
      memberRows,
      teamById,
    ]);


  /* ========================================================
     Counts
  ======================================================== */

  const assignedMemberCount =
    memberRows.filter(
      (row) =>
        row.assignment !==
        null
    ).length;


  const unassignedMemberCount =
    memberRows.length -
    assignedMemberCount;


  /* ========================================================
     Render
  ======================================================== */

  return (

    <main className="min-h-screen bg-gray-50 px-8 py-10">

      <div className="mx-auto max-w-7xl space-y-8">


        {/* ==================================================
            Header
        ================================================== */}

        <AdminPageHeader
          title="Performance"
          description="Manage the active Performance Sheet experience for each member of the selected organization."
          actions={
            <Button
              asChild
              variant="outline"
            >
              <Link
                href={
                  selectedOrganizationId
                    ? `/builder?organizationId=${encodeURIComponent(
                        selectedOrganizationId
                      )}`
                    : "/builder"
                }
              >
                Open Builder
              </Link>
            </Button>
          }
        />


        {/* ==================================================
            Organization Context
        ================================================== */}

        {!isLoading &&
          organization && (

            <section className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Organization
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {
                      organization.company_name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Current member performance management
                  </p>

                </div>


                <div className="flex gap-3">

                  <div className="rounded-lg bg-gray-100 px-4 py-3">

                    <p className="text-xs text-muted-foreground">
                      Members
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {
                        memberRows.length
                      }
                    </p>

                  </div>


                  <div className="rounded-lg bg-gray-100 px-4 py-3">

                    <p className="text-xs text-muted-foreground">
                      Active Sheets
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {
                        assignedMemberCount
                      }
                    </p>

                  </div>

                </div>

              </div>

            </section>

          )}


        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">

            <p className="text-sm text-red-700">
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

          <section className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm text-muted-foreground">
              Loading member performance...
            </p>

          </section>

        )}


        {/* ==================================================
            Member Performance
        ================================================== */}

        {!isLoading &&
          organization &&
          !errorMessage && (

            <section className="rounded-xl border bg-white shadow-sm">


              {/* ==================================================
                  Section Header
              ================================================== */}

              <div className="border-b p-6">

                <h2 className="text-xl font-semibold">
                  Member Performance
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Members are grouped by Team. Manage opens the member's active Runtime Performance experience.
                </p>

              </div>


              {/* ==================================================
                  Empty State
              ================================================== */}

              {memberRows.length ===
                0 ? (

                <div className="p-8">

                  <p className="text-sm text-muted-foreground">
                    No active members are available for this organization.
                  </p>

                </div>

              ) : (

                <div className="divide-y">

                  {groupedMembers.map(
                    (
                      group
                    ) => (

                      <div
                        key={
                          group.id
                        }
                        className="p-6"
                      >


                        {/* ==================================================
                            Team Header
                        ================================================== */}

                        <div className="mb-4 flex items-center justify-between gap-4">

                          <div>

                            <h3 className="text-lg font-semibold">
                              {
                                group.name
                              }
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {
                                group.members.length
                              }{" "}
                              {
                                group.members.length ===
                                1
                                  ? "member"
                                  : "members"
                              }
                            </p>

                          </div>

                        </div>


                        {/* ==================================================
                            Member Rows
                        ================================================== */}

                        <div className="overflow-hidden rounded-lg border">

                          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px] gap-4 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">

                            <span>
                              Member
                            </span>

                            <span>
                              Performance Sheet
                            </span>

                            <span className="text-right">
                              Action
                            </span>

                          </div>


                          <div className="divide-y">

                            {group.members.map(
                              (
                                row
                              ) => {

                                const user =
                                  row.user.user;


                                const displayName =
                                  user.display_name?.trim()
                                  ||
                                  `${user.first_name} ${user.last_name}`.trim()
                                  ||
                                  user.email;


                                const departmentId =
                                  row.user.membership?.department_id;


                                const team =
                                  row.user.membership?.team_id
                                    ? teamById.get(
                                        row.user.membership.team_id
                                      )
                                    : null;


                                const manageHref =
                                  selectedOrganizationId
                                    ? `/member?organizationId=${encodeURIComponent(
                                        selectedOrganizationId
                                      )}&subjectId=${encodeURIComponent(
                                        user.id
                                      )}`
                                    : `/member?subjectId=${encodeURIComponent(
                                        user.id
                                      )}`;


                                return (

                                  <div
                                    key={
                                      user.id
                                    }
                                    className="grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px] md:items-center"
                                  >


                                    {/* Member */}

                                    <div className="min-w-0">

                                      <p className="font-medium">
                                        {
                                          displayName
                                        }
                                      </p>

                                      <p className="mt-1 truncate text-sm text-muted-foreground">
                                        {
                                          user.email
                                        }
                                      </p>

                                      {team && (

                                        <p className="mt-1 text-xs text-muted-foreground">
                                          Team:{" "}
                                          {
                                            team.name
                                          }
                                        </p>

                                      )}

                                      {!team &&
                                        departmentId && (

                                          <p className="mt-1 text-xs text-muted-foreground">
                                            Department member
                                          </p>

                                        )}

                                    </div>


                                    {/* Performance Sheet */}

                                    <div className="min-w-0">

                                      {row.performanceSheet ? (

                                        <>

                                          <p className="font-medium">
                                            {
                                              row.performanceSheet.name
                                            }
                                          </p>

                                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">

                                            <span>
                                              Version{" "}
                                              {
                                                row.performanceSheet.version
                                              }
                                            </span>

                                            <span>
                                              Published
                                            </span>

                                          </div>

                                        </>

                                      ) : row.assignment ? (

                                        <>

                                          <p className="font-medium text-amber-700">
                                            Performance Sheet unavailable
                                          </p>

                                          <p className="mt-1 text-xs text-muted-foreground">
                                            The active assignment references a Performance Sheet that is not currently available as a published version.
                                          </p>

                                        </>

                                      ) : (

                                        <>

                                          <p className="font-medium text-muted-foreground">
                                            No Performance Sheet assigned
                                          </p>

                                          <p className="mt-1 text-xs text-muted-foreground">
                                            This member does not currently have an active individual Performance Sheet assignment.
                                          </p>

                                        </>

                                      )}

                                    </div>


                                    {/* Manage */}

                                    <div className="flex justify-start md:justify-end">

                                      {row.assignment ? (

                                        <Button
                                          asChild
                                          size="sm"
                                        >
                                          <Link
                                            href={
                                              manageHref
                                            }
                                          >
                                            Manage
                                          </Link>
                                        </Button>

                                      ) : (

                                        <Button
                                          asChild
                                          size="sm"
                                          variant="outline"
                                        >
                                          <Link
                                            href={
                                              selectedOrganizationId
                                                ? `/admin/assignments?organizationId=${encodeURIComponent(
                                                    selectedOrganizationId
                                                  )}`
                                                : "/admin/assignments"
                                            }
                                          >
                                            Assign
                                          </Link>
                                        </Button>

                                      )}

                                    </div>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          )}


        {/* ==================================================
            Unassigned Summary
        ================================================== */}

        {!isLoading &&
          organization &&
          unassignedMemberCount > 0 && (

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="font-semibold text-amber-900">
                    Members without an active Performance Sheet
                  </h3>

                  <p className="mt-1 text-sm text-amber-800">
                    {
                      unassignedMemberCount
                    }{" "}
                    {
                      unassignedMemberCount ===
                      1
                        ? "member does"
                        : "members do"
                    }{" "}
                    not currently have an active individual Performance Sheet assignment.
                  </p>

                </div>


                <Button
                  asChild
                  variant="outline"
                >
                  <Link
                    href={
                      selectedOrganizationId
                        ? `/admin/assignments?organizationId=${encodeURIComponent(
                            selectedOrganizationId
                          )}`
                        : "/admin/assignments"
                    }
                  >
                    Manage Assignments
                  </Link>
                </Button>

              </div>

            </section>

          )}

      </div>

    </main>

  );

}