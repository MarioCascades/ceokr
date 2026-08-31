"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import UsersList from "@/components/admin/users/userslist";

import InviteUserDialog from "@/components/admin/users/inviteuserdialog";

import UserEditDialog from "@/components/admin/users/usereditdialog";

import DeactivateUserDialog from "@/components/admin/users/deactivateuserdialog";

import {
  listUserManagementRecords,
  updateUser,
  updateOrganizationMembership,
  deactivateUser,
} from "@/services/user.service";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  getDepartments,
} from "@/services/department.service";

import {
  getTeams,
} from "@/services/team.service";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  UserFormValues,
} from "@/components/admin/users/userform";

export default function UsersPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [userRecords, setUserRecords] =
    useState<UserManagementRecord[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isInviteOpen, setIsInviteOpen] =
    useState(false);

  const [isEditOpen, setIsEditOpen] =
    useState(false);

  const [isDeactivateOpen, setIsDeactivateOpen] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<UserManagementRecord | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeactivating, setIsDeactivating] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function loadUsers(
    organizationId: string
  ) {
    const records =
      await listUserManagementRecords(
        organizationId
      );

    setUserRecords(records);
  }

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

        const [
          records,
          loadedDepartments,
          loadedTeams,
        ] = await Promise.all([
          listUserManagementRecords(
            existingOrganization.id
          ),

          getDepartments(
            existingOrganization.id
          ),

          getTeams(
            existingOrganization.id
          ),
        ]);

        setUserRecords(
          records
        );

        setDepartments(
          loadedDepartments
        );

        setTeams(
          loadedTeams
        );
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load users."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  async function handleInvite(
    values: UserFormValues
  ) {
    if (!organization) {
      throw new Error(
        "No organization has been configured."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response =
        await fetch(
          "/api/admin/users",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organization_id:
                organization.id,

              first_name:
                values.first_name,

              last_name:
                values.last_name,

              display_name:
                values.display_name,

              email:
                values.email,

              department_id:
                values.department_id,

              team_id:
                values.team_id,

              is_active:
                values.is_active,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Failed to invite user."
        );
      }

      await loadUsers(
        organization.id
      );

      setIsInviteOpen(
        false
      );
    } catch (error) {
      console.error(
        "Failed to invite user:",
        error
      );

      throw error;
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function handleEdit(
    record: UserManagementRecord
  ) {
    setSelectedUser(
      record
    );

    setIsEditOpen(
      true
    );
  }

  function handleEditOpenChange(
    open: boolean
  ) {
    setIsEditOpen(
      open
    );

    if (!open) {
      setSelectedUser(
        null
      );
    }
  }

  async function handleUpdateUser(
    values: UserFormValues
  ) {
    if (
      !organization ||
      !selectedUser
    ) {
      throw new Error(
        "No user is selected."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateUser(
        selectedUser.user.id,
        {
          first_name:
            values.first_name,

          last_name:
            values.last_name,

          display_name:
            values.display_name ||
            null,

          email:
            values.email,

          is_active:
            values.is_active,
        }
      );

      if (
        selectedUser.membership
      ) {
        await updateOrganizationMembership(
          selectedUser.membership.id,
          {
            department_id:
              values.department_id,

            team_id:
              values.team_id,
          }
        );
      }

      await loadUsers(
        organization.id
      );

      setIsEditOpen(
        false
      );

      setSelectedUser(
        null
      );
    } catch (error) {
      console.error(
        "Failed to update user:",
        error
      );

      throw error;
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function handleDeactivate(
    record: UserManagementRecord
  ) {
    setSelectedUser(
      record
    );

    setIsDeactivateOpen(
      true
    );
  }

  function handleDeactivateOpenChange(
    open: boolean
  ) {
    if (isDeactivating) {
      return;
    }

    setIsDeactivateOpen(
      open
    );

    if (!open) {
      setSelectedUser(
        null
      );
    }
  }

  async function handleConfirmDeactivate() {
    if (
      !organization ||
      !selectedUser
    ) {
      throw new Error(
        "No user is selected."
      );
    }

    setIsDeactivating(
      true
    );

    setErrorMessage(
      null
    );

    try {
      await deactivateUser(
        selectedUser.user.id
      );

      await loadUsers(
        organization.id
      );

      setIsDeactivateOpen(
        false
      );

      setSelectedUser(
        null
      );
    } catch (error) {
      console.error(
        "Failed to deactivate user:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to deactivate user."
      );
    } finally {
      setIsDeactivating(
        false
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}

        <AdminPageHeader
          title="Users"
          description="Create and manage users within your organization."
          actions={
            <Button
              type="button"
              onClick={() =>
                setIsInviteOpen(
                  true
                )
              }
              disabled={
                isLoading ||
                departments.length === 0 ||
                isSaving ||
                isDeactivating
              }
            >
              Invite User
            </Button>
          }
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
              Loading users...
            </p>
          </section>
        )}

        {/* Organization */}

        {!isLoading &&
          organization && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    {organization.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Organization Users
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {userRecords.length}{" "}
                  {userRecords.length === 1
                    ? "user"
                    : "users"}
                </div>

              </div>

            </section>
          )}

        {/* Users */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">
                Users
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Organization users will
                appear here.
              </p>
            </div>

            <UsersList
              records={
                userRecords
              }
              onEdit={
                handleEdit
              }
              onDeactivate={
                handleDeactivate
              }
            />

          </section>
        )}

      </div>

      {/* Invite User Dialog */}

      <InviteUserDialog
        open={
          isInviteOpen
        }
        departments={
          departments
        }
        teams={
          teams
        }
        onOpenChange={
          setIsInviteOpen
        }
        onSubmit={
          handleInvite
        }
        isSaving={
          isSaving
        }
      />

      {/* Edit User Dialog */}

      {organization &&
        selectedUser && (
          <UserEditDialog
            open={
              isEditOpen
            }
            record={
              selectedUser
            }
            organizationId={
              organization.id
            }
            departments={
              departments
            }
            teams={
              teams
            }
            onOpenChange={
              handleEditOpenChange
            }
            onSubmit={
              handleUpdateUser
            }
            isSaving={
              isSaving
            }
          />
        )}

      {/* Deactivate User Dialog */}

      {selectedUser && (
        <DeactivateUserDialog
          open={
            isDeactivateOpen
          }
          userName={
            selectedUser.user.display_name ||
            `${selectedUser.user.first_name} ${selectedUser.user.last_name}`
          }
          onOpenChange={
            handleDeactivateOpenChange
          }
          onConfirm={
            handleConfirmDeactivate
          }
          isDeactivating={
            isDeactivating
          }
        />
      )}

    </main>
  );
}