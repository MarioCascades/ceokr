"use client";

import {
  useCallback,
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
  saveRuntimePerformanceSheetAction,
} from "@/app/runtime/actions";

import ObjectiveCard from "./objectivecard";

import ObjectiveEditor from "./objectiveeditor";

import RuntimeHeader from "../shared/runtimeheader";

import RuntimeSummary from "../shared/runtimesummary";

import RuntimeNavigation from "../shared/runtimenavigation";

import RuntimeOverview from "../shared/runtimeoverview";

import EmployeeComments from "../shared/employeecomments";


/* ==========================================================
   Runtime Organization Presentation
========================================================== */

export interface RuntimeOrganization {
  id: string;

  company_name: string;

  logo_url: string | null;
}


/* ==========================================================
   Runtime Performance Draft
========================================================== */

/**
 * The Performance Sheet is now the owner of the Runtime
 * performance draft.
 *
 * Child components must report edits to this parent rather
 * than writing Runtime performance data directly.
 *
 * This allows the global Save button to persist the entire
 * monthly Performance Instance in one operation.
 */

export interface RuntimePerformanceKeyResultDraft {
  keyResultId: string;

  progressId: string;

  target: unknown;

  currentValue: number | string;

  score: number;

  employeeComment?: string;

  managerComment?: string;
}


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

  /*
   * Runtime provides the actual organization record.
   *
   * Member Workspace does not currently provide this,
   * so the prop remains optional for compatibility.
   */
  organization?: RuntimeOrganization;

  performanceInstanceId: string;

  performanceInstance: PerformanceInstance;

  subject: RuntimeSubject | null;

  /*
   * Organization Runtime provides these.
   *
   * Member Workspace intentionally does not need them yet.
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

  organization,

  performanceInstanceId,

  performanceInstance,

  subject,

  members = [],

  dashboard,

  performanceMonths,

  memberMode = false,

}: PerformanceSheetProps) {


  /* ========================================================
     Runtime Status
  ======================================================== */

  const [
    currentStatus,
    setCurrentStatus,
  ] = useState(
    performanceInstance.status
  );


  /* ========================================================
     Performance Sheet Edit Mode
  ======================================================== */

  const [
    editing,
    setEditing,
  ] = useState(false);


  /* ========================================================
     Runtime Objectives
  ======================================================== */

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


  /* ========================================================
     Global Save State
  ======================================================== */

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    saveError,
    setSaveError,
  ] = useState<string | null>(
    null
  );


  const [
    saveSuccessful,
    setSaveSuccessful,
  ] = useState(false);


  /* ========================================================
     Runtime Performance Draft
  ======================================================== */

  const [
    keyResultDrafts,
    setKeyResultDrafts,
  ] = useState<
    Record<
      string,
      RuntimePerformanceKeyResultDraft
    >
  >(() => {

    const initialDrafts:
      Record<
        string,
        RuntimePerformanceKeyResultDraft
      > = {};


    for (
      const progress
      of keyResultProgress
    ) {

      /*
       * Key Result configuration is supplied by the
       * Runtime Objective / Key Result components.
       *
       * The Runtime Performance Key Result ID is the
       * authoritative relationship between the progress
       * record and the Runtime Key Result snapshot.
       *
       * This is important because progress.keyResultId
       * can refer to the source Key Result while the target
       * belongs to the Runtime Performance Key Result.
       */

      const runtimeKeyResult =
        initialObjectives
          .flatMap(
            (objective) =>
              objective.keyResults
          )
          .find(
            (keyResult) =>
              keyResult.id ===
              progress.performanceInstanceKeyResultId
          );


      initialDrafts[
        progress.id
      ] = {

        keyResultId:
          progress.keyResultId,

        progressId:
          progress.id,

        target:
          runtimeKeyResult?.target ??
          "",

        currentValue:
          progress.currentValue,

        score:
          progress.score,

        employeeComment:
          progress.employeeComment,

        managerComment:
          progress.managerComment,

      };

    }


    return initialDrafts;

  });


  /* ========================================================
     Employee Comments Draft
  ======================================================== */

  const [
    employeeComments,
    setEmployeeComments,
  ] = useState(
    performanceInstance.employeeComments ??
    ""
  );


  /* ========================================================
     Runtime Draft Registration
  ======================================================== */

  /*
   * Keep this callback stable.
   *
   * KeyResultRow reports its draft through this callback
   * from a useEffect. If this function is recreated on
   * every PerformanceSheet render, the callback becomes a
   * changing dependency of that effect.
   *
   * The resulting cycle is:
   *
   * KeyResultRow effect
   *   -> onDraftChange
   *   -> setKeyResultDrafts
   *   -> PerformanceSheet render
   *   -> new callback
   *   -> KeyResultRow effect again
   *
   * useCallback prevents that render loop.
   */

  const handleKeyResultDraftChange =
    useCallback(
      (
        draft:
          RuntimePerformanceKeyResultDraft
      ) => {

        setKeyResultDrafts(
          (current) => ({

            ...current,

            [draft.progressId]:
              draft,

          })
        );


        setSaveSuccessful(
          false
        );


        setSaveError(
          null
        );

      },
      []
    );


  /* ========================================================
     Employee Comments Draft Change
  ======================================================== */

  function handleEmployeeCommentsChange(
    comments: string
  ) {

    setEmployeeComments(
      comments
    );


    setSaveSuccessful(
      false
    );


    setSaveError(
      null
    );

  }


  /* ========================================================
     Global Performance Save
  ======================================================== */

  async function handleSavePerformance() {

    if (saving) {
      return;
    }


    setSaving(
      true
    );


    setSaveError(
      null
    );


    setSaveSuccessful(
      false
    );


    try {

      const drafts =
        Object.values(
          keyResultDrafts
        );


      const updated =
        await saveRuntimePerformanceSheetAction({

          organizationId,

          performanceInstanceId,

          employeeComments,

          keyResults:
            drafts,

        });


      /*
       * Saving the Performance Sheet is the Runtime
       * completion event.
       *
       * Completed does not lock the Performance Instance.
       */

      setCurrentStatus(
        updated.performanceInstance.status
      );


      setEditing(
        false
      );


      setSaveSuccessful(
        true
      );


    } catch (
      error
    ) {

      console.error(
        "Failed to save Runtime Performance Sheet:",
        error
      );


      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save the Performance Sheet."
      );


    } finally {

      setSaving(
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

      employeeComments:
        employeeComments,

    };


  /* ========================================================
     Render
  ======================================================== */

  return (

    <main
      className="
        mx-auto
        w-full
        max-w-none
        px-2
        py-2
        sm:px-3
        lg:px-4
      "
    >

      {/* ======================================================
          Sticky Performance Context
          ------------------------------------------------------
          Everything above the Performance section remains
          visible while the Performance content scrolls.
      ====================================================== */}

      <div
        className="
          sticky
          top-0
          z-40
          -mx-2
          bg-background
          px-2
          pb-2
          sm:-mx-3
          sm:px-3
          lg:-mx-4
          lg:px-4
        "
      >

        <div
          className="
            space-y-4
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

          {organization && (

            <RuntimeHeader
              document={
                document
              }

              organization={
                organization
              }

              performanceInstance={
                runtimePerformanceInstance
              }

              subject={
                subject
              }

            />

          )}


          {/* ======================================================
              Runtime Summary
          ====================================================== */}

          <RuntimeSummary
            performanceInstance={
              runtimePerformanceInstance
            }
          />

        </div>

      </div>


      {/* ======================================================
          Runtime Performance Objectives
      ====================================================== */}

      <section
        className="
          space-y-3
        "
      >

        <div
          className="
            rounded-xl
            border
            border-border/80
            bg-card
            px-4
            py-3
            shadow-sm
            md:px-5
            md:py-3
          "
        >

          <div
            className="
              flex
              flex-col
              gap-2
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
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
                  mt-1
                  text-xl
                  font-black
                  tracking-tight
                  text-primary
                "
              >
                Objectives
              </h2>


              <p
                className="
                  mt-1
                  max-w-3xl
                  text-xs
                  leading-5
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
                flex
                shrink-0
                items-center
                gap-2
              "
            >

              <div
                className="
                  hidden
                  rounded-lg
                  bg-[#e9f4f8]
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-primary
                  sm:block
                "
              >
                Monthly Performance
              </div>


              {!editing && (

                <button
                  type="button"

                  onClick={() => {

                    setEditing(
                      true
                    );

                    setSaveSuccessful(
                      false
                    );

                    setSaveError(
                      null
                    );

                  }}

                  className="
                    rounded-lg
                    bg-primary
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-primary-foreground
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-px
                    hover:shadow-md
                  "
                >
                  Edit
                </button>

              )}


              {editing && (

                <button
                  type="button"

                  onClick={
                    handleSavePerformance
                  }

                  disabled={
                    saving
                  }

                  className="
                    rounded-lg
                    bg-primary
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-primary-foreground
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-px
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {
                    saving
                      ? "Saving..."
                      : "Save"
                  }

                </button>

              )}

            </div>

          </div>


          {(saveSuccessful ||
            saveError) && (

            <div
              className="
                mt-3
                border-t
                border-border/70
                pt-3
              "
            >

              {saveSuccessful && (

                <p
                  className="
                    text-xs
                    font-semibold
                    text-primary
                  "
                >
                  Performance saved successfully.
                </p>

              )}


              {saveError && (

                <div
                  className="
                    rounded-lg
                    border
                    border-destructive/30
                    bg-destructive/5
                    px-3
                    py-2
                  "
                >

                  <p
                    className="
                      text-xs
                      font-bold
                      text-destructive
                    "
                  >
                    Unable to save performance
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {
                      saveError
                    }
                  </p>

                </div>

              )}

            </div>

          )}

        </div>


        <div
          className="
            space-y-3
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

                editing={
                  editing
                }

                onUpdated={
                  handleObjectiveUpdated
                }

                onDeleted={
                  handleObjectiveDeleted
                }

                onKeyResultDraftChange={
                  handleKeyResultDraftChange
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


          {!addingObjective &&
            editing && (

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
                rounded-xl
                border-2
                border-dashed
                border-[#b4c2d1]
                bg-[#e9f4f8]/40
                px-4
                py-3
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
          rounded-xl
          border
          border-border/80
          bg-card
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-border/70
            px-4
            py-3
            md:px-5
          "
        >

          <p
            className="
              text-[10px]
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
              mt-1
              text-lg
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
            px-4
            py-4
            md:px-5
            md:py-4
          "
        >

          <EmployeeComments

            initialComments={
              employeeComments
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

            editing={
              editing
            }

            onChange={
              handleEmployeeCommentsChange
            }

          />

        </div>

      </section>

    </main>

  );

}