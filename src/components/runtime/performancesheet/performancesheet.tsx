"use client";

import {
  useState,
} from "react";

import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  RuntimeSubject,
} from "@/lib/runtime/runtimeexecution";

import type {
  RuntimePerformanceObjective,
} from "@/lib/runtime/runtimeperformance";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

import type {
  DashboardData,
} from "@/services/dashboard.service";

import {
  transitionPerformanceInstanceAction,
} from "@/app/runtime/actions";

import ObjectiveCard from "./objectivecard";

import ObjectiveEditor from "./objectiveeditor";

import RuntimeHeader from "../shared/runtimeheader";

import RuntimeSummary from "../shared/runtimesummary";

import RuntimeNavigation from "../shared/runtimenavigation";

import RuntimeOverview from "../shared/runtimeoverview";

import EmployeeComments from "../shared/employeecomments";


/* ==========================================================
   Props
========================================================== */

interface PerformanceSheetProps {
  document: BuilderDocument;

  objectives: RuntimePerformanceObjective[];

  keyResultProgress: KeyResultProgress[];

  previousKeyResultValues: Record<
    string,
    string | number
  >;

  organizationId: string;

  performanceInstanceId: string;

  performanceInstance: PerformanceInstance;

  subject: RuntimeSubject | null;

  /*
   * Organization Runtime provides these.
   *
   * Member Workspace intentionally does not need to
   * provide them yet.
   */
  members?: UserManagementRecord[];

  dashboard?: DashboardData;

  memberMode?: boolean;
}


/* ==========================================================
   Performance Sheet
========================================================== */

