"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

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

import type {
  Assignment,
} from "@/lib/domain/assignment";

import {
  findPublishedPerformanceSheetsByOrganization,
  type PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

/* ==========================================================
   Organization Admin Performance Sheets
   ----------------------------------------------------------
   Product rule:

   Performance Sheets belong to individual members.

   This page is the Organization Admin version of the
   Super Admin member-performance view.

   The Organization Admin operates inside one organization.
   There is intentionally NO organization selector here.

   This page does NOT manage Performance Sheet definitions
   or versions. Builder owns those definitions.

   This page shows:

   Organization
      ↓
   Members
      ↓
   Assigned Performance Sheet
      ↓
   Manage
      ↓
   Member Runtime Performance
========================================================== */

export default function OrganizationPerformanceSheetsPage() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  /*
   * Temporary organization context.
   *
   * Authentication / authorization will eventually provide
   * the organization directly from the authenticated
   * Organization Membership.
   */
  const organizationId =
    searchParams.get(
      "organizationId"
    );

  /* ========================================================
     Core Data
  ======================================================== */

  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(
    null
  );

  const [
    assignments,
    setAssignments,
  ] = useState<Assignment[]>(
    []
  );

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<PerformanceSheetRecord[]>(
    []
  );

  const [
    users,
    setUsers,
  ] = useState<UserManagementRecord[]>(
    []
  );

  const [
    teams,
    setTeams,
  ] = useState<Team[]>(
    []
  );

  /* ========================================================
     Page State
  ======================================================== */

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  /* ========================================================
     Load Data
  ======================================================== */

  const loadData =
    useCallback(
      async () => {
        try {
          setIsLoading(true);

          setErrorMessage(null);

          if (!organizationId) {
            setOrganization(null);

            setAssignments([]);

            setPerformanceSheets([]);

            setUsers([]);

            setTeams([]);

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
            setOrganization(null);

            setAssignments([]);

            setPerformanceSheets([]);

            setUsers([]);

            setTeams([]);

            setErrorMessage(
              "The selected organization could not be found."
            );

            return;
          }

          setOrganization(
            existingOrganization
          );

          const [
            assignmentRecords,
            publishedSheets,
            userRecords,
            teamRecords,
          ] =
            await Promise.all([
              findAssignmentsByOrganization(
                existingOrganization.id
              ),

              findPublishedPerformanceSheetsByOrganization(
                existingOrganization.id
              ),

              listUserManagementRecords(
                existingOrganization.id
              ),

              getTeams(
                existingOrganization.id
              ),
            ]);

          setAssignments(
            assignmentRecords
          );

          setPerformanceSheets(
            publishedSheets
          );

          setUsers(
            userRecords
          );

          setTeams(
            teamRecords
          );
        } catch (error) {
          console.error(
            "Failed to load member Performance Sheets:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load member Performance Sheets."
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        organizationId,
      ]
    );

  /* ========================================================
     Initialize
  ======================================================== */

  useEffect(() => {
    loadData();
  }, [
    loadData,
  ]);

  /* ========================================================
     Lookup Maps
  ======================================================== */

  const performanceSheetMap =
    useMemo(() => {
      return new Map(
        performanceSheets.map(
          (sheet) => [
            sheet.id,
            sheet,
          ]
        )
      );
    }, [
      performanceSheets,
    ]);

  const teamMap =
    useMemo(() => {
      return new Map(
        teams.map(
          (team) => [
            team.id,
            team,
          ]
        )
      );
    }, [
      teams,
    ]);

  /* ========================================================
     Active Individual Assignments
     --------------------------------------------------------
     Runtime expects one current individual assignment.

     If historical/test data contains more than one active
     assignment, the newest assignment wins.
  ======================================================== */

  const activeAssignmentByMember =
    useMemo(() => {
      const map =
        new Map<
          string,
          Assignment
        >();

      const activeAssignments =
        assignments
          .filter(
            (assignment) =>
              assignment.assignmentType ===
                "individual" &&
              assignment.status ===
                "active"
          )
          .sort(
            (a, b) =>
              new Date(
                b.assignedAt
              ).getTime() -
              new Date(
                a.assignedAt
              ).getTime()
          );

      for (
        const assignment of
          activeAssignments
      ) {
        if (
          !map.has(
            assignment.subjectId
          )
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
     Member Groups
     --------------------------------------------------------
     Teams organize the display only.

     Performance Sheets remain individual-member assignments.
  ======================================================== */

  const memberGroups =
    useMemo(() => {
      const groups =
        new Map<
          string,
          {
            teamId: string | null;
            teamName: string;
            members: UserManagementRecord[];
          }
        >();

      const activeMembers =
        users.filter(
          (record) =>
            record.user.is_active !==
            false
        );

      for (
        const record of
          activeMembers
      ) {
        const teamId =
          record.membership
            ?.team_id ??
          null;

        const team =
          teamId
            ? teamMap.get(
                teamId
              )
            : null;

        const groupKey =
          teamId ??
          "unassigned";

        const existing =
          groups.get(
            groupKey
          );

        if (existing) {
          existing.members.push(
            record
          );
        } else {
          groups.set(
            groupKey,
            {
              teamId,
              teamName:
                team?.name ??
                "Unassigned Team",
              members: [
                record,
              ],
            }
          );
        }
      }

      return Array.from(
        groups.values()
      )
        .map(
          (group) => ({
            ...group,
            members:
              [...group.members].sort(
                compareMembers
              ),
          })
        )
        .sort(
          (a, b) =>
            a.teamName.localeCompare(
              b.teamName
            )
        );
    }, [
      users,
      teamMap,
    ]);

  /* ========================================================
     Counts
  ======================================================== */

  const memberCount =
    users.filter(
      (record) =>
        record.user.is_active !==
        false
    ).length;

  const activeSheetCount =
    activeAssignmentByMember.size;

  /* ========================================================
     Manage Member Performance
     --------------------------------------------------------
     Opens the existing Runtime member-performance route.

     This is NOT impersonation.

     The eventual authorization layer determines whether the
     Organization Admin is allowed to operate on this member.
  ======================================================== */

  function handleManageMember(
    memberId: string
  ) {
    if (!organizationId) {
      return;
    }

    router.push(
      `/member?organizationId=${encodeURIComponent(
        organizationId
      )}&subjectId=${encodeURIComponent(
        memberId
      )}`
    );
  }

  /* ========================================================
     Render
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <AdminPageHeader
            title="Performance Sheets"
            description="Manage the Performance Sheet experience for each member of this organization."
            showOrganizationSelector={false}
          />

          <Button
            asChild
            variant="outline"
            className="shrink-0"
          >
            <a
              href={
                organizationId
                  ? `/organization?organizationId=${encodeURIComponent(
                      organizationId
                    )}`
                  : "/organization"
              }
            >
              Back to Overview
            </a>
          </Button>

        </div>

        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </section>
        )}

        {/* ==================================================
            Loading
        ================================================== */}

        {isLoading && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading member Performance Sheets...
            </p>
          </section>
        )}

        {/* ==================================================
            Organization Summary
        ================================================== */}

        {!isLoading &&
          organization && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Organization
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-gray-950">
                    {organization.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Member Performance
                  </p>
                </div>

                <div className="flex gap-6">

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Members
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-gray-950">
                      {memberCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Active Sheets
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-gray-950">
                      {activeSheetCount}
                    </p>
                  </div>

                </div>

              </div>

            </section>
          )}

        {/* ==================================================
            Member Performance
        ================================================== */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">

              <h2 className="text-xl font-semibold text-gray-950">
                Member Performance
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View each member's assigned Performance Sheet
                and manage their performance experience.
              </p>

            </div>

            {memberGroups.length === 0 ? (

              <div className="p-6">

                <p className="text-sm text-muted-foreground">
                  No active members were found in this
                  organization.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {memberGroups.map(
                  (group) => (
                    <div
                      key={
                        group.teamId ??
                        "unassigned"
                      }
                      className="p-6"
                    >

                      {/* ==================================
                          Team
                      ================================== */}

                      <div className="mb-4">

                        <h3 className="text-base font-semibold text-gray-950">
                          {group.teamName}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {group.members.length}{" "}
                          {group.members.length ===
                          1
                            ? "member"
                            : "members"}
                        </p>

                      </div>

                      {/* ==================================
                          Member Table
                      ================================== */}

                      <div className="overflow-hidden rounded-lg border">

                        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] border-b bg-gray-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">

                          <div>
                            Member
                          </div>

                          <div>
                            Performance Sheet
                          </div>

                          <div className="text-right">
                            Action
                          </div>

                        </div>

                        <div className="divide-y">

                          {group.members.map(
                            (record) => {
                              const memberId =
                                record.user.id;

                              const activeAssignment =
                                activeAssignmentByMember.get(
                                  memberId
                                );

                              const performanceSheet =
                                activeAssignment
                                  ? performanceSheetMap.get(
                                      activeAssignment.performanceSheetId
                                    )
                                  : null;

                              const memberName =
                                getMemberName(
                                  record
                                );

                              return (
                                <div
                                  key={
                                    memberId
                                  }
                                  className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center"
                                >

                                  {/* ====================
                                      Member
                                  ==================== */}

                                  <div className="min-w-0">

                                    <p className="font-medium text-gray-950">
                                      {memberName}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {
                                        record
                                          .user
                                          .email
                                      }
                                    </p>

                                  </div>

                                  {/* ====================
                                      Performance Sheet
                                  ==================== */}

                                  <div>

                                    {activeAssignment &&
                                    performanceSheet ? (
                                      <>
                                        <p className="font-medium text-gray-950">
                                          {
                                            performanceSheet.name
                                          }
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                          Version{" "}
                                          {
                                            performanceSheet.version
                                          }{" "}
                                          ·{" "}
                                          {formatStatus(
                                            performanceSheet.status
                                          )}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No active Performance
                                        Sheet
                                      </p>
                                    )}

                                  </div>

                                  {/* ====================
                                      Action
                                  ==================== */}

                                  <div className="sm:text-right">

                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={
                                        !activeAssignment
                                      }
                                      onClick={() =>
                                        handleManageMember(
                                          memberId
                                        )
                                      }
                                    >
                                      Manage
                                    </Button>

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

      </div>
    </main>
  );
}

/* ==========================================================
   Member Name
========================================================== */

function getMemberName(
  record: UserManagementRecord
): string {
  return (
    record.user.display_name ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}

/* ==========================================================
   Member Sorting
========================================================== */

function compareMembers(
  a: UserManagementRecord,
  b: UserManagementRecord
): number {
  return getMemberName(
    a
  ).localeCompare(
    getMemberName(
      b
    )
  );
}

/* ==========================================================
   Status
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