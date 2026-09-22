"use client";

import {
  useState,
} from "react";

import type {
  RuntimePerformanceInitiative,
  RuntimePerformanceKeyResult,
} from "@/lib/runtime/runtimeperformance";

import {
  createRuntimePerformanceInstanceInitiativeAction,
} from "@/app/runtime/actions";

import InitiativeEditor from "./initiativeeditor";

import InitiativeItem from "./initiativeitem";

interface InitiativesProps {
  keyResult: RuntimePerformanceKeyResult;

  organizationId: string;

  performanceInstanceId: string;

  onUpdated?: (
    initiatives: RuntimePerformanceInitiative[]
  ) => void;
}

const MAX_INITIATIVES = 3;

export default function Initiatives({
  keyResult,
  organizationId,
  performanceInstanceId,
  onUpdated,
}: InitiativesProps) {
  const [
    initiatives,
    setInitiatives,
  ] = useState<
    RuntimePerformanceInitiative[]
  >(
    keyResult.initiatives ?? []
  );

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    adding,
    setAdding,
  ] = useState(false);

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

  function updateInitiatives(
    next: RuntimePerformanceInitiative[]
  ) {
    setInitiatives(
      next
    );

    onUpdated?.(
      next
    );
  }

  async function handleAdd(
    text: string
  ) {
    if (
      initiatives.length >=
      MAX_INITIATIVES
    ) {
      throw new Error(
        "A Key Result can have a maximum of 3 Initiatives."
      );
    }

    setSaving(true);
    setError(null);

    try {
      const created =
        await createRuntimePerformanceInstanceInitiativeAction({
          organizationId,

          performanceInstanceId,

          performanceInstanceKeyResultId:
            keyResult.id,

          text,
        });

      const runtimeCreated: RuntimePerformanceInitiative = {
        id:
          created.id,

        sourceInitiativeId:
          created.sourceInitiativeId,

        text:
          created.text,

        position:
          created.position,
      };

      updateInitiatives([
        ...initiatives,
        runtimeCreated,
      ]);

      setAdding(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create Initiative."
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  function handleUpdated(
    updated: RuntimePerformanceInitiative
  ) {
    updateInitiatives(
      initiatives.map(
        (initiative) =>
          initiative.id ===
          updated.id
            ? updated
            : initiative
      )
    );
  }

  function handleDeleted(
    initiativeId: string
  ) {
    updateInitiatives(
      initiatives.filter(
        (initiative) =>
          initiative.id !==
          initiativeId
      )
    );
  }

  return (
    <div className="mt-5 border-t pt-4">

      {/* ======================================================
          Initiative Toggle
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            !expanded
          )
        }
        className="text-sm font-medium"
      >
        {expanded
          ? "− Hide Initiatives"
          : "+ Initiatives"}{" "}
        ({initiatives.length}/
        {MAX_INITIATIVES})
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">

          {/* ==================================================
              Existing Initiatives
          ================================================== */}

          {initiatives.map(
            (initiative) => (
              <InitiativeItem
                key={
                  initiative.id
                }
                initiative={
                  initiative
                }
                organizationId={
                  organizationId
                }
                performanceInstanceId={
                  performanceInstanceId
                }
                performanceInstanceKeyResultId={
                  keyResult.id
                }
                onUpdated={
                  handleUpdated
                }
                onDeleted={
                  handleDeleted
                }
              />
            )
          )}

          {/* ==================================================
              Add Initiative
          ================================================== */}

          {!adding &&
            initiatives.length <
              MAX_INITIATIVES && (
              <button
                type="button"
                onClick={() =>
                  setAdding(
                    true
                  )
                }
                className="w-full rounded-md border border-dashed px-3 py-2 text-xs font-medium"
              >
                + Add Initiative
              </button>
            )}

          {initiatives.length >=
            MAX_INITIATIVES && (
            <p className="text-xs text-gray-500">
              Maximum of 3
              initiatives reached.
            </p>
          )}

          {/* ==================================================
              New Initiative Editor
          ================================================== */}

          {adding && (
            <InitiativeEditor
              onCancel={() =>
                setAdding(
                  false
                )
              }
              onSave={
                handleAdd
              }
              saving={
                saving
              }
            />
          )}

          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}

        </div>
      )}

    </div>
  );
}