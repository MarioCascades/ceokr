"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import RoleDialog from "@/components/admin/roles/roledialog";
import DeleteRoleDialog from "@/components/admin/roles/deleteroledialog";
import RolesList from "@/components/admin/roles/roleslist";
import UserRoles from "@/components/admin/users/userroles";

import type { RoleFormValues } from "@/components/admin/roles/roleform";

import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/role.service";

import { getOrganization } from "@/services/organization.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

import type { Role } from "@/lib/types/domain/role";
import type { Organization } from "@/lib/types/organization";
import type { UserManagementRecord } from "@/lib/types/domain/usermanagement";

export default function RolesPage() {
  const searchParams = useSearchParams();
  const selectedOrganizationId =
    searchParams.get("organizationId");

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [roles, setRoles] =
    useState<Role[]>([]);

  const [members, setMembers] =
    useState<UserManagementRecord[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingMembers, setIsLoadingMembers] =
    useState(false);

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

  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

  const [selectedMemberId, setSelectedMemberId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* ========================================================
     Load Roles
  ======================================================== */

  async function loadRoles(
    organizationId: string
  ) {
    const existingRoles =
      await listRoles(
        organizationId
      );

    setRoles(
      existingRoles
    );
  }

  /* ========================================================
     Load Organization Members
  ======================================================== */

  async function loadMembers(
    organizationId: string
  ) {
    setIsLoadingMembers(true);

    try {
      const existingMembers =
        await listUserManagementRecords(
          organizationId
        );

      setMembers(
        existingMembers
      );
    } finally {
      setIsLoadingMembers(false);
    }
  }

  /* ========================================================
     Initial Load
  ======================================================== */

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSelectedMemberId(null);

        const existingOrganization =
          await getOrganization(
            selectedOrganizationId ?? undefined
          );

        if (!existingOrganization) {
          setErrorMessage(
            "No organization has been configured yet."
          );

          setOrganization(null);
          setRoles([]);
          setMembers([]);

          return;
        }

        setOrganization(
          existingOrganization
        );

        await Promise.all([
          loadRoles(
            existingOrganization.id
          ),
          loadMembers(
            existingOrganization.id
          ),
        ]);
      } catch (error) {
        console.error(
          "Failed to load roles and organization members:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load roles."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [selectedOrganizationId]);

  /* ========================================================
     Create Role
  ======================================================== */

  async function handleCreateRole(
    values: RoleFormValues
  ) {
    if (!organization) {
      throw new Error(
        "No organization has been configured."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await createRole({
        organization_id:
          organization.id,

        name:
          values.name,

        description:
          values.description || null,

        is_active:
          values.is_active,
      });

      await loadRoles(
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
     Edit Role
  ======================================================== */

  async function handleEditRole(
    values: RoleFormValues
  ) {
    if (
      !organization ||
      !selectedRole
    ) {
      throw new Error(
        "No role is selected."
      );
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateRole(
        selectedRole.id,
        organization.id,
        {
          name:
            values.name,

          description:
            values.description || null,

          is_active:
            values.is_active,
        }
      );

      await loadRoles(
        organization.id
      );

      setIsEditDialogOpen(
        false
      );

      setSelectedRole(
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
    role: Role
  ) {
    setSelectedRole(
      role
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
      setSelectedRole(
        null
      );
    }
  }

  /* ========================================================
     Open Delete
  ======================================================== */

  function openDeleteDialog(
    role: Role
  ) {
    setSelectedRole(
      role
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
      setSelectedRole(
        null
      );
    }
  }

  /* ========================================================
     Delete Role
  ======================================================== */

  async function handleDeleteRole() {
    if (
      !organization ||
      !selectedRole
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteRole(
        selectedRole.id,
        organization.id
      );

      await loadRoles(
        organization.id
      );

      setIsDeleteDialogOpen(
        false
      );

      setSelectedRole(
        null
      );
    } catch (error) {
      console.error(
        "Failed to delete role:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete role."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* ========================================================
     Toggle Member Role Management
  ======================================================== */

  function toggleMemberRoles(
    userId: string
  ) {
    setSelectedMemberId(
      (current) =>
        current === userId
          ? null
          : userId
    );
  }

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}

        <AdminPageHeader
          title="Roles"
          description="Create and manage roles within your organization."
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
              Loading roles...
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
                  Organization Roles
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {roles.length}{" "}
                  {roles.length === 1
                    ? "role"
                    : "roles"}
                </div>

                <Button
                  onClick={() =>
                    setIsCreateDialogOpen(
                      true
                    )
                  }
                >
                  Create Role
                </Button>

              </div>

            </div>

          </section>
        )}

        {/* Roles */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">
                Roles
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Organization roles will appear here.
              </p>
            </div>

            <RolesList
              roles={roles}
              onEdit={
                openEditDialog
              }
              onDelete={
                openDeleteDialog
              }
            />

          </section>
        )}

        {/* Users & Role Assignments */}

        {!isLoading && organization && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    Users &amp; Role Assignments
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    View and manage roles assigned to members of this organization.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {members.length}{" "}
                  {members.length === 1
                    ? "member"
                    : "members"}
                </div>

              </div>
            </div>

            {isLoadingMembers ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Loading organization members...
                </p>
              </div>
            ) : members.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  No members are currently assigned to this organization.
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {members.map(
                  (record) => {
                    const membership =
                      record.membership;

                    if (!membership) {
                      return null;
                    }

                    const displayName =
                      record.user.display_name?.trim() ||
                      `${record.user.first_name} ${record.user.last_name}`.trim() ||
                      record.user.email;

                    const isSelected =
                      selectedMemberId ===
                      record.user.id;

                    return (
                      <div
                        key={membership.id}
                        className="p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="font-medium">
                                {displayName}
                              </p>

                              {!record.user.is_active && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">
                                  Inactive
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {record.user.email}
                            </p>

                            {(record.department ||
                              record.team) && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {[
                                  record.department?.name,
                                  record.team?.name,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}

                          </div>

                          <Button
                            type="button"
                            variant={
                              isSelected
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() =>
                              toggleMemberRoles(
                                record.user.id
                              )
                            }
                          >
                            {isSelected
                              ? "Close"
                              : "Manage Roles"}
                          </Button>

                        </div>

                        {isSelected && (
                          <div className="mt-5 rounded-lg border bg-gray-50 p-5">

                            <UserRoles
                              organizationMembershipId={
                                membership.id
                              }
                              organizationId={
                                organization.id
                              }
                            />

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>
        )}

        {/* Create Role Dialog */}

        <RoleDialog
          open={
            isCreateDialogOpen
          }
          mode="create"
          onOpenChange={
            setIsCreateDialogOpen
          }
          onSubmit={
            handleCreateRole
          }
          isSaving={
            isSaving
          }
        />

        {/* Edit Role Dialog */}

        {selectedRole && (
          <RoleDialog
            open={
              isEditDialogOpen
            }
            mode="edit"
            roleId={
              selectedRole.id
            }
            organizationId={
              selectedRole.organization_id
            }
            initialValues={{
              name:
                selectedRole.name,

              description:
                selectedRole.description ??
                "",

              is_active:
                selectedRole.is_active,
            }}
            onOpenChange={
              closeEditDialog
            }
            onSubmit={
              handleEditRole
            }
            isSaving={
              isSaving
            }
          />
        )}

        {/* Delete Role Dialog */}

        {selectedRole && (
          <DeleteRoleDialog
            open={
              isDeleteDialogOpen
            }
            roleName={
              selectedRole.name
            }
            onOpenChange={
              closeDeleteDialog
            }
            onConfirm={
              handleDeleteRole
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