"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

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
  getDepartments,
} from "@/services/department.service";

import {
  createAssignment,
  activateAssignment,
  cancelAssignment,
  createPerformanceExecutionFromAssignment,
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
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

/* ==========================================================
   Assignment Management Page
========================================================== */

export default function AssignmentsPage() {
  const searchParams = useSearchParams();
  const selectedOrganizationId = searchParams.get("organizationId");

  /* ========================================================
     Core Data
  ======================================================== */

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<PerformanceSheetRecord[]>([]);

  const [users, setUsers] =
    useState<UserManagementRecord[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  /* ========================================================
     Page State
  ======================================================== */

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* ========================================================
     Create Assignment State
  ======================================================== */

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState<string | null>(null);

  const [
    selectedPerformanceSheetId,
    setSelectedPerformanceSheetId,
  ] = useState("");

  const [
    selectedAssignmentType,
    setSelectedAssignmentType,
  ] = useState<Assignment["assignmentType"]>(
    "individual"
  );

  const [
    selectedSubjectId,
    setSelectedSubjectId,
  ] = useState("");

  const [
    selectedAssignedByUserId,
    setSelectedAssignedByUserId,
  ] = useState("");

  /* ========================================================
     Manage Assignment State
  ======================================================== */

  const [
    managedAssignment,
    setManagedAssignment,
  ] = useState<Assignment | null>(null);

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
          await getOrganization(selectedOrganizationId ?? undefined);

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
          departmentRecords,
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

          getDepartments(
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

        setDepartments(
          departmentRecords
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

  const userMap =
    useMemo(() => {
      return new Map(
        users.map(
          (record) => [
            record.user.id,
            record.user,
          ]
        )
      );
    }, [users]);

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

  const departmentMap =
    useMemo(() => {
      return new Map(
        departments.map(
          (department) => [
            department.id,
            department,
          ]
        )
      );
    }, [departments]);

  /* ========================================================
     Subject Options
  ======================================================== */

  const subjectOptions =
    useMemo(() => {
      switch (
        selectedAssignmentType
      ) {
        case "individual":
          return users.map(
            (record) => ({
              id: record.user.id,

              label:
                record.user.display_name ||
                `${record.user.first_name} ${record.user.last_name}`.trim() ||
                record.user.email,
            })
          );

        case "team":
          return teams.map(
            (team) => ({
              id: team.id,
              label: team.name,
            })
          );

        case "department":
          return departments.map(
            (department) => ({
              id: department.id,
              label: department.name,
            })
          );

        case "organization":
          return organization
            ? [
                {
                  id: organization.id,
                  label:
                    organization.company_name,
                },
              ]
            : [];

        default:
          return [];
      }
    }, [
      selectedAssignmentType,
      users,
      teams,
      departments,
      organization,
    ]);

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
            id: record.user.id,

            label:
              record.user.display_name ||
              `${record.user.first_name} ${record.user.last_name}`.trim() ||
              record.user.email,
          })
        );
    }, [users]);

  /* ========================================================
     Reset Create Form
  ======================================================== */

  function resetCreateForm() {
    setSelectedPerformanceSheetId("");

    setSelectedAssignmentType(
      "individual"
    );

    setSelectedSubjectId("");

    setSelectedAssignedByUserId("");

    setCreateError(null);
  }

  /* ========================================================
     Open Create Form
  ======================================================== */

  function openCreateAssignment() {
    resetCreateForm();

    setIsCreateOpen(true);
  }

  /* ========================================================
     Close Create Form
  ======================================================== */

  function closeCreateAssignment() {
    if (isCreating) {
      return;
    }

    setIsCreateOpen(false);

    resetCreateForm();
  }

  /* ========================================================
     Assignment Type Change
  ======================================================== */

  function handleAssignmentTypeChange(
    type: Assignment["assignmentType"]
  ) {
    setSelectedAssignmentType(type);

    setSelectedSubjectId("");
  }

  /* ========================================================
     Create Assignment
  ======================================================== */

  async function handleCreateAssignment() {
    setCreateError(null);

    if (!organization) {
      setCreateError(
        "No organization has been configured."
      );

      return;
    }

    if (!selectedPerformanceSheetId) {
      setCreateError(
        "Please select a Performance Sheet."
      );

      return;
    }

    if (!selectedSubjectId) {
      setCreateError(
        "Please select a subject for this assignment."
      );

      return;
    }

    if (!selectedAssignedByUserId) {
      setCreateError(
        "Please select the user creating this assignment."
      );

      return;
    }

    setIsCreating(true);

    try {
      await createAssignment({
        organizationId:
          organization.id,

        performanceSheetId:
          selectedPerformanceSheetId,

        assignmentType:
          selectedAssignmentType,

        subjectId:
          selectedSubjectId,

        status:
          "draft",

        assignedBy:
          selectedAssignedByUserId,
      });

      await loadData();

      setIsCreateOpen(false);

      resetCreateForm();
    } catch (error) {
      console.error(
        "Failed to create assignment:",
        error
      );

      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create assignment."
      );
    } finally {
      setIsCreating(false);
    }
  }

  /* ========================================================
     Open Manage Assignment
  ======================================================== */

  function openManageAssignment(
    assignment: Assignment
  ) {
    setManageError(null);

    setManagedAssignment(
      assignment
    );
  }

  /* ========================================================
     Close Manage Assignment
  ======================================================== */

  function closeManageAssignment() {
    if (isManaging) {
      return;
    }

    setManagedAssignment(null);

    setManageError(null);
  }

  /* ========================================================
     Activate Assignment
  ======================================================== */

  async function handleActivateAssignment() {
    if (
      !organization ||
      !managedAssignment
    ) {
      return;
    }

    setIsManaging(true);

    setManageError(null);

    try {
      await activateAssignment(
        organization.id,
        managedAssignment.id
      );

      await loadData();

      setManagedAssignment(null);
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

  async function handleCancelAssignment() {
    if (
      !organization ||
      !managedAssignment
    ) {
      return;
    }

    setIsManaging(true);

    setManageError(null);

    try {
      await cancelAssignment(
        organization.id,
        managedAssignment.id
      );

      await loadData();

      setManagedAssignment(null);
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
     Create Performance Execution
  ======================================================== */

  async function handleCreatePerformanceExecution() {
    if (
      !organization ||
      !managedAssignment
    ) {
      return;
    }

    setIsManaging(true);

    setManageError(null);

    try {
      await createPerformanceExecutionFromAssignment(
        organization.id,
        managedAssignment.id
      );

      /*
       * The existing Runtime page resolves the active
       * Performance Instance for the organization.
       *
       * We intentionally navigate to the existing Runtime
       * surface instead of creating another Runtime UI.
       */
      window.location.href =
        "/runtime";
    } catch (error) {
      console.error(
        "Failed to create performance execution:",
        error
      );

      setManageError(
        error instanceof Error
          ? error.message
          : "Failed to create performance execution."
      );

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
          description="Manage Performance Sheet assignments across your organization."
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
                  <h2 className="text-xl font-semibold">
                    {organization.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Assignment Management
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {assignments.length}{" "}
                  {assignments.length === 1
                    ? "assignment"
                    : "assignments"}
                </div>

              </div>

            </section>
          )}

        {/* ==================================================
            Assignments
        ================================================== */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="flex items-center justify-between gap-4 border-b p-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Performance Assignments
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Assign published Performance Sheets
                  to users, teams, departments or the
                  organization.
                </p>
              </div>

              <Button
                onClick={
                  openCreateAssignment
                }
              >
                Create Assignment
              </Button>

            </div>

            {assignments.length === 0 ? (
              <div className="p-6">

                <p className="text-sm text-muted-foreground">
                  No assignments have been created yet.
                </p>

              </div>
            ) : (

              <div className="divide-y">

                {assignments.map(
                  (assignment) => {

                    const performanceSheet =
                      performanceSheetMap.get(
                        assignment.performanceSheetId
                      );

                    return (
                      <div
                        key={assignment.id}
                        className="p-6"
                      >

                        <div className="flex items-start justify-between gap-6">

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="font-semibold">
                                {getSubjectName(
                                  assignment,
                                  organization,
                                  userMap,
                                  teamMap,
                                  departmentMap
                                )}
                              </h3>

                              <StatusBadge
                                status={
                                  assignment.status
                                }
                              />

                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">

                              <div>
                                <span className="font-medium text-gray-700">
                                  Type:
                                </span>{" "}
                                {formatAssignmentType(
                                  assignment.assignmentType
                                )}
                              </div>

                              <div>
                                <span className="font-medium text-gray-700">
                                  Performance Sheet:
                                </span>{" "}
                                {performanceSheet
                                  ? `${performanceSheet.name} — Version ${performanceSheet.version}`
                                  : "Unavailable"}
                              </div>

                              <div>
                                <span className="font-medium text-gray-700">
                                  Assigned:
                                </span>{" "}
                                {formatDate(
                                  assignment.assignedAt
                                )}
                              </div>

                            </div>

                          </div>

                          <div className="flex shrink-0 gap-2">

                            <Button
                              variant="outline"
                              onClick={() =>
                                openManageAssignment(
                                  assignment
                                )
                              }
                            >
                              Manage
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

      {/* ======================================================
          Create Assignment Modal
      ====================================================== */}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-2xl rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    Create Assignment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Assign a published Performance Sheet
                    to a user, team, department or your
                    organization.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCreateAssignment
                  }
                  disabled={isCreating}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="space-y-6 px-6 py-6">

              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {createError}
                  </p>
                </div>
              )}

              {/* Performance Sheet */}

              <div className="space-y-2">

                <label
                  htmlFor="performance-sheet"
                  className="text-sm font-medium"
                >
                  Performance Sheet
                </label>

                <select
                  id="performance-sheet"
                  value={
                    selectedPerformanceSheetId
                  }
                  onChange={(event) =>
                    setSelectedPerformanceSheetId(
                      event.target.value
                    )
                  }
                  disabled={isCreating}
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
                    No published Performance Sheets
                    are available.
                  </p>
                )}

              </div>

              {/* Assignment Type */}

              <div className="space-y-2">

                <label
                  htmlFor="assignment-type"
                  className="text-sm font-medium"
                >
                  Assignment Type
                </label>

                <select
                  id="assignment-type"
                  value={
                    selectedAssignmentType
                  }
                  onChange={(event) =>
                    handleAssignmentTypeChange(
                      event.target
                        .value as Assignment["assignmentType"]
                    )
                  }
                  disabled={isCreating}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >
                  <option value="individual">
                    Individual
                  </option>

                  <option value="team">
                    Team
                  </option>

                  <option value="department">
                    Department
                  </option>

                  <option value="organization">
                    Organization
                  </option>
                </select>

              </div>

              {/* Subject */}

              <div className="space-y-2">

                <label
                  htmlFor="assignment-subject"
                  className="text-sm font-medium"
                >
                  {getSubjectLabel(
                    selectedAssignmentType
                  )}
                </label>

                <select
                  id="assignment-subject"
                  value={
                    selectedSubjectId
                  }
                  onChange={(event) =>
                    setSelectedSubjectId(
                      event.target.value
                    )
                  }
                  disabled={
                    isCreating ||
                    subjectOptions.length === 0
                  }
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >
                  <option value="">
                    Select{" "}
                    {getSubjectLabel(
                      selectedAssignmentType
                    ).toLowerCase()}
                  </option>

                  {subjectOptions.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.label}
                      </option>
                    )
                  )}

                </select>

                {subjectOptions.length ===
                  0 && (
                  <p className="text-xs text-amber-600">
                    No available subjects were found
                    for this assignment type.
                  </p>
                )}

              </div>

              {/* Acting User */}

              <div className="space-y-2">

                <label
                  htmlFor="assigned-by-user"
                  className="text-sm font-medium"
                >
                  Acting User
                </label>

                <select
                  id="assigned-by-user"
                  value={
                    selectedAssignedByUserId
                  }
                  onChange={(event) =>
                    setSelectedAssignedByUserId(
                      event.target.value
                    )
                  }
                  disabled={
                    isCreating ||
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
                  Development mode: this represents the
                  platform user creating the assignment.
                  Production authentication will replace
                  this selection later.
                </p>

                {actingUserOptions.length ===
                  0 && (
                  <p className="text-xs text-amber-600">
                    No active organization users are
                    available to create assignments.
                  </p>
                )}

              </div>

              {/* Draft Notice */}

              <div className="rounded-lg border bg-gray-50 p-4">

                <p className="text-sm font-medium">
                  Assignment lifecycle
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  New assignments are created as{" "}
                  <span className="font-medium">
                    Draft
                  </span>
                  . They can be activated later after
                  the assignment has been reviewed.
                </p>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeCreateAssignment
                }
                disabled={isCreating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  handleCreateAssignment
                }
                disabled={
                  isCreating ||
                  !selectedPerformanceSheetId ||
                  !selectedSubjectId ||
                  !selectedAssignedByUserId
                }
              >
                {isCreating
                  ? "Creating..."
                  : "Create Assignment"}
              </Button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          Manage Assignment Modal
      ====================================================== */}

      {managedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    Manage Assignment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Review and manage the assignment lifecycle.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeManageAssignment
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

              <div className="rounded-lg border bg-gray-50 p-4">

                <div className="space-y-3 text-sm">

                  <div>
                    <span className="font-medium text-gray-700">
                      Subject:
                    </span>{" "}
                    {getSubjectName(
                      managedAssignment,
                      organization,
                      userMap,
                      teamMap,
                      departmentMap
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Type:
                    </span>{" "}
                    {formatAssignmentType(
                      managedAssignment.assignmentType
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Status:
                    </span>{" "}
                    {formatAssignmentStatus(
                      managedAssignment.status
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Performance Sheet:
                    </span>{" "}
                    {performanceSheetMap.get(
                      managedAssignment.performanceSheetId
                    )
                      ? `${performanceSheetMap.get(
                          managedAssignment.performanceSheetId
                        )?.name} — Version ${performanceSheetMap.get(
                          managedAssignment.performanceSheetId
                        )?.version}`
                      : "Unavailable"}
                  </div>

                </div>

              </div>

              <div className="rounded-lg border bg-white p-4">

                <p className="text-sm font-medium">
                  Assignment lifecycle
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Draft assignments can be activated after
                  review. Active assignments can create a
                  Performance Execution or be cancelled.
                  Completed assignments remain historical records.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeManageAssignment
                }
                disabled={isManaging}
              >
                Close
              </Button>

              {managedAssignment.status ===
                "draft" && (
                <Button
                  type="button"
                  onClick={
                    handleActivateAssignment
                  }
                  disabled={isManaging}
                >
                  {isManaging
                    ? "Activating..."
                    : "Activate Assignment"}
                </Button>
              )}

              {managedAssignment.status ===
                "active" && (
                <>
                  <Button
                    type="button"
                    onClick={
                      handleCreatePerformanceExecution
                    }
                    disabled={isManaging}
                  >
                    {isManaging
                      ? "Opening Runtime..."
                      : "Create Performance Execution"}
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={
                      handleCancelAssignment
                    }
                    disabled={isManaging}
                  >
                    {isManaging
                      ? "Cancelling..."
                      : "Cancel Assignment"}
                  </Button>
                </>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

/* ==========================================================
   Subject Name
========================================================== */

function getSubjectName(
  assignment: Assignment,
  organization: Organization | null,
  userMap: Map<
    string,
    UserManagementRecord["user"]
  >,
  teamMap: Map<
    string,
    Team
  >,
  departmentMap: Map<
    string,
    Department
  >
): string {
  switch (
    assignment.assignmentType
  ) {
    case "individual": {
      const user =
        userMap.get(
          assignment.subjectId
        );

      if (!user) {
        return "Unknown User";
      }

      return (
        user.display_name ||
        `${user.first_name} ${user.last_name}`.trim() ||
        user.email
      );
    }

    case "team": {
      const team =
        teamMap.get(
          assignment.subjectId
        );

      return (
        team?.name ??
        "Unknown Team"
      );
    }

    case "department": {
      const department =
        departmentMap.get(
          assignment.subjectId
        );

      return (
        department?.name ??
        "Unknown Department"
      );
    }

    case "organization":
      return (
        organization?.company_name ??
        "Organization"
      );

    default:
      return "Unknown Subject";
  }
}

/* ==========================================================
   Assignment Type
========================================================== */

function formatAssignmentType(
  type: Assignment["assignmentType"]
): string {
  switch (type) {
    case "individual":
      return "Individual";

    case "team":
      return "Team";

    case "department":
      return "Department";

    case "organization":
      return "Organization";

    default:
      return type;
  }
}

/* ==========================================================
   Subject Label
========================================================== */

function getSubjectLabel(
  type: Assignment["assignmentType"]
): string {
  switch (type) {
    case "individual":
      return "User";

    case "team":
      return "Team";

    case "department":
      return "Department";

    case "organization":
      return "Organization";

    default:
      return "Subject";
  }
}

/* ==========================================================
   Status Badge
========================================================== */

function StatusBadge({
  status,
}: {
  status: Assignment["status"];
}) {
  const label =
    formatAssignmentStatus(
      status
    );

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
      {label}
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