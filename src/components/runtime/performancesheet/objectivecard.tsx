"use client";


import type {
  RuntimePerformanceObjective,
} from "@/lib/runtime/runtimeperformance";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  RuntimePerformanceKeyResultDraft,
} from "./performancesheet";

import KeyResultRow from "../keyresults/keyresultrow";

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

  previousKeyResultScores?: Record<
    string,
    number
  >;

  editing?: boolean;

  /*
   * Runtime Performance Sheet owns the
   * Performance draft.
   *
   * Key Result changes flow upward through
   * this callback instead of saving directly
   * from the Key Result component.
   */
  onKeyResultDraftChange: (
    draft: RuntimePerformanceKeyResultDraft
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

  previousKeyResultScores = {},

  editing: globalEditing = false,


  onKeyResultDraftChange,

}: ObjectiveCardProps) {


  /* ========================================================
     Objective Progress
  ======================================================== */

  /*
   * Runtime progress is owned by the
   * Performance Instance Key Result snapshot.
   *
   * Do NOT filter by progress.objectiveId here.
   *
   * The Runtime Objective ID and the legacy
   * source Objective ID are not guaranteed to
   * be the same identifier.
   *
   * Each Key Result below resolves its own
   * progress record through:
   *
   * progress.performanceInstanceKeyResultId
   *
   * matching:
   *
   * keyResult.id
   */

  const objectiveProgress =
    keyResultProgress;

  /* ========================================================
     Render
  ======================================================== */

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

                /*
                 * IMPORTANT:
                 *
                 * Runtime progress belongs to the
                 * Performance Instance Key Result
                 * snapshot, not the legacy source
                 * Key Result relationship.
                 *
                 * This relationship is what allows
                 * saved Current Value, Score, Target,
                 * and comments to hydrate correctly
                 * after a page refresh.
                 */

                const progress =
                  objectiveProgress.find(
                    (item) =>
                      item.performanceInstanceKeyResultId ===
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

                      /*
                       * Key Result no longer saves itself.
                       *
                       * It reports its current draft to
                       * the Performance Sheet parent.
                       */

                      onDraftChange={
                        onKeyResultDraftChange
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