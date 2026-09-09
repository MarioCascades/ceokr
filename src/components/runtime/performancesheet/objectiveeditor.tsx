"use client";

import {
  useState,
} from "react";

import {
  createRuntimePerformanceInstanceObjectiveAction,
  updateRuntimePerformanceInstanceObjectiveAction,
} from "@/app/runtime/actions";

import type {
  RuntimePerformanceObjective,
} from "@/lib/runtime/runtimeperformance";

interface ObjectiveEditorProps {
  organizationId: string;

  performanceInstanceId: string;

  objective?: RuntimePerformanceObjective;

  onSaved: (
    objective: RuntimePerformanceObjective
  ) => void;

  onCancel: () => void;
}

export default function ObjectiveEditor({
  organizationId,

  performanceInstanceId,

  objective,

  onSaved,

  onCancel,
}: ObjectiveEditorProps) {
  const [
    title,
    setTitle,
  ] = useState(
    objective?.title ?? ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    objective?.description ?? ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function handleSave() {
    if (!title.trim()) {
      setError(
        "Objective title is required."
      );

      return;
    }

    setSaving(true);

    setError(null);

    try {
      if (objective) {
        const updated =
          await updateRuntimePerformanceInstanceObjectiveAction(
            {
              organizationId,

              performanceInstanceId,

              objectiveId:
                objective.id,

              title,

              description,
            }
          );

        onSaved({
          ...objective,

          title:
            updated.title,

          description:
            updated.description,

          weight:
            updated.weight,

          position:
            updated.position,
        });

        return;
      }

      const created =
        await createRuntimePerformanceInstanceObjectiveAction(
          {
            organizationId,

            performanceInstanceId,

            title,

            description,
          }
        );

      onSaved({
        id:
          created.id,

        sourceObjectiveId:
          created.sourceObjectiveId,

        title:
          created.title,

        description:
          created.description,

        weight:
          created.weight,

        position:
          created.position,

        keyResults: [],
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save objective."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border bg-muted/20 p-5">

      <h3 className="text-lg font-semibold">
        {objective
          ? "Edit Objective"
          : "Add Objective"}
      </h3>

      <div className="mt-4 space-y-4">

        <div>
          <label
            htmlFor="objective-title"
            className="mb-1 block text-sm font-medium"
          >
            Objective
          </label>

          <input
            id="objective-title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            disabled={saving}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="Enter objective"
          />
        </div>

        <div>
          <label
            htmlFor="objective-description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="objective-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            disabled={saving}
            rows={3}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="Describe what you want to accomplish"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : objective
                ? "Save Objective"
                : "Add Objective"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>

        </div>

      </div>

    </section>
  );
}