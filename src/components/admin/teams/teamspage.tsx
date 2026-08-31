"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import TeamDialog from "@/components/admin/teams/teamdialog";
import DeleteTeamDialog from "@/components/admin/teams/deleteteamdialog";

import type { TeamFormValues } from "@/components/admin/teams/teamform";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/services/team.service";

import { getDepartments } from "@/services/department.service";
import { getOrganization } from "@/services/organization.service";

import type { Team } from "@/lib/types/domain/team";
import type { Organization } from "@/lib/types/organization";
import type { Department } from "@/lib/types/domain/department";

export default function TeamsPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  const [selectedTeam, setSelectedTeam] =
    useState<Team | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* ========================================================
     Load Teams
  ======================================================== */

  async function loadTeams(
    organizationId: string
  ) {
    const existingTeams =
      await getTeams(
        organizationId
      );

    setTeams(
      existingTeams
    );
  }

  /* ========================================================
     Load Departments
  ======================================================== */

  async function loadDepartments(
    organizationId: string
  ) {
    const existingDepartments =
      await getDepartments(
        organizationId
      );

    setDepartments(
      existingDepartments
    );
  }

  /* ========================================================
     Initial Load
  ======================================================== */

  useEffect(() => {
    async function initialize() {
      try {
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization();

        if (!existingOrganization) {
          setErrorMessage(
            "No organization has been configured yet."
          );

          return;
        }

        setOrganization(
          existingOrganization
        );

        await Promise.all([
          loadDepartments(
            existingOrganization.id
          ),

          loadTeams(
            existingOrganization.id
          ),
        ]);
      } catch (error) {
        console.error(
          "Failed to load teams:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load teams."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  /* ========================================================
     Create Team
  ======================================================== */

  async function handleCreateTeam(
    values: TeamFormValues
  ) {
    if (!organization) {
      throw new Error(
        "No organization has been configured."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await createTeam({
        organization_id:
          organization.id,

        department_id:
          values.department_id,

        name:
          values.name,

        description:
          values.description || null,

        is_active:
          values.is_active,
      });

      await loadTeams(
        organization.id
      );

      setIsCreateDialogOpen(
        false
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Edit Team
  ======================================================== */

  async function handleEditTeam(
    values: TeamFormValues
  ) {
    if (
      !organization ||
      !selectedTeam
    ) {
      throw new Error(
        "No team is selected."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateTeam(
        selectedTeam.id,
        organization.id,
        {
          department_id:
            values.department_id,

          name:
            values.name,

          description:
            values.description || null,

          is_active:
            values.is_active,
        }
      );

      await loadTeams(
        organization.id
      );

      setIsEditDialogOpen(
        false
      );

      setSelectedTeam(
        null
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Open Edit
  ======================================================== */

  function openEditDialog(
    team: Team
  ) {
    setSelectedTeam(
      team
    );

    setIsEditDialogOpen(
      true
    );
  }

  /* ========================================================
     Close Edit
  ======================================================== */

  function closeEditDialog(
    open: boolean
  ) {
    setIsEditDialogOpen(
      open
    );

    if (!open) {
      setSelectedTeam(
        null
      );
    }
  }

  /* ========================================================
     Open Delete
  ======================================================== */

  function openDeleteDialog(
    team: Team
  ) {
    setSelectedTeam(
      team
    );

    setIsDeleteDialogOpen(
      true
    );
  }

  /* ========================================================
     Close Delete
  ======================================================== */

  function closeDeleteDialog(
    open: boolean
  ) {
    setIsDeleteDialogOpen(
      open
    );

    if (!open) {
      setSelectedTeam(
        null
      );
    }
  }

  /* ========================================================
     Delete Team
  ======================================================== */

  async function handleDeleteTeam() {
    if (
      !organization ||
      !selectedTeam
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteTeam(
        selectedTeam.id,
        organization.id
      );

      await loadTeams(
        organization.id
      );

      setIsDeleteDialogOpen(
        false
      );

      setSelectedTeam(
        null
      );
    } catch (error) {
      console.error(
        "Failed to delete team:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete team."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}

        <AdminPageHeader
          title="Teams"
          description="Create and manage teams within your organization."
        />

        {/* Error */}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Loading */}

        {isLoading && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading teams...
            </p>
          </section>
        )}

        {/* Organization */}

        {!isLoading && organization && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold">
                  {organization.company_name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Organization Teams
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {teams.length}{" "}
                  {teams.length === 1
                    ? "team"
                    : "teams"}
                </div>

                <Button
                  onClick={() =>
                    setIsCreateDialogOpen(
                      true
                    )
                  }
                >
                  Create Team
                </Button>

              </div>

            </div>

          </section>
        )}

        {/* Teams */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">
                Teams
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Organizational teams will appear here.
              </p>
            </div>

            {teams.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  No teams have been created yet.
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {teams.map(
                  (team) => (
                    <div
                      key={team.id}
                      className="p-6"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <h3 className="font-semibold">
                            {team.name}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Department:{" "}
                            {
                              departments.find(
                                (department) =>
                                  department.id ===
                                  team.department_id
                              )?.name ??
                              "Unknown Department"
                            }
                          </p>

                          {team.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {team.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">

                          <span className="text-sm text-muted-foreground">
                            {team.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditDialog(
                                team
                              )
                            }
                          >
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              openDeleteDialog(
                                team
                              )
                            }
                          >
                            Delete
                          </Button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        )}

        {/* Create Team Dialog */}

        <TeamDialog
          open={
            isCreateDialogOpen
          }
          mode="create"
          departments={
            departments
          }
          onOpenChange={
            setIsCreateDialogOpen
          }
          onSubmit={
            handleCreateTeam
          }
          isSaving={
            isSaving
          }
        />

        {/* Edit Team Dialog */}

        {selectedTeam && (
          <TeamDialog
            open={
              isEditDialogOpen
            }
            mode="edit"
            departments={
              departments
            }
            initialValues={{
              department_id:
                selectedTeam.department_id,

              name:
                selectedTeam.name,

              description:
                selectedTeam.description ??
                "",

              is_active:
                selectedTeam.is_active,
            }}
            onOpenChange={
              closeEditDialog
            }
            onSubmit={
              handleEditTeam
            }
            isSaving={
              isSaving
            }
          />
        )}

        {/* Delete Team Dialog */}

        {selectedTeam && (
          <DeleteTeamDialog
            open={
              isDeleteDialogOpen
            }
            teamName={
              selectedTeam.name
            }
            onOpenChange={
              closeDeleteDialog
            }
            onConfirm={
              handleDeleteTeam
            }
            isDeleting={
              isDeleting
            }
          />
        )}

      </div>
    </main>
  );
}