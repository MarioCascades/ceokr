"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useOrganizationFeatures } from "@/lib/organization/useorganizationfeatures";

import type { Department } from "@/lib/types/domain/department";
import type { Team } from "@/lib/types/domain/team";

/* ==========================================================
   Form Values
========================================================== */

export interface UserFormValues {
  first_name: string;

  last_name: string;

  display_name: string;

  email: string;

  password?: string;

  department_id: string;

  team_id: string;

  is_active: boolean;
}

/* ==========================================================
   Props
========================================================== */

interface UserFormProps {
  departments: Department[];

  teams: Team[];

  initialValues?: UserFormValues;

  submitLabel?: string;

  savingLabel?: string;

  showPassword?: boolean;

  onSubmit: (
    values: UserFormValues
  ) => Promise<void>;

  onCancel: () => void;

  isSaving?: boolean;
}

/* ==========================================================
   Component
========================================================== */

export default function UserForm({
  departments,

  teams,

  initialValues,

  submitLabel = "Invite User",

  savingLabel = "Inviting...",

  showPassword = false,

  onSubmit,

  onCancel,

  isSaving = false,
}: UserFormProps) {
  const { features } =
    useOrganizationFeatures();

  const departmentsEnabled =
    features.departments;

  const teamsEnabled =
    features.teams;

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

  const [password, setPassword] =
    useState("");

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

  /* ========================================================
     Reset Form When Initial Values Change
  ======================================================== */

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

    setPassword("");

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

  /* ========================================================
     Clear Disabled Feature Values
     
     If an organization turns a feature off, the form should
     never continue submitting stale department/team values.
  ======================================================== */

  useEffect(() => {
    if (!departmentsEnabled) {
      setDepartmentId("");
    }

    if (!teamsEnabled) {
      setTeamId("");
    }
  }, [
    departmentsEnabled,
    teamsEnabled,
  ]);

  /* ========================================================
     Available Teams

     Teams are independent from the Departments feature.

     If Departments are enabled:
       - show teams belonging to the selected department.

     If Departments are disabled:
       - show all available teams.

     Team assignment remains optional either way.
  ======================================================== */

  const availableTeams =
    teamsEnabled
      ? departmentsEnabled
        ? departmentId
          ? teams.filter(
              (team) =>
                team.department_id ===
                departmentId
            )
          : []
        : teams
      : [];

  /* ========================================================
     Department Change
  ======================================================== */

  function handleDepartmentChange(
    value: string
  ) {
    setDepartmentId(value);

    if (
      !value ||
      !teams.some(
        (team) =>
          team.id === teamId &&
          team.department_id === value
      )
    ) {
      setTeamId("");
    }
  }

  /* ========================================================
     Team Change
  ======================================================== */

  function handleTeamChange(
    value: string
  ) {
    setTeamId(value);
  }

  /* ========================================================
     Submit
  ======================================================== */

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

    const trimmedPassword =
      password;

    /* ======================================================
       Validation
    ====================================================== */

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

    if (
      showPassword &&
      !trimmedPassword
    ) {
      setErrorMessage(
        "Password is required."
      );

      return;
    }

    if (
      showPassword &&
      trimmedPassword.length < 8
    ) {
      setErrorMessage(
        "Password must be at least 8 characters."
      );

      return;
    }

    /*
      Department is only required as a field when the
      Departments feature is enabled.

      Even when enabled, this remains a required assignment
      only for workflows where the form currently requires it.
    */
    if (
      departmentsEnabled &&
      !departmentId
    ) {
      setErrorMessage(
        "Department is required."
      );

      return;
    }

    /*
      Team is only required as a field when the Teams feature
      is enabled.

      IMPORTANT:
      Feature availability does not mean every member must
      belong to a team.

      Therefore Team is intentionally NOT required here.
    */

    setErrorMessage(null);

    /* ======================================================
       Submit Values
    ====================================================== */

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

        ...(showPassword
          ? {
              password:
                trimmedPassword,
            }
          : {}),

        department_id:
          departmentsEnabled
            ? departmentId
            : "",

        team_id:
          teamsEnabled
            ? teamId
            : "",

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

  /* ========================================================
     Render
  ======================================================== */

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

      {/* Password */}

      {showPassword && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <Input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Minimum 8 characters"
            disabled={isSaving}
            autoComplete="new-password"
          />

          <p className="mt-1 text-xs text-muted-foreground">
            This account will be created immediately
            and can log in without an invitation email.
          </p>
        </div>
      )}

      {/* Department */}

      {departmentsEnabled && (
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
      )}

      {/* Team */}

      {teamsEnabled && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Team
          </label>

          <select
            value={teamId}
            onChange={(event) =>
              handleTeamChange(
                event.target.value
              )
            }
            disabled={
              isSaving ||
              (
                departmentsEnabled &&
                !departmentId
              )
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {departmentsEnabled
                ? departmentId
                  ? "Select team (optional)"
                  : "Select department first"
                : "Select team (optional)"}
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

          <p className="mt-1 text-xs text-muted-foreground">
            Team assignment is optional.
          </p>
        </div>
      )}

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