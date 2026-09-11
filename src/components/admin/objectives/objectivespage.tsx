"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  getDepartments,
} from "@/services/department.service";

import {
  getTeams,
} from "@/services/team.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

import {
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByAssignment,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceObjectives,
  updatePerformanceInstanceObjective,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import {
  findPublishedPerformanceSheetsByOrganization,
} from "@/lib/repositories/performancesheetrepository";

import {
  getOrCreatePerformanceExecutionForMonth,
} from "@/services/assignment.service";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

import type {
  Assignment,
} from "@/lib/domain/assignment";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

/* ==========================================================
   Helpers
========================================================== */

function getCurrentMonth(): string {
  const now = new Date();

  return `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, "0")}-01`;
}

function formatMonth(
  performanceMonth: string
): string {
  const date = new Date(
    `${performanceMonth}T00:00:00Z`
  );

  if (Number.isNaN(date.getTime())) {
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

function displayUserName(
  record: UserManagementRecord
): string {
  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}

/* ==========================================================
   Objective Editor
========================================================== */

function ObjectiveEditor({
  objective,
  onSaved,
}: {
  objective: PerformanceInstanceObjective;

  onSaved: (
    objective: PerformanceInstanceObjective
  ) => void;
}) {
  const [
    title,
    setTitle,
  ] = useState(
    objective.title
  );

  const [
    description,
    setDescription,
  ] = useState(
    objective.description ?? ""
  );

  const [
    position,
    setPosition,
  ] = useState(
    String(objective.position)
  );

  const [
    weight,
    setWeight,
  ] = useState(
    objective.weight === undefined
      ? ""
      : String(objective.weight)
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    setTitle(
      objective.title
    );

    setDescription(
      objective.description ?? ""
    );

    setPosition(
      String(objective.position)
    );

    setWeight(
      objective.weight === undefined
        ? ""
        : String(objective.weight)
    );
  }, [objective]);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const parsedPosition =
        Number(position);

      if (
        !Number.isInteger(
          parsedPosition
        ) ||
        parsedPosition < 1
      ) {
        throw new Error(
          "Position must be a positive whole number."
        );
      }

      const trimmedWeight =
        weight.trim();

      const parsedWeight =
        trimmedWeight === ""
          ? undefined
          : Number(
              trimmedWeight
            );

      if (
        parsedWeight !== undefined &&
        (
          !Number.isFinite(
            parsedWeight
          ) ||
          parsedWeight < 0
        )
      ) {
        throw new Error(
          "Weight must be a valid non-negative number."
        );
      }

      const updatedObjective =
        await updatePerformanceInstanceObjective({
          performanceInstanceId:
            objective.performanceInstanceId,

          objectiveId:
            objective.id,

          title,

          description,

          weight:
            parsedWeight,

          position:
            parsedPosition,
        });

      onSaved(
        updatedObjective
      );
    } catch (error) {
      console.error(
        "Failed to update Objective:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update Objective."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Objective
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Runtime monthly snapshot
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
            #{position || "—"}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <label
            htmlFor={`objective-title-${objective.id}`}
            className="mb-2 block text-sm font-medium"
          >
            Title
          </label>

          <input
            id={`objective-title-${objective.id}`}
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#082550]/20"
          />
        </div>

        <div>
          <label
            htmlFor={`objective-description-${objective.id}`}
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id={`objective-description-${objective.id}`}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            rows={3}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#082550]/20"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`objective-position-${objective.id}`}
              className="mb-2 block text-sm font-medium"
            >
              Position
            </label>

            <input
              id={`objective-position-${objective.id}`}
              type="number"
              min="1"
              step="1"
              value={position}
              onChange={(event) =>
                setPosition(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#082550]/20"
            />
          </div>

          <div>
            <label
              htmlFor={`objective-weight-${objective.id}`}
              className="mb-2 block text-sm font-medium"
            >
              Weight
            </label>

            <input
              id={`objective-weight-${objective.id}`}
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) =>
                setWeight(
                  event.target.value
                )
              }
              placeholder="Optional"
              className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#082550]/20"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              !title.trim()
            }
            className="rounded-md bg-[#082550] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save Objective"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================
   Objectives Page
========================================================== */

export default function ObjectivesPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(
    null
  );

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    teams,
    setTeams,
  ] = useState<Team[]>([]);

  const [
    userRecords,
    setUserRecords,
  ] = useState<UserManagementRecord[]>(
    []
  );

  const [
    assignments,
    setAssignments,
  ] = useState<Assignment[]>([]);

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<
    PerformanceSheetRecord[]
  >([]);

  const [
    performanceInstances,
    setPerformanceInstances,
  ] = useState<
    PerformanceInstance[]
  >([]);

  const [
    objectives,
    setObjectives,
  ] = useState<
    PerformanceInstanceObjective[]
  >([]);

  const [
    selectedDepartmentId,
    setSelectedDepartmentId,
  ] = useState("");

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] = useState("");

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState("");

  const [
    selectedAssignmentId,
    setSelectedAssignmentId,
  ] = useState("");

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    getCurrentMonth()
  );

  const [
    selectedPerformanceInstance,
    setSelectedPerformanceInstance,
  ] = useState<
    PerformanceInstance | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoadingObjectives,
    setIsLoadingObjectives,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  /* ========================================================
     Initial Load
  ======================================================== */

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization(
            organizationId
          );

        if (!existingOrganization) {
          setErrorMessage(
            "No organization has been configured yet."
          );

          return;
        }

        const [
          loadedDepartments,
          loadedTeams,
          loadedUsers,
          loadedAssignments,
          loadedPerformanceSheets,
        ] = await Promise.all([
          getDepartments(
            existingOrganization.id
          ),

          getTeams(
            existingOrganization.id
          ),

          listUserManagementRecords(
            existingOrganization.id
          ),

          findAssignmentsByOrganization(
            existingOrganization.id
          ),

          findPublishedPerformanceSheetsByOrganization(
            existingOrganization.id
          ),
        ]);

        setOrganization(
          existingOrganization
        );

        setDepartments(
          loadedDepartments
        );

        setTeams(
          loadedTeams
        );

        setUserRecords(
          loadedUsers
        );

        setAssignments(
          loadedAssignments
        );

        setPerformanceSheets(
          loadedPerformanceSheets
        );

        setSelectedDepartmentId("");
        setSelectedTeamId("");
        setSelectedMemberId("");
        setSelectedAssignmentId("");
        setSelectedMonth(
          getCurrentMonth()
        );

        setPerformanceInstances([]);
        setObjectives([]);
        setSelectedPerformanceInstance(
          null
        );
      } catch (error) {
        console.error(
          "Failed to load Objectives:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Objectives."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [organizationId]);

  /* ========================================================
     Cascading Selectors
  ======================================================== */

  const visibleTeams =
    useMemo(
      () =>
        selectedDepartmentId
          ? teams.filter(
              (team) =>
                team.department_id ===
                selectedDepartmentId &&
                team.is_active
            )
          : [],
      [
        teams,
        selectedDepartmentId,
      ]
    );

  const visibleMembers =
    useMemo(
      () =>
        userRecords.filter(
          (record) =>
            record.user.is_active &&
            record.membership?.department_id ===
              selectedDepartmentId &&
            record.membership?.team_id ===
              selectedTeamId
        ),
      [
        userRecords,
        selectedDepartmentId,
        selectedTeamId,
      ]
    );

  const activeAssignmentsForMember =
    useMemo(
      () =>
        assignments
          .filter(
            (assignment) =>
              assignment.assignmentType ===
                "individual" &&
              assignment.status ===
                "active" &&
              assignment.subjectId ===
                selectedMemberId
          )
          .sort(
            (a, b) =>
              new Date(
                b.assignedAt
              ).getTime() -
              new Date(
                a.assignedAt
              ).getTime()
          ),
      [
        assignments,
        selectedMemberId,
      ]
    );

  const performanceSheetMap =
    useMemo(
      () =>
        new Map(
          performanceSheets.map(
            (sheet) => [
              sheet.id,
              sheet,
            ]
          )
        ),
      [performanceSheets]
    );

  const selectedAssignment =
    activeAssignmentsForMember.find(
      (assignment) =>
        assignment.id ===
        selectedAssignmentId
    ) ??
    activeAssignmentsForMember[0] ??
    null;

  const selectedPerformanceSheet =
    selectedAssignment
      ? performanceSheetMap.get(
          selectedAssignment.performanceSheetId
        ) ?? null
      : null;

  /* ========================================================
     Available Months
  ======================================================== */

  const monthOptions =
    useMemo(() => {
      const months =
        new Set<string>();

      months.add(
        getCurrentMonth()
      );

      for (
        const instance of performanceInstances
      ) {
        months.add(
          instance.performanceMonth
        );
      }

      return Array.from(
        months
      ).sort(
        (a, b) =>
          new Date(
            b
          ).getTime() -
          new Date(
            a
          ).getTime()
      );
    }, [
      performanceInstances,
    ]);

  /* ========================================================
     Load Assignment History
  ======================================================== */

  useEffect(() => {
    async function loadHistory() {
      if (
        !organization ||
        !selectedAssignment
      ) {
        setPerformanceInstances([]);
        return;
      }

      try {
        const instances =
          await findPerformanceInstancesByAssignment(
            organization.id,
            selectedAssignment.id
          );

        setPerformanceInstances(
          instances
        );
      } catch (error) {
        console.error(
          "Failed to load performance history:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load performance history."
        );

        setPerformanceInstances([]);
      }
    }

    loadHistory();
  }, [
    organization,
    selectedAssignment,
  ]);

  /* ========================================================
     Load Monthly Runtime Objectives
  ======================================================== */

  useEffect(() => {
    async function loadMonthlyObjectives() {
      if (
        !organization ||
        !selectedAssignment
      ) {
        setObjectives([]);
        setSelectedPerformanceInstance(
          null
        );
        return;
      }

      try {
        setIsLoadingObjectives(
          true
        );

        setErrorMessage(null);

        const performanceInstance =
          await getOrCreatePerformanceExecutionForMonth(
            organization.id,
            selectedAssignment.id,
            selectedMonth
          );

        const loadedObjectives =
          await findPerformanceInstanceObjectives(
            performanceInstance.id
          );

        setSelectedPerformanceInstance(
          performanceInstance
        );

        setObjectives(
          loadedObjectives
        );

        setPerformanceInstances(
          (current) => {
            const existing =
              current.filter(
                (instance) =>
                  instance.id !==
                  performanceInstance.id
              );

            return [
              performanceInstance,
              ...existing,
            ].sort(
              (a, b) =>
                new Date(
                  b.performanceMonth
                ).getTime() -
                new Date(
                  a.performanceMonth
                ).getTime()
            );
          }
        );
      } catch (error) {
        console.error(
          "Failed to load monthly Objectives:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load the selected month."
        );

        setObjectives([]);
        setSelectedPerformanceInstance(
          null
        );
      } finally {
        setIsLoadingObjectives(
          false
        );
      }
    }

    loadMonthlyObjectives();
  }, [
    organization,
    selectedAssignment,
    selectedMonth,
  ]);

  /* ========================================================
     Selection Handlers
  ======================================================== */

  function handleDepartmentChange(
    value: string
  ) {
    setSelectedDepartmentId(
      value
    );

    setSelectedTeamId("");
    setSelectedMemberId("");
    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setSelectedPerformanceInstance(
      null
    );
  }

  function handleTeamChange(
    value: string
  ) {
    setSelectedTeamId(
      value
    );

    setSelectedMemberId("");
    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setSelectedPerformanceInstance(
      null
    );
  }

  function handleMemberChange(
    value: string
  ) {
    setSelectedMemberId(
      value
    );

    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setSelectedPerformanceInstance(
      null
    );

    setSelectedMonth(
      getCurrentMonth()
    );
  }

  function handleAssignmentChange(
    value: string
  ) {
    setSelectedAssignmentId(
      value
    );

    setPerformanceInstances([]);
    setObjectives([]);
    setSelectedPerformanceInstance(
      null
    );

    setSelectedMonth(
      getCurrentMonth()
    );
  }

  function handleObjectiveSaved(
    updatedObjective: PerformanceInstanceObjective
  ) {
    setObjectives(
      (current) =>
        current
          .map(
            (objective) =>
              objective.id ===
              updatedObjective.id
                ? updatedObjective
                : objective
          )
          .sort(
            (a, b) =>
              a.position -
              b.position
          )
    );
  }

  /* ========================================================
     Selected Member
  ======================================================== */

  const selectedMember =
    userRecords.find(
      (record) =>
        record.user.id ===
        selectedMemberId
    ) ?? null;

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <AdminPageHeader
          title="Objectives"
          description="Manage Objectives for an individual member's monthly performance."
        />

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {isLoading ? (
          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading Objectives...
            </p>
          </section>
        ) : !organization ? (
          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">
              No Organization
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Create an organization before managing Objectives.
            </p>
          </section>
        ) : (
          <>
            {/* ==================================================
               Context
            ================================================== */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Performance Context
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select the member and monthly performance context
                  you want to manage.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="objectives-department"
                    className="mb-2 block text-sm font-medium"
                  >
                    Department
                  </label>

                  <select
                    id="objectives-department"
                    value={
                      selectedDepartmentId
                    }
                    onChange={(event) =>
                      handleDepartmentChange(
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.is_active
                      )
                      .map(
                        (department) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                          >
                            {
                              department.name
                            }
                          </option>
                        )
                      )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="objectives-team"
                    className="mb-2 block text-sm font-medium"
                  >
                    Team
                  </label>

                  <select
                    id="objectives-team"
                    value={
                      selectedTeamId
                    }
                    onChange={(event) =>
                      handleTeamChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedDepartmentId
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Team
                    </option>

                    {visibleTeams.map(
                      (team) => (
                        <option
                          key={
                            team.id
                          }
                          value={
                            team.id
                          }
                        >
                          {team.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="objectives-member"
                    className="mb-2 block text-sm font-medium"
                  >
                    Member
                  </label>

                  <select
                    id="objectives-member"
                    value={
                      selectedMemberId
                    }
                    onChange={(event) =>
                      handleMemberChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedTeamId
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Member
                    </option>

                    {visibleMembers.map(
                      (record) => (
                        <option
                          key={
                            record.user.id
                          }
                          value={
                            record.user.id
                          }
                        >
                          {displayUserName(
                            record
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="objectives-performance-sheet"
                    className="mb-2 block text-sm font-medium"
                  >
                    Active Performance Sheet
                  </label>

                  <select
                    id="objectives-performance-sheet"
                    value={
                      selectedAssignment?.id ??
                      ""
                    }
                    onChange={(event) =>
                      handleAssignmentChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedMemberId ||
                      activeAssignmentsForMember.length ===
                        0
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Performance Sheet
                    </option>

                    {activeAssignmentsForMember.map(
                      (assignment) => {
                        const sheet =
                          performanceSheetMap.get(
                            assignment.performanceSheetId
                          );

                        return (
                          <option
                            key={
                              assignment.id
                            }
                            value={
                              assignment.id
                            }
                          >
                            {sheet?.name ??
                              "Performance Sheet"}{" "}
                            {sheet
                              ? `· Version ${sheet.version}`
                              : ""}
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="objectives-month"
                    className="mb-2 block text-sm font-medium"
                  >
                    Performance Month
                  </label>

                  <select
                    id="objectives-month"
                    value={
                      selectedMonth.slice(
                        0,
                        7
                      )
                    }
                    onChange={(event) =>
                      setSelectedMonth(
                        `${event.target.value}-01`
                      )
                    }
                    disabled={
                      !selectedAssignment
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    {monthOptions.map(
                      (month) => (
                        <option
                          key={
                            month
                          }
                          value={month.slice(
                            0,
                            7
                          )}
                        >
                          {formatMonth(
                            month
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            {/* ==================================================
               Selected Context
            ================================================== */}

            {selectedMember &&
              selectedAssignment &&
              selectedPerformanceSheet && (
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Monthly Performance
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold">
                        {displayUserName(
                          selectedMember
                        )}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          selectedPerformanceSheet.name
                        }{" "}
                        · Version{" "}
                        {
                          selectedPerformanceSheet.version
                        }
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-100 px-4 py-3">
                      <p className="text-sm font-medium">
                        {formatMonth(
                          selectedMonth
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedPerformanceInstance
                          ? "Runtime instance loaded"
                          : "Loading runtime instance..."}
                      </p>
                    </div>
                  </div>
                </section>
              )}

            {/* ==================================================
               Objectives
            ================================================== */}

            {!selectedAssignment ? (
              <section className="rounded-xl border bg-white p-8 shadow-sm">
                <h2 className="text-lg font-semibold">
                  Select a Member
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Select Department, Team, Member,
                  Performance Sheet, and Month to manage
                  monthly Objectives.
                </p>
              </section>
            ) : isLoadingObjectives &&
              objectives.length === 0 ? (
              <section className="rounded-xl border bg-white p-8 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Loading monthly Objectives...
                </p>
              </section>
            ) : objectives.length === 0 ? (
              <section className="rounded-xl border bg-white p-8 shadow-sm">
                <h2 className="text-lg font-semibold">
                  No Objectives
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  No Runtime Objectives exist for the selected
                  Performance Instance.
                </p>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Objectives
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Edit the monthly Runtime Objective snapshot.
                    </p>
                  </div>

                  <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                    {objectives.length}{" "}
                    {objectives.length === 1
                      ? "Objective"
                      : "Objectives"}
                  </div>
                </div>

                {objectives.map(
                  (objective) => (
                    <ObjectiveEditor
                      key={
                        objective.id
                      }
                      objective={
                        objective
                      }
                      onSaved={
                        handleObjectiveSaved
                      }
                    />
                  )
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}