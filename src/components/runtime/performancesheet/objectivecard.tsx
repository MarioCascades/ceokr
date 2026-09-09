"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createRuntimePerformanceInstanceKeyResultAction,
  deleteRuntimePerformanceInstanceObjectiveAction,
} from "@/app/runtime/actions";

import type {
  RuntimePerformanceObjective,
  RuntimePerformanceKeyResult,
} from "@/lib/runtime/runtimeperformance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import KeyResultRow from "../keyresults/keyresultrow";

import KeyResultEditor from "../keyresults/keyresulteditor";

import ObjectiveEditor from "./objectiveeditor";

interface ObjectiveCardProps {
  objective: RuntimePerformanceObjective;

  keyResultProgress: KeyResultProgress[];

  organizationId: string;

  performanceInstanceId: string;

  onUpdated: (
    objective: RuntimePerformanceObjective
  ) => void;

  onDeleted: (
    objectiveId: string
  ) => void;
}

export default function ObjectiveCard({
  objective: initialObjective,

  keyResultProgress:
    initialKeyResultProgress,

  organizationId,

  performanceInstanceId,

  onUpdated,

  onDeleted,
}: ObjectiveCardProps) {
  const [
    objective,
    setObjective,
  ] = useState(
    initialObjective
  );

  const [
    localKeyResultProgress,
    setLocalKeyResultProgress,
  ] = useState(
    initialKeyResultProgress
  );

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    addingKeyResult,
    setAddingKeyResult,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(
    null
  );

  /*
   * Keep local Runtime progress synchronized
   * when the parent Runtime execution reloads
   * or provides updated progress.
   */
  useEffect(() => {
    setLocalKeyResultProgress(
      initialKeyResultProgress
    );
  }, [
    initialKeyResultProgress,
  ]);

  /* ==========================================================
     Objective Delete
  ========================================================== */

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Delete this Objective and all of its Key Results and Initiatives?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    setDeleteError(null);

    try {
      await deleteRuntimePerformanceInstanceObjectiveAction(
  organizationId,

  performanceInstanceId,

  objective.id
);

      onDeleted(
        objective.id
      );
    } catch (caughtError) {
      setDeleteError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete objective."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ==========================================================
     Objective Update
  ========================================================== */

  function handleUpdated(
    updatedObjective:
      RuntimePerformanceObjective
  ) {
    setObjective(
      updatedObjective
    );

    onUpdated(
      updatedObjective
    );

    setEditing(false);
  }

  /* ==========================================================
     Key Result Create
  ========================================================== */

  async function handleCreateKeyResult(
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
  ) {
    const result =
      await createRuntimePerformanceInstanceKeyResultAction(
        {
          organizationId,

          performanceInstanceId,

          performanceInstanceObjectiveId:
            objective.id,

          title:
            values.title,

          target:
            values.target,

          measurementType:
            values.measurementType,

          scoringMethod:
            values.scoringMethod,

          weight:
            values.weight,
        }
      );

    const newKeyResult:
      RuntimePerformanceKeyResult = {
      id:
        result.keyResult.id,

      sourceKeyResultId:
        result.keyResult.sourceKeyResultId,

      title:
        result.keyResult.title,

      target:
        result.keyResult.target,

      weight:
        result.keyResult.weight,

      measurementType:
        result.keyResult.measurementType,

      scoringMethod:
        result.keyResult.scoringMethod,

      position:
        result.keyResult.position,

      initiatives:
        [],
    };

    const updatedObjective:
      RuntimePerformanceObjective = {
      ...objective,

      keyResults: [
        ...objective.keyResults,

        newKeyResult,
      ],
    };

    setObjective(
      updatedObjective
    );

    setLocalKeyResultProgress(
      (current) => [
        ...current,

        result.progress,
      ]
    );

    /*
     * Keep the parent PerformanceSheet state
     * synchronized with the newly created KR.
     */
    onUpdated(
      updatedObjective
    );

    setAddingKeyResult(
      false
    );
  }

  /* ==========================================================
     Key Result Update
  ========================================================== */

  function handleKeyResultUpdated(
    updatedKeyResult:
      RuntimePerformanceKeyResult
  ) {
    const updatedObjective:
      RuntimePerformanceObjective = {
      ...objective,

      keyResults:
        objective.keyResults.map(
          (keyResult) =>
            keyResult.id ===
            updatedKeyResult.id
              ? updatedKeyResult
              : keyResult
        ),
    };

    setObjective(
      updatedObjective
    );

    onUpdated(
      updatedObjective
    );
  }

  /* ==========================================================
     Key Result Delete
  ========================================================== */

  function handleKeyResultDeleted(
    keyResultId: string
  ) {
    const updatedObjective:
      RuntimePerformanceObjective = {
      ...objective,

      keyResults:
        objective.keyResults.filter(
          (keyResult) =>
            keyResult.id !==
            keyResultId
        ),
    };

    setObjective(
      updatedObjective
    );

    setLocalKeyResultProgress(
      (current) =>
        current.filter(
          (progress) =>
            progress.performanceInstanceKeyResultId !==
            keyResultId
        )
    );

    onUpdated(
      updatedObjective
    );
  }

  /* ==========================================================
     Objective Edit
  ========================================================== */

  if (editing) {
    return (
      <ObjectiveEditor
        organizationId={
          organizationId
        }
        performanceInstanceId={
          performanceInstanceId
        }
        objective={
          objective
        }
        onSaved={
          handleUpdated
        }
        onCancel={() =>
          setEditing(false)
        }
      />
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

      {/* ======================================================
          Objective Header
      ====================================================== */}

      <div className="mb-6 flex items-start justify-between gap-6">

        <div className="min-w-0 flex-1">

          <h2 className="text-2xl font-semibold">
            {
              objective.title
            }
          </h2>

          {objective.description && (
            <p className="mt-1 text-muted-foreground">
              {
                objective.description
              }
            </p>
          )}

        </div>

        <div className="flex shrink-0 gap-2">

          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            disabled={
              deleting ||
              addingKeyResult
            }
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={
              handleDelete
            }
            disabled={
              deleting ||
              addingKeyResult
            }
            className="rounded-md border px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

      {/* ======================================================
          Objective Delete Error
      ====================================================== */}

      {deleteError && (
        <p className="mb-4 text-sm text-red-600">
          {
            deleteError
          }
        </p>
      )}

      {/* ======================================================
          Objective Weight
      ====================================================== */}

      {objective.weight !==
        undefined && (
        <div className="mb-6 rounded-md border px-4 py-2">

          <p className="text-sm text-muted-foreground">
            Weight
          </p>

          <p className="text-lg font-semibold">
            {
              objective.weight
            }%
          </p>

        </div>
      )}

      {/* ======================================================
          Key Results
      ====================================================== */}

      <div className="space-y-4">

        {objective.keyResults.map(
          (keyResult) => {

            const progress =
              localKeyResultProgress.find(
                (item) =>
                  item.performanceInstanceKeyResultId ===
                  keyResult.id
              );

            return (
              <KeyResultRow
                key={
                  keyResult.id
                }
                keyResult={
                  keyResult
                }
                progress={
                  progress
                }
                organizationId={
                  organizationId
                }
                performanceInstanceId={
                  performanceInstanceId
                }
                onUpdated={
                  handleKeyResultUpdated
                }
                onDeleted={
                  handleKeyResultDeleted
                }
              />
            );
          }
        )}

      </div>

      {/* ======================================================
          Add Key Result
      ====================================================== */}

      {addingKeyResult ? (
        <div className="mt-5">

          <KeyResultEditor
            onCancel={() =>
              setAddingKeyResult(
                false
              )
            }
            onSave={
              handleCreateKeyResult
            }
          />

        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setAddingKeyResult(
              true
            )
          }
          disabled={
            deleting
          }
          className="mt-5 w-full rounded-md border border-dashed px-4 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          + Add Key Result
        </button>
      )}

    </section>
  );
}