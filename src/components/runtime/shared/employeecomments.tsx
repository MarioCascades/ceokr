"use client";

import { useState } from "react";

import {
  updateRuntimeEmployeeCommentsAction,
} from "@/app/runtime/actions";

interface EmployeeCommentsProps {
  organizationId: string;

  performanceInstanceId: string;

  initialComments?: string;

  label: string;

  placeholder: string;

  helpText: string;
}

export default function EmployeeComments({
  organizationId,
  performanceInstanceId,
  initialComments,
  label,
  placeholder,
  helpText,
}: EmployeeCommentsProps) {
  const [comments, setComments] =
    useState(
      initialComments ?? ""
    );

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await updateRuntimeEmployeeCommentsAction({
        organizationId,

        performanceInstanceId,

        employeeComments:
          comments,
      });

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save employee comments:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save employee comments."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        {label}
      </h2>

      <textarea
        value={comments}
        onChange={(event) => {
          setComments(
            event.target.value
          );

          setSaved(false);
          setError(null);
        }}
        placeholder={placeholder}
        className="mt-4 min-h-[140px] w-full rounded-md border p-4"
      />

      <p className="mt-2 text-sm text-muted-foreground">
        {helpText}
      </p>

      <div className="mt-4 flex items-center gap-3">

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Comments"}
        </button>

        {saved && (
          <span className="text-sm text-green-600">
            Saved
          </span>
        )}

      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

    </section>
  );
}