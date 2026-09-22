"use client";

import {
  useState,
} from "react";

import type {
  RuntimePerformanceKeyResult,
} from "@/lib/runtime/runtimeperformance";

interface KeyResultEditorProps {
  keyResult?: RuntimePerformanceKeyResult;

  onCancel: () => void;

  onSave: (
    values: {
      title: string;
      target: unknown;
      measurementType:
        | "percentage"
        | "numeric"
        | "financial";
      scoringMethod:
        | "percent_into_period"
        | "percentage_of_target";
      weight?: number;
    }
  ) => Promise<void>;
}

export default function KeyResultEditor({
  keyResult,

  onCancel,

  onSave,
}: KeyResultEditorProps) {
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
    keyResult?.target ===
        undefined ||
      keyResult?.target ===
        null
      ? ""
      : String(
          keyResult.target
        )
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
      : String(
          keyResult.weight
        )
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

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      setError(
        "Key Result title is required."
      );

      return;
    }

    if (!target.trim()) {
      setError(
        "Key Result target is required."
      );

      return;
    }

    const parsedWeight =
      weight.trim()
        ? Number(
            weight
          )
        : undefined;

    if (
      parsedWeight !==
        undefined &&
      (!Number.isFinite(
        parsedWeight
      ) ||
        parsedWeight < 0 ||
        parsedWeight > 100)
    ) {
      setError(
        "Weight must be between 0 and 100."
      );

      return;
    }

    setSaving(true);

    setError(null);

    try {
      await onSave({
        title:
          trimmedTitle,

        target:
          target.trim(),

        measurementType,

        scoringMethod,

        weight:
          parsedWeight,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save Key Result."
      );

      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-lg border bg-white p-5"
    >
      <div className="space-y-4">

        {/* ====================================================
            Title
        ==================================================== */}

        <div>
          <label
            htmlFor="key-result-title"
            className="block text-sm font-medium"
          >
            Key Result Title
          </label>

          <input
            id="key-result-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            disabled={saving}
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Enter Key Result"
            autoFocus
          />
        </div>

        {/* ====================================================
            Target
        ==================================================== */}

        <div>
          <label
            htmlFor="key-result-target"
            className="block text-sm font-medium"
          >
            Target
          </label>

          <input
            id="key-result-target"
            type="text"
            value={target}
            onChange={(event) =>
              setTarget(
                event.target.value
              )
            }
            disabled={saving}
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Enter target"
          />
        </div>

        {/* ====================================================
            Measurement Type
        ==================================================== */}

        <div>
          <label
            htmlFor="key-result-measurement"
            className="block text-sm font-medium"
          >
            Measurement Type
          </label>

          <select
            id="key-result-measurement"
            value={
              measurementType
            }
            onChange={(event) =>
              setMeasurementType(
                event.target
                  .value as
                  | "percentage"
                  | "numeric"
                  | "financial"
              )
            }
            disabled={saving}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="numeric">
              Numeric
            </option>

            <option value="financial">
              Financial ($)
            </option>
          </select>
        </div>

        {/* ====================================================
            Scoring Method
        ==================================================== */}

        <div>
          <label
            htmlFor="key-result-scoring"
            className="block text-sm font-medium"
          >
            Scoring Method
          </label>

          <select
            id="key-result-scoring"
            value={
              scoringMethod
            }
            onChange={(event) =>
              setScoringMethod(
                event.target
                  .value as
                  | "percent_into_period"
                  | "percentage_of_target"
              )
            }
            disabled={saving}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="percentage_of_target">
              Percentage of Target
            </option>

            <option value="percent_into_period">
              % Into Period
            </option>
          </select>
        </div>

        {/* ====================================================
            Weight
        ==================================================== */}

        <div>
          <label
            htmlFor="key-result-weight"
            className="block text-sm font-medium"
          >
            Weight
          </label>

          <input
            id="key-result-weight"
            type="number"
            min="0"
            max="100"
            value={weight}
            onChange={(event) =>
              setWeight(
                event.target.value
              )
            }
            disabled={saving}
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Optional"
          />
        </div>

        {/* ====================================================
            Error
        ==================================================== */}

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* ====================================================
            Actions
        ==================================================== */}

        <div className="flex gap-2">

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : keyResult
                ? "Save Key Result"
                : "Add Key Result"}
          </button>

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={saving}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>

        </div>

      </div>
    </form>
  );
}