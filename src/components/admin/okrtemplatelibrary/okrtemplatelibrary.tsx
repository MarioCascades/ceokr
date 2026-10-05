"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Button,
} from "@/components/ui/button";

import {
  loadAllObjectiveTemplates,
  loadAllKeyResultTemplates,
  deleteOKRTemplateObjective,
  deleteOKRTemplateKeyResult,
} from "@/lib/repositories/okrtemplaterepository";

import type {
  OKRTemplateObjective,
  OKRTemplateKeyResult,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   Types
========================================================== */

interface OKRTemplateLibraryProps {
  isPlatformAdmin?: boolean;
}


/* ==========================================================
   Template Library
========================================================== */

export default function OKRTemplateLibrary({
  isPlatformAdmin: _isPlatformAdmin = false,
}: OKRTemplateLibraryProps) {

  const [
    objectiveTemplates,
    setObjectiveTemplates,
  ] =
    useState<OKRTemplateObjective[]>(
      []
    );


  const [
    keyResultTemplates,
    setKeyResultTemplates,
  ] =
    useState<OKRTemplateKeyResult[]>(
      []
    );


  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );


  const [
    deletingTemplateId,
    setDeletingTemplateId,
  ] =
    useState<string | null>(
      null
    );


  /* ========================================================
     Delete Global Template
  ======================================================== */

  async function handleDeleteTemplate(
    templateType: "objective" | "keyResult",
    templateId: string,
    templateTitle: string,
  ) {

    const confirmed =
      window.confirm(
        `Delete the global ${
          templateType === "objective"
            ? "Objective"
            : "Key Result"
        } Template "${templateTitle}"?\n\nThis cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingTemplateId(
        templateId
      );

      setErrorMessage(
        null
      );

      if (templateType === "objective") {
        await deleteOKRTemplateObjective(
          templateId
        );

        setObjectiveTemplates(
          (current) =>
            current.filter(
              (template) =>
                template.id !== templateId
            )
        );
      } else {
        await deleteOKRTemplateKeyResult(
          templateId
        );

        setKeyResultTemplates(
          (current) =>
            current.filter(
              (template) =>
                template.id !== templateId
            )
        );
      }

    } catch (error) {

      console.error(
        "Failed to delete global OKR template:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete the global template."
      );

    } finally {

      setDeletingTemplateId(
        null
      );
    }
  }


  /* ========================================================
     Load Templates
  ======================================================== */

  useEffect(() => {

    let cancelled =
      false;


    async function initialize() {

      try {

        setIsLoading(
          true
        );

        setErrorMessage(
          null
        );


        const [
          loadedObjectiveTemplates,
          loadedKeyResultTemplates,
        ] =
          await Promise.all([
            loadAllObjectiveTemplates(),
            loadAllKeyResultTemplates(),
          ]);


        if (
          cancelled
        ) {
          return;
        }


        setObjectiveTemplates(
          loadedObjectiveTemplates
        );


        setKeyResultTemplates(
          loadedKeyResultTemplates
        );

      } catch (
        error
      ) {

        if (
          cancelled
        ) {
          return;
        }


        console.error(
          "Failed to load OKR templates:",
          error
        );


        setObjectiveTemplates(
          []
        );


        setKeyResultTemplates(
          []
        );


        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load OKR templates."
        );

      } finally {

        if (
          !cancelled
        ) {

          setIsLoading(
            false
          );

        }

      }

    }


    initialize();


    return () => {

      cancelled =
        true;

    };

  }, []);


  /* ========================================================
     Main Library
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

      {/* ====================================================
          Header
      ==================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          rounded-xl
          border
          bg-background
          p-6
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <p
            className="
              text-sm
              font-medium
              text-muted-foreground
            "
          >
            OKR Management
          </p>


          <h1
            className="
              mt-1
              text-2xl
              font-semibold
              tracking-tight
            "
          >
            OKR Templates
          </h1>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              text-muted-foreground
            "
          >
            Reusable templates for building
            member OKRs.
          </p>

        </div>


        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >

          <Button
            asChild
          >

            <Link
              href="/admin/okrtemplates/new?type=objective"
            >
              Create Objective Template
            </Link>

          </Button>


          <Button
            asChild
            variant="outline"
          >

            <Link
              href="/admin/okrtemplates/keyresults/new"
            >
              Create Key Result Template
            </Link>

          </Button>

        </div>

      </section>


      {/* ====================================================
          Error
      ==================================================== */}

      {errorMessage && (

        <section
          className="
            rounded-xl
            border
            border-destructive/30
            bg-destructive/5
            p-6
          "
        >

          <h2
            className="
              font-semibold
            "
          >
            Unable to load templates
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            {errorMessage}
          </p>

        </section>

      )}


      {/* ====================================================
          Loading
      ==================================================== */}

      {isLoading && (

        <section
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
            Loading OKR templates...
          </p>

        </section>

      )}


      {/* ====================================================
          Objective Templates
      ==================================================== */}

      {!isLoading && (

        <section
          className="
            space-y-4
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-semibold
                tracking-tight
              "
            >
              Objective Templates
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Reusable objectives that can be
              added to member OKR sheets.
            </p>

          </div>


          {objectiveTemplates.length === 0 ? (

            <section
              className="
                rounded-xl
                border
                bg-background
                p-8
              "
            >

              <h3
                className="
                  font-semibold
                "
              >
                No Objective Templates
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-muted-foreground
                "
              >
                Create an Objective Template
                to build your reusable objective
                library.
              </p>


              <div
                className="
                  mt-5
                "
              >

                <Button
                  asChild
                  variant="outline"
                >

                  <Link
                    href="/admin/okrtemplates/new?type=objective"
                  >
                    Create Objective Template
                  </Link>

                </Button>

              </div>

            </section>

          ) : (

            <div
              className="
                overflow-hidden
                rounded-xl
                border
                bg-background
              "
            >

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    min-w-[720px]
                    text-sm
                  "
                >

                  <thead
                    className="
                      border-b
                      bg-muted/40
                    "
                  >

                    <tr>

                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Type
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Template
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Description
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-right
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                    "
                  >

                    {objectiveTemplates.map(
                      (
                        objective
                      ) => (

                        <tr
                          key={
                            objective.id
                          }
                          className="
                            transition-colors
                            hover:bg-muted/20
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >

                            <span
                              className="
                                inline-flex
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                              "
                            >
                              Objective
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >

                            <div
                              className="
                                font-medium
                              "
                            >
                              {objective.title}
                            </div>

                          </td>


                          <td
                            className="
                              max-w-[500px]
                              px-5
                              py-4
                              align-middle
                              text-muted-foreground
                            "
                          >

                            <div
                              className="
                                line-clamp-2
                              "
                            >
                              {objective.description?.trim()
                                ? objective.description
                                : "No description has been added to this template."}
                            </div>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              align-middle
                            "
                          >

                            <div
                              className="flex items-center justify-end gap-2"
                            >

                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                              >

                                <Link
                                  href={`/admin/okrtemplates/new?type=objective&id=${objective.id}`}
                                >
                                  View Template
                                </Link>

                              </Button>

                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={
                                  deletingTemplateId === objective.id
                                }
                                onClick={() =>
                                  handleDeleteTemplate(
                                    "objective",
                                    objective.id,
                                    objective.title,
                                  )
                                }
                              >
                                {
                                  deletingTemplateId === objective.id
                                    ? "Deleting..."
                                    : "Delete"
                                }
                              </Button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </section>

      )}


      {/* ====================================================
          Key Result Templates
      ==================================================== */}

      {!isLoading && (

        <section
          className="
            space-y-4
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-semibold
                tracking-tight
              "
            >
              Key Result Templates
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Reusable key results that can be
              added to member OKR sheets.
            </p>

          </div>


          {keyResultTemplates.length === 0 ? (

            <section
              className="
                rounded-xl
                border
                bg-background
                p-8
              "
            >

              <h3
                className="
                  font-semibold
                "
              >
                No Key Result Templates
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-muted-foreground
                "
              >
                Create a Key Result Template
                to build your reusable key result
                library.
              </p>


              <div
                className="
                  mt-5
                "
              >

                <Button
                  asChild
                  variant="outline"
                >

                  <Link
                    href="/admin/okrtemplates/keyresults/new"
                  >
                    Create Key Result Template
                  </Link>

                </Button>

              </div>

            </section>

          ) : (

            <div
              className="
                overflow-hidden
                rounded-xl
                border
                bg-background
              "
            >

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    min-w-[900px]
                    text-sm
                  "
                >

                  <thead
                    className="
                      border-b
                      bg-muted/40
                    "
                  >

                    <tr>

                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Type
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Template
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Measurement
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Scoring
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-left
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Weight
                      </th>


                      <th
                        className="
                          px-5
                          py-3
                          text-right
                          font-medium
                          text-muted-foreground
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                    "
                  >

                    {keyResultTemplates.map(
                      (
                        keyResult
                      ) => (

                        <tr
                          key={
                            keyResult.id
                          }
                          className="
                            transition-colors
                            hover:bg-muted/20
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >

                            <span
                              className="
                                inline-flex
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                              "
                            >
                              Key Result
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >

                            <div
                              className="
                                font-medium
                              "
                            >
                              {keyResult.title}
                            </div>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >

                            <span
                              className="
                                inline-flex
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                              "
                            >
                              {keyResult.measurementType}
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                              text-muted-foreground
                            "
                          >
                            {keyResult.scoringMethod}
                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              align-middle
                            "
                          >
                            {keyResult.weight}
                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              align-middle
                            "
                          >

                            <div
                              className="flex items-center justify-end gap-2"
                            >

                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                              >

                                <Link
                                  href={`/admin/okrtemplates/new?type=keyResult&id=${keyResult.id}`}
                                >
                                  View Template
                                </Link>

                              </Button>

                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={
                                  deletingTemplateId === keyResult.id
                                }
                                onClick={() =>
                                  handleDeleteTemplate(
                                    "keyResult",
                                    keyResult.id,
                                    keyResult.title,
                                  )
                                }
                              >
                                {
                                  deletingTemplateId === keyResult.id
                                    ? "Deleting..."
                                    : "Delete"
                                }
                              </Button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </section>

      )}

    </main>
  );
}