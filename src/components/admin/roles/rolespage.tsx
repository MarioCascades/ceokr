"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import RoleDialog from "@/components/admin/roles/roledialog";
import DeleteRoleDialog from "@/components/admin/roles/deleteroledialog";
import RolesList from "@/components/admin/roles/roleslist";

import type { RoleFormValues } from "@/components/admin/roles/roleform";

import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/role.service";

import { getOrganization } from "@/services/organization.service";

import type { Role } from "@/lib/types/domain/role";
import type { Organization } from "@/lib/types/organization";

export default function RolesPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [roles, setRoles] =
    useState<Role[]>([]);

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

  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

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

        await loadRoles(
          existingOrganization.id
        );
      } catch (error) {
        console.error(
          "Failed to load roles:",
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
  }, []);

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