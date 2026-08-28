"use client";

import Link from "next/link";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import CEPageHeader from "@/components/ui/cepageheader";

import {
  BuilderProvider,
  useBuilder,
} from "@/components/builder/context/buildercontext";

import OrganizationSection from "@/components/builder/organization/organizationsection";
import NavigationTabsManager from "@/components/builder/navigation/navigationtabsmanager";

import PerformanceSheet from "@/components/builder/performance/performancesheet";
import PerformanceHeader from "@/components/builder/performance/performanceheader";

import Objectives from "@/components/builder/objectives/objectives";
import Comments from "@/components/builder/comments/comments";

import ValidationPanel from "@/components/builder/validation/validationpanel";

import {
  validateBuilderDocument,
} from "@/lib/builder/buildervalidation";

import type {
  BuilderValidationResult,
} from "@/lib/builder/buildervalidation";

/* ==========================================================
   Builder Content
========================================================== */

function BuilderContent() {
  const {
    editMode,
    setEditMode,

    builderDocument,

    performanceSheetStatus,
    performanceSheetVersion,

    isLoadingBuilder,
    isSavingBuilder,
    isPublishingBuilder,

    builderError,

    saveBuilder,
    publishBuilder,
    createRevision,
  } = useBuilder();

  const [
    statusMessage,
    setStatusMessage,
  ] = useState<string | null>(null);

  const [
    validationResult,
    setValidationResult,
  ] = useState<BuilderValidationResult | null>(
    null
  );

  const isDraft =
    performanceSheetStatus === "draft";

  const isPublished =
    performanceSheetStatus === "published";

  /* ========================================================
     Preview
  ======================================================== */

  function handlePreview() {
    setEditMode(false);
  }

  /* ========================================================
     Edit
  ======================================================== */

  function handleEdit() {
    /*
     * Published definitions are immutable.
     *
     * A published definition must first become
     * a new draft revision before editing.
     */
    if (!isDraft) {
      return;
    }

    setEditMode(true);
  }

  /* ========================================================
     Validate
  ======================================================== */

  function handleValidate() {
    const result =
      validateBuilderDocument(
        builderDocument
      );

    setValidationResult(result);

    setStatusMessage(null);
  }

  /* ========================================================
     Save
  ======================================================== */

  async function handleSave() {
    setStatusMessage(null);

    try {
      await saveBuilder();

      setStatusMessage(
        `Draft version ${performanceSheetVersion} saved successfully.`
      );
    } catch (error) {
      console.error(
        "Builder save failed:",
        error
      );
    }
  }

  /* ========================================================
     Publish
  ======================================================== */

  async function handlePublish() {
    setStatusMessage(null);

    try {
      const result =
        await publishBuilder();

      /*
       * publishBuilder validates before doing
       * any database publication.
       */
      setValidationResult(result);

      if (!result.valid) {
        setStatusMessage(
          "Publishing was blocked because the performance sheet has validation errors."
        );

        return;
      }

      setStatusMessage(
        `Performance sheet version ${performanceSheetVersion} published successfully.`
      );
    } catch (error) {
      console.error(
        "Builder publish failed:",
        error
      );
    }
  }

  /* ========================================================
     Create Revision
  ======================================================== */

  async function handleCreateRevision() {
    setStatusMessage(null);
    setValidationResult(null);

    try {
      await createRevision();

      setStatusMessage(
        `Draft version ${performanceSheetVersion + 1} created successfully.`
      );
    } catch (error) {
      console.error(
        "Create revision failed:",
        error
      );
    }
  }

  /* ========================================================
     Loading
  ======================================================== */

  if (isLoadingBuilder) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Loading Performance Sheet Builder...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-slate-100">

      {/* ================= PAGE HEADER ================= */}

      <CEPageHeader
        title="Performance Sheet Builder"
        description="Design your organization's performance sheet."
        rightContent={
          <>
            {/* ================= Navigation ================= */}

            <Button
              asChild
              variant="outline"
            >
              <Link href="/admin">
                Administration
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
            >
              <Link href="/">
                Back to Main
              </Link>
            </Button>

            {/* ================= Preview ================= */}

            <Button
              variant={
                !editMode
                  ? "default"
                  : "outline"
              }
              onClick={handlePreview}
            >
              Preview
            </Button>

            {/* ================= Draft Controls ================= */}

            {isDraft && (
              <>
                <Button
                  variant={
                    editMode
                      ? "default"
                      : "outline"
                  }
                  onClick={handleEdit}
                >
                  Edit
                </Button>

                <Button
                  variant="outline"
                  onClick={handleValidate}
                >
                  Validate
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={
                    isSavingBuilder ||
                    isPublishingBuilder
                  }
                >
                  {isSavingBuilder
                    ? "Saving..."
                    : "Save"}
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={
                    isSavingBuilder ||
                    isPublishingBuilder
                  }
                >
                  {isPublishingBuilder
                    ? "Publishing..."
                    : "Publish"}
                </Button>
              </>
            )}

            {/* ================= Published Controls ================= */}

            {isPublished && (
              <Button
                onClick={
                  handleCreateRevision
                }
              >
                Create Revision
              </Button>
            )}
          </>
        }
      />

      {/* ================= PAGE ================= */}

      <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* ================= Lifecycle Status ================= */}

        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white px-5 py-4 shadow-sm">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Performance Sheet
            </p>

            <p className="mt-1 font-semibold">
              Version {performanceSheetVersion}
            </p>
          </div>

          <div
            className={
              isPublished
                ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                : "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"
            }
          >
            {isPublished
              ? "Published"
              : "Draft"}
          </div>

          {isPublished && (
            <div className="text-sm text-muted-foreground">
              This version is locked. Create a revision to make changes.
            </div>
          )}

        </div>

        {/* ================= Status Message ================= */}

        {statusMessage && (
          <div className="rounded-lg border bg-white px-4 py-3">
            <p className="text-sm font-medium">
              {statusMessage}
            </p>
          </div>
        )}

        {/* ================= Error ================= */}

        {builderError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {builderError}
            </p>
          </div>
        )}

        {/* ================= Validation ================= */}

        {validationResult && (
          <ValidationPanel
            result={validationResult}
            onClose={() =>
              setValidationResult(null)
            }
          />
        )}

        {/* ================= Organization ================= */}

        <OrganizationSection />

        {/* ================= Navigation ================= */}

        <NavigationTabsManager />

        {/* ================= Performance Sheet ================= */}

        <PerformanceSheet>

          <PerformanceHeader />

          <Objectives />

          <Comments />

        </PerformanceSheet>

      </div>

    </main>
  );
}

/* ==========================================================
   Builder Loading Fallback
========================================================== */

function BuilderLoadingFallback() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Loading Performance Sheet Builder...
          </p>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================
   Builder Page
========================================================== */

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoadingFallback />}>
      <BuilderProvider>
        <BuilderContent />
      </BuilderProvider>
    </Suspense>
  );
}