export default function PerformanceSheet({
  document,

  objectives: initialObjectives,

  keyResultProgress,

  previousKeyResultValues,

  organizationId,

  performanceInstanceId,

  performanceInstance,

  subject,

  members = [],

  dashboard,

  memberMode = false,

}: PerformanceSheetProps) {

  const [
    currentStatus,
    setCurrentStatus,
  ] = useState(
    performanceInstance.status
  );


  const [
    objectives,
    setObjectives,
  ] = useState(
    initialObjectives
  );


  const [
    addingObjective,
    setAddingObjective,
  ] = useState(false);


  const [
    transitioning,
    setTransitioning,
  ] = useState(false);


  const [
    transitionError,
    setTransitionError,
  ] = useState<string | null>(
    null
  );


  const [
    transitionSaved,
    setTransitionSaved,
  ] = useState(false);


  /* ========================================================
     Runtime Lifecycle
  ======================================================== */

  async function handleTransition(
    transition:
      | "start"
      | "submit"
      | "approve"
      | "complete"
  ) {

    setTransitioning(
      true
    );

    setTransitionError(
      null
    );

    setTransitionSaved(
      false
    );


    try {

      const updated =
        await transitionPerformanceInstanceAction({
          organizationId,

          performanceInstanceId,

          transition,
        });


      setCurrentStatus(
        updated.status
      );

      setTransitionSaved(
        true
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to transition Performance Instance:",
        error
      );

      setTransitionError(
        error instanceof Error
          ? error.message
          : "Failed to update Performance Instance status."
      );

    } finally {

      setTransitioning(
        false
      );

    }
  }


  /* ========================================================
     Objective Updates
  ======================================================== */

  function handleObjectiveUpdated(
    updatedObjective:
      RuntimePerformanceObjective
  ) {

    setObjectives(
      (current) =>
        current.map(
          (objective) =>
            objective.id ===
            updatedObjective.id
              ? updatedObjective
              : objective
        )
    );

  }


  function handleObjectiveDeleted(
    objectiveId: string
  ) {

    setObjectives(
      (current) =>
        current.filter(
          (objective) =>
            objective.id !==
            objectiveId
        )
    );

  }


  function handleObjectiveCreated(
    objective:
      RuntimePerformanceObjective
  ) {

    setObjectives(
      (current) => [
        ...current,

        {
          ...objective,

          position:
            current.length + 1,
        },
      ]
    );

    setAddingObjective(
      false
    );

  }


  /* ========================================================
     Runtime Instance With Local Status
  ======================================================== */

  const runtimePerformanceInstance:
    PerformanceInstance =
    {
      ...performanceInstance,

      status:
        currentStatus,
    };


  /* ========================================================
     Render
  ======================================================== */

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">


      {/* ======================================================
          Runtime Navigation

          Only the organization Runtime supplies the
          organization member navigation context.

          Member Workspace continues to use the same
          PerformanceSheet without creating another engine.
      ====================================================== */}

      {!memberMode &&
        members.length > 0 && (

        <RuntimeNavigation

          organizationId={
            organizationId
          }

          members={
            members
          }

          selectedSubjectId={
            subject?.id
          }

        />

      )}


      {/* ======================================================
          Organization Dashboard

          Dashboard is intentionally only rendered when the
          organization Runtime provides dashboard data.
      ====================================================== */}

      {!memberMode &&
        !subject &&
        dashboard && (

        <RuntimeOverview
          dashboard={
            dashboard
          }
        />

      )}


      {/* ======================================================
          Runtime Header
      ====================================================== */}

      <RuntimeHeader

        document={
          document
        }

        performanceInstance={
          runtimePerformanceInstance
        }

        subject={
          subject
        }

      />


      {/* ======================================================
          Runtime Summary
      ====================================================== */}

      <RuntimeSummary

        performanceInstance={
          runtimePerformanceInstance
        }

      />


      {/* ======================================================
          Performance Workflow
      ====================================================== */}

      <section className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-medium text-primary">
              Workflow
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Performance Status
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Move this monthly performance instance
              through its current workflow stage.
            </p>

          </div>


          <div className="flex flex-wrap gap-3">

            {currentStatus ===
              "not_started" && (

              <button
                type="button"
                onClick={() =>
                  handleTransition(
                    "start"
                  )
                }
                disabled={
                  transitioning
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {
                  transitioning
                    ? "Starting..."
                    : "Start Performance"
                }
              </button>

            )}


            {currentStatus ===
              "in_progress" && (

              <button
                type="button"
                onClick={() =>
                  handleTransition(
                    "submit"
                  )
                }
                disabled={
                  transitioning
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {
                  transitioning
                    ? "Submitting..."
                    : "Submit Performance"
                }
              </button>

            )}


            {!memberMode &&
              currentStatus ===
                "submitted" && (

              <button
                type="button"
                onClick={() =>
                  handleTransition(
                    "approve"
                  )
                }
                disabled={
                  transitioning
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {
                  transitioning
                    ? "Approving..."
                    : "Approve Performance"
                }
              </button>

            )}


            {!memberMode &&
              currentStatus ===
                "approved" && (

              <button
                type="button"
                onClick={() =>
                  handleTransition(
                    "complete"
                  )
                }
                disabled={
                  transitioning
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {
                  transitioning
                    ? "Completing..."
                    : "Complete Performance"
                }
              </button>

            )}

          </div>

        </div>


        {transitionSaved && (

          <p className="mt-4 text-sm text-muted-foreground">
            Performance status updated.
          </p>

        )}


        {transitionError && (

          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">

            <p className="text-sm font-medium text-destructive">
              Unable to update performance status
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {
                transitionError
              }
            </p>

          </div>

        )}

      </section>


      {/* ======================================================
          Runtime Performance Objectives
      ====================================================== */}

      <section className="space-y-6">

        <div>

          <p className="text-sm font-medium text-primary">
            Performance
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Objectives
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Review and update the objectives,
            Key Results, and initiatives for this
            monthly performance instance.
          </p>

        </div>


        {objectives.map(
          (objective) => (

            <ObjectiveCard

              key={
                objective.id
              }

              objective={
                objective
              }

              keyResultProgress={
                keyResultProgress
              }

              organizationId={
                organizationId
              }

              performanceInstanceId={
                performanceInstanceId
              }

              performanceMonth={
                performanceInstance
                  .performanceMonth
              }

              previousKeyResultValues={
                previousKeyResultValues
              }

              onUpdated={
                handleObjectiveUpdated
              }

              onDeleted={
                handleObjectiveDeleted
              }

            />

          )
        )}


        {addingObjective && (

          <ObjectiveEditor

            organizationId={
              organizationId
            }

            performanceInstanceId={
              performanceInstanceId
            }

            onSaved={
              handleObjectiveCreated
            }

            onCancel={() =>
              setAddingObjective(
                false
              )
            }

          />

        )}


        {!addingObjective && (

          <button
            type="button"
            onClick={() =>
              setAddingObjective(
                true
              )
            }
            className="w-full rounded-xl border-2 border-dashed px-6 py-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            + Add Objective
          </button>

        )}

      </section>


      {/* ======================================================
          Employee Comments
      ====================================================== */}

      <EmployeeComments

        organizationId={
          organizationId
        }

        performanceInstanceId={
          performanceInstanceId
        }

        initialComments={
          performanceInstance
            .employeeComments
        }

        label="Employee Comments"

        placeholder={
          document
            .comments
            .placeholder
        }

        helpText={
          document
            .comments
            .helpText
        }

      />

    </main>
  );
}