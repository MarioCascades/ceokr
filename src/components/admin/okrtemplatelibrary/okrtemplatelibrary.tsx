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
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {objectiveTemplates.map(
                (
                  objective
                ) => (

                  <article
                    key={
                      objective.id
                    }
                    className="
                      flex
                      min-h-[220px]
                      flex-col
                      rounded-xl
                      border
                      bg-background
                      p-6
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        flex-1
                      "
                    >

                      <h3
                        className="
                          text-lg
                          font-semibold
                        "
                      >
                        {objective.title}
                      </h3>


                      <p
                        className="
                          mt-4
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        {objective.description?.trim()
                          ? objective.description
                          : "No description has been added to this template."}
                      </p>

                    </div>


                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Objective Template
                      </span>


                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >

                        <Link
                          href={
                            `/admin/okrtemplates/objectives/${objective.id}`
                          }
                        >
                          View Template
                        </Link>

                      </Button>

                    </div>

                  </article>

                )
              )}

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
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {keyResultTemplates.map(
                (
                  keyResult
                ) => (

                  <article
                    key={
                      keyResult.id
                    }
                    className="
                      flex
                      min-h-[220px]
                      flex-col
                      rounded-xl
                      border
                      bg-background
                      p-6
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        flex-1
                      "
                    >

                      <h3
                        className="
                          text-lg
                          font-semibold
                        "
                      >
                        {keyResult.title}
                      </h3>


                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          gap-2
                        "
                      >

                        <span
                          className="
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


                        <span
                          className="
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                          "
                        >
                          {keyResult.scoringMethod}
                        </span>

                      </div>


                      <p
                        className="
                          mt-4
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        Reusable Key Result template
                        with its own target and
                        measurement configuration.
                      </p>

                    </div>


                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Key Result Template
                      </span>


                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >

                        <Link
                          href={
                            `/admin/okrtemplates/keyresults/${keyResult.id}`
                          }
                        >
                          View Template
                        </Link>

                      </Button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      )}

    </main>
  );
}