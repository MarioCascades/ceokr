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


/* ==========================================================
   Props
========================================================== */

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

  onUpdated: (
    updatedObjective: RuntimePerformanceObjective
  ) => void;

  onDeleted: (
    objectiveId: string
  ) => void;
}


/* ==========================================================
   Objective Card
========================================================== */

export default function ObjectiveCard({
  objective,

  keyResultProgress,

  organizationId,

  performanceInstanceId,

  performanceMonth,

  previousKeyResultValues,

  onUpdated,

  onDeleted,
}: ObjectiveCardProps) {

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  /* ========================================================
     Objective Progress
  ======================================================== */

  const objectiveProgress =
    keyResultProgress.filter(
      (progress) =>
        progress.objectiveId ===
        objective.id
    );


  /* ========================================================
     Delete Objective
  ======================================================== */

  async function handleDelete() {

    if (deleting) {
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


  /* ========================================================
     Objective Editor
  ======================================================== */

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

        onSaved={(
          updatedObjective
        ) => {

          setEditing(false);

          onUpdated(
            updatedObjective
          );
        }}

        onCancel={() =>
          setEditing(false)
        }

      />
    );
  }


  /* ========================================================
     Render
  ======================================================== */

  return (

    <section className="rounded-2xl border bg-card shadow-sm">

      {/* ====================================================
          Objective Header
      ==================================================== */}

      <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-start md:justify-between">

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Objective
          </p>

          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {objective.title}
          </h3>

          {objective.description && (

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">

              {
                objective.description
              }

            </p>
          )}

        </div>


        {/* ==================================================
            Objective Actions
        ================================================== */}

        <div className="flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
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
            className="inline-flex items-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Trash2 className="h-4 w-4" />

            {
              deleting
                ? "Deleting..."
                : "Delete"
            }

          </button>

        </div>

      </div>


      {/* ====================================================
          Key Results
      ==================================================== */}

      <div className="divide-y">

        {objective.keyResults.length === 0 ? (

          <div className="px-6 py-8">

            <p className="text-sm text-muted-foreground">
              No Key Results have been
              added to this objective yet.
            </p>

          </div>

        ) : (

          objective.keyResults.map(
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
                  className="px-6 py-5"
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

                  />

                </div>
              );
            }
          )
        )}

      </div>

    </section>
  );
}