"use client";

import { useState } from "react";

import type {
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import {
  updateRuntimeKeyResultProgressAction,
} from "@/app/runtime/actions";

interface KeyResultRowProps {
  keyResult: BuilderKeyResult;

  progress?: KeyResultProgress;

  organizationId: string;

  performanceInstanceId: string;
}

export default function KeyResultRow({
  keyResult,
  progress,
  organizationId,
  performanceInstanceId,
}: KeyResultRowProps) {
  const [currentValue, setCurrentValue] =
    useState(
      progress?.currentValue ?? ""
    );

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSave() {
    if (!progress) {
      setError(
        "Runtime Key Result Progress record not found."
      );

      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await updateRuntimeKeyResultProgressAction({
        organizationId,

        performanceInstanceId,

        keyResultProgressId:
          progress.id,

        currentValue,

        score:
          progress.score,

        confidence:
          progress.confidence,

        employeeComment:
          progress.employeeComment,

        managerComment:
          progress.managerComment,

        status:
          progress.status,
      });

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save Runtime Key Result progress:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save Runtime Key Result progress."
      );
    } finally {
      setSaving(false);
    }
  }

  const score =
    progress?.score ?? 0;

  const progressWidth =
    Math.min(
      Math.max(score, 0),
      100
    );

  return (
    <div className="rounded-lg border bg-gray-50 p-5">

      {/* ==========================================
          Key Result Header
      ========================================== */}

      <div className="flex items-center justify-between">

        <h3 className="text-lg font-semibold">
          {keyResult.title}
        </h3>

        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {keyResult.weight}% Weight
        </span>

      </div>

      {/* ==========================================
          Runtime Values
      ========================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Target */}

        <div>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            Target
          </p>

          <p className="mt-2 text-xl font-semibold">
            {keyResult.target}
          </p>

        </div>

        {/* Current */}

        <div>

          <label
            htmlFor={`current-${keyResult.id}`}
            className="text-xs uppercase tracking-wide text-gray-500"
          >
            Current
          </label>

          <input
            id={`current-${keyResult.id}`}
            type="text"
            value={currentValue}
            onChange={(event) => {
              setCurrentValue(
                event.target.value
              );

              setSaved(false);
            }}
            className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-xl font-semibold"
            placeholder="Enter current value"
          />

        </div>

        {/* Score */}

        <div>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            Score
          </p>

          <p className="mt-2 text-xl font-semibold">
            {score}
          </p>

        </div>

      </div>

      {/* ==========================================
          Runtime Status
      ========================================== */}

      <div className="mt-4">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          Status
        </p>

        <p className="mt-1 text-sm font-medium">
          {progress?.status ?? "not_started"}
        </p>

      </div>

      {/* ==========================================
          Save
      ========================================== */}

      <div className="mt-5 flex items-center gap-3">

        <button
          type="button"
          onClick={handleSave}
          disabled={
            saving ||
            !progress
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Current"}
        </button>

        {saved && (
          <span className="text-sm text-green-600">
            Saved
          </span>
        )}

      </div>

      {/* ==========================================
          Error
      ========================================== */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ==========================================
          Progress Bar
      ========================================== */}

      <div className="mt-6">

        <div className="h-3 w-full rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-blue-600"
            style={{
              width: `${progressWidth}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}