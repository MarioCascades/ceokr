"use client";

import {
  useState,
} from "react";

import type {
  RuntimePerformanceInitiative,
  RuntimePerformanceKeyResult,
} from "@/lib/runtime/runtimeperformance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import {
  updateRuntimeKeyResultProgressAction,
  updateRuntimePerformanceInstanceKeyResultAction,
  deleteRuntimePerformanceInstanceKeyResultAction,
} from "@/app/runtime/actions";

import {
  calculateRuntimeKeyResultScore,
} from "@/lib/runtime/keyresultscoring";

import KeyResultEditor from "./keyresulteditor";

import Initiatives from "../initiatives/initiatives";


/* ==========================================================
   Props
========================================================== */

interface KeyResultRowProps {
  keyResult: RuntimePerformanceKeyResult;

  progress?: KeyResultProgress;

  organizationId: string;

  performanceInstanceId: string;

  performanceMonth: string;

  previousKeyResultValues: Record<
    string,
    string | number
  >;

  onUpdated?: (
    keyResult: RuntimePerformanceKeyResult
  ) => void;

  onDeleted?: (
    keyResultId: string
  ) => void;
}


/* ==========================================================
   Key Result Row
========================================================== */

export default function KeyResultRow({
  keyResult,

  progress,

  organizationId,

  performanceInstanceId,

  performanceMonth,

  previousKeyResultValues,

  onUpdated,

  onDeleted,
}: KeyResultRowProps) {

  const [
    currentKeyResult,
    setCurrentKeyResult,
  ] = useState(
    keyResult
  );

  const [
    currentValue,
    setCurrentValue,
  ] = useState(
    progress?.currentValue ?? ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    editing,
    setEditing,
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


  /* ========================================================
     Target
  ======================================================== */

  const target =
    typeof currentKeyResult.target ===
        "number" ||
    typeof currentKeyResult.target ===
        "string"
      ? currentKeyResult.target
      : "";


  /* ========================================================
     Previous Value
  ======================================================== */

  const previousValue =
    currentKeyResult.sourceKeyResultId
      ? previousKeyResultValues[
          currentKeyResult.sourceKeyResultId
        ]
      : undefined;


  /* ========================================================
     Current Score
  ======================================================== */

  /*
   * Runtime scoring is centralized in the Runtime scoring
   * utility.
   *
   * Percentage of Target:
   *
   *     current / target * 100
   *
   * % Into Period:
   *
   *     actual progress / expected progress * 100
   *
   * The Performance Instance month is passed into the
   * calculation so the selected month controls the
   * calendar context for % Into Period scoring.
   */

  const hasCurrentValue =
    String(
      currentValue
    ).trim() !== "";

  const calculatedScore =
    hasCurrentValue
      ? calculateRuntimeKeyResultScore(
          currentValue,

          target,

          currentKeyResult.scoringMethod,

          performanceMonth
        )
      : 0;

  const scoreDisplay =
    hasCurrentValue
      ? calculatedScore
      : null;


  /* ========================================================
     Progress Width
  ======================================================== */

  const progressWidth =
    scoreDisplay === null
      ? 0
      : Math.min(
          Math.max(
            scoreDisplay,
            0
          ),
          100
        );


  /* ========================================================
     Runtime Status
  ======================================================== */

  const runtimeStatus =
    !hasCurrentValue
      ? "not_started"
      : "in_progress";


  /* ========================================================
     Save Current Value
  ======================================================== */

  async function handleSave() {

    if (!progress) {

      setError(
        "Runtime Key Result Progress record not found."
      );

      return;
    }


    setSaving(
      true
    );

    setSaved(
      false
    );

    setError(
      null
    );


    try {

      await updateRuntimeKeyResultProgressAction({

        organizationId,

        performanceInstanceId,

        keyResultProgressId:
          progress.id,

        currentValue,

        /*
         * Score is calculated automatically.
         * The user never enters the score manually.
         */
        score:
          calculatedScore,

        employeeComment:
          progress.employeeComment,

        managerComment:
          progress.managerComment,

        status:
          hasCurrentValue
            ? "in_progress"
            : "not_started",
      });


      setSaved(
        true
      );

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

      setSaving(
        false
      );
    }
  }


  /* ========================================================
     Update Key Result
  ======================================================== */

  async function handleUpdate(
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

    setError(
      null
    );


    try {

      const updated =
        await updateRuntimePerformanceInstanceKeyResultAction({

          organizationId,

          performanceInstanceId,

          keyResultId:
            currentKeyResult.id,

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
        });


      const runtimeUpdated:
        RuntimePerformanceKeyResult =
        {

          ...currentKeyResult,

          title:
            updated.title,

          target:
            updated.target,

          weight:
            updated.weight,

          measurementType:
            updated.measurementType,

          scoringMethod:
            updated.scoringMethod,
        };


      setCurrentKeyResult(
        runtimeUpdated
      );

      setEditing(
        false
      );

      setSaved(
        false
      );


      onUpdated?.(
        runtimeUpdated
      );

    } catch (error) {

      console.error(
        "Failed to update Runtime Key Result:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Failed to update Key Result."
      );
    }
  }


  /* ========================================================
     Delete Key Result
  ======================================================== */

  async function handleDelete() {

    const confirmed =
      window.confirm(
        `Delete "${currentKeyResult.title}"?\n\nThis will remove the Key Result from this Performance Instance.`
      );


    if (!confirmed) {
      return;
    }


    setDeleting(
      true
    );

    setError(
      null
    );


    try {

      await deleteRuntimePerformanceInstanceKeyResultAction(

        organizationId,

        performanceInstanceId,

        currentKeyResult.id

      );


      onDeleted?.(
        currentKeyResult.id
      );

    } catch (error) {

      console.error(
        "Failed to delete Runtime Key Result:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete Key Result."
      );


      setDeleting(
        false
      );
    }
  }


  /* ========================================================
     Initiative Updates
  ======================================================== */

  function handleInitiativesUpdated(
    initiatives:
      RuntimePerformanceInitiative[]
  ) {

    const updated:
      RuntimePerformanceKeyResult =
      {

        ...currentKeyResult,

        initiatives,
      };


    setCurrentKeyResult(
      updated
    );


    onUpdated?.(
      updated
    );
  }


  /* ========================================================
     Editor
  ======================================================== */

  if (editing) {

    return (
      <KeyResultEditor

        keyResult={
          currentKeyResult
        }

        onCancel={() =>
          setEditing(
            false
          )
        }

        onSave={
          handleUpdate
        }

      />
    );
  }


  /* ========================================================
     Runtime Row
  ======================================================== */

  return (

    <div className="rounded-lg border bg-gray-50 p-5">

      {/* ====================================================
          Header
      ==================================================== */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <h3 className="text-lg font-semibold">
            {
              currentKeyResult.title
            }
          </h3>


          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">

            {currentKeyResult.measurementType && (

              <span className="rounded border bg-white px-2 py-1">

                {
                  currentKeyResult.measurementType ===
                  "financial"

                    ? "Financial ($)"

                    : currentKeyResult.measurementType ===
                      "percentage"

                      ? "Percentage"

                      : "Numeric"
                }

              </span>
            )}


            {currentKeyResult.scoringMethod && (

              <span className="rounded border bg-white px-2 py-1">

                {
                  currentKeyResult.scoringMethod ===
                  "percent_into_period"

                    ? "% Into Period"

                    : "Percentage of Target"
                }

              </span>
            )}

          </div>

        </div>


        {/* ==================================================
            Actions
        ================================================== */}

        <div className="flex items-center gap-2">

          <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">

            {
              currentKeyResult.weight ??
              0
            }% Weight

          </span>


          <button
            type="button"
            onClick={() =>
              setEditing(
                true
              )
            }
            className="rounded-md border bg-white px-3 py-1 text-xs font-medium"
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
            className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
          >

            {
              deleting
                ? "Deleting..."
                : "Delete"
            }

          </button>

        </div>

      </div>


      {/* ====================================================
          Performance Values
      ==================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">

        {/* ==================================================
            Previous
        ================================================== */}

        <div>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            Previous
          </p>


          <p className="mt-2 text-xl font-semibold">

            {
              previousValue !==
              undefined
                ? previousValue
                : "—"
            }

          </p>


          <p className="mt-1 text-xs text-gray-500">
            Previous month
          </p>

        </div>


        {/* ==================================================
            Target
        ================================================== */}

        <div>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            Target
          </p>


          <p className="mt-2 text-xl font-semibold">
            {
              target ||
              "—"
            }
          </p>

        </div>


        {/* ==================================================
            Current
        ================================================== */}

        <div>

          <label
            htmlFor={`current-${currentKeyResult.id}`}
            className="text-xs uppercase tracking-wide text-gray-500"
          >
            Current
          </label>


          <input
            id={`current-${currentKeyResult.id}`}
            type="text"
            value={
              currentValue
            }
            onChange={(
              event
            ) => {

              setCurrentValue(
                event.target.value
              );

              setSaved(
                false
              );

              setError(
                null
              );
            }}
            className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-xl font-semibold"
            placeholder="Enter current value"
          />

        </div>


        {/* ==================================================
            Score
        ================================================== */}

        <div>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            Score
          </p>


          <p className="mt-2 text-xl font-semibold">

            {
              scoreDisplay === null
                ? "—"
                : `${scoreDisplay}%`
            }

          </p>


          <p className="mt-1 text-xs text-gray-500">

            {
              currentKeyResult.scoringMethod ===
              "percent_into_period"
                ? "% Into Period"
                : "Percentage of Target"
            }

          </p>

        </div>

      </div>


      {/* ====================================================
          Status
      ==================================================== */}

      <div className="mt-4">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          Status
        </p>


        <p className="mt-1 text-sm font-medium">
          {
            runtimeStatus
          }
        </p>

      </div>


      {/* ====================================================
          Save
      ==================================================== */}

      <div className="mt-5 flex items-center gap-3">

        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            saving ||
            !progress
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >

          {
            saving
              ? "Saving..."
              : "Save Current"
          }

        </button>


        {saved && (

          <span className="text-sm text-green-600">
            Saved
          </span>

        )}

      </div>


      {/* ====================================================
          Error
      ==================================================== */}

      {error && (

        <p className="mt-3 text-sm text-red-600">
          {
            error
          }
        </p>

      )}


      {/* ====================================================
          Progress
      ==================================================== */}

      <div className="mt-6">

        <div className="h-3 w-full rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-blue-600"
            style={{
              width:
                `${progressWidth}%`,
            }}
          />

        </div>

      </div>


      {/* ====================================================
          Initiatives
      ==================================================== */}

      <Initiatives

        keyResult={
          currentKeyResult
        }

        organizationId={
          organizationId
        }

        performanceInstanceId={
          performanceInstanceId
        }

        onUpdated={
          handleInitiativesUpdated
        }

      />

    </div>
  );
}