"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import DepartmentDialog from "@/components/admin/departments/departmentdialog";
import DeleteDepartmentDialog from "@/components/admin/departments/deletedepartmentdialog";

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/services/department.service";

import {
  getOrganization,
} from "@/services/organization.service";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  DepartmentFormValues,
} from "@/components/admin/departments/departmentform";

export default function DepartmentsPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    isCreateDialogOpen,
    setIsCreateDialogOpen,
  ] = useState(false);

  const [
    isEditDialogOpen,
    setIsEditDialogOpen,
  ] = useState(false);

  const [
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  ] = useState(false);

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState<Department | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

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

        await loadDepartments(
          existingOrganization.id
        );
      } catch (error) {
        console.error(
          "Failed to load departments:",
          error
        );

        setErrorMessage(
          "Failed to load departments."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  /* ========================================================
     Create Department
  ======================================================== */

  async function handleCreateDepartment(
    values: DepartmentFormValues
  ) {
    if (!organization) {
      setErrorMessage(
        "No organization has been configured."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await createDepartment({
        organization_id:
          organization.id,

        name:
          values.name,

        description:
          values.description || null,

        is_active:
          values.is_active,
      });

      await loadDepartments(
        organization.id
      );

      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error(
        "Failed to create department:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create department."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Edit Department
  ======================================================== */

  async function handleEditDepartment(
    values: DepartmentFormValues
  ) {
    if (
      !organization ||
      !selectedDepartment
    ) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateDepartment(
        selectedDepartment.id,
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

      await loadDepartments(
        organization.id
      );

      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error(
        "Failed to update department:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update department."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Delete Department
  ======================================================== */

  async function handleDeleteDepartment() {
    if (
      !organization ||
      !selectedDepartment
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteDepartment(
        selectedDepartment.id,
        organization.id
      );

      await loadDepartments(
        organization.id
      );

      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error(
        "Failed to delete department:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete department."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* ========================================================
     Open Edit Dialog
  ======================================================== */

  function openEditDialog(
    department: Department
  ) {
    setSelectedDepartment(
      department
    );

    setIsEditDialogOpen(true);
  }

  /* ========================================================
     Close Edit Dialog
  ======================================================== */

  function closeEditDialog(
    open: boolean
  ) {
    setIsEditDialogOpen(open);

    if (!open) {
      setSelectedDepartment(null);
    }
  }

  /* ========================================================
     Open Delete Dialog
  ======================================================== */

  function openDeleteDialog(
    department: Department
  ) {
    setSelectedDepartment(
      department
    );

    setIsDeleteDialogOpen(true);
  }

  /* ========================================================
     Close Delete Dialog
  ======================================================== */

  function closeDeleteDialog(
    open: boolean
  ) {
    setIsDeleteDialogOpen(open);

    if (!open) {
      setSelectedDepartment(null);
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
          title="Departments"
          description="Create and manage departments within your organization."
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
              Loading departments...
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
                  Organization Departments
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  {departments.length}{" "}
                  {departments.length === 1
                    ? "department"
                    : "departments"}
                </div>

                <Button
                  onClick={() =>
                    setIsCreateDialogOpen(
                      true
                    )
                  }
                >
                  Create Department
                </Button>

              </div>

            </div>

          </section>
        )}

        {/* Departments */}

        {!isLoading && (
          <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">
                Departments
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Organizational departments will
                appear here.
              </p>
            </div>

            {departments.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  No departments have been created yet.
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {departments.map(
                  (department) => (
                    <div
                      key={department.id}
                      className="p-6"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <h3 className="font-semibold">
                            {department.name}
                          </h3>

                          {department.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {department.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">

                          <span className="text-sm text-muted-foreground">
                            {department.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditDialog(
                                department
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
                                department
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

        {/* Create Dialog */}

        <DepartmentDialog
          open={
            isCreateDialogOpen
          }
          mode="create"
          onOpenChange={
            setIsCreateDialogOpen
          }
          onSubmit={
            handleCreateDepartment
          }
          isSaving={
            isSaving
          }
        />

        {/* Edit Dialog */}

        {selectedDepartment && (
          <DepartmentDialog
            open={
              isEditDialogOpen
            }
            mode="edit"
            initialValues={{
              name:
                selectedDepartment.name,

              description:
                selectedDepartment.description ??
                "",

              is_active:
                selectedDepartment.is_active,
            }}
            onOpenChange={
              closeEditDialog
            }
            onSubmit={
              handleEditDepartment
            }
            isSaving={
              isSaving
            }
          />
        )}

        {/* Delete Dialog */}

        {selectedDepartment && (
          <DeleteDepartmentDialog
            open={
              isDeleteDialogOpen
            }
            departmentName={
              selectedDepartment.name
            }
            onOpenChange={
              closeDeleteDialog
            }
            onConfirm={
              handleDeleteDepartment
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