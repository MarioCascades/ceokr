"use client";

import {
  useState,
} from "react";

import {
  updateRuntimePerformanceInstanceObjectiveAction,
} from "@/app/runtime/actions";

import type {
  RuntimePerformanceObjective,
} from "@/lib/runtime/runtimeperformance";

/* ==========================================================
   Props
========================================================== */

interface EditObjectiveButtonProps {
  objective: RuntimePerformanceObjective;

  organizationId: string;

  performanceInstanceId: string;

  onUpdated: (
    objective: RuntimePerformanceObjective
  ) => void;
}

/* ==========================================================
   Component
========================================================== */

export default function EditObjectiveButton({
  objective,

  organizationId,

  performanceInstanceId,

  onUpdated,
}: EditObjectiveButtonProps) {
  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState(
    objective.title
  );

  const [
    description,
    setDescription,
  ] = useState(
    objective.description ?? ""
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  function handleCancel() {
    setTitle(
      objective.title
    );

    setDescription(
      objective.description ?? ""
    );

    setError(null);

    setIsEditing(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError(
        "Objective title is required."
      );

      return;
    }

    setIsSaving(true);

    setError(null);

    try {
      const updated =
        await updateRuntimePerformanceInstanceObjectiveAction(
          {
            organizationId,

            performanceInstanceId,

            objectiveId:
              objective.id,

            title,

            description,

            position:
              objective.position,
          }
        );

      const updatedObjective:
        RuntimePerformanceObjective =
        {
          ...objective,

          title:
            updated.title,

          description:
            updated.description,

          weight:
            updated.weight,

          position:
            updated.position,
        };

      onUpdated(
        updatedObjective
      );

      setIsEditing(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update objective."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() =>
          setIsEditing(true)
        }
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        Edit Objective
      </button>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-lg border bg-muted/30 p-4">

      <div className="space-y-4">

        <div>
          <label
            htmlFor={`objective-title-${objective.id}`}
            className="mb-1 block text-sm font-medium"
          >
            Objective
          </label>

          <input
            id={`objective-title-${objective.id}`}
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            disabled={isSaving}
          />
        </div>

        <div>
          <label
            htmlFor={`objective-description-${objective.id}`}
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id={`objective-description-${objective.id}`}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            rows={3}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            disabled={isSaving}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save Objective"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}