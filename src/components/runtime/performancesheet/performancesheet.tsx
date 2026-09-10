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

  /*
   * Available monthly Performance Instances for
   * the current Runtime assignment.
   */
  performanceMonths: string[];

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

  performanceMonths,

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
    <main
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-8
        px-4
        py-6
        sm:px-6
        lg:px-8
        xl:px-10
      "
    >

      {/* ======================================================
          Runtime Navigation
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

          performanceMonth={
            performanceInstance.performanceMonth
          }

          performanceMonths={
            performanceMonths
          }

        />

      )}


      {/* ======================================================
          Organization Dashboard
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

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-border/80
          bg-card
          shadow-[0_8px_30px_rgba(8,37,80,0.05)]
        "
      >

        <div
          className="
            flex
            flex-col
            gap-6
            px-6
            py-6
            md:px-8
            md:py-7
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Workflow
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-primary
              "
            >
              Performance Status
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Move this monthly performance instance
              through its current workflow stage.
            </p>

          </div>


          <div
            className="
              flex
              shrink-0
              flex-wrap
              gap-3
            "
          >

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
                className="
                  rounded-xl
                  bg-primary
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-primary-foreground
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
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
                className="
                  rounded-xl
                  bg-[#e26d5c]
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
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
                className="
                  rounded-xl
                  bg-primary
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-primary-foreground
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
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
                className="
                  rounded-xl
                  bg-primary
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-primary-foreground
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:hover:translate-y-0
                "
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


        {(transitionSaved ||
          transitionError) && (

          <div
            className="
              border-t
              border-border/70
              bg-background/70
              px-6
              py-4
              md:px-8
            "
          >

            {transitionSaved && (

              <p
                className="
                  text-sm
                  font-semibold
                  text-primary
                "
              >
                Performance status updated.
              </p>

            )}


            {transitionError && (

              <div
                className="
                  rounded-xl
                  border
                  border-destructive/30
                  bg-destructive/5
                  px-4
                  py-3
                "
              >

                <p
                  className="
                    text-sm
                    font-bold
                    text-destructive
                  "
                >
                  Unable to update performance status
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  {
                    transitionError
                  }
                </p>

              </div>

            )}

          </div>

        )}

      </section>


      {/* ======================================================
          Runtime Performance Objectives
      ====================================================== */}

      <section
        className="
          space-y-6
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-border/80
            bg-card
            px-6
            py-6
            shadow-[0_8px_30px_rgba(8,37,80,0.04)]
            md:px-8
            md:py-7
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-primary
                "
              >
                Performance
              </p>

              <h2
                className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-tight
                  text-primary
                "
              >
                Objectives
              </h2>

              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Review and update the objectives,
                Key Results, and initiatives for this
                monthly performance instance.
              </p>

            </div>


            <div
              className="
                hidden
                shrink-0
                rounded-xl
                bg-[#e9f4f8]
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.12em]
                text-primary
                sm:block
              "
            >
              Monthly Performance
            </div>

          </div>

        </div>


        <div
          className="
            space-y-6
          "
        >

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
              className="
                group
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border-2
                border-dashed
                border-[#b4c2d1]
                bg-[#e9f4f8]/40
                px-6
                py-6
                text-sm
                font-bold
                text-primary
                transition-all
                duration-200
                hover:border-primary
                hover:bg-[#e9f4f8]
              "
            >

              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  text-lg
                  font-normal
                  leading-none
                  text-primary-foreground
                  transition-transform
                  duration-200
                  group-hover:scale-105
                "
                aria-hidden="true"
              >
                +
              </span>

              Add Objective

            </button>

          )}

        </div>

      </section>


      {/* ======================================================
          Employee Comments
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-border/80
          bg-card
          shadow-[0_8px_30px_rgba(8,37,80,0.05)]
        "
      >

        <div
          className="
            border-b
            border-border/70
            px-6
            py-5
            md:px-8
          "
        >

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-primary
            "
          >
            Reflection
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-primary
            "
          >
            Employee Comments
          </h2>

        </div>

        <div
          className="
            px-6
            py-6
            md:px-8
            md:py-7
          "
        >

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

        </div>

      </section>

    </main>
  );
}