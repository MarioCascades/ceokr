"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createOKRTemplateKeyResult,
  createOKRTemplateInitiative,
} from "@/lib/repositories/okrtemplaterepository";

import type {
  OKRTemplateMeasurementType,
  OKRTemplateScoringMethod,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   Types
========================================================== */

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
   Page
========================================================== */

export default function CreateKeyResultTemplatePage() {

  const router =
    useRouter();


  /* ========================================================
     Key Result State
  ======================================================== */

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    target,
    setTarget,
  ] = useState("");

  const [
    weight,
    setWeight,
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
          text: "",
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

    if (
      !title.trim()
    ) {
      return (
        "Key Result title is required."
      );
    }

    if (
      weight < 0 ||
      weight > 100
    ) {
      return (
        "Key Result weight must be between 0 and 100."
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

    const validationError =
      validate();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    try {

      setSaving(true);
      setError(null);


      /* ====================================================
         Create Independent Key Result Template
      ==================================================== */

      const createdKeyResult =
        await createOKRTemplateKeyResult({
          title:
            title.trim(),

          target:
            target.trim()
              ? target.trim()
              : undefined,

          weight:
            Number(weight),

          measurementType,

          scoringMethod,

          status:
            "active",
        });


      /* ====================================================
         Create Initiatives

         Initiatives belong directly to the
         Key Result Template.
      ==================================================== */

      for (
        const initiative
        of initiatives
      ) {

        await createOKRTemplateInitiative({
          okrTemplateKeyResultId:
            createdKeyResult.id,

          text:
            initiative.text.trim(),

          position:
            initiative.position,
        });
      }


      /* ====================================================
         Return to Template Library
      ==================================================== */

      router.push(
        "/admin/okrtemplates"
      );

    } catch (
      saveError
    ) {

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create the Key Result Template."
      );

    } finally {

      setSaving(false);

    }
  }


  /* ========================================================
     Cancel
  ======================================================== */

  function handleCancel() {
    router.back();
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
            OKR Templates
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Create Key Result Template
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Create a reusable Key Result Template.
            Key Result Templates are independent reusable records
            and can be applied to Member OKRs when needed.
          </p>

        </section>


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
            Key Result Details
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-gray-950">
              Key Result Details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Define the reusable Key Result and its measurement settings.
            </p>

          </div>


          <div className="grid gap-5 lg:grid-cols-2">

            {/* Title */}

            <label className="block lg:col-span-2">

              <span className="text-sm font-medium">
                Key Result Title
              </span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Increase qualified leads"
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              />

            </label>


            {/* Target */}

            <label className="block">

              <span className="text-sm font-medium">
                Target
              </span>

              <input
                type="text"
                value={target}
                onChange={(event) =>
                  setTarget(
                    event.target.value
                  )
                }
                placeholder="e.g. 100"
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              />

            </label>


            {/* Weight */}

            <label className="block">

              <span className="text-sm font-medium">
                Weight
              </span>

              <input
                type="number"
                min={0}
                max={100}
                value={weight}
                onChange={(event) =>
                  setWeight(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              />

            </label>


            {/* Measurement Type */}

            <label className="block">

              <span className="text-sm font-medium">
                Measurement Type
              </span>

              <select
                value={
                  measurementType
                }
                onChange={(event) =>
                  setMeasurementType(
                    event.target.value as
                      OKRTemplateMeasurementType
                  )
                }
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
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

            </label>


            {/* Scoring Method */}

            <label className="block">

              <span className="text-sm font-medium">
                Scoring Method
              </span>

              <select
                value={
                  scoringMethod
                }
                onChange={(event) =>
                  setScoringMethod(
                    event.target.value as
                      OKRTemplateScoringMethod
                  )
                }
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
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

            </label>

          </div>

        </section>


        {/* ==================================================
            Initiatives
        ================================================== */}

        <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-gray-950">
                Initiatives
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Add up to 3 suggested initiatives for this Key Result.
              </p>

            </div>

            <button
              type="button"
              onClick={
                addInitiative
              }
              disabled={
                initiatives.length >= 3
              }
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Initiative
            </button>

          </div>


          {initiatives.length === 0 && (

            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

              <h3 className="font-semibold text-gray-950">
                No Initiatives yet
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Initiatives are optional. You can add up to 3 suggested initiatives.
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
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Initiative {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeInitiative(
                          initiative.id
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>

                  </div>

                  <input
                    type="text"
                    value={
                      initiative.text
                    }
                    onChange={(event) =>
                      updateInitiative(
                        initiative.id,
                        event.target.value
                      )
                    }
                    placeholder="Describe the suggested initiative"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  />

                </div>

              )
            )}

          </div>

        </section>


        {/* ==================================================
            Actions
        ================================================== */}

        <section className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={
              handleCancel
            }
            disabled={
              saving
            }
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
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
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Key Result Template"}
          </button>

        </section>

      </div>

    </main>
  );
}