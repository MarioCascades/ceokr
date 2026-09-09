"use client";

import {
  useState,
} from "react";

import type {
  RuntimePerformanceInitiative,
} from "@/lib/runtime/runtimeperformance";

import {
  updateRuntimePerformanceInstanceInitiativeAction,
  deleteRuntimePerformanceInstanceInitiativeAction,
} from "@/app/runtime/actions";

import InitiativeEditor from "./initiativeeditor";

interface InitiativeItemProps {
  initiative: RuntimePerformanceInitiative;

  organizationId: string;

  performanceInstanceId: string;

  performanceInstanceKeyResultId: string;

  onUpdated?: (
    initiative: RuntimePerformanceInitiative
  ) => void;

  onDeleted?: (
    initiativeId: string
  ) => void;
}

export default function InitiativeItem({
  initiative,
  organizationId,
  performanceInstanceId,
  performanceInstanceKeyResultId,
  onUpdated,
  onDeleted,
}: InitiativeItemProps) {
  const [
    currentInitiative,
    setCurrentInitiative,
  ] = useState(
    initiative
  );

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function handleSave(
    text: string
  ) {
    setSaving(true);
    setError(null);

    try {
      const updated =
        await updateRuntimePerformanceInstanceInitiativeAction({
          organizationId,

          performanceInstanceId,

          performanceInstanceKeyResultId,

          initiativeId:
            currentInitiative.id,

          text,
        });

      const runtimeUpdated: RuntimePerformanceInitiative = {
        ...currentInitiative,

        text:
          updated.text,

        position:
          updated.position,
      };

      setCurrentInitiative(
        runtimeUpdated
      );

      setEditing(false);

      onUpdated?.(
        runtimeUpdated
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update Initiative."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Delete this Initiative?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteRuntimePerformanceInstanceInitiativeAction(
        organizationId,

        performanceInstanceId,

        performanceInstanceKeyResultId,

        currentInitiative.id
      );

      onDeleted?.(
        currentInitiative.id
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete Initiative."
      );

      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <InitiativeEditor
        initialText={
          currentInitiative.text
        }
        onCancel={() =>
          setEditing(false)
        }
        onSave={
          handleSave
        }
        saving={
          saving
        }
      />
    );
  }

  return (
    <div className="rounded-md border bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm">
            {currentInitiative.text}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            className="rounded-md border px-2 py-1 text-xs font-medium"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={
              handleDelete
            }
            disabled={
              deleting
            }
            className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}