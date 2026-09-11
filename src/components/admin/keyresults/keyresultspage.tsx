"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  getDepartments,
} from "@/services/department.service";

import {
  getTeams,
} from "@/services/team.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

import {
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByAssignment,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPerformanceInstanceObjectives,
} from "@/lib/repositories/performanceinstanceobjectiverepository";

import {
  findPerformanceInstanceKeyResults,
} from "@/lib/repositories/performanceinstancekeyresultrepository";

import {
  findPerformanceInstanceInitiativesByKeyResult,
} from "@/lib/repositories/performanceinstanceinitiativerepository";

import {
  findKeyResultProgressByPerformanceInstance,
} from "@/lib/repositories/keyresultprogressrepository";

import {
  findPublishedPerformanceSheetsByOrganization,
} from "@/lib/repositories/performancesheetrepository";

import {
  getOrCreatePerformanceExecutionForMonth,
} from "@/services/assignment.service";

import {
  createRuntimePerformanceInstanceKeyResultAction,
  updateRuntimePerformanceInstanceKeyResultAction,
  deleteRuntimePerformanceInstanceKeyResultAction,
  updateRuntimeKeyResultProgressAction,
  createRuntimePerformanceInstanceInitiativeAction,
  updateRuntimePerformanceInstanceInitiativeAction,
  deleteRuntimePerformanceInstanceInitiativeAction,
} from "@/app/runtime/actions";

import {
  calculateRuntimeKeyResultScore,
} from "@/lib/runtime/keyresultscoring";

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

import type {
  Assignment,
} from "@/lib/domain/assignment";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

import type {
  PerformanceInstanceKeyResult,
} from "@/lib/domain/performanceinstancekeyresult";

import type {
  PerformanceInstanceInitiative,
} from "@/lib/domain/performanceinstanceinitiative";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

/* ==========================================================
   Helpers
========================================================== */

function getCurrentMonth(): string {
  const now = new Date();

  return `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, "0")}-01`;
}

