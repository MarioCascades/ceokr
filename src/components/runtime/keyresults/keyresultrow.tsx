"use client";

import {
  useEffect,
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
  updateRuntimePerformanceInstanceKeyResultAction,
  deleteRuntimePerformanceInstanceKeyResultAction,
} from "@/app/runtime/actions";

import {
  calculateRuntimeKeyResultScore,
} from "@/lib/runtime/keyresultscoring";

import type {
  RuntimePerformanceKeyResultDraft,
} from "../performancesheet/performancesheet";

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

  previousKeyResultScores?: Record<
    string,
    number
  >;

  /**
   * Global edit mode controlled by
   * the parent Performance Sheet.
   */
  editing?: boolean;

  /**
   * Reports the current Key Result draft
   * to the parent Performance Sheet.
   *
   * The parent owns persistence.
   */
  onDraftChange?: (
    draft: RuntimePerformanceKeyResultDraft
  ) => void;

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

  previousKeyResultScores = {},

  editing: globalEditing = false,

  onDraftChange,

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
    targetValue,
    setTargetValue,
  ] = useState(
    typeof keyResult.target === "number" ||
    typeof keyResult.target === "string"
      ? keyResult.target
      : ""
  );


  const [
    persistedScore,
    setPersistedScore,
  ] = useState<number>(
    progress?.score ?? 0
  );


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
     Hydrate From Persisted Monthly Progress
  ======================================================== */

  useEffect(() => {

    setCurrentValue(
      progress?.currentValue ?? ""
    );

    setPersistedScore(
      progress?.score ?? 0
    );

  }, [
    progress?.id,
    progress?.currentValue,
    progress?.score,
  ]);


  /* ========================================================
     Keep Key Result Configuration In Sync
  ======================================================== */

  useEffect(() => {

    setCurrentKeyResult(
      keyResult
    );

    setTargetValue(
      typeof keyResult.target === "number" ||
      typeof keyResult.target === "string"
        ? keyResult.target
        : ""
    );

  }, [
    keyResult,
  ]);


  /* ========================================================
     Target
  ======================================================== */

  const target =
    targetValue;


  /* ========================================================
     Previous Value
  ======================================================== */

  const previousValue =
    currentKeyResult.sourceKeyResultId
      ? previousKeyResultValues[
          currentKeyResult.sourceKeyResultId
        ]
      : undefined;


  const previousScore =
    currentKeyResult.sourceKeyResultId
      ? previousKeyResultScores[
          currentKeyResult.sourceKeyResultId
        ]
      : undefined;


  /* ========================================================
     Current Score
  ======================================================== */

  const hasCurrentValue =
    String(
      currentValue
    ).trim() !== "";


  /*
   * The persisted monthly score is the source of truth
   * when the row is loaded from Supabase.
   *
   * When the user changes Target or Current Value,
   * the score is recalculated for the current month.
   */
  const calculatedScore =
    hasCurrentValue
      ? calculateRuntimeKeyResultScore(
          currentValue,

          target,

          currentKeyResult.scoringMethod,

          performanceMonth
        )
      : 0;


  const score =
    hasCurrentValue
      ? calculatedScore
      : persistedScore;


  const scoreDisplay =
    hasCurrentValue
      ? Math.round(
          score
        )
      : null;


  /* ========================================================
     Runtime Status
  ======================================================== */

  const runtimeStatus =
    progress?.status ??
    "Not Started";


  /*
   * Keep runtimeStatus available for
   * the Runtime row state even though
   * the visual presentation does not
   * currently display it directly.
   */
  void runtimeStatus;


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
     Draft Registration
  ======================================================== */

  useEffect(() => {

    if (!progress) {
      return;
    }


    onDraftChange?.({

      keyResultId:
        currentKeyResult.id,

      progressId:
        progress.id,

      target:
        targetValue,

      currentValue:
        currentValue,

      /*
       * Use the persisted score when
       * the row has no current value.
       *
       * Otherwise use the recalculated
       * score for the current month.
       */
      score:
        hasCurrentValue
          ? calculatedScore
          : persistedScore,

      employeeComment:
        progress.employeeComment,

      managerComment:
        progress.managerComment,

    });

  }, [
    currentKeyResult.id,
    progress,
    targetValue,
    currentValue,
    calculatedScore,
    persistedScore,
    hasCurrentValue,
    onDraftChange,
  ]);


  /* ========================================================
     Draft Change Helper
  ======================================================== */

  function notifyDraftChange(
    nextTarget: string | number = targetValue,
    nextCurrentValue: string | number = currentValue
  ) {

    if (!progress) {
      return;
    }


    const nextHasCurrentValue =
      String(
        nextCurrentValue
      ).trim() !== "";


    const nextScore =
      nextHasCurrentValue
        ? calculateRuntimeKeyResultScore(
            nextCurrentValue,

            nextTarget,

            currentKeyResult.scoringMethod,

            performanceMonth
          )
        : persistedScore;


    onDraftChange?.({

      keyResultId:
        currentKeyResult.id,

      progressId:
        progress.id,

      target:
        nextTarget,

      currentValue:
        nextCurrentValue,

      score:
        nextScore,

      employeeComment:
        progress.employeeComment,

      managerComment:
        progress.managerComment,

    });

  }


  /* ========================================================
     Target Change
  ======================================================== */

  function handleTargetValueChange(
    value: string
  ) {

    setTargetValue(
      value
    );

    setError(
      null
    );

    notifyDraftChange(
      value,
      currentValue
    );

  }


  /* ========================================================
     Current Value Change
  ======================================================== */

  function handleCurrentValueChange(
    value: string
  ) {

    setCurrentValue(
      value
    );

    setError(
      null
    );

    notifyDraftChange(
      targetValue,
      value
    );

  }


  /* ========================================================
     Key Result Editor
  ======================================================== */

  async function handleUpdate(
    values: {
      title: string;

      /*
       * KeyResultEditor defines this as
       * unknown, so handleUpdate must
       * accept unknown as well.
       */
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

      /*
       * Normalize the editor's unknown
       * target into the values supported
       * by the Runtime action.
       */

      const normalizedTarget =
        typeof values.target === "string" ||
        typeof values.target === "number"
          ? values.target
          : null;


      const updated =
        await updateRuntimePerformanceInstanceKeyResultAction({

          organizationId,

          performanceInstanceId,

          keyResultId:
            currentKeyResult.id,

          title:
            values.title,

          target:
            normalizedTarget,

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


      const nextTarget =
        typeof updated.target ===
          "string" ||
        typeof updated.target ===
          "number"
          ? updated.target
          : "";


      setTargetValue(
        nextTarget
      );


      setEditing(
        false
      );


      onUpdated?.(
        runtimeUpdated
      );


      /*
       * Keep the parent draft synchronized
       * after the Key Result configuration
       * editor changes the target.
       */
      notifyDraftChange(
        nextTarget,
        currentValue
      );


    } catch (caughtError) {

      console.error(
        "Failed to update Runtime Key Result:",
        caughtError
      );


      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update Key Result."
      );

    }

  }


  /* ========================================================
     Delete Key Result
  ======================================================== */

  async function handleDelete() {

    if (deleting) {
      return;
    }


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


    } catch (caughtError) {

      console.error(
        "Failed to delete Runtime Key Result:",
        caughtError
      );


      setError(
        caughtError instanceof Error
          ? caughtError.message
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
     Individual Key Result Editor
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

    <div className="w-full">

      {/* ==================================================
          Mobile / Small Screen
      ================================================== */}

      <div className="block p-4 lg:hidden">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="text-base font-semibold">
              {currentKeyResult.title}
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


          {!globalEditing && (

            <div className="flex shrink-0 gap-2">

              <button
                type="button"
                onClick={() =>
                  setEditing(
                    true
                  )
                }
                className="rounded-md border-2 bg-white px-3 py-1 text-xs font-medium"
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
                className="rounded-md border-2 border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
              >

                {deleting
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </div>

          )}

        </div>


        <div className="mt-5 grid grid-cols-2 gap-3">

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Last Month
            </p>


            <p className="mt-1 text-lg font-semibold">

              {
                previousValue !==
                undefined
                  ? previousValue
                  : "—"
              }

            </p>

          </div>


          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Previous Score
            </p>


            <p className="mt-1 text-lg font-semibold">

              {
                previousScore !==
                undefined
                  ? `${Math.round(previousScore)}%`
                  : "—"
              }

            </p>

          </div>


          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Target
            </p>


            <input
              type="text"
              value={
                targetValue
              }
              disabled={
                !globalEditing
              }
              onChange={(event) =>
                handleTargetValueChange(
                  event.target.value
                )
              }
              className={`mt-1 w-full rounded-md border-2 px-3 py-2 text-lg font-semibold ${
                globalEditing
                  ? "bg-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            />

          </div>


          <div>

            <label
              htmlFor={`current-${currentKeyResult.id}`}
              className="text-xs uppercase tracking-wide text-gray-500"
            >
              This Month
            </label>


            <input
              id={`current-${currentKeyResult.id}`}
              type="text"
              value={
                currentValue
              }
              disabled={
                !globalEditing
              }
              onChange={(event) =>
                handleCurrentValueChange(
                  event.target.value
                )
              }
              className={`mt-1 w-full rounded-md border-2 px-3 py-2 text-lg font-semibold ${
                globalEditing
                  ? "bg-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            />

          </div>


          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Score
            </p>


            <p className="mt-1 text-xl font-bold">

              {
                scoreDisplay ===
                null

                  ? "—"

                  : `${scoreDisplay}%`
              }

            </p>

          </div>

        </div>


        {error && (

          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>

        )}


        <div className="mt-5">

          <div className="h-2 w-full rounded-full bg-gray-200">

            <div
              className="h-2 rounded-full bg-blue-600"
              style={{
                width:
                  `${progressWidth}%`,
              }}
            />

          </div>

        </div>


        <div className="mt-5">

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

      </div>


      {/* ==================================================
          Desktop Landscape Row
      ================================================== */}

      <div className="hidden lg:grid lg:grid-cols-[minmax(220px,2fr)_120px_120px_120px_110px_minmax(260px,1.5fr)] lg:items-stretch lg:gap-3 lg:p-3">

        {/* ==================================================
            Key Result
        ================================================== */}

        <div className="flex min-w-0 flex-col justify-center px-2">

          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              <h3 className="text-sm font-semibold leading-5">
                {currentKeyResult.title}
              </h3>


              <div className="mt-1 flex flex-wrap gap-1">

                {currentKeyResult.measurementType && (

                  <span className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600">

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

                  <span className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600">

                    {
                      currentKeyResult.scoringMethod ===
                      "percent_into_period"

                        ? "% Into Period"

                        : "% of Target"
                    }

                  </span>

                )}

              </div>

            </div>


            <span className="shrink-0 rounded bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">

              {currentKeyResult.weight ?? 0}%

            </span>

          </div>


          <div className="mt-3">

            <div className="h-1.5 w-full rounded-full bg-gray-200">

              <div
                className="h-1.5 rounded-full bg-blue-600"
                style={{
                  width:
                    `${progressWidth}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* ==================================================
            Last Month
        ================================================== */}

        <div className="flex flex-col justify-center border-l-2 pl-3">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Last Month
          </p>


          <p className="mt-1 text-lg font-semibold">

            {
              previousValue !==
              undefined
                ? previousValue
                : "—"
            }

          </p>


          {previousScore !==
            undefined && (

            <p className="mt-1 text-xs text-gray-500">

              Score:{" "}

              {Math.round(
                previousScore
              )}

              %

            </p>

          )}

        </div>


        {/* ==================================================
            Target
        ================================================== */}

        <div className="flex flex-col justify-center border-l-2 pl-3">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Target
          </p>


          <input
            id={`target-${currentKeyResult.id}`}
            type="text"
            value={
              targetValue
            }
            disabled={
              !globalEditing
            }
            onChange={(event) =>
              handleTargetValueChange(
                event.target.value
              )
            }
            className={`mt-1 w-full rounded-md border-2 px-2 py-2 text-base font-semibold ${
              globalEditing
                ? "bg-white"
                : "bg-gray-100 text-gray-700"
            }`}
            placeholder="Target"
          />

        </div>


        {/* ==================================================
            This Month
        ================================================== */}

        <div className="flex flex-col justify-center border-l-2 pl-3">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            This Month
          </p>


          <input
            id={`current-${currentKeyResult.id}`}
            type="text"
            value={
              currentValue
            }
            disabled={
              !globalEditing
            }
            onChange={(event) =>
              handleCurrentValueChange(
                event.target.value
              )
            }
            className={`mt-1 w-full rounded-md border-2 px-2 py-2 text-base font-semibold ${
              globalEditing
                ? "bg-white"
                : "bg-gray-100 text-gray-700"
            }`}
            placeholder="Current"
          />

        </div>


        {/* ==================================================
            Score
        ================================================== */}

        <div className="flex flex-col justify-center border-l-2 pl-3">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Score
          </p>


          <p className="mt-1 text-xl font-bold">

            {
              scoreDisplay ===
              null

                ? "—"

                : `${scoreDisplay}%`
            }

          </p>


          <p className="mt-1 text-[10px] text-gray-500">

            {
              currentKeyResult.scoringMethod ===
              "percent_into_period"

                ? "% Into Period"

                : "% of Target"
            }

          </p>

        </div>


        {/* ==================================================
            Initiatives
        ================================================== */}

        <div className="flex min-w-0 flex-col border-l-2 pl-3">

          <div className="mb-2 flex items-center justify-between">

            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Initiatives
            </p>

          </div>


          <div className="min-w-0 flex-1 rounded-md border-2 border-gray-200 bg-gray-50 p-2">

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

        </div>

      </div>


      {/* ==================================================
          Error State
      ================================================== */}

      {error && (

        <p className="border-t-2 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>

      )}

    </div>

  );
}