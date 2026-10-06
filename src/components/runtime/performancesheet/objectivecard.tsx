"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type {
  RuntimePerformanceObjective,
} from "@/lib/runtime/runtimeperformance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import KeyResultRow from "../keyresults/keyresultrow";
import ObjectiveEditor from "./objectiveeditor";

interface ObjectiveCardProps {
  objective: RuntimePerformanceObjective;

  keyResultProgress: KeyResultProgress[];

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

  editing?: boolean;

  onUpdated: (
    updatedObjective: RuntimePerformanceObjective
  ) => void;

  onDeleted: (
    objectiveId: string
  ) => void;
}

export default function ObjectiveCard({
  objective,
  keyResultProgress,
  organizationId,
  performanceInstanceId,
  performanceMonth,
  previousKeyResultValues,
  previousKeyResultScores = {},
  editing: globalEditing = false,
  onUpdated,
  onDeleted,
}: ObjectiveCardProps) {

  const [
    editingObjective,
    setEditingObjective,
  ] = useState(false);


  const [
    deleting,
    setDeleting,
  ] = useState(false);


  const objectiveProgress =
    keyResultProgress.filter(
      (progress) =>
        progress.objectiveId ===
        objective.id
    );


  async function handleDelete() {

    if (deleting) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete "${objective.title}"?\n\nThis will remove the Objective from this Performance Instance.`
      );


    if (!confirmed) {
      return;
    }


    setDeleting(true);


    try {

      const response =
        await fetch(
          "/api/runtime/objectives",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organizationId,

              performanceInstanceId,

              objectiveId:
                objective.id,
            }),
          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to delete objective."
        );
      }


      onDeleted(
        objective.id
      );

    } catch (error) {

      console.error(
        "Failed to delete objective:",
        error
      );


      setDeleting(false);
    }
  }


  /*
   * Individual Objective editing.
   *
   * This remains separate from the
   * global Performance Sheet editing
   * mode.
   */

  if (editingObjective) {

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

        onSaved={(
          updatedObjective
        ) => {

          setEditingObjective(
            false
          );


          onUpdated(
            updatedObjective
          );

        }}

        onCancel={() =>
          setEditingObjective(
            false
          )
        }

      />

    );
  }


  return (

    <section className="overflow-hidden rounded-2xl border-2 bg-card shadow-sm">

      {/* ====================================================
          Objective Header
      ==================================================== */}

      <div className="flex flex-col gap-4 border-b-2 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Objective
          </p>


          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {objective.title}
          </h3>


          {objective.description && (

            <p className="mt-1 max-w-4xl text-sm leading-5 text-muted-foreground">
              {objective.description}
            </p>

          )}

        </div>


        {/* ==================================================
            Objective Actions
        ================================================== */}

        {!globalEditing && (

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setEditingObjective(true)
              }
              className="inline-flex items-center gap-2 rounded-md border-2 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
            >

              <Pencil className="h-4 w-4" />

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
              className="inline-flex items-center gap-2 rounded-md border-2 border-destructive/30 bg-white px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Trash2 className="h-4 w-4" />

              {deleting
                ? "Deleting..."
                : "Delete"}

            </button>

          </div>

        )}

      </div>


      {/* ====================================================
          Key Result Column Headers
      ==================================================== */}

      <div className="hidden border-b-2 bg-gray-200 px-4 py-3 lg:grid lg:grid-cols-[minmax(220px,2fr)_120px_120px_120px_110px_minmax(260px,1.5fr)] lg:items-center lg:gap-3">

        <div className="text-xs font-bold uppercase tracking-wide text-gray-700">
          Key Result
        </div>


        <div className="text-center text-xs font-bold uppercase tracking-wide text-gray-700">
          Last Month
        </div>


        <div className="text-center text-xs font-bold uppercase tracking-wide text-gray-700">
          Target
        </div>


        <div className="text-center text-xs font-bold uppercase tracking-wide text-gray-700">
          This Month
        </div>


        <div className="text-center text-xs font-bold uppercase tracking-wide text-gray-700">
          Score
        </div>


        <div className="text-xs font-bold uppercase tracking-wide text-gray-700">
          Initiatives
        </div>

      </div>


      {/* ====================================================
          Key Results
      ==================================================== */}

      <div className="bg-gray-100 p-3">

        {objective.keyResults.length === 0 ? (

          <div className="rounded-lg border-2 border-dashed bg-white px-6 py-8">

            <p className="text-sm text-muted-foreground">
              No Key Results have been
              added to this Objective yet.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {objective.keyResults.map(
              (keyResult) => {

                const progress =
                  objectiveProgress.find(
                    (item) =>
                      item.keyResultId ===
                      keyResult.id
                  );


                return (

                  <div
                    key={
                      keyResult.id
                    }
                    className="rounded-lg border-2 border-gray-300 bg-white"
                  >

                    <KeyResultRow

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


                      performanceMonth={
                        performanceMonth
                      }


                      previousKeyResultValues={
                        previousKeyResultValues
                      }


                      previousKeyResultScores={
                        previousKeyResultScores
                      }


                      /*
                       * Pass the Performance Sheet's
                       * global Edit mode into every
                       * Key Result.
                       */
                      editing={
                        globalEditing
                      }

                    />

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </section>
  );
}