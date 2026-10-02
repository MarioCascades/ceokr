"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import type {
  OKRTemplate,
  CreateOKRTemplateInput,
  OKRTemplateInitiative,
  OKRTemplateKeyResult,
  OKRTemplateObjective,
  OKRTemplateStatus,
  UpdateOKRTemplateInput,
  OKRTemplateMeasurementType,
  OKRTemplateScoringMethod,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   Props
========================================================== */

interface OKRTemplateEditorProps {
  template?: OKRTemplate | null;

  initialObjectives?: OKRTemplateObjective[];

  initialKeyResults?: OKRTemplateKeyResult[];

  initialInitiatives?: OKRTemplateInitiative[];

  /*
   * Kept temporarily for compatibility with the
   * existing page contract.
   *
   * Scope is no longer exposed or used by the UI.
   */
  isPlatformAdmin?: boolean;

  saving?: boolean;

  error?: string | null;

  onSave: (input: {
    template:
      | CreateOKRTemplateInput
      | UpdateOKRTemplateInput;

    objectives: OKRTemplateObjective[];

    keyResults: OKRTemplateKeyResult[];

    initiatives: OKRTemplateInitiative[];
  }) => void | Promise<void>;

  onCancel?: () => void;
}


/* ==========================================================
   Template Type
========================================================== */

type TemplateType =
  | "objective"
  | "keyResult";


/* ==========================================================
   Draft Types
========================================================== */

interface DraftObjective {
  id: string;
  title: string;
  description: string;
  weight: number;
  position: number;
}


interface DraftKeyResult {
  id: string;
  title: string;
  target: string;
  weight: number;
  measurementType: OKRTemplateMeasurementType;
  scoringMethod: OKRTemplateScoringMethod;
  status:
    | "active"
    | "completed"
    | "cancelled";
}


interface DraftInitiative {
  id: string;
  keyResultId: string;
  text: string;
  position: number;
}


/* ==========================================================
   Temporary IDs
========================================================== */

function createTemporaryId(
  prefix: string
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


/* ==========================================================
   Draft Mapping
========================================================== */

function toDraftObjectives(
  objectives: OKRTemplateObjective[] = []
): DraftObjective[] {
  return [...objectives]
    .sort(
      (a, b) =>
        a.position -
        b.position
    )
    .map(
      (
        objective
      ) => ({
        id:
          objective.id,

        title:
          objective.title,

        description:
          objective.description ??
          "",

        weight:
          objective.weight ??
          0,

        position:
          objective.position,
      })
    );
}


function toDraftKeyResults(
  keyResults: OKRTemplateKeyResult[] = []
): DraftKeyResult[] {
  return [...keyResults]
    .sort(
      (a, b) =>
        a.createdAt.localeCompare(
          b.createdAt
        )
    )
    .map(
      (
        keyResult
      ) => ({
        id:
          keyResult.id,

        title:
          keyResult.title,

        target:
          typeof keyResult.target ===
          "string"
            ? keyResult.target
            : JSON.stringify(
                keyResult.target ??
                {}
              ),

        weight:
          keyResult.weight ??
          0,

        measurementType:
          keyResult.measurementType ??
          "numeric",

        scoringMethod:
          keyResult.scoringMethod ??
          "percent_into_period",

        status:
          keyResult.status ??
          "active",
      })
    );
}


function toDraftInitiatives(
  initiatives:
    OKRTemplateInitiative[] = []
): DraftInitiative[] {
  return [...initiatives]
    .sort(
      (a, b) =>
        a.position -
        b.position
    )
    .map(
      (
        initiative
      ) => ({
        id:
          initiative.id,

        keyResultId:
          initiative.okrTemplateKeyResultId,

        text:
          initiative.text,

        position:
          initiative.position,
      })
    );
}


/* ==========================================================
   Target Parser
========================================================== */

function parseTarget(
  value: string
): unknown {

  const trimmed =
    value.trim();


  if (!trimmed) {
    return null;
  }


  try {

    return JSON.parse(
      trimmed
    );

  } catch {

    return trimmed;

  }
}


/* ==========================================================
   Template Type Detection
========================================================== */

function detectTemplateType(
  pathname: string,
  searchParams: URLSearchParams
): TemplateType {

  const requestedType =
    searchParams.get(
      "type"
    );


  if (
    requestedType ===
    "keyResult"
  ) {
    return "keyResult";
  }


  if (
    requestedType ===
    "objective"
  ) {
    return "objective";
  }


  if (
    pathname.includes(
      "/keyresults/"
    ) ||
    pathname.endsWith(
      "/keyresults/new"
    )
  ) {
    return "keyResult";
  }


  return "objective";
}


/* ==========================================================
   Editor
========================================================== */

export default function OKRTemplateEditor({
  template,

  initialObjectives = [],

  initialKeyResults = [],

  initialInitiatives = [],

  saving = false,

  error = null,

  onSave,

  onCancel,
}: OKRTemplateEditorProps) {

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();


  const templateType =
    detectTemplateType(
      pathname,
      searchParams
    );


  const isObjectiveTemplate =
    templateType ===
    "objective";


  /* ========================================================
     Template State
  ======================================================== */

  const [
    title,
    setTitle,
  ] =
    useState(
      isObjectiveTemplate
        ? initialObjectives[0]?.title ??
          ""
        : initialKeyResults[0]?.title ??
          ""
    );


  const [
    description,
    setDescription,
  ] =
    useState(
      initialObjectives[0]?.description ??
      ""
    );


  const [
    objectiveWeight,
    setObjectiveWeight,
  ] =
    useState(
      initialObjectives[0]?.weight ??
      0
    );


  const [
    target,
    setTarget,
  ] =
    useState(
      initialKeyResults[0]
        ? typeof initialKeyResults[0].target ===
          "string"
          ? initialKeyResults[0].target
          : JSON.stringify(
              initialKeyResults[0].target ??
              {}
            )
        : ""
    );


  const [
    keyResultWeight,
    setKeyResultWeight,
  ] =
    useState(
      initialKeyResults[0]?.weight ??
      0
    );


  const [
    measurementType,
    setMeasurementType,
  ] =
    useState<OKRTemplateMeasurementType>(
      initialKeyResults[0]?.measurementType ??
      "numeric"
    );


  const [
    scoringMethod,
    setScoringMethod,
  ] =
    useState<OKRTemplateScoringMethod>(
      initialKeyResults[0]?.scoringMethod ??
      "percent_into_period"
    );


  const [
    status,
    setStatus,
  ] =
    useState<
      "active" |
      "completed" |
      "cancelled"
    >(
      initialKeyResults[0]?.status ??
      "active"
    );


  /* ========================================================
     Initiative State
  ======================================================== */

  const [
    initiatives,
    setInitiatives,
  ] =
    useState<DraftInitiative[]>(
      () =>
        toDraftInitiatives(
          initialInitiatives
        )
    );


  /* ========================================================
     Validation State
  ======================================================== */

  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null
    );


  /* ========================================================
     Initiative Helpers
  ======================================================== */

  function addInitiative() {

    if (
      initiatives.length >=
      3
    ) {

      setValidationError(
        "A Key Result Template can have a maximum of 3 initiatives."
      );

      return;
    }


    const initiative:
      DraftInitiative = {

      id:
        createTemporaryId(
          "initiative"
        ),

      keyResultId:
        initialKeyResults[0]?.id ??
        "new-key-result",

      text:
        "",

      position:
        initiatives.length,
    };


    setInitiatives(
      (items) => [
        ...items,
        initiative,
      ]
    );


    setValidationError(
      null
    );
  }


  function updateInitiative(
    initiativeId: string,
    text: string
  ) {

    setInitiatives(
      (items) =>
        items.map(
          (
            initiative
          ) =>
            initiative.id ===
            initiativeId
              ? {
                  ...initiative,
                  text,
                }
              : initiative
        )
    );
  }


  function removeInitiative(
    initiativeId: string
  ) {

    setInitiatives(
      (items) =>
        items
          .filter(
            (
              initiative
            ) =>
              initiative.id !==
              initiativeId
          )
          .map(
            (
              initiative,
              index
            ) => ({
              ...initiative,
              position:
                index,
            })
          )
    );


    setValidationError(
      null
    );
  }


  /* ========================================================
     Validation
  ======================================================== */

  function validate():
    string | null {

    if (
      !title.trim()
    ) {

      return isObjectiveTemplate
        ? "Objective title is required."
        : "Key Result title is required.";
    }


    if (
      isObjectiveTemplate
    ) {

      if (
        objectiveWeight <
        0 ||
        objectiveWeight >
        100
      ) {

        return "Objective weight must be between 0 and 100.";
      }

      return null;
    }


    if (
      keyResultWeight <
      0 ||
      keyResultWeight >
      100
    ) {

      return "Key Result weight must be between 0 and 100.";
    }


    for (
      const initiative of
      initiatives
    ) {

      if (
        !initiative.text.trim()
      ) {

        return "Every Initiative must contain text.";
      }
    }


    return null;
  }


  /* ========================================================
     Save
  ======================================================== */

  async function handleSave() {

    const currentValidationError =
      validate();


    if (
      currentValidationError
    ) {

      setValidationError(
        currentValidationError
      );

      return;
    }


    setValidationError(
      null
    );


    const now =
      new Date().toISOString();


    /*
     * The existing page still expects a template
     * payload. We keep this compatibility object
     * temporarily while the page is migrated.
     *
     * The UI no longer exposes or asks the user
     * about scope.
     */
    const templateInput =
      template
        ? ({
            templateId:
              template.id,

            name:
              title.trim(),

            description:
              isObjectiveTemplate
                ? description.trim()
                : "",

            status:
              template.status ??
              "active",
          } satisfies
            UpdateOKRTemplateInput)
        : ({
            name:
              title.trim(),

            description:
              isObjectiveTemplate
                ? description.trim()
                : "",

            scope:
              "global",

            status:
              "active",
          } satisfies
            CreateOKRTemplateInput);


    if (
      isObjectiveTemplate
    ) {

      const objective:
        OKRTemplateObjective = {

        id:
          initialObjectives[0]?.id ??
          createTemporaryId(
            "objective"
          ),

        okrTemplateId:
          template?.id ??
          "",

        title:
          title.trim(),

        description:
          description.trim(),

        weight:
          Number(
            objectiveWeight ||
            0
          ),

        position:
          0,

        createdAt:
          initialObjectives[0]?.createdAt ??
          template?.createdAt ??
          now,

                 updatedAt: now,
        };


      await onSave({

        template:
          templateInput,

        objectives:
          [
            objective,
          ],

        keyResults:
          [],

        initiatives:
          [],
      });

      return;
    }


    const keyResult:
      OKRTemplateKeyResult = {

      id:
        initialKeyResults[0]?.id ??
        createTemporaryId(
          "key-result"
        ),

      title:
        title.trim(),

      target:
        parseTarget(
          target
        ),

      weight:
        Number(
          keyResultWeight ||
          0
        ),

      measurementType,

      scoringMethod,

      status,

      createdAt:
        initialKeyResults[0]?.createdAt ??
        template?.createdAt ??
        now,

      updatedAt:
        now,

      initiatives:
        [],
    };


    const normalizedInitiatives:
      OKRTemplateInitiative[] =
      initiatives.map(
        (
          initiative,
          index
        ) => ({
          id:
            initiative.id,

          okrTemplateKeyResultId:
            keyResult.id,

          text:
            initiative.text.trim(),

          position:
            index,

          createdAt:
            now,

          updatedAt:
            now,
        })
      );


    await onSave({

      template:
        templateInput,

      objectives:
        [],

      keyResults:
        [
          keyResult,
        ],

      initiatives:
        normalizedInitiatives,
    });
  }


  /* ========================================================
     Render Helpers
  ======================================================== */

  const pageTitle =
    isObjectiveTemplate
      ? template
        ? "Edit Objective Template"
        : "Create Objective Template"
      : template
        ? "Edit Key Result Template"
        : "Create Key Result Template";


  const pageDescription =
    isObjectiveTemplate
      ? "Create a reusable Objective Template that can be added to member OKRs."
      : "Create a reusable Key Result Template with its target, measurement, scoring, and initiatives.";


  const saveLabel =
    saving
      ? "Saving..."
      : template
        ? "Save Template"
        : "Create Template";


  const initiativeCount =
    initiatives.length;


  const objectiveWeightDisplay =
    useMemo(
      () =>
        Number(
          objectiveWeight ||
          0
        ),
      [
        objectiveWeight,
      ]
    );


  /* ========================================================
     Render
  ======================================================== */

  return (
    <main
      className="
        min-h-screen
        bg-gray-100
        px-6
        py-8
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
          space-y-6
        "
      >

        {/* ==================================================
            Header
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-300
            bg-white
            p-6
            shadow-sm
          "
        >

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            OKR Templates
          </p>


          <h1
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-gray-950
            "
          >
            {pageTitle}
          </h1>


          <p
            className="
              mt-2
              max-w-3xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            {pageDescription}
          </p>

        </section>


        {/* ==================================================
            Error
        ================================================== */}

        {(error ||
          validationError) && (

          <section
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
            "
          >

            <p
              className="
                text-sm
                text-red-700
              "
            >
              {error ??
                validationError}
            </p>

          </section>

        )}


        {/* ==================================================
            Objective Template
        ================================================== */}

        {isObjectiveTemplate && (

          <section
            className="
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                mb-6
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-950
                "
              >
                Objective Template
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                Define the reusable objective
                that can be copied into a
                member OKR.
              </p>

            </div>


            <div
              className="
                grid
                gap-5
              "
            >

              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Objective Title
                </span>


                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Improve Patient Experience"
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Description
                </span>


                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe the objective and what it is intended to accomplish."
                  className="
                    mt-2
                    w-full
                    resize-y
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

              </label>


              <label
                className="
                  block
                  max-w-sm
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Weight
                </span>


                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    objectiveWeight
                  }
                  onChange={(
                    event
                  ) =>
                    setObjectiveWeight(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />


                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Weight:{" "}
                  {objectiveWeightDisplay}
                </p>

              </label>

            </div>

          </section>

        )}


        {/* ==================================================
            Key Result Template
        ================================================== */}

        {!isObjectiveTemplate && (

          <section
            className="
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                mb-6
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-950
                "
              >
                Key Result Template
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                Define a reusable Key Result
                independently from any Objective.
              </p>

            </div>


            <div
              className="
                grid
                gap-5
                lg:grid-cols-2
              "
            >

              <label
                className="
                  block
                  lg:col-span-2
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Key Result Title
                </span>


                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Maintain a 95% Patient Satisfaction Rate"
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Target
                </span>


                <input
                  type="text"
                  value={
                    target
                  }
                  onChange={(
                    event
                  ) =>
                    setTarget(
                      event.target.value
                    )
                  }
                  placeholder="Target value"
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Weight
                </span>


                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    keyResultWeight
                  }
                  onChange={(
                    event
                  ) =>
                    setKeyResultWeight(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Measurement Type
                </span>


                <select
                  value={
                    measurementType
                  }
                  onChange={(
                    event
                  ) =>
                    setMeasurementType(
                      event.target.value as
                        OKRTemplateMeasurementType
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                >

                  <option
                    value="numeric"
                  >
                    Numeric
                  </option>

                  <option
                    value="percentage"
                  >
                    Percentage
                  </option>

                  <option
                    value="financial"
                  >
                    Financial
                  </option>

                </select>

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Scoring Method
                </span>


                <select
                  value={
                    scoringMethod
                  }
                  onChange={(
                    event
                  ) =>
                    setScoringMethod(
                      event.target.value as
                        OKRTemplateScoringMethod
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                >

                  <option
                    value="percent_into_period"
                  >
                    Percent Into Period
                  </option>

                  <option
                    value="percentage_of_target"
                  >
                    Percentage of Target
                  </option>

                  <option
                    value="display_only"
                  >
                    Display Only
                  </option>

                </select>

              </label>


              <label
                className="
                  block
                "
              >

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Status
                </span>


                <select
                  value={
                    status
                  }
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event.target.value as
                        DraftKeyResult["status"]
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                >

                  <option
                    value="active"
                  >
                    Active
                  </option>

                  <option
                    value="completed"
                  >
                    Completed
                  </option>

                  <option
                    value="cancelled"
                  >
                    Cancelled
                  </option>

                </select>

              </label>

            </div>


            {/* ==================================================
                Initiatives
            ================================================== */}

            <div
              className="
                mt-8
                border-t
                border-gray-200
                pt-6
              "
            >

              <div
                className="
                  mb-4
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <div>

                  <h3
                    className="
                      text-base
                      font-semibold
                    "
                  >
                    Initiatives
                  </h3>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Add up to 3 initiatives
                    to this Key Result Template.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    addInitiative
                  }
                  disabled={
                    initiativeCount >=
                    3
                  }
                  className="
                    rounded-md
                    border
                    border-gray-300
                    px-3
                    py-2
                    text-xs
                    font-medium
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  + Add Initiative
                </button>

              </div>


              {initiativeCount ===
                0 && (

                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    p-6
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    No initiatives added.
                  </p>

                </div>

              )}


              {initiativeCount >
                0 && (

                <div
                  className="
                    space-y-3
                  "
                >

                  {initiatives.map(
                    (
                      initiative,
                      index
                    ) => (

                      <div
                        key={
                          initiative.id
                        }
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <span
                          className="
                            w-6
                            text-center
                            text-xs
                            text-muted-foreground
                          "
                        >
                          {index + 1}
                        </span>


                        <input
                          type="text"
                          value={
                            initiative.text
                          }
                          onChange={(
                            event
                          ) =>
                            updateInitiative(
                              initiative.id,
                              event.target.value
                            )
                          }
                          placeholder="Initiative"
                          className="
                            flex-1
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-sm
                            outline-none
                            focus:border-gray-500
                          "
                        />


                        <button
                          type="button"
                          onClick={() =>
                            removeInitiative(
                              initiative.id
                            )
                          }
                          className="
                            rounded-md
                            border
                            border-red-200
                            px-3
                            py-2
                            text-xs
                            text-red-600
                          "
                        >
                          Remove
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        )}


        {/* ==================================================
            Footer
        ================================================== */}

        <section
          className="
            flex
            flex-col-reverse
            gap-3
            rounded-2xl
            border
            border-gray-300
            bg-white
            p-5
            shadow-sm
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div
            className="
              text-xs
              text-muted-foreground
            "
          >
            {isObjectiveTemplate
              ? "Objective Template"
              : `${initiativeCount} Initiative${
                  initiativeCount ===
                  1
                    ? ""
                    : "s"
                }`}
          </div>


          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >

            {onCancel && (

              <button
                type="button"
                onClick={
                  onCancel
                }
                disabled={
                  saving
                }
                className="
                  rounded-md
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

            )}


            <button
              type="button"
              onClick={() =>
                void handleSave()
              }
              disabled={
                saving
              }
              className="
                rounded-md
                bg-black
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saveLabel}
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}