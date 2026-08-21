"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Department } from "@/lib/types/domain/department";
import type { Team } from "@/lib/types/domain/team";

export interface UserFormValues {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  department_id: string;
  team_id: string;
  is_active: boolean;
}

interface UserFormProps {
  departments: Department[];
  teams: Team[];

  initialValues?: UserFormValues;

  submitLabel?: string;
  savingLabel?: string;

  onSubmit: (
    values: UserFormValues
  ) => Promise<void>;

  onCancel: () => void;

  isSaving?: boolean;
}

export default function UserForm({
  departments,
  teams,
  initialValues,

  submitLabel = "Invite User",
  savingLabel = "Inviting...",

  onSubmit,
  onCancel,

  isSaving = false,
}: UserFormProps) {
  const [firstName, setFirstName] =
    useState(
      initialValues?.first_name ?? ""
    );

  const [lastName, setLastName] =
    useState(
      initialValues?.last_name ?? ""
    );

  const [displayName, setDisplayName] =
    useState(
      initialValues?.display_name ?? ""
    );

  const [email, setEmail] =
    useState(
      initialValues?.email ?? ""
    );

  const [departmentId, setDepartmentId] =
    useState(
      initialValues?.department_id ?? ""
    );

  const [teamId, setTeamId] =
    useState(
      initialValues?.team_id ?? ""
    );

  const [isActive, setIsActive] =
    useState(
      initialValues?.is_active ?? true
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    setFirstName(
      initialValues?.first_name ?? ""
    );

    setLastName(
      initialValues?.last_name ?? ""
    );

    setDisplayName(
      initialValues?.display_name ?? ""
    );

    setEmail(
      initialValues?.email ?? ""
    );

    setDepartmentId(
      initialValues?.department_id ?? ""
    );

    setTeamId(
      initialValues?.team_id ?? ""
    );

    setIsActive(
      initialValues?.is_active ?? true
    );

    setErrorMessage(null);
  }, [initialValues]);

  /*
   * Only show teams belonging to the selected department.
   */
  const availableTeams =
    departmentId
      ? teams.filter(
          (team) =>
            team.department_id ===
            departmentId
        )
      : [];

  /*
   * Changing the department can invalidate
   * the currently selected team.
   */
  function handleDepartmentChange(
    value: string
  ) {
    setDepartmentId(value);

    if (
      !value ||
      !teams.some(
        (team) =>
          team.id === teamId &&
          team.department_id ===
            value
      )
    ) {
      setTeamId("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedFirstName =
      firstName.trim();

    const trimmedLastName =
      lastName.trim();

    const trimmedDisplayName =
      displayName.trim();

    const trimmedEmail =
      email.trim();

    if (!trimmedFirstName) {
      setErrorMessage(
        "First name is required."
      );

      return;
    }

    if (!trimmedLastName) {
      setErrorMessage(
        "Last name is required."
      );

      return;
    }

    if (!trimmedEmail) {
      setErrorMessage(
        "Email is required."
      );

      return;
    }

    if (!departmentId) {
      setErrorMessage(
        "Department is required."
      );

      return;
    }

    if (!teamId) {
      setErrorMessage(
        "Team is required."
      );

      return;
    }

    setErrorMessage(null);

    try {
      await onSubmit({
        first_name:
          trimmedFirstName,

        last_name:
          trimmedLastName,

        display_name:
          trimmedDisplayName,

        email:
          trimmedEmail,

        department_id:
          departmentId,

        team_id:
          teamId,

        is_active:
          isActive,
      });
    } catch (error) {
      console.error(
        "Failed to save user:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save user."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* First Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          First Name
        </label>

        <Input
          value={firstName}
          onChange={(event) =>
            setFirstName(
              event.target.value
            )
          }
          placeholder="e.g. John"
          disabled={isSaving}
          autoFocus
        />
      </div>

      {/* Last Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Last Name
        </label>

        <Input
          value={lastName}
          onChange={(event) =>
            setLastName(
              event.target.value
            )
          }
          placeholder="e.g. Smith"
          disabled={isSaving}
        />
      </div>

      {/* Display Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Display Name
        </label>

        <Input
          value={displayName}
          onChange={(event) =>
            setDisplayName(
              event.target.value
            )
          }
          placeholder="Optional display name"
          disabled={isSaving}
        />
      </div>

      {/* Email */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <Input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="name@company.com"
          disabled={isSaving}
        />
      </div>

      {/* Department */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Department
        </label>

        <select
          value={departmentId}
          onChange={(event) =>
            handleDepartmentChange(
              event.target.value
            )
          }
          disabled={isSaving}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">
            Select department
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

      {/* Team */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Team
        </label>

        <select
          value={teamId}
          onChange={(event) =>
            setTeamId(
              event.target.value
            )
          }
          disabled={
            isSaving ||
            !departmentId
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">
            {departmentId
              ? "Select team"
              : "Select department first"}
          </option>

          {availableTeams.map(
            (team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* Active */}

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
          Active user
        </span>
      </label>

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