function formatMonth(
  performanceMonth: string
): string {
  const date = new Date(
    `${performanceMonth}T00:00:00Z`
  );

  if (Number.isNaN(date.getTime())) {
    return performanceMonth;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

function displayUserName(
  record: UserManagementRecord
): string {
  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}

function formatValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseTargetValue(
  value: string
): unknown {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  const numericValue =
    Number(trimmed);

  if (
    !Number.isNaN(
      numericValue
    )
  ) {
    return numericValue;
  }

  return trimmed;
}

/* ==========================================================
   Key Result Editor
========================================================== */

function KeyResultEditor({
  organizationId,
  performanceInstanceId,
  performanceInstanceObjectiveId,
  keyResult,
  progress,
  performanceMonth,
  onSaved,
  onProgressSaved,
  onCancel,
}: {
  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceObjectiveId: string;

  keyResult?: PerformanceInstanceKeyResult;

  progress?: KeyResultProgress;

  performanceMonth: string;

  onSaved: (
    keyResult: PerformanceInstanceKeyResult
  ) => void;

  onProgressSaved: (
    progress: KeyResultProgress
  ) => void;

  onCancel: () => void;
}) {
  const [
    title,
    setTitle,
  ] = useState(
    keyResult?.title ?? ""
  );

  const [
    target,
    setTarget,
  ] = useState(
    keyResult
      ? formatValue(keyResult.target)
      : ""
  );

  const [
    measurementType,
    setMeasurementType,
  ] = useState<
    | "percentage"
    | "numeric"
    | "financial"
  >(
    keyResult?.measurementType ??
      "numeric"
  );

  const [
    scoringMethod,
    setScoringMethod,
  ] = useState<
    | "percent_into_period"
    | "percentage_of_target"
  >(
    keyResult?.scoringMethod ??
      "percentage_of_target"
  );

  const [
    weight,
    setWeight,
  ] = useState(
    keyResult?.weight ===
      undefined
      ? ""
      : String(keyResult.weight)
  );

  const [
    currentValue,
    setCurrentValue,
  ] = useState(
    progress
      ? formatValue(
          progress.currentValue
        )
      : ""
  );

  /*
   * Score is derived from the current Target, Current Value,
   * scoring method, and selected Performance Month.
   *
   * The administrator never enters the score manually.
   */
  const normalizedPerformanceMonth =
    performanceMonth.length >= 7
      ? performanceMonth.slice(0, 7)
      : performanceMonth;

  const calculatedScore =
    calculateRuntimeKeyResultScore(
      currentValue,
      target,
      scoringMethod,
      normalizedPerformanceMonth
    );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  async function handleSave() {
    if (!title.trim()) {
      setErrorMessage(
        "Key Result title is required."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (keyResult) {
        const updated =
          await updateRuntimePerformanceInstanceKeyResultAction(
            {
              organizationId,

              performanceInstanceId,

              keyResultId:
                keyResult.id,

              title,

              target:
                parseTargetValue(
                  target
                ),

              measurementType,

              scoringMethod,

              weight:
                weight.trim()
                  ? Number(weight)
                  : undefined,
            }
          );

        onSaved(
          updated
        );

        if (progress) {
          const updatedProgress =
            await updateRuntimeKeyResultProgressAction(
              {
                organizationId,

                performanceInstanceId,

                keyResultProgressId:
                  progress.id,

                currentValue,

                /*
                 * Score is calculated automatically from the
                 * selected scoring method.
                 */
                score:
                  calculatedScore,

                employeeComment:
                  progress.employeeComment,

                managerComment:
                  progress.managerComment,

                status:
                  progress.status,
              }
            );

          onProgressSaved(
            updatedProgress.keyResultProgress
          );
        }
      } else {
        const created =
          await createRuntimePerformanceInstanceKeyResultAction(
            {
              organizationId,

              performanceInstanceId,

              performanceInstanceObjectiveId,

              title,

              target:
                parseTargetValue(
                  target
                ),

              measurementType,

              scoringMethod,

              weight:
                weight.trim()
                  ? Number(weight)
                  : undefined,
            }
          );

        onSaved(
          created.keyResult
        );

        onProgressSaved(
          created.progress
        );
      }
    } catch (error) {
      console.error(
        "Failed to save Key Result:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save Key Result."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[#b4c2d1] bg-[#f8fbfc] p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor={
              keyResult
                ? `kr-title-${keyResult.id}`
                : "new-kr-title"
            }
            className="mb-2 block text-sm font-medium"
          >
            Key Result
          </label>

          <input
            id={
              keyResult
                ? `kr-title-${keyResult.id}`
                : "new-kr-title"
            }
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            placeholder="Enter Key Result"
          />
        </div>

        <div>
          <label
            htmlFor={
              keyResult
                ? `kr-target-${keyResult.id}`
                : "new-kr-target"
            }
            className="mb-2 block text-sm font-medium"
          >
            Target
          </label>

          <input
            id={
              keyResult
                ? `kr-target-${keyResult.id}`
                : "new-kr-target"
            }
            value={target}
            onChange={(event) =>
              setTarget(
                event.target.value
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            placeholder="Target value"
          />
        </div>

        <div>
          <label
            htmlFor={
              keyResult
                ? `kr-weight-${keyResult.id}`
                : "new-kr-weight"
            }
            className="mb-2 block text-sm font-medium"
          >
            Weight
          </label>

          <input
            id={
              keyResult
                ? `kr-weight-${keyResult.id}`
                : "new-kr-weight"
            }
            type="number"
            min="0"
            step="0.01"
            value={weight}
            onChange={(event) =>
              setWeight(
                event.target.value
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            placeholder="Optional"
          />
        </div>

        <div>
          <label
            htmlFor={
              keyResult
                ? `kr-measurement-${keyResult.id}`
                : "new-kr-measurement"
            }
            className="mb-2 block text-sm font-medium"
          >
            Measurement Type
          </label>

          <select
            id={
              keyResult
                ? `kr-measurement-${keyResult.id}`
                : "new-kr-measurement"
            }
            value={measurementType}
            onChange={(event) =>
              setMeasurementType(
                event.target.value as
                  | "percentage"
                  | "numeric"
                  | "financial"
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
          >
            <option value="numeric">
              Numeric
            </option>

            <option value="percentage">
              Percentage
            </option>

            <option value="financial">
              Financial
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor={
              keyResult
                ? `kr-scoring-${keyResult.id}`
                : "new-kr-scoring"
            }
            className="mb-2 block text-sm font-medium"
          >
            Scoring Method
          </label>

          <select
            id={
              keyResult
                ? `kr-scoring-${keyResult.id}`
                : "new-kr-scoring"
            }
            value={scoringMethod}
            onChange={(event) =>
              setScoringMethod(
                event.target.value as
                  | "percent_into_period"
                  | "percentage_of_target"
              )
            }
            disabled={isSaving}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
          >
            <option value="percentage_of_target">
              Percentage of Target
            </option>

            <option value="percent_into_period">
              Percent Into Period
            </option>
          </select>
        </div>

        {keyResult && progress && (
          <>
            <div>
              <label
                htmlFor={`kr-current-${keyResult.id}`}
                className="mb-2 block text-sm font-medium"
              >
                Current Value
              </label>

              <input
                id={`kr-current-${keyResult.id}`}
                value={currentValue}
                onChange={(event) =>
                  setCurrentValue(
                    event.target.value
                  )
                }
                disabled={isSaving}
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
              />
            </div>

            <div>
              <p className="mb-2 block text-sm font-medium">
                Calculated Score
              </p>

              <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3 text-sm font-medium">
                {calculatedScore}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Automatically calculated from the selected scoring method.
              </p>
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving ||
            !title.trim()
          }
          className="rounded-md bg-[#082550] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : keyResult
              ? "Save Key Result"
              : "Add Key Result"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ==========================================================
   Initiative Editor
========================================================== */

function InitiativeEditor({
  organizationId,
  performanceInstanceId,
  keyResultId,
  initiative,
  onSaved,
  onCancel,
}: {
  organizationId: string;

  performanceInstanceId: string;

  keyResultId: string;

  initiative?: PerformanceInstanceInitiative;

  onSaved: (
    initiative: PerformanceInstanceInitiative
  ) => void;

  onCancel: () => void;
}) {
  const [
    text,
    setText,
  ] = useState(
    initiative?.text ?? ""
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  async function handleSave() {
    if (!text.trim()) {
      setErrorMessage(
        "Initiative text is required."
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (initiative) {
        const updated =
          await updateRuntimePerformanceInstanceInitiativeAction(
            {
              organizationId,

              performanceInstanceId,

              performanceInstanceKeyResultId:
                keyResultId,

              initiativeId:
                initiative.id,

              text,
            }
          );

        onSaved(
          updated
        );
      } else {
        const created =
          await createRuntimePerformanceInstanceInitiativeAction(
            {
              organizationId,

              performanceInstanceId,

              performanceInstanceKeyResultId:
                keyResultId,

              text,
            }
          );

        onSaved(
          created
        );
      }
    } catch (error) {
      console.error(
        "Failed to save Initiative:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save Initiative."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border bg-white p-4">
      <label
        htmlFor={
          initiative
            ? `initiative-${initiative.id}`
            : `new-initiative-${keyResultId}`
        }
        className="mb-2 block text-sm font-medium"
      >
        Initiative
      </label>

      <textarea
        id={
          initiative
            ? `initiative-${initiative.id}`
            : `new-initiative-${keyResultId}`
        }
        value={text}
        onChange={(event) =>
          setText(
            event.target.value
          )
        }
        disabled={isSaving}
        rows={3}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        placeholder="Describe the initiative"
      />

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving ||
            !text.trim()
          }
          className="rounded-md bg-[#082550] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : initiative
              ? "Save Initiative"
              : "Add Initiative"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ==========================================================
   Key Result Card
========================================================== */

function KeyResultCard({
  organizationId,
  performanceInstanceId,
  objectiveId,
  keyResult,
  progress,
  performanceMonth,
  initiatives,
  onKeyResultSaved,
  onKeyResultDeleted,
  onProgressSaved,
  onInitiativeSaved,
  onInitiativeDeleted,
}: {
  organizationId: string;

  performanceInstanceId: string;

  objectiveId: string;

  keyResult: PerformanceInstanceKeyResult;

  progress?: KeyResultProgress;

  performanceMonth: string;

  initiatives: PerformanceInstanceInitiative[];

  onKeyResultSaved: (
    keyResult: PerformanceInstanceKeyResult
  ) => void;

  onKeyResultDeleted: (
    keyResultId: string
  ) => void;

  onProgressSaved: (
    progress: KeyResultProgress
  ) => void;

  onInitiativeSaved: (
    initiative: PerformanceInstanceInitiative
  ) => void;

  onInitiativeDeleted: (
    initiativeId: string
  ) => void;
}) {
  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    showInitiatives,
    setShowInitiatives,
  ] = useState(false);

  const [
    isAddingInitiative,
    setIsAddingInitiative,
  ] = useState(false);

  const [
    editingInitiativeId,
    setEditingInitiativeId,
  ] = useState<string | null>(
    null
  );

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  async function handleDeleteKeyResult() {
    const confirmed =
      window.confirm(
        "Delete this Key Result? This will also remove its associated initiatives and progress."
      );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteRuntimePerformanceInstanceKeyResultAction(
        organizationId,
        performanceInstanceId,
        keyResult.id
      );

      onKeyResultDeleted(
        keyResult.id
      );
    } catch (error) {
      console.error(
        "Failed to delete Key Result:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete Key Result."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeleteInitiative(
    initiativeId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this Initiative?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRuntimePerformanceInstanceInitiativeAction(
        organizationId,
        performanceInstanceId,
        keyResult.id,
        initiativeId
      );

      onInitiativeDeleted(
        initiativeId
      );
    } catch (error) {
      console.error(
        "Failed to delete Initiative:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete Initiative."
      );
    }
  }

  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      {!isEditing ? (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#082550]">
                {keyResult.title}
              </p>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Target
                  </p>

                  <p className="mt-1 font-medium">
                    {formatValue(
                      keyResult.target
                    ) || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Current Value
                  </p>

                  <p className="mt-1 font-medium">
                    {progress
                      ? formatValue(
                          progress.currentValue
                        ) || "—"
                      : "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Score
                  </p>

                  <p className="mt-1 font-medium">
                    {progress &&
                    String(
                      progress.currentValue
                    ).trim() !== ""
                      ? calculateRuntimeKeyResultScore(
                          progress.currentValue,
                          keyResult.target as
                            | number
                            | string,
                          keyResult.scoringMethod,
                          performanceMonth.length >= 7
                            ? performanceMonth.slice(0, 7)
                            : performanceMonth
                        )
                      : "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Weight
                  </p>

                  <p className="mt-1 font-medium">
                    {keyResult.weight ??
                      "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-[#e9f4f8] px-3 py-1">
                  {keyResult.measurementType ??
                    "numeric"}
                </span>

                <span className="rounded-full bg-[#e9f4f8] px-3 py-1">
                  {keyResult.scoringMethod ===
                  "percent_into_period"
                    ? "Percent Into Period"
                    : "Percentage of Target"}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
                className="rounded-md border px-3 py-2 text-sm font-medium"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteKeyResult
                }
                disabled={isDeleting}
                className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <button
              type="button"
              onClick={() =>
                setShowInitiatives(
                  (current) =>
                    !current
                )
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#082550]"
            >
              <span className="text-lg leading-none">
                {showInitiatives
                  ? "−"
                  : "+"}
              </span>

              Initiatives (
              {initiatives.length}
              )
            </button>

            {showInitiatives && (
              <div className="mt-3 space-y-3 pl-5">
                {initiatives.length ===
                  0 &&
                  !isAddingInitiative && (
                    <p className="text-sm text-muted-foreground">
                      No initiatives have
                      been added to this
                      Key Result.
                    </p>
                  )}

                {initiatives.map(
                  (initiative) => (
                    <div
                      key={
                        initiative.id
                      }
                      className="rounded-lg border bg-gray-50 p-4"
                    >
                      {editingInitiativeId ===
                      initiative.id ? (
                        <InitiativeEditor
                          organizationId={
                            organizationId
                          }
                          performanceInstanceId={
                            performanceInstanceId
                          }
                          keyResultId={
                            keyResult.id
                          }
                          initiative={
                            initiative
                          }
                          onSaved={(
                            updated
                          ) => {
                            onInitiativeSaved(
                              updated
                            );

                            setEditingInitiativeId(
                              null
                            );
                          }}
                          onCancel={() =>
                            setEditingInitiativeId(
                              null
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-foreground">
                            {
                              initiative.text
                            }
                          </p>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingInitiativeId(
                                  initiative.id
                                )
                              }
                              className="text-xs font-medium text-[#082550]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteInitiative(
                                  initiative.id
                                )
                              }
                              className="text-xs font-medium text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {isAddingInitiative && (
                  <InitiativeEditor
                    organizationId={
                      organizationId
                    }
                    performanceInstanceId={
                      performanceInstanceId
                    }
                    keyResultId={
                      keyResult.id
                    }
                    onSaved={(
                      created
                    ) => {
                      onInitiativeSaved(
                        created
                      );

                      setIsAddingInitiative(
                        false
                      );
                    }}
                    onCancel={() =>
                      setIsAddingInitiative(
                        false
                      )
                    }
                  />
                )}

                {!isAddingInitiative &&
                  initiatives.length <
                    3 && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsAddingInitiative(
                          true
                        )
                      }
                      className="rounded-md border border-dashed px-3 py-2 text-sm font-medium text-[#082550]"
                    >
                      + Add Initiative
                    </button>
                  )}

                {initiatives.length >=
                  3 && (
                  <p className="text-xs text-muted-foreground">
                    Maximum of 3 initiatives
                    reached.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <KeyResultEditor
          organizationId={
            organizationId
          }
          performanceInstanceId={
            performanceInstanceId
          }
          performanceInstanceObjectiveId={
            objectiveId
          }
          keyResult={
            keyResult
          }
          progress={
            progress
          }
          performanceMonth={
            performanceMonth
          }
          onSaved={(
            updated
          ) => {
            onKeyResultSaved(
              updated
            );

            setIsEditing(false);
          }}
          onProgressSaved={
            onProgressSaved
          }
          onCancel={() =>
            setIsEditing(false)
          }
        />
      )}
    </article>
  );
}

/* ==========================================================
   Key Results Page
========================================================== */

export default function KeyResultsPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(
    null
  );

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    teams,
    setTeams,
  ] = useState<Team[]>([]);

  const [
    userRecords,
    setUserRecords,
  ] = useState<UserManagementRecord[]>(
    []
  );

  const [
    assignments,
    setAssignments,
  ] = useState<Assignment[]>([]);

  const [
    performanceSheets,
    setPerformanceSheets,
  ] = useState<
    PerformanceSheetRecord[]
  >([]);

  const [
    performanceInstances,
    setPerformanceInstances,
  ] = useState<
    PerformanceInstance[]
  >([]);

  const [
    objectives,
    setObjectives,
  ] = useState<
    PerformanceInstanceObjective[]
  >([]);

  const [
    keyResults,
    setKeyResults,
  ] = useState<
    PerformanceInstanceKeyResult[]
  >([]);

  const [
    initiativesByKeyResult,
    setInitiativesByKeyResult,
  ] = useState<
    Record<
      string,
      PerformanceInstanceInitiative[]
    >
  >({});

  const [
    progressByKeyResult,
    setProgressByKeyResult,
  ] = useState<
    Record<
      string,
      KeyResultProgress
    >
  >({});

  const [
    selectedDepartmentId,
    setSelectedDepartmentId,
  ] = useState("");

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] = useState("");

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState("");

  const [
    selectedAssignmentId,
    setSelectedAssignmentId,
  ] = useState("");

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    getCurrentMonth()
  );

  const [
    selectedObjectiveId,
    setSelectedObjectiveId,
  ] = useState("");

  const [
    selectedPerformanceInstance,
    setSelectedPerformanceInstance,
  ] = useState<
    PerformanceInstance | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoadingKeyResults,
    setIsLoadingKeyResults,
  ] = useState(false);

  const [
    isAddingKeyResult,
    setIsAddingKeyResult,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  /* ========================================================
     Initial Load
  ======================================================== */

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization(
            organizationId
          );

        if (!existingOrganization) {
          setOrganization(null);

          setErrorMessage(
            "No organization has been configured yet."
          );

          return;
        }

        const [
          loadedDepartments,
          loadedTeams,
          loadedUsers,
          loadedAssignments,
          loadedPerformanceSheets,
        ] = await Promise.all([
          getDepartments(
            existingOrganization.id
          ),

          getTeams(
            existingOrganization.id
          ),

          listUserManagementRecords(
            existingOrganization.id
          ),

          findAssignmentsByOrganization(
            existingOrganization.id
          ),

          findPublishedPerformanceSheetsByOrganization(
            existingOrganization.id
          ),
        ]);

        setOrganization(
          existingOrganization
        );

        setDepartments(
          loadedDepartments
        );

        setTeams(
          loadedTeams
        );

        setUserRecords(
          loadedUsers
        );

        setAssignments(
          loadedAssignments
        );

        setPerformanceSheets(
          loadedPerformanceSheets
        );

        setSelectedDepartmentId("");
        setSelectedTeamId("");
        setSelectedMemberId("");
        setSelectedAssignmentId("");
        setSelectedMonth(
          getCurrentMonth()
        );

        setPerformanceInstances([]);
        setObjectives([]);
        setKeyResults([]);
        setInitiativesByKeyResult(
          {}
        );
        setProgressByKeyResult({});
        setSelectedPerformanceInstance(
          null
        );
        setSelectedObjectiveId("");
      } catch (error) {
        console.error(
          "Failed to load Key Results:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Key Results."
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [organizationId]);

  /* ========================================================
     Cascading Selectors
  ======================================================== */

  const visibleTeams =
    useMemo(
      () =>
        selectedDepartmentId
          ? teams.filter(
              (team) =>
                team.department_id ===
                  selectedDepartmentId &&
                team.is_active
            )
          : [],
      [
        teams,
        selectedDepartmentId,
      ]
    );

  const visibleMembers =
    useMemo(
      () =>
        userRecords.filter(
          (record) =>
            record.user.is_active &&
            record.membership?.department_id ===
              selectedDepartmentId &&
            record.membership?.team_id ===
              selectedTeamId
        ),
      [
        userRecords,
        selectedDepartmentId,
        selectedTeamId,
      ]
    );

  const activeAssignmentsForMember =
    useMemo(
      () =>
        assignments
          .filter(
            (assignment) =>
              assignment.assignmentType ===
                "individual" &&
              assignment.status ===
                "active" &&
              assignment.subjectId ===
                selectedMemberId
          )
          .sort(
            (a, b) =>
              new Date(
                b.assignedAt
              ).getTime() -
              new Date(
                a.assignedAt
              ).getTime()
          ),
      [
        assignments,
        selectedMemberId,
      ]
    );

  const performanceSheetMap =
    useMemo(
      () =>
        new Map(
          performanceSheets.map(
            (sheet) => [
              sheet.id,
              sheet,
            ]
          )
        ),
      [performanceSheets]
    );

  const selectedAssignment =
    activeAssignmentsForMember.find(
      (assignment) =>
        assignment.id ===
        selectedAssignmentId
    ) ??
    activeAssignmentsForMember[0] ??
    null;

  const selectedPerformanceSheet =
    selectedAssignment
      ? performanceSheetMap.get(
          selectedAssignment.performanceSheetId
        ) ?? null
      : null;

  /* ========================================================
     Available Months
  ======================================================== */

  const monthOptions =
    useMemo(() => {
      const months =
        new Set<string>();

      months.add(
        getCurrentMonth()
      );

      for (
        const instance of performanceInstances
      ) {
        months.add(
          instance.performanceMonth
        );
      }

      return Array.from(
        months
      ).sort(
        (a, b) =>
          new Date(
            b
          ).getTime() -
          new Date(
            a
          ).getTime()
      );
    }, [
      performanceInstances,
    ]);

  /* ========================================================
     Load Assignment History
  ======================================================== */

  useEffect(() => {
    async function loadHistory() {
      if (
        !organization ||
        !selectedAssignment
      ) {
        setPerformanceInstances([]);
        return;
      }

      try {
        const instances =
          await findPerformanceInstancesByAssignment(
            organization.id,
            selectedAssignment.id
          );

        setPerformanceInstances(
          instances
        );
      } catch (error) {
        console.error(
          "Failed to load performance history:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load performance history."
        );

        setPerformanceInstances([]);
      }
    }

    loadHistory();
  }, [
    organization,
    selectedAssignment,
  ]);

  /* ========================================================
     Load Monthly Runtime Objectives
  ======================================================== */

  useEffect(() => {
    async function loadMonthlyObjectives() {
      if (
        !organization ||
        !selectedAssignment
      ) {
        setObjectives([]);
        setSelectedObjectiveId("");
        setSelectedPerformanceInstance(
          null
        );
        return;
      }

      try {
        setIsLoadingKeyResults(
          true
        );

        setErrorMessage(null);

        const performanceInstance =
          await getOrCreatePerformanceExecutionForMonth(
            organization.id,
            selectedAssignment.id,
            selectedMonth
          );

        const loadedObjectives =
          await findPerformanceInstanceObjectives(
            performanceInstance.id
          );

        setSelectedPerformanceInstance(
          performanceInstance
        );

        setObjectives(
          loadedObjectives
        );

        setSelectedObjectiveId(
          (current) =>
            loadedObjectives.some(
              (objective) =>
                objective.id ===
                current
            )
              ? current
              : loadedObjectives[0]
                  ?.id ?? ""
        );

        setPerformanceInstances(
          (current) => {
            const existing =
              current.filter(
                (instance) =>
                  instance.id !==
                  performanceInstance.id
              );

            return [
              performanceInstance,
              ...existing,
            ].sort(
              (a, b) =>
                new Date(
                  b.performanceMonth
                ).getTime() -
                new Date(
                  a.performanceMonth
                ).getTime()
            );
          }
        );
      } catch (error) {
        console.error(
          "Failed to load monthly Key Results:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load the selected month."
        );

        setObjectives([]);
        setKeyResults([]);
        setSelectedObjectiveId("");
        setSelectedPerformanceInstance(
          null
        );
      } finally {
        setIsLoadingKeyResults(
          false
        );
      }
    }

    loadMonthlyObjectives();
  }, [
    organization,
    selectedAssignment,
    selectedMonth,
  ]);

  /* ========================================================
     Load Key Results For Selected Objective
  ======================================================== */

  useEffect(() => {
    async function loadKeyResults() {
      if (
        !selectedPerformanceInstance ||
        !selectedObjectiveId
      ) {
        setKeyResults([]);
        setInitiativesByKeyResult(
          {}
        );
        setProgressByKeyResult({});
        return;
      }

      try {
        setIsLoadingKeyResults(
          true
        );

        setErrorMessage(null);

        const [
          loadedKeyResults,
          loadedProgress,
        ] = await Promise.all([
          findPerformanceInstanceKeyResults(
            selectedPerformanceInstance.id
          ),

          findKeyResultProgressByPerformanceInstance(
            selectedPerformanceInstance.id
          ),
        ]);

        const objectiveKeyResults =
          loadedKeyResults
            .filter(
              (keyResult) =>
                keyResult.performanceInstanceObjectiveId ===
                selectedObjectiveId
            )
            .sort(
              (a, b) =>
                a.position -
                b.position
            );

        const initiatives =
          await Promise.all(
            objectiveKeyResults.map(
              async (keyResult) => {
                const records =
                  await findPerformanceInstanceInitiativesByKeyResult(
                    keyResult.id
                  );

                return [
                  keyResult.id,
                  records,
                ] as const;
              }
            )
          );

        const progressMap =
          Object.fromEntries(
            loadedProgress.map(
              (progress) => [
                progress.keyResultId,
                progress,
              ]
            )
          );

        setKeyResults(
          objectiveKeyResults
        );

        setProgressByKeyResult(
          progressMap
        );

        setInitiativesByKeyResult(
          Object.fromEntries(
            initiatives
          )
        );
      } catch (error) {
        console.error(
          "Failed to load Key Results:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load Key Results."
        );

        setKeyResults([]);
        setInitiativesByKeyResult(
          {}
        );
        setProgressByKeyResult({});
      } finally {
        setIsLoadingKeyResults(
          false
        );
      }
    }

    loadKeyResults();
  }, [
    selectedPerformanceInstance,
    selectedObjectiveId,
  ]);

  /* ========================================================
     Selection Handlers
  ======================================================== */

  function handleDepartmentChange(
    value: string
  ) {
    setSelectedDepartmentId(
      value
    );

    setSelectedTeamId("");
    setSelectedMemberId("");
    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setKeyResults([]);
    setInitiativesByKeyResult(
      {}
    );
    setProgressByKeyResult({});
    setSelectedObjectiveId("");
    setSelectedPerformanceInstance(
      null
    );
    setIsAddingKeyResult(false);
  }

  function handleTeamChange(
    value: string
  ) {
    setSelectedTeamId(
      value
    );

    setSelectedMemberId("");
    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setKeyResults([]);
    setInitiativesByKeyResult(
      {}
    );
    setProgressByKeyResult({});
    setSelectedObjectiveId("");
    setSelectedPerformanceInstance(
      null
    );
    setIsAddingKeyResult(false);
  }

  function handleMemberChange(
    value: string
  ) {
    setSelectedMemberId(
      value
    );

    setSelectedAssignmentId("");

    setPerformanceInstances([]);
    setObjectives([]);
    setKeyResults([]);
    setInitiativesByKeyResult(
      {}
    );
    setProgressByKeyResult({});
    setSelectedObjectiveId("");
    setSelectedPerformanceInstance(
      null
    );
    setSelectedMonth(
      getCurrentMonth()
    );
    setIsAddingKeyResult(false);
  }

  function handleAssignmentChange(
    value: string
  ) {
    setSelectedAssignmentId(
      value
    );

    setPerformanceInstances([]);
    setObjectives([]);
    setKeyResults([]);
    setInitiativesByKeyResult(
      {}
    );
    setProgressByKeyResult({});
    setSelectedObjectiveId("");
    setSelectedPerformanceInstance(
      null
    );
    setSelectedMonth(
      getCurrentMonth()
    );
    setIsAddingKeyResult(false);
  }

  function handleObjectiveChange(
    value: string
  ) {
    setSelectedObjectiveId(
      value
    );

    setIsAddingKeyResult(false);
  }

  /* ========================================================
     Key Result Handlers
  ======================================================== */

  function handleKeyResultSaved(
    updatedKeyResult: PerformanceInstanceKeyResult
  ) {
    setKeyResults(
      (current) =>
        current
          .map(
            (keyResult) =>
              keyResult.id ===
              updatedKeyResult.id
                ? updatedKeyResult
                : keyResult
          )
          .sort(
            (a, b) =>
              a.position -
              b.position
          )
    );
  }

  function handleKeyResultDeleted(
    keyResultId: string
  ) {
    setKeyResults(
      (current) =>
        current.filter(
          (keyResult) =>
            keyResult.id !==
            keyResultId
        )
    );

    setProgressByKeyResult(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          keyResultId
        ];

        return next;
      }
    );

    setInitiativesByKeyResult(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          keyResultId
        ];

        return next;
      }
    );
  }

  function handleProgressSaved(
    updatedProgress: KeyResultProgress
  ) {
    setProgressByKeyResult(
      (current) => ({
        ...current,

        [updatedProgress.keyResultId]:
          updatedProgress,
      })
    );
  }

  function handleInitiativeSaved(
    initiative: PerformanceInstanceInitiative
  ) {
    setInitiativesByKeyResult(
      (current) => {
        const existing =
          current[
            initiative.performanceInstanceKeyResultId
          ] ?? [];

        const alreadyExists =
          existing.some(
            (item) =>
              item.id ===
              initiative.id
          );

        return {
          ...current,

          [
            initiative.performanceInstanceKeyResultId
          ]: alreadyExists
            ? existing.map(
                (item) =>
                  item.id ===
                  initiative.id
                    ? initiative
                    : item
              )
            : [
                ...existing,
                initiative,
              ],
        };
      }
    );
  }

  function handleInitiativeDeleted(
    keyResultId: string,
    initiativeId: string
  ) {
    setInitiativesByKeyResult(
      (current) => ({
        ...current,

        [keyResultId]: (
          current[
            keyResultId
          ] ?? []
        ).filter(
          (initiative) =>
            initiative.id !==
            initiativeId
        ),
      })
    );
  }

  /* ========================================================
     Selected Member / Objective
  ======================================================== */

  const selectedMember =
    userRecords.find(
      (record) =>
        record.user.id ===
        selectedMemberId
    ) ?? null;

  const selectedObjective =
    objectives.find(
      (objective) =>
        objective.id ===
        selectedObjectiveId
    ) ?? null;

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <AdminPageHeader
          title="Key Results"
          description="Manage Key Results and initiatives for an individual member's monthly performance."
        />

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {isLoading ? (
          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading Key Results...
            </p>
          </section>
        ) : !organization ? (
          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">
              No Organization
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Create an organization before managing Key Results.
            </p>
          </section>
        ) : (
          <>
            {/* ==================================================
               Performance Context
            ================================================== */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Performance Context
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select the member and monthly performance context you want to manage.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="keyresults-department"
                    className="mb-2 block text-sm font-medium"
                  >
                    Department
                  </label>

                  <select
                    id="keyresults-department"
                    value={
                      selectedDepartmentId
                    }
                    onChange={(event) =>
                      handleDepartmentChange(
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.is_active
                      )
                      .map(
                        (department) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                          >
                            {
                              department.name
                            }
                          </option>
                        )
                      )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="keyresults-team"
                    className="mb-2 block text-sm font-medium"
                  >
                    Team
                  </label>

                  <select
                    id="keyresults-team"
                    value={
                      selectedTeamId
                    }
                    onChange={(event) =>
                      handleTeamChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedDepartmentId
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Team
                    </option>

                    {visibleTeams.map(
                      (team) => (
                        <option
                          key={
                            team.id
                          }
                          value={
                            team.id
                          }
                        >
                          {team.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="keyresults-member"
                    className="mb-2 block text-sm font-medium"
                  >
                    Member
                  </label>

                  <select
                    id="keyresults-member"
                    value={
                      selectedMemberId
                    }
                    onChange={(event) =>
                      handleMemberChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedTeamId
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Member
                    </option>

                    {visibleMembers.map(
                      (record) => (
                        <option
                          key={
                            record.user.id
                          }
                          value={
                            record.user.id
                          }
                        >
                          {displayUserName(
                            record
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="keyresults-performance-sheet"
                    className="mb-2 block text-sm font-medium"
                  >
                    Active Performance Sheet
                  </label>

                  <select
                    id="keyresults-performance-sheet"
                    value={
                      selectedAssignment?.id ??
                      ""
                    }
                    onChange={(event) =>
                      handleAssignmentChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedMemberId ||
                      activeAssignmentsForMember.length ===
                        0
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Performance Sheet
                    </option>

                    {activeAssignmentsForMember.map(
                      (assignment) => {
                        const sheet =
                          performanceSheetMap.get(
                            assignment.performanceSheetId
                          );

                        return (
                          <option
                            key={
                              assignment.id
                            }
                            value={
                              assignment.id
                            }
                          >
                            {sheet?.name ??
                              "Performance Sheet"}{" "}
                            {sheet
                              ? `· Version ${sheet.version}`
                              : ""}
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="keyresults-month"
                    className="mb-2 block text-sm font-medium"
                  >
                    Performance Month
                  </label>

                  <select
                    id="keyresults-month"
                    value={
                      selectedMonth.slice(
                        0,
                        7
                      )
                    }
                    onChange={(event) =>
                      setSelectedMonth(
                        `${event.target.value}-01`
                      )
                    }
                    disabled={
                      !selectedAssignment
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    {monthOptions.map(
                      (month) => (
                        <option
                          key={
                            month
                          }
                          value={month.slice(
                            0,
                            7
                          )}
                        >
                          {formatMonth(
                            month
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="keyresults-objective"
                    className="mb-2 block text-sm font-medium"
                  >
                    Objective
                  </label>

                  <select
                    id="keyresults-objective"
                    value={
                      selectedObjectiveId
                    }
                    onChange={(event) =>
                      handleObjectiveChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedPerformanceInstance ||
                      objectives.length ===
                        0
                    }
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      Select Objective
                    </option>

                    {objectives.map(
                      (
                        objective,
                        index
                      ) => (
                        <option
                          key={
                            objective.id
                          }
                          value={
                            objective.id
                          }
                        >
                          Objective{" "}
                          {index + 1}:{" "}
                          {
                            objective.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            {/* ==================================================
               Selected Context
            ================================================== */}

            {selectedMember &&
              selectedAssignment &&
              selectedPerformanceSheet &&
              selectedPerformanceInstance && (
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Monthly Performance
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold">
                        {displayUserName(
                          selectedMember
                        )}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          selectedPerformanceSheet.name
                        }{" "}
                        · Version{" "}
                        {
                          selectedPerformanceSheet.version
                        }
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#e9f4f8] px-4 py-3">
                      <p className="text-sm font-semibold text-[#082550]">
                        {formatMonth(
                          selectedMonth
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Performance Instance
                      </p>
                    </div>
                  </div>
                </section>
              )}

            {/* ==================================================
               Selected Objective / Key Results
            ================================================== */}

            {selectedPerformanceInstance &&
              selectedObjective && (
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#082550]">
                        Objective
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold">
                        {
                          selectedObjective.title
                        }
                      </h2>

                      {selectedObjective.description && (
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                          {
                            selectedObjective.description
                          }
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setIsAddingKeyResult(
                          (current) =>
                            !current
                        )
                      }
                      className="shrink-0 rounded-md bg-[#082550] px-4 py-2 text-sm font-medium text-white"
                    >
                      {isAddingKeyResult
                        ? "Cancel"
                        : "+ Add Key Result"}
                    </button>
                  </div>

                  {isAddingKeyResult && (
                    <KeyResultEditor
                      organizationId={
                        organization.id
                      }
                      performanceInstanceId={
                        selectedPerformanceInstance.id
                      }
                      performanceInstanceObjectiveId={
                        selectedObjective.id
                      }
                      performanceMonth={
                        selectedMonth
                      }
                      onSaved={(
                        created
                      ) => {
                        setKeyResults(
                          (current) =>
                            [
                              ...current,
                              created,
                            ].sort(
                              (a, b) =>
                                a.position -
                                b.position
                            )
                        );

                        setProgressByKeyResult(
                          (current) => ({
                            ...current,

                            /*
                             * The create action returns
                             * the new progress through the
                             * editor callback.
                             */
                            ...current,
                          })
                        );

                        setIsAddingKeyResult(
                          false
                        );
                      }}
                      onProgressSaved={(
                        createdProgress
                      ) => {
                        setProgressByKeyResult(
                          (current) => ({
                            ...current,

                            [
                              createdProgress.keyResultId
                            ]:
                              createdProgress,
                          })
                        );
                      }}
                      onCancel={() =>
                        setIsAddingKeyResult(
                          false
                        )
                      }
                    />
                  )}

                  {isLoadingKeyResults ? (
                    <div className="py-8">
                      <p className="text-sm text-muted-foreground">
                        Loading Key Results...
                      </p>
                    </div>
                  ) : keyResults.length ===
                    0 ? (
                    <div className="mt-5 rounded-xl border border-dashed p-8 text-center">
                      <p className="text-sm font-medium">
                        No Key Results for this Objective
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Add the first Key Result for this member and monthly performance instance.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {keyResults.map(
                        (keyResult) => (
                          <KeyResultCard
                            key={
                              keyResult.id
                            }
                            organizationId={
                              organization.id
                            }
                            performanceInstanceId={
                              selectedPerformanceInstance.id
                            }
                            objectiveId={
                              selectedObjective.id
                            }
                            keyResult={
                              keyResult
                            }
                            progress={
                              progressByKeyResult[
                                keyResult.id
                              ]
                            }
                            performanceMonth={
                              selectedMonth
                            }
                            initiatives={
                              initiativesByKeyResult[
                                keyResult.id
                              ] ?? []
                            }
                            onKeyResultSaved={
                              handleKeyResultSaved
                            }
                            onKeyResultDeleted={
                              handleKeyResultDeleted
                            }
                            onProgressSaved={
                              handleProgressSaved
                            }
                            onInitiativeSaved={
                              handleInitiativeSaved
                            }
                            onInitiativeDeleted={(
                              initiativeId
                            ) =>
                              handleInitiativeDeleted(
                                keyResult.id,
                                initiativeId
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </section>
              )}

            {/* ==================================================
               Selection Guidance
            ================================================== */}

            {!selectedMember ||
            !selectedAssignment ||
            !selectedPerformanceInstance ? (
              <section className="rounded-xl border border-dashed bg-white p-10 text-center">
                <h2 className="text-lg font-semibold">
                  Select a Performance Context
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Select a Department, Team, Member, Performance Sheet, and Month to manage Key Results.
                </p>
              </section>
            ) : (
              objectives.length ===
                0 && (
                <section className="rounded-xl border border-dashed bg-white p-10 text-center">
                  <h2 className="text-lg font-semibold">
                    No Objectives Available
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    This monthly Performance Instance does not currently contain any Objectives.
                  </p>
                </section>
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}