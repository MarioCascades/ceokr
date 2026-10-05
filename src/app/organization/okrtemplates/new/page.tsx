"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createOrganizationOKRTemplateObjective,
  createOrganizationOKRTemplateKeyResult,
  createOrganizationOKRTemplateInitiative,
  copyGlobalOKRTemplateObjectiveToOrganization,
  copyGlobalOKRTemplateKeyResultToOrganization,
} from "@/lib/repositories/okrtemplaterepository";

import type {
  OKRTemplateMeasurementType,
  OKRTemplateScoringMethod,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   Types
========================================================== */

type TemplateType =
  | "objective"
  | "keyResult";


interface InitiativeDraft {
  id: string;

  text: string;

  position: number;
}


/* ==========================================================
   Temporary ID
========================================================== */

function createTemporaryId(
  prefix: string
): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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
   Page
========================================================== */

export default function NewOrganizationOKRTemplatePage() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  /* ========================================================
     Organization Context
  ======================================================== */

  const organizationId =
    searchParams.get(
      "organizationId"
    );


  /* ========================================================
     Template Type
  ======================================================== */

  const requestedType =
    searchParams.get(
      "type"
    );

  const templateType: TemplateType =
    requestedType ===
    "keyResult"
      ? "keyResult"
      : "objective";


  /* ========================================================
     Global Template Source
  ======================================================== */

  const sourceGlobalTemplateId =
    searchParams.get(
      "sourceGlobalTemplateId"
    );

  const isGlobalTemplateCopy =
    Boolean(
      sourceGlobalTemplateId
    );


  /* ========================================================
     Objective State
  ======================================================== */

  const [
    objectiveTitle,
    setObjectiveTitle,
  ] = useState("");

  const [
    objectiveDescription,
    setObjectiveDescription,
  ] = useState("");

  const [
    objectiveWeight,
    setObjectiveWeight,
  ] = useState(0);


  /* ========================================================
     Key Result State
  ======================================================== */

  const [
    keyResultTitle,
    setKeyResultTitle,
  ] = useState("");

  const [
    keyResultTarget,
    setKeyResultTarget,
  ] = useState("");

  const [
    keyResultWeight,
    setKeyResultWeight,
  ] = useState(0);

  const [
    measurementType,
    setMeasurementType,
  ] =
    useState<OKRTemplateMeasurementType>(
      "numeric"
    );

  const [
    scoringMethod,
    setScoringMethod,
  ] =
    useState<OKRTemplateScoringMethod>(
      "percent_into_period"
    );


  /* ========================================================
     Initiative State
  ======================================================== */

  const [
    initiatives,
    setInitiatives,
  ] =
    useState<InitiativeDraft[]>(
      []
    );


  /* ========================================================
     UI State
  ======================================================== */

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  /* ========================================================
     Initiative Functions
  ======================================================== */

  function addInitiative() {

    if (
      initiatives.length >= 3
    ) {
      setError(
        "Each Key Result can have a maximum of 3 initiatives."
      );

      return;
    }


    setInitiatives(
      (items) => [
        ...items,

        {
          id:
            createTemporaryId(
              "initiative"
            ),

          text:
            "",

          position:
            items.length,
        },
      ]
    );


    setError(null);
  }


  function updateInitiative(
    initiativeId: string,
    text: string
  ) {

    setInitiatives(
      (items) =>
        items.map(
          (initiative) =>
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
      (items) => {

        const remaining =
          items.filter(
            (initiative) =>
              initiative.id !==
              initiativeId
          );

        return remaining.map(
          (
            initiative,
            index
          ) => ({
            ...initiative,

            position:
              index,
          })
        );
      }
    );
  }


  /* ========================================================
     Validation
  ======================================================== */

  function validate():
    string | null {

    if (!organizationId) {
      return (
        "Organization context is required."
      );
    }


    /* ======================================================
       Objective Validation
    ====================================================== */

    if (
      templateType ===
      "objective"
    ) {

      if (
        !objectiveTitle.trim()
      ) {
        return (
          "Objective Template title is required."
        );
      }


      if (
        objectiveWeight < 0 ||
        objectiveWeight > 100
      ) {
        return (
          "Objective Template weight must be between 0 and 100."
        );
      }


      return null;
    }


    /* ======================================================
       Key Result Validation
    ====================================================== */

    if (
      !keyResultTitle.trim()
    ) {
      return (
        "Key Result Template title is required."
      );
    }


    if (
      keyResultWeight < 0 ||
      keyResultWeight > 100
    ) {
      return (
        "Key Result Template weight must be between 0 and 100."
      );
    }


    for (
      const initiative
      of initiatives
    ) {

      if (
        !initiative.text.trim()
      ) {
        return (
          "Every Initiative must contain text."
        );
      }
    }


    return null;
  }


  /* ========================================================
     Save
  ======================================================== */

  async function handleSave() {

    /*
      A global-template copy does not use the manual form
      fields. The sourceGlobalTemplateId identifies the
      global record that must be copied.
    */

    const validationError =
      isGlobalTemplateCopy
        ? null
        : validate();


    if (
      validationError
    ) {

      setError(
        validationError
      );

      return;
    }


    if (
      isGlobalTemplateCopy &&
      !sourceGlobalTemplateId
    ) {

      setError(
        "Global template source is required."
      );

      return;
    }


    try {

      setSaving(true);

      setError(null);


      /* ====================================================
         Organization Objective Template
      ==================================================== */

      if (
        templateType ===
        "objective"
      ) {

        if (
          sourceGlobalTemplateId
        ) {

          /*
            Copy the global Objective Template into the
            organization-owned library.

            This creates an independent organization record.
          */

          await copyGlobalOKRTemplateObjectiveToOrganization({

            organizationId:
              organizationId!,

            sourceGlobalTemplateId,
          });

        } else {

          /*
            Manual organization Objective Template creation.
          */

          await createOrganizationOKRTemplateObjective({

            organizationId:

              organizationId!,

            title:
              objectiveTitle.trim(),

            description:
              objectiveDescription.trim()
                ? objectiveDescription.trim()
                : undefined,

            weight:
              Number(
                objectiveWeight
              ),

            position:
              undefined,
          });
        }
      }


      /* ====================================================
         Organization Key Result Template
      ==================================================== */

      if (
        templateType ===
        "keyResult"
      ) {

        if (
          sourceGlobalTemplateId
        ) {

          /*
            Copy the global Key Result Template into the
            organization-owned library.

            The repository copy operation also copies all
            reusable initiatives belonging to the global
            Key Result Template.
          */

          await copyGlobalOKRTemplateKeyResultToOrganization({

            organizationId:
              organizationId!,

            sourceGlobalTemplateId,
          });

        } else {

          /*
            Manual organization Key Result Template creation.
          */

          const createdKeyResult =
            await createOrganizationOKRTemplateKeyResult({

              organizationId:

                organizationId!,

              title:
                keyResultTitle.trim(),

              target:
                parseTarget(
                  keyResultTarget
                ),

              weight:
                Number(
                  keyResultWeight
                ),

              measurementType,

              scoringMethod,

              status:
                "active",
            });


          /* ================================================
             Organization Key Result Initiatives
          ================================================= */

          for (
            const initiative
            of initiatives
          ) {

            await createOrganizationOKRTemplateInitiative(

              organizationId!,

              {

                organizationKeyResultTemplateId:
                  createdKeyResult.id,

                text:
                  initiative.text.trim(),

                position:
                  initiative.position,
              }
            );
          }
        }
      }


      /* ====================================================
         Return to Organization Template Library
      ==================================================== */

      router.push(
        `/organization/okrtemplates?organizationId=${encodeURIComponent(
          organizationId!
        )}`
      );

    } catch (
      saveError
    ) {

      setError(
        saveError instanceof Error
          ? saveError.message
          : isGlobalTemplateCopy
            ? "Failed to add the global template to the organization."
            : "Failed to create the template."
      );

    } finally {

      setSaving(false);
    }
  }


  /* ========================================================
     Cancel
  ======================================================== */

  function handleCancel() {

    router.push(
      `/organization/okrtemplates?organizationId=${encodeURIComponent(
        organizationId ?? ""
      )}`
    );
  }


  /* ========================================================
     Missing Organization Context
  ======================================================== */

  if (!organizationId) {

    return (
      <main className="min-h-screen bg-gray-100 px-6 py-8">

        <div className="mx-auto max-w-4xl">

          <section className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="text-xl font-semibold text-red-900">
              Organization Context Required
            </h1>

            <p className="mt-2 text-sm text-red-700">
              This page requires an organizationId.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/organization"
                )
              }
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Back to Organization Workspace
            </button>

          </section>

        </div>

      </main>
    );
  }


  /* ========================================================
     Render
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8">

      <div className="mx-auto max-w-4xl space-y-6">

        {/* ==================================================
            Header
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization OKR Templates
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {isGlobalTemplateCopy
              ? templateType === "objective"
                ? "Add Global Objective Template"
                : "Add Global Key Result Template"
              : templateType === "objective"
                ? "Create Objective Template"
                : "Create Key Result Template"}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {isGlobalTemplateCopy
              ? `Copy this global ${templateType === "objective" ? "Objective" : "Key Result"} Template into this organization's independent template library. The organization copy will not remain linked to the global template.`
              : templateType === "objective"
                ? "Create a reusable Objective Template for this organization."
                : "Create a reusable Key Result Template for this organization. Key Result Templates are independent reusable records and may contain up to 3 initiatives."}
          </p>

        </section>


        {/* ==================================================
            Global Template Copy Notice
        ================================================== */}

        {isGlobalTemplateCopy && (

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Global Template Copy
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-900">
              The selected global template will be copied as-is into
              this organization. The organization copy becomes an
              independent template and can be modified or deleted
              without changing the global template.
            </p>

          </section>

        )}


        {/* ==================================================
            Error
        ================================================== */}

        {error && (

          <section className="rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm text-red-700">
              {error}
            </p>

          </section>

        )}


        {/* ==================================================
            Objective Form
        ================================================== */}

        {templateType ===
          "objective" && (

          <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h2 className="text-xl font-semibold text-gray-950">
                Objective Details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isGlobalTemplateCopy
                  ? "The global Objective Template will be copied using its existing details."
                  : "Define the reusable Objective Template."}
              </p>

            </div>


            <div className="space-y-5">

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Objective Title
                </label>

                <input
                  type="text"
                  value={
                    objectiveTitle
                  }
                  onChange={(event) =>
                    setObjectiveTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter Objective Template title"
                  disabled={isGlobalTemplateCopy}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Description
                </label>

                <textarea
                  value={
                    objectiveDescription
                  }
                  onChange={(event) =>
                    setObjectiveDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the Objective Template"
                  rows={4}
                  disabled={isGlobalTemplateCopy}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                />

              </div>


              <div className="max-w-xs">

                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Weight
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    objectiveWeight
                  }
                  onChange={(event) =>
                    setObjectiveWeight(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  disabled={isGlobalTemplateCopy}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  {isGlobalTemplateCopy
                    ? "The global template's existing weight will be copied."
                    : "Enter a value from 0 to 100."}
                </p>

              </div>

            </div>

          </section>
        )}


        {/* ==================================================
            Key Result Form
        ================================================== */}

        {templateType ===
          "keyResult" && (

          <>

            <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-gray-950">
                  Key Result Details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isGlobalTemplateCopy
                    ? "The global Key Result Template will be copied using its existing details."
                    : "Define the reusable Key Result and its measurement settings."}
                </p>

              </div>


              <div className="grid gap-5 lg:grid-cols-2">

                <div className="lg:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Key Result Title
                  </label>

                  <input
                    type="text"
                    value={
                      keyResultTitle
                    }
                    onChange={(event) =>
                      setKeyResultTitle(
                        event.target.value
                      )
                    }
                    placeholder="Enter Key Result Template title"
                    disabled={isGlobalTemplateCopy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />

                </div>


                <div className="lg:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Target
                  </label>

                  <input
                    type="text"
                    value={
                      keyResultTarget
                    }
                    onChange={(event) =>
                      setKeyResultTarget(
                        event.target.value
                      )
                    }
                    placeholder="Example: 100 or 95%"
                    disabled={isGlobalTemplateCopy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    {isGlobalTemplateCopy
                      ? "The global template's existing target will be copied."
                      : "The value is stored as structured data when valid JSON is entered, otherwise as text."}
                  </p>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Weight
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      keyResultWeight
                    }
                    onChange={(event) =>
                      setKeyResultWeight(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    disabled={isGlobalTemplateCopy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Measurement Type
                  </label>

                  <select
                    value={
                      measurementType
                    }
                    onChange={(event) =>
                      setMeasurementType(
                        event.target.value as OKRTemplateMeasurementType
                      )
                    }
                    disabled={isGlobalTemplateCopy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  >

                    <option value="numeric">
                      Numeric
                    </option>

                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="financial">
                      Financial
                    </option>

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Scoring Method
                  </label>

                  <select
                    value={
                      scoringMethod
                    }
                    onChange={(event) =>
                      setScoringMethod(
                        event.target.value as OKRTemplateScoringMethod
                      )
                    }
                    disabled={isGlobalTemplateCopy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  >

                    <option value="percent_into_period">
                      Percent Into Period
                    </option>

                    <option value="percentage_of_target">
                      Percentage of Target
                    </option>

                    <option value="display_only">
                      Display Only
                    </option>

                  </select>

                </div>

              </div>

            </section>


            {/* ================================================
                Initiatives
            ================================================= */}

            <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-xl font-semibold text-gray-950">
                    Initiatives
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {isGlobalTemplateCopy
                      ? "All initiatives belonging to the global Key Result Template will be copied automatically."
                      : "Add up to 3 reusable initiatives for this Key Result Template."}
                  </p>

                </div>


                {!isGlobalTemplateCopy && (

                  <button
                    type="button"
                    onClick={
                      addInitiative
                    }
                    disabled={
                      initiatives.length >= 3
                    }
                    className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add Initiative
                  </button>

                )}

              </div>


              {isGlobalTemplateCopy ? (

                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center">

                  <p className="text-sm text-muted-foreground">
                    Global initiatives will be copied automatically.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    The repository copy operation preserves the global
                    Key Result Template and its reusable initiatives.
                  </p>

                </div>

              ) : (

                <>

                  {initiatives.length ===
                    0 && (

                    <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center">

                      <p className="text-sm text-muted-foreground">
                        No initiatives added.
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Initiatives are optional.
                      </p>

                    </div>
                  )}


                  <div className="space-y-4">

                    {initiatives.map(
                      (
                        initiative,
                        index
                      ) => (

                        <div
                          key={
                            initiative.id
                          }
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <label className="text-sm font-medium text-gray-900">
                              Initiative {index + 1}
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                removeInitiative(
                                  initiative.id
                                )
                              }
                              className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>

                          </div>


                          <textarea
                            value={
                              initiative.text
                            }
                            onChange={(event) =>
                              updateInitiative(
                                initiative.id,
                                event.target.value
                              )
                            }
                            placeholder="Enter initiative"
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                          />

                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </section>

          </>
        )}


        {/* ==================================================
            Actions
        ================================================== */}

        <section className="flex items-center justify-end gap-3">

          <button
            type="button"
            onClick={
              handleCancel
            }
            disabled={
              saving
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? isGlobalTemplateCopy
                ? "Adding..."
                : "Creating..."
              : isGlobalTemplateCopy
                ? "Add to Organization"
                : "Create Template"}
          </button>

        </section>

      </div>

    </main>
  );
}