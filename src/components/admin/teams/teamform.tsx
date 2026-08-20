"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { Department } from "@/lib/types/domain/department";

export interface TeamFormValues {
  department_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface TeamFormProps {
  departments: Department[];
  initialValues?: TeamFormValues;
  onSubmit: (
    values: TeamFormValues
  ) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
}

export default function TeamForm({
  departments,
  initialValues,
  onSubmit,
  onCancel,
  isSaving = false,
}: TeamFormProps) {
  const isEditMode =
    initialValues !== undefined;

  const [departmentId, setDepartmentId] =
    useState(
      initialValues?.department_id ?? ""
    );

  const [name, setName] =
    useState(
      initialValues?.name ?? ""
    );

  const [description, setDescription] =
    useState(
      initialValues?.description ?? ""
    );

  const [isActive, setIsActive] =
    useState(
      initialValues?.is_active ?? true
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(null);

    const trimmedName =
      name.trim();

    if (!departmentId) {
      setErrorMessage(
        "Please select a department."
      );

      return;
    }

    if (!trimmedName) {
      setErrorMessage(
        "Team name is required."
      );

      return;
    }

    try {
      await onSubmit({
        department_id:
          departmentId,

        name:
          trimmedName,

        description:
          description.trim(),

        is_active:
          isActive,
      });
    } catch (error) {
      console.error(
        "Failed to submit team:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save team."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Department */}

      <div className="space-y-2">

        <label
          htmlFor="team-department"
          className="text-sm font-medium"
        >
          Department
        </label>

        <select
          id="team-department"
          value={departmentId}
          onChange={(event) =>
            setDepartmentId(
              event.target.value
            )
          }
          disabled={isSaving}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">
            Select a department
          </option>

          {departments.map(
            (department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name}
              </option>
            )
          )}
        </select>

      </div>

      {/* Team Name */}

      <div className="space-y-2">

        <label
          htmlFor="team-name"
          className="text-sm font-medium"
        >
          Team Name
        </label>

        <input
          id="team-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          disabled={isSaving}
          placeholder="Enter team name"
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />

      </div>

      {/* Description */}

      <div className="space-y-2">

        <label
          htmlFor="team-description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="team-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          disabled={isSaving}
          placeholder="Describe this team"
          rows={4}
          className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
        />

      </div>

      {/* Active */}

      <div className="flex items-center gap-3">

        <input
          id="team-active"
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(
              event.target.checked
            )
          }
          disabled={isSaving}
          className="h-4 w-4"
        />

        <label
          htmlFor="team-active"
          className="text-sm font-medium"
        >
          Active
        </label>

      </div>

      {/* Error */}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Actions */}

      <div className="flex justify-end gap-3">

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : isEditMode
              ? "Update Team"
              : "Create Team"}
        </Button>

      </div>

    </form>
  );
}