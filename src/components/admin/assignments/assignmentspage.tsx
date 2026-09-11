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
  createAssignment,
  activateAssignment,
  cancelAssignment,
  reassignPerformanceSheet,
} from "@/services/assignment.service";

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
   Assignment Management Page
   ----------------------------------------------------------
   Product rule:

   Performance Sheets are assigned only to individual members.

   Teams are used only for grouping members in the
   administrative experience.

   Team / Department / Organization Performance Sheets
   are not part of the product model.
========================================================== */

export default function AssignmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedOrganizationId =
    searchParams.get("organizationId");

  /* ========================================================
     Core Data
  ======================================================== */

  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(null);

  const [
    assignments,
    setAssignments,
  ] = useState<Assignment[]>([]);

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<PerformanceSheetRecord[]>([]);

  const [
    users,
    setUsers,
  ] = useState<UserManagementRecord[]>([]);

  const [
    teams,
    setTeams,
  ] = useState<Team[]>([]);

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
  ] = useState<string | null>(null);

  /* ========================================================
     Assign Member State
  ======================================================== */

  const [
    memberToAssign,
    setMemberToAssign,
  ] = useState<UserManagementRecord | null>(null);

  const [
    selectedPerformanceSheetId,
    setSelectedPerformanceSheetId,
  ] = useState("");

  const [
    selectedAssignedByUserId,
    setSelectedAssignedByUserId,
  ] = useState("");

  const [
    isAssigning,
    setIsAssigning,
  ] = useState(false);

  const [
    assignError,
    setAssignError,
  ] = useState<string | null>(null);

  /* ========================================================
     View Assignment State
  ======================================================== */

  const [
    viewedAssignment,
    setViewedAssignment,
  ] = useState<Assignment | null>(null);

  /* ========================================================
     Assignment History State
  ======================================================== */

  const [
    historyMemberId,
    setHistoryMemberId,
  ] = useState<string | null>(null);

  /* ========================================================
     Reassignment State
  ======================================================== */

  const [
    reassignmentAssignment,
    setReassignmentAssignment,
  ] = useState<Assignment | null>(null);

  const [
    selectedReplacementPerformanceSheetId,
    setSelectedReplacementPerformanceSheetId,
  ] = useState("");

  const [
    selectedReassignedByUserId,
    setSelectedReassignedByUserId,
  ] = useState("");

  const [
    isReassigning,
    setIsReassigning,
  ] = useState(false);

  const [
    reassignError,
    setReassignError,
  ] = useState<string | null>(null);

  /* ========================================================
     Lifecycle State
  ======================================================== */

  const [
    isManaging,
    setIsManaging,
  ] = useState(false);

  const [
    manageError,
    setManageError,
  ] = useState<string | null>(null);

  /* ========================================================
     Load Data
  ======================================================== */

  const loadData = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization(
            selectedOrganizationId ?? undefined
          );

        if (!existingOrganization) {
          setOrganization(null);

          setErrorMessage(
            "No organization has been configured yet."
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
        ] = await Promise.all([
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
          "Failed to load assignments:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load assignments."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedOrganizationId]
  );

  /* ========================================================
     Initialize
  ======================================================== */

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    }, [performanceSheets]);

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
    }, [teams]);

  /* ========================================================
     Active Individual Assignments
     --------------------------------------------------------
     Runtime expects one current individual assignment.

     If historical/test data contains more than one active
     assignment, the newest assignment wins for this page,
     matching the existing Runtime resolution behavior.
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
        const assignment of activeAssignments
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
    }, [assignments]);

  /* ========================================================
     Draft Individual Assignments
  ======================================================== */

  const draftAssignmentByMember =
    useMemo(() => {
      const map =
        new Map<
          string,
          Assignment
        >();

      const draftAssignments =
        assignments
          .filter(
            (assignment) =>
              assignment.assignmentType ===
                "individual" &&
              assignment.status ===
                "draft"
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
        const assignment of draftAssignments
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
    }, [assignments]);

  /* ========================================================
     Acting User Options
  ======================================================== */

  const actingUserOptions =
    useMemo(() => {
      return users
        .filter(
          (record) =>
            record.user.is_active &&
            record.membership !== null
        )
        .map(
          (record) => ({
            id:
              record.user.id,

            label:
              record.user.display_name ||
              `${record.user.first_name} ${record.user.last_name}`.trim() ||
              record.user.email,
          })
        );
    }, [users]);

  /* ========================================================
     Member Groups
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
            record.user.is_active !== false
        );

      for (
        const record of activeMembers
      ) {
        const teamId =
          record.membership?.team_id ??
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
      ).sort(
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
     Assignment Counts
  ======================================================== */

  const activeMemberCount =
    activeAssignmentByMember.size;

  const memberCount =
    users.filter(
      (record) =>
        record.user.is_active !== false
    ).length;

  /* ========================================================
     Assignment History
  ======================================================== */

  const historyAssignments =
    useMemo(() => {
      if (!historyMemberId) {
        return [];
      }

      return assignments
        .filter(
          (assignment) =>
            assignment.assignmentType ===
              "individual" &&
            assignment.subjectId ===
              historyMemberId
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
    }, [
      assignments,
      historyMemberId,
    ]);

  const historyMember =
    useMemo(() => {
      if (!historyMemberId) {
        return null;
      }

      return (
        users.find(
          (record) =>
            record.user.id ===
            historyMemberId
        ) ?? null
      );
    }, [
      historyMemberId,
      users,
    ]);

  /* ========================================================
     Open Assign Member
  ======================================================== */

  function openAssignMember(
    record: UserManagementRecord
  ) {
    setAssignError(null);

    setMemberToAssign(
      record
    );

    setSelectedPerformanceSheetId("");

    /*
     * Development convenience:
     * preselect the first active organization user.
     *
     * Production authentication will eventually provide
     * the acting user automatically.
     */
    setSelectedAssignedByUserId(
      actingUserOptions[0]?.id ??
        ""
    );
  }

  /* ========================================================
     Close Assign Member
  ======================================================== */

  function closeAssignMember() {
    if (isAssigning) {
      return;
    }

    setMemberToAssign(
      null
    );

    setSelectedPerformanceSheetId(
      ""
    );

    setSelectedAssignedByUserId(
      ""
    );

    setAssignError(null);
  }

  /* ========================================================
     Create Member Assignment
  ======================================================== */

  async function handleAssignMember() {
    setAssignError(null);

    if (!organization) {
      setAssignError(
        "No organization has been configured."
      );

      return;
    }

    if (!memberToAssign) {
      setAssignError(
        "No member has been selected."
      );

      return;
    }

    if (!selectedPerformanceSheetId) {
      setAssignError(
        "Please select a published Performance Sheet."
      );

      return;
    }

    if (!selectedAssignedByUserId) {
      setAssignError(
        "Please select the user creating this assignment."
      );

      return;
    }

    if (
      activeAssignmentByMember.has(
        memberToAssign.user.id
      )
    ) {
      setAssignError(
        "This member already has an active Performance Sheet assignment. Use View to work with the existing assignment."
      );

      return;
    }

    setIsAssigning(true);

    try {
      await createAssignment({
        organizationId:
          organization.id,

        performanceSheetId:
          selectedPerformanceSheetId,

        assignmentType:
          "individual",

        subjectId:
          memberToAssign.user.id,

        status:
          "draft",

        assignedBy:
          selectedAssignedByUserId,
      });

      await loadData();

      closeAssignMember();
    } catch (error) {
      console.error(
        "Failed to assign Performance Sheet:",
        error
      );

      setAssignError(
        error instanceof Error
          ? error.message
          : "Failed to assign Performance Sheet."
      );
    } finally {
      setIsAssigning(false);
    }
  }

  /* ========================================================
     Open View Assignment
  ======================================================== */

  function openViewAssignment(
    assignment: Assignment
  ) {
    setManageError(null);

    setViewedAssignment(
      assignment
    );
  }

  /* ========================================================
     Close View Assignment
  ======================================================== */

  function closeViewAssignment() {
    if (isManaging) {
      return;
    }

    setViewedAssignment(
      null
    );

    setManageError(null);
  }

  /* ========================================================
     View Performance
  ======================================================== */

  function handleViewPerformance(
    assignment: Assignment
  ) {
    if (!organization) {
      return;
    }

    router.push(
      `/member?organizationId=${encodeURIComponent(
        organization.id
      )}&subjectId=${encodeURIComponent(
        assignment.subjectId
      )}`
    );
  }

  /* ========================================================
     Open Performance History
     --------------------------------------------------------
     The dedicated historical runtime view is not yet
     implemented. The member performance route remains the
     current runtime experience.
  ======================================================== */

  function handleViewPerformanceHistory(
    assignment: Assignment
  ) {
    if (!organization) {
      return;
    }

    router.push(
      `/member?organizationId=${encodeURIComponent(
        organization.id
      )}&subjectId=${encodeURIComponent(
        assignment.subjectId
      )}`
    );
  }

  /* ========================================================
     Open Assignment History
  ======================================================== */

  function handleViewAssignmentHistory(
    assignment: Assignment
  ) {
    setHistoryMemberId(
      assignment.subjectId
    );

    setViewedAssignment(
      null
    );
  }

  /* ========================================================
     Open Reassignment
  ======================================================== */

  function openReassignment(
    assignment: Assignment
  ) {
    setReassignError(null);

    setSelectedReplacementPerformanceSheetId("");

    setSelectedReassignedByUserId(
      actingUserOptions[0]?.id ??
        ""
    );

    setReassignmentAssignment(
      assignment
    );

    setViewedAssignment(
      null
    );
  }

  /* ========================================================
     Close Reassignment
  ======================================================== */

  function closeReassignment() {
    if (isReassigning) {
      return;
    }

    setReassignmentAssignment(
      null
    );

    setSelectedReplacementPerformanceSheetId(
      ""
    );

    setSelectedReassignedByUserId(
      ""
    );

    setReassignError(null);
  }

  /* ========================================================
     Execute Reassignment
  ======================================================== */

  async function handleReassignPerformanceSheet() {
    setReassignError(null);

    if (!organization) {
      setReassignError(
        "No organization has been configured."
      );

      return;
    }

    if (!reassignmentAssignment) {
      setReassignError(
        "No assignment has been selected."
      );

      return;
    }

    if (
      reassignmentAssignment.assignmentType !==
      "individual"
    ) {
      setReassignError(
        "Only individual member assignments can be reassigned."
      );

      return;
    }

    if (
      reassignmentAssignment.status !==
      "active"
    ) {
      setReassignError(
        "Only an active Performance Sheet assignment can be reassigned."
      );

      return;
    }

    if (
      !selectedReplacementPerformanceSheetId
    ) {
      setReassignError(
        "Please select the replacement Performance Sheet."
      );

      return;
    }

    if (
      selectedReplacementPerformanceSheetId ===
      reassignmentAssignment.performanceSheetId
    ) {
      setReassignError(
        "Please select a different Performance Sheet."
      );

      return;
    }

    if (!selectedReassignedByUserId) {
      setReassignError(
        "Please select the user performing the reassignment."
      );

      return;
    }

    setIsReassigning(true);

    try {
      await reassignPerformanceSheet(
        organization.id,
        reassignmentAssignment.id,
        selectedReplacementPerformanceSheetId,
        selectedReassignedByUserId
      );

      await loadData();

      closeReassignment();
    } catch (error) {
      console.error(
        "Failed to reassign Performance Sheet:",
        error
      );

      setReassignError(
        error instanceof Error
          ? error.message
          : "Failed to reassign Performance Sheet."
      );
    } finally {
      setIsReassigning(false);
    }
  }

  /* ========================================================
     Activate Assignment
  ======================================================== */

  async function handleActivateAssignment(
    assignment: Assignment
  ) {
    if (!organization) {
      return;
    }

    setIsManaging(true);
    setManageError(null);

    try {
      await activateAssignment(
        organization.id,
        assignment.id
      );

      await loadData();

      setViewedAssignment(
        null
      );
    } catch (error) {
      console.error(
        "Failed to activate assignment:",
        error
      );

      setManageError(
        error instanceof Error
          ? error.message
          : "Failed to activate assignment."
      );
    } finally {
      setIsManaging(false);
    }
  }

  /* ========================================================
     Cancel Assignment
  ======================================================== */

  async function handleCancelAssignment(
    assignment: Assignment
  ) {
    if (!organization) {
      return;
    }

    setIsManaging(true);
    setManageError(null);

    try {
      await cancelAssignment(
        organization.id,
        assignment.id
      );

      await loadData();

      setViewedAssignment(
        null
      );
    } catch (error) {
      console.error(
        "Failed to cancel assignment:",
        error
      );

      setManageError(
        error instanceof Error
          ? error.message
          : "Failed to cancel assignment."
      );
    } finally {
      setIsManaging(false);
    }
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

        <AdminPageHeader
          title="Assignments"
          description="Assign Performance Sheets to individual members of the selected organization."
        />

        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ==================================================
            Loading
        ================================================== */}

        {isLoading && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading Assignments...
            </p>
          </section>
        )}

        {/* ==================================================
            Organization Summary
        ================================================== */}

        {!isLoading &&
          organization && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Organization
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {organization.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Member Performance Assignment
                  </p>
                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm">
                    <div className="text-xs text-muted-foreground">
                      Members
                    </div>

                    <div className="mt-1 font-semibold">
                      {memberCount}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm">
                    <div className="text-xs text-muted-foreground">
                      Assigned
                    </div>

                    <div className="mt-1 font-semibold">
                      {activeMemberCount}
                    </div>
                  </div>

                </div>

              </div>

            </section>
          )}

        {/* ==================================================
            Member Assignments
        ================================================== */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Member Performance Assignments
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Assign published Performance Sheets to individual members. Teams are used only to organize the member list.
                </p>
              </div>

            </div>

            {memberGroups.length === 0 ? (
              <div className="p-6">

                <p className="text-sm text-muted-foreground">
                  No active members were found in this organization.
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
                          Team Group
                      ================================== */}

                      <div className="mb-4">

                        <h3 className="text-base font-semibold">
                          {group.teamName}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {group.members.length}{" "}
                          {group.members.length === 1
                            ? "member"
                            : "members"}
                        </p>

                      </div>

                      {/* ==================================
                          Members
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

                              const draftAssignment =
                                draftAssignmentByMember.get(
                                  memberId
                                );

                              const currentAssignment =
                                activeAssignment ??
                                draftAssignment ??
                                null;

                              const performanceSheet =
                                currentAssignment
                                  ? performanceSheetMap.get(
                                      currentAssignment.performanceSheetId
                                    )
                                  : null;

                              const memberName =
                                record.user.display_name ||
                                `${record.user.first_name} ${record.user.last_name}`.trim() ||
                                record.user.email;

                              return (
                                <div
                                  key={
                                    memberId
                                  }
                                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4"
                                >

                                  {/* ==============================
                                      Member
                                  ============================== */}

                                  <div className="min-w-0">

                                    <p className="font-medium">
                                      {memberName}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {record.user.email}
                                    </p>

                                  </div>

                                  {/* ==============================
                                      Performance Sheet
                                  ============================== */}

                                  <div className="min-w-0">

                                    {performanceSheet ? (
                                      <>
                                        <p className="truncate text-sm">
                                          {
                                            performanceSheet.name
                                          }
                                        </p>

                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">

                                          <span>
                                            Version{" "}
                                            {
                                              performanceSheet.version
                                            }
                                          </span>

                                          <StatusBadge
                                            status={
                                              currentAssignment?.status ??
                                              "draft"
                                            }
                                          />

                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No Performance Sheet assigned
                                      </p>
                                    )}

                                  </div>

                                  {/* ==============================
                                      Action
                                  ============================== */}

                                  <div className="flex justify-end">

                                    {currentAssignment ? (
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          openViewAssignment(
                                            currentAssignment
                                          )
                                        }
                                      >
                                        View
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() =>
                                          openAssignMember(
                                            record
                                          )
                                        }
                                      >
                                        Assign
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

      </div>

      {/* ======================================================
          Assign Member Modal
      ====================================================== */}

      {memberToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Assign Member
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {memberToAssign.user.display_name ||
                      `${memberToAssign.user.first_name} ${memberToAssign.user.last_name}`.trim() ||
                      memberToAssign.user.email}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Assign a published Performance Sheet to this individual member.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeAssignMember
                  }
                  disabled={isAssigning}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="space-y-6 px-6 py-6">

              {assignError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {assignError}
                  </p>
                </div>
              )}

              <div className="space-y-2">

                <label
                  htmlFor="member-performance-sheet"
                  className="text-sm font-medium"
                >
                  Performance Sheet
                </label>

                <select
                  id="member-performance-sheet"
                  value={
                    selectedPerformanceSheetId
                  }
                  onChange={(event) =>
                    setSelectedPerformanceSheetId(
                      event.target.value
                    )
                  }
                  disabled={isAssigning}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >

                  <option value="">
                    Select a published Performance Sheet
                  </option>

                  {performanceSheets.map(
                    (sheet) => (
                      <option
                        key={sheet.id}
                        value={sheet.id}
                      >
                        {sheet.name} — Version{" "}
                        {sheet.version}
                      </option>
                    )
                  )}

                </select>

                {performanceSheets.length ===
                  0 && (
                  <p className="text-xs text-amber-600">
                    No published Performance Sheets are available.
                  </p>
                )}

              </div>

              <div className="space-y-2">

                <label
                  htmlFor="member-assigned-by"
                  className="text-sm font-medium"
                >
                  Acting User
                </label>

                <select
                  id="member-assigned-by"
                  value={
                    selectedAssignedByUserId
                  }
                  onChange={(event) =>
                    setSelectedAssignedByUserId(
                      event.target.value
                    )
                  }
                  disabled={
                    isAssigning ||
                    actingUserOptions.length === 0
                  }
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >

                  <option value="">
                    Select the user creating this assignment
                  </option>

                  {actingUserOptions.map(
                    (user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.label}
                      </option>
                    )
                  )}

                </select>

                <p className="text-xs text-muted-foreground">
                  Development mode: authentication will provide the acting user in the production authorization model.
                </p>

              </div>

              <div className="rounded-lg border bg-gray-50 p-4">

                <p className="text-sm font-medium">
                  Assignment lifecycle
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  New member assignments are created as{" "}
                  <span className="font-medium">
                    Draft
                  </span>
                  . They must be activated before Runtime performance can be created.
                </p>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeAssignMember
                }
                disabled={isAssigning}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  handleAssignMember
                }
                disabled={
                  isAssigning ||
                  !selectedPerformanceSheetId ||
                  !selectedAssignedByUserId
                }
              >
                {isAssigning
                  ? "Assigning..."
                  : "Create Assignment"}
              </Button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          View Assignment Modal
      ====================================================== */}

      {viewedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Member Assignment
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    View Assignment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    View the member's current Performance Sheet assignment and available actions.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeViewAssignment
                  }
                  disabled={isManaging}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="space-y-5 px-6 py-6">

              {manageError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {manageError}
                  </p>
                </div>
              )}

              {/* ==========================================
                  Assignment Summary
              ========================================== */}

              <div className="rounded-lg border bg-gray-50 p-4">

                <div className="space-y-3 text-sm">

                  <div>
                    <span className="font-medium text-gray-700">
                      Member:
                    </span>{" "}
                    {getMemberNameFromAssignment(
                      viewedAssignment,
                      users
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Performance Sheet:
                    </span>{" "}
                    {performanceSheetMap.get(
                      viewedAssignment.performanceSheetId
                    )
                      ? `${performanceSheetMap.get(
                          viewedAssignment.performanceSheetId
                        )?.name} — Version ${performanceSheetMap.get(
                          viewedAssignment.performanceSheetId
                        )?.version}`
                      : "Unavailable"}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Status:
                    </span>{" "}
                    <StatusBadge
                      status={
                        viewedAssignment.status
                      }
                    />
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Assigned:
                    </span>{" "}
                    {formatDate(
                      viewedAssignment.assignedAt
                    )}
                  </div>

                </div>

              </div>

              {/* ==========================================
                  Performance Actions
              ========================================== */}

              <div className="space-y-3">

                <p className="text-sm font-medium">
                  Performance
                </p>

                <Button
                  type="button"
                  className="w-full justify-start"
                  onClick={() =>
                    handleViewPerformance(
                      viewedAssignment
                    )
                  }
                >
                  View Performance
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    handleViewPerformanceHistory(
                      viewedAssignment
                    )
                  }
                >
                  Performance History
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    handleViewAssignmentHistory(
                      viewedAssignment
                    )
                  }
                >
                  Assignment History
                </Button>

              </div>

              {/* ==========================================
                  Assignment Management
              ========================================== */}

              <div className="space-y-3">

                <p className="text-sm font-medium">
                  Assignment Management
                </p>

                {viewedAssignment.status ===
                  "active" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      openReassignment(
                        viewedAssignment
                      )
                    }
                  >
                    Reassign Performance Sheet
                  </Button>
                )}

                {viewedAssignment.status ===
                  "draft" && (
                  <Button
                    type="button"
                    className="w-full justify-start"
                    onClick={() =>
                      handleActivateAssignment(
                        viewedAssignment
                      )
                    }
                    disabled={isManaging}
                  >
                    {isManaging
                      ? "Activating..."
                      : "Activate Assignment"}
                  </Button>
                )}

                {viewedAssignment.status ===
                  "active" && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() =>
                      handleCancelAssignment(
                        viewedAssignment
                      )
                    }
                    disabled={isManaging}
                  >
                    {isManaging
                      ? "Cancelling..."
                      : "Cancel Assignment"}
                  </Button>
                )}

              </div>

            </div>

            <div className="flex justify-end border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeViewAssignment
                }
                disabled={isManaging}
              >
                Close
              </Button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          Assignment History Modal
      ====================================================== */}

      {historyMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-2xl rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Assignment History
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {historyMember
                      ? getMemberName(
                          historyMember
                        )
                      : "Member"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Historical Performance Sheet assignments for this member.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHistoryMemberId(
                      null
                    )
                  }
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="px-6 py-6">

              {historyAssignments.length ===
              0 ? (
                <p className="text-sm text-muted-foreground">
                  No assignment history was found for this member.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border">

                  <div className="grid grid-cols-[minmax(0,1.5fr)_auto_auto] border-b bg-gray-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">

                    <div>
                      Performance Sheet
                    </div>

                    <div>
                      Status
                    </div>

                    <div>
                      Assigned
                    </div>

                  </div>

                  <div className="divide-y">

                    {historyAssignments.map(
                      (assignment) => {
                        const sheet =
                          performanceSheetMap.get(
                            assignment.performanceSheetId
                          );

                        return (
                          <div
                            key={
                              assignment.id
                            }
                            className="grid grid-cols-[minmax(0,1.5fr)_auto_auto] items-center gap-4 px-4 py-4"
                          >

                            <div className="min-w-0">

                              <p className="truncate text-sm font-medium">
                                {sheet?.name ??
                                  "Unavailable"}
                              </p>

                              {sheet && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Version{" "}
                                  {
                                    sheet.version
                                  }
                                </p>
                              )}

                            </div>

                            <StatusBadge
                              status={
                                assignment.status
                              }
                            />

                            <p className="text-xs text-muted-foreground">
                              {formatDate(
                                assignment.assignedAt
                              )}
                            </p>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </div>

            <div className="flex justify-end border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setHistoryMemberId(
                    null
                  )
                }
              >
                Close
              </Button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          Reassign Performance Sheet Modal
      ====================================================== */}

      {reassignmentAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Reassign Performance Sheet
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Change Member Assignment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    The existing assignment will remain preserved as historical record and a new active assignment will be created.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeReassignment
                  }
                  disabled={isReassigning}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="space-y-6 px-6 py-6">

              {reassignError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {reassignError}
                  </p>
                </div>
              )}

              {/* ==========================================
                  Member
              ========================================== */}

              <div className="rounded-lg border bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Member
                </p>

                <p className="mt-1 text-sm font-medium">
                  {getMemberNameFromAssignment(
                    reassignmentAssignment,
                    users
                  )}
                </p>

              </div>

              {/* ==========================================
                  Current Sheet
              ========================================== */}

              <div className="space-y-2">

                <p className="text-sm font-medium">
                  Current Performance Sheet
                </p>

                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">

                  {performanceSheetMap.get(
                    reassignmentAssignment.performanceSheetId
                  )
                    ? `${performanceSheetMap.get(
                        reassignmentAssignment.performanceSheetId
                      )?.name} — Version ${performanceSheetMap.get(
                        reassignmentAssignment.performanceSheetId
                      )?.version}`
                    : "Unavailable"}

                </div>

              </div>

              {/* ==========================================
                  Replacement Sheet
              ========================================== */}

              <div className="space-y-2">

                <label
                  htmlFor="replacement-performance-sheet"
                  className="text-sm font-medium"
                >
                  Replacement Performance Sheet
                </label>

                <select
                  id="replacement-performance-sheet"
                  value={
                    selectedReplacementPerformanceSheetId
                  }
                  onChange={(event) =>
                    setSelectedReplacementPerformanceSheetId(
                      event.target.value
                    )
                  }
                  disabled={isReassigning}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >

                  <option value="">
                    Select a published Performance Sheet
                  </option>

                  {performanceSheets
                    .filter(
                      (sheet) =>
                        sheet.id !==
                        reassignmentAssignment.performanceSheetId
                    )
                    .map(
                      (sheet) => (
                        <option
                          key={sheet.id}
                          value={sheet.id}
                        >
                          {sheet.name} — Version{" "}
                          {sheet.version}
                        </option>
                      )
                    )}

                </select>

              </div>

              {/* ==========================================
                  Acting User
              ========================================== */}

              <div className="space-y-2">

                <label
                  htmlFor="reassigned-by"
                  className="text-sm font-medium"
                >
                  Acting User
                </label>

                <select
                  id="reassigned-by"
                  value={
                    selectedReassignedByUserId
                  }
                  onChange={(event) =>
                    setSelectedReassignedByUserId(
                      event.target.value
                    )
                  }
                  disabled={
                    isReassigning ||
                    actingUserOptions.length === 0
                  }
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >

                  <option value="">
                    Select the user performing the reassignment
                  </option>

                  {actingUserOptions.map(
                    (user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.label}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ==========================================
                  Historical Preservation Notice
              ========================================== */}

              <div className="rounded-lg border bg-gray-50 p-4">

                <p className="text-sm font-medium">
                  Historical preservation
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  The previous assignment is not overwritten. It will remain available in Assignment History, while the replacement becomes the member's new active Performance Sheet assignment.
                </p>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeReassignment
                }
                disabled={isReassigning}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  handleReassignPerformanceSheet
                }
                disabled={
                  isReassigning ||
                  !selectedReplacementPerformanceSheetId ||
                  !selectedReassignedByUserId
                }
              >
                {isReassigning
                  ? "Reassigning..."
                  : "Confirm Reassignment"}
              </Button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

/* ==========================================================
   Member Name From Assignment
========================================================== */

function getMemberNameFromAssignment(
  assignment: Assignment,
  users: UserManagementRecord[]
): string {
  const record =
    users.find(
      (item) =>
        item.user.id ===
        assignment.subjectId
    );

  if (!record) {
    return "Unknown Member";
  }

  return getMemberName(
    record
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
   Status Badge
========================================================== */

function StatusBadge({
  status,
}: {
  status: Assignment["status"];
}) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium">
      {formatAssignmentStatus(
        status
      )}
    </span>
  );
}

/* ==========================================================
   Assignment Status
========================================================== */

function formatAssignmentStatus(
  status: Assignment["status"]
): string {
  switch (status) {
    case "draft":
      return "Draft";

    case "active":
      return "Active";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

/* ==========================================================
   Date Formatting
========================================================== */

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
}