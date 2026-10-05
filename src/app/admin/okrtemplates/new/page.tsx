"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import OKRTemplateEditor from "@/components/admin/okrtemplatelibrary/okrtemplateeditor";

import {
  createOKRTemplateObjective,
  createOKRTemplateKeyResult,
  createOKRTemplateInitiative,
  updateOKRTemplateObjective,
  updateOKRTemplateKeyResult,
  deleteOKRTemplateInitiative,
  loadGlobalOKRTemplateLibrary,
} from "@/lib/repositories/okrtemplaterepository";

import type {
  OKRTemplate,
  OKRTemplateObjective,
  OKRTemplateKeyResult,
  OKRTemplateInitiative,
  CreateOKRTemplateInput,
  UpdateOKRTemplateInput,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   New / Edit OKR Template Page
========================================================== */

export default function NewOKRTemplatePage() {

  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();


  /* ========================================================
     Template Type
  ======================================================== */

  const requestedType =
    searchParams.get(
      "type"
    );


  const templateType =
    requestedType ===
      "keyResult" ||
    pathname.includes(
      "/keyresults/"
    )
      ? "keyResult"
      : "objective";


  /* ========================================================
     Edit Mode
  ======================================================== */

  const templateId =
    searchParams.get(
      "id"
    );


  const isEditMode =
    Boolean(
      templateId
    );


  /* ========================================================
     Load State
  ======================================================== */

  const [
    template,
    setTemplate,
  ] =
    useState<
      OKRTemplate | null
    >(
      null
    );


  const [
    initialObjectives,
    setInitialObjectives,
  ] =
    useState<
      OKRTemplateObjective[]
    >(
      []
    );


  const [
    initialKeyResults,
    setInitialKeyResults,
  ] =
    useState<
      OKRTemplateKeyResult[]
    >(
      []
    );


  const [
    initialInitiatives,
    setInitialInitiatives,
  ] =
    useState<
      OKRTemplateInitiative[]
    >(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      Boolean(
        templateId
      )
    );


  const [
    loadError,
    setLoadError,
  ] =
    useState<
      string | null
    >(
      null
    );


  /* ========================================================
     Save State
  ======================================================== */

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );


  /* ========================================================
     Load Existing Template
  ======================================================== */

  useEffect(
    () => {

      if (
        !templateId
      ) {

        setLoading(
          false
        );

        return;

      }


      let cancelled =
        false;


      async function loadTemplate() {

        try {

          setLoading(
            true
          );

          setLoadError(
            null
          );


          const library =
            await loadGlobalOKRTemplateLibrary(
              true
            );


          if (
            cancelled
          ) {

            return;

          }


          if (
            templateType ===
            "objective"
          ) {

            const objective =
              library.objectives.find(
                (
                  item
                ) =>
                  item.id ===
                  templateId
              );


            if (
              !objective
            ) {

              throw new Error(
                "The requested Objective Template could not be found."
              );

            }


            /*
             * The current template model is a
             * compatibility wrapper around the
             * independent template records.
             *
             * For edit mode, provide the editor
             * with the matching objective as the
             * initial record.
             */

            setTemplate({
              ...library,

              objectives:
                [
                  objective,
                ],

              keyResults:
                [],
            });


            setInitialObjectives(
              [
                objective,
              ]
            );


            setInitialKeyResults(
              []
            );


            setInitialInitiatives(
              []
            );

          } else {

            const keyResult =
              library.keyResults.find(
                (
                  item
                ) =>
                  item.id ===
                  templateId
              );


            if (
              !keyResult
            ) {

              throw new Error(
                "The requested Key Result Template could not be found."
              );

            }


            setTemplate({
              ...library,

              objectives:
                [],

              keyResults:
                [
                  keyResult,
                ],
            });


            setInitialObjectives(
              []
            );


            setInitialKeyResults(
              [
                keyResult,
              ]
            );


            setInitialInitiatives(
              keyResult.initiatives ??
              []
            );

          }

        } catch (
          loadException
        ) {

          if (
            cancelled
          ) {

            return;

          }


          const message =
            loadException instanceof Error
              ? loadException.message
              : "Failed to load the template.";


          setLoadError(
            message
          );

        } finally {

          if (
            !cancelled
          ) {

            setLoading(
              false
            );

          }

        }

      }


      loadTemplate();


      return () => {

        cancelled =
          true;

      };

    },
    [
      templateId,
      templateType,
    ]
  );


  /* ========================================================
     Save Template
  ======================================================== */

  async function handleSave({
    template:
      templateInput,

    objectives,

    keyResults,

    initiatives,
  }: {
    template:
      | CreateOKRTemplateInput
      | UpdateOKRTemplateInput;

    objectives:
      OKRTemplateObjective[];

    keyResults:
      OKRTemplateKeyResult[];

    initiatives:
      OKRTemplateInitiative[];
  }) {

    try {

      setSaving(
        true
      );

      setError(
        null
      );


      /* ======================================================
         Objective Template
      ====================================================== */

      if (
        templateType ===
        "objective"
      ) {

        const objective =
          objectives[0];


        if (
          !objective
        ) {

          throw new Error(
            "An Objective Template is required."
          );

        }


        if (
          isEditMode &&
          templateId
        ) {

          await updateOKRTemplateObjective({
            objectiveId:
              templateId,

            title:
              objective.title,

            description:
              objective.description,

            weight:
              objective.weight,

            position:
              objective.position,
          });

        } else {

          await createOKRTemplateObjective({
            okrTemplateId:
              objective.okrTemplateId,

            title:
              objective.title,

            description:
              objective.description,

            weight:
              objective.weight,

            position:
              objective.position,
          });

        }

      }


      /* ======================================================
         Key Result Template
      ====================================================== */

      if (
        templateType ===
        "keyResult"
      ) {

        const keyResult =
          keyResults[0];


        if (
          !keyResult
        ) {

          throw new Error(
            "A Key Result Template is required."
          );

        }


        let savedKeyResultId =
          keyResult.id;


        if (
          isEditMode &&
          templateId
        ) {

          const updatedKeyResult =
            await updateOKRTemplateKeyResult({
              keyResultId:
                templateId,

              title:
                keyResult.title,

              target:
                keyResult.target,

              weight:
                keyResult.weight,

              measurementType:
                keyResult.measurementType,

              scoringMethod:
                keyResult.scoringMethod,

              status:
                keyResult.status,
            });


          savedKeyResultId =
            updatedKeyResult.id;


          /* ==================================================
             Existing Initiatives

             The editor is already enforcing the
             maximum of three initiatives.

             For this first edit implementation,
             replace the existing initiative set
             with the current editor state.
          ================================================== */

          for (
            const existingInitiative of
              initialInitiatives
          ) {

            await deleteOKRTemplateInitiative(
              existingInitiative.id
            );

          }

        } else {

          const createdKeyResult =
            await createOKRTemplateKeyResult({
              title:
                keyResult.title,

              target:
                keyResult.target,

              weight:
                keyResult.weight,

              measurementType:
                keyResult.measurementType,

              scoringMethod:
                keyResult.scoringMethod,

              status:
                keyResult.status,
            });


          savedKeyResultId =
            createdKeyResult.id;

        }


        /* ====================================================
           Save Initiatives
        ==================================================== */

        const keyResultInitiatives =
          initiatives.filter(
            (
              initiative
            ) =>
              initiative.okrTemplateKeyResultId ===
                keyResult.id ||
              initiative.okrTemplateKeyResultId ===
                savedKeyResultId
          );


        for (
          const initiative of
            keyResultInitiatives
        ) {

          const text =
            initiative.text.trim();


          if (
            !text
          ) {

            continue;

          }


          await createOKRTemplateInitiative({
            okrTemplateKeyResultId:
              savedKeyResultId,

            text,

            position:
              initiative.position,
          });

        }

      }


      /* ======================================================
         Return to Template Library
      ====================================================== */

      router.push(
        "/admin/okrtemplates"
      );

      router.refresh();

    } catch (
      saveError
    ) {

      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save the template.";


      setError(
        message
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* ========================================================
     Cancel
  ======================================================== */

  function handleCancel() {

    router.back();

  }


  /* ========================================================
     Loading
  ======================================================== */

  if (
    loading
  ) {

    return (

      <main
        className="
          mx-auto
          max-w-7xl
          px-6
          py-8
          lg:px-8
        "
      >

        <div
          className="
            rounded-xl
            border
            bg-background
            p-8
          "
        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Loading template...
          </p>

        </div>

      </main>

    );

  }


  /* ========================================================
     Load Error
  ======================================================== */

  if (
    loadError
  ) {

    return (

      <main
        className="
          mx-auto
          max-w-7xl
          px-6
          py-8
          lg:px-8
        "
      >

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          "
        >

          {loadError}

        </div>


        <div
          className="
            mt-5
          "
        >

          <button
            type="button"
            onClick={
              handleCancel
            }
            className="
              rounded-md
              border
              px-4
              py-2
              text-sm
              font-medium
              hover:bg-muted
            "
          >
            Back to Templates
          </button>

        </div>

      </main>

    );

  }


  /* ========================================================
     Render
  ======================================================== */

  return (

    <>

      {error && (

        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            pt-6
            lg:px-8
          "
        >

          <div
            className="
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >

            {error}

          </div>

        </div>

      )}


      <OKRTemplateEditor

        isPlatformAdmin={
          true
        }

        template={
          template
        }

        initialObjectives={
          initialObjectives
        }

        initialKeyResults={
          initialKeyResults
        }

        initialInitiatives={
          initialInitiatives
        }

        saving={
          saving
        }

        error={
          error
        }

        onSave={
          handleSave
        }

        onCancel={
          handleCancel
        }

      />

    </>

  );

}