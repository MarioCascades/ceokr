"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface RoleFormValues {
  name: string;

  description: string;

  is_active: boolean;
}

interface RoleFormProps {
  initialValues?: RoleFormValues;

  submitLabel?: string;

  savingLabel?: string;

  onSubmit: (
    values: RoleFormValues
  ) => Promise<void>;

  onCancel: () => void;

  isSaving?: boolean;
}

export default function RoleForm({
  initialValues,

  submitLabel = "Create Role",

  savingLabel = "Saving...",

  onSubmit,

  onCancel,

  isSaving = false,
}: RoleFormProps) {
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

  useEffect(() => {
    setName(
      initialValues?.name ?? ""
    );

    setDescription(
      initialValues?.description ?? ""
    );

    setIsActive(
      initialValues?.is_active ?? true
    );

    setErrorMessage(null);
  }, [initialValues]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setErrorMessage(
        "Role name is required."
      );

      return;
    }

    setErrorMessage(null);

    try {
      await onSubmit({
        name:
          trimmedName,

        description:
          description.trim(),

        is_active:
          isActive,
      });
    } catch (error) {
      console.error(
        "Failed to save role:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save role."
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Role Name
        </label>

        <Input
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="e.g. Manager"
          disabled={isSaving}
          autoFocus
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <Input
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Optional role description"
          disabled={isSaving}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(
              event.target.checked
            )
          }
          disabled={isSaving}
        />

        <span>
          Active role
        </span>
      </label>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? savingLabel
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}