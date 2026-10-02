"use client";

import Link from "next/link";
import {
  Suspense,
  useState,
} from "react";
import {
  useSearchParams,
} from "next/navigation";

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
  const searchParams =
    useSearchParams();

  /*
   * ========================================================
   * Organization Context
   * ========================================================
   *
   * The Builder is shared by both administrative contexts.
   *
   * Super Admin:
   *
   * /builder?organizationId=123
   *
   * Organization Admin:
   *
   * /builder?organizationId=123&from=organization
   *
   * from=organization is navigation context only.
   * It is NOT an authorization mechanism.
   */

  const selectedOrganizationId =
    searchParams.get(
      "organizationId"
    );

  const isOrganizationContext =
    searchParams.get(
      "from"
    ) === "organization";

  /*
   * ========================================================
   * Navigation
   * ========================================================
   */

  const encodedOrganizationId =
    selectedOrganizationId
      ? encodeURIComponent(
          selectedOrganizationId
        )
      : null;

  /*
   * Back to Performance Sheets
   *
   * The destination depends on which administrative
   * context opened the Builder.
   */

  const performanceSheetsHref =
    encodedOrganizationId
      ? isOrganizationContext
        ? `/organization/performancesheets?organizationId=${encodedOrganizationId}`
        : `/admin/performancesheets?organizationId=${encodedOrganizationId}`
      : isOrganizationContext
        ? "/organization/performancesheets"
        : "/admin/performancesheets";

  /*
   * Back to Organization Workspace
   *
   * Only available when the Builder was opened from
   * the Organization Admin workspace.
   */

  const organizationWorkspaceHref =
    encodedOrganizationId
      ? `/organization?organizationId=${encodedOrganizationId}`
      : "/organization";

  /*
   * Back to Administration
   *
   * Only available for the Super Admin context.
   */

  const administrationHref =
    encodedOrganizationId
      ? `/admin?organizationId=${encodedOrganizationId}`
      : "/admin";

  /*
   * ========================================================
   * Builder State
   * ========================================================
   */

  const {
    editMode,
    setEditMode,

    builderDocument,

    isLoadingBuilder,
    isSavingBuilder,
    isPublishingBuilder,

    builderError,

    saveBuilder,
    publishBuilder,
  } = useBuilder();

  const [
    statusMessage,
    setStatusMessage,
  ] = useState<string | null>(
    null
  );

  const [
    validationResult,
    setValidationResult,
  ] = useState<BuilderValidationResult | null>(
    null
  );

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
     * There is only one Performance Workspace.
     *
     * The Builder remains editable regardless of whether
     * the workspace has previously been published.
     */

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

    setValidationResult(
      result
    );

    setStatusMessage(
      null
    );
  }

  /* ========================================================
     Save
  ======================================================== */

  async function handleSave() {
    setStatusMessage(
      null
    );

    try {
      await saveBuilder();

      setStatusMessage(
        "Performance workspace saved successfully."
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
    setStatusMessage(
      null
    );

    try {
      const result =
        await publishBuilder();

      /*
       * publishBuilder validates before doing
       * any database publication.
       */

      setValidationResult(
        result
      );

      if (!result.valid) {
        setStatusMessage(
          "Publishing was blocked because the performance sheet has validation errors."
        );

        return;
      }

      setStatusMessage(
        "Performance workspace published successfully."
      );
    } catch (error) {
      console.error(
        "Builder publish failed:",
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

            {/* =================================================
                Administrative Navigation
            ================================================= */}

            {!isOrganizationContext && (
              <Button
                asChild
                variant="outline"
              >
                <Link
                  href={
                    administrationHref
                  }
                >
                  Administration
                </Link>
              </Button>
            )}

            {/* =================================================
                Performance Sheet Management
            ================================================= */}

            <Button
              asChild
              variant="outline"
            >
              <Link
                href={
                  performanceSheetsHref
                }
              >
                Back to Performance Sheets
              </Link>
            </Button>

            {/* =================================================
                Organization Workspace
            ================================================= */}

            {isOrganizationContext && (
              <Button
                asChild
                variant="outline"
              >
                <Link
                  href={
                    organizationWorkspaceHref
                  }
                >
                  Back to Organization Workspace
                </Link>
              </Button>
            )}

            {/* =================================================
                Main Application
            ================================================= */}

            {!isOrganizationContext && (
              <Button
                asChild
                variant="outline"
              >
                <Link href="/">
                  Back to Main
                </Link>
              </Button>
            )}

            {/* =================================================
                Preview
            ================================================= */}

            <Button
              variant={
                !editMode
                  ? "default"
                  : "outline"
              }
              onClick={
                handlePreview
              }
            >
              Preview
            </Button>

            {/* =================================================
                Edit
            ================================================= */}

            <Button
              variant={
                editMode
                  ? "default"
                  : "outline"
              }
              onClick={
                handleEdit
              }
            >
              Edit
            </Button>

            {/* =================================================
                Validate
            ================================================= */}

            <Button
              variant="outline"
              onClick={
                handleValidate
              }
            >
              Validate
            </Button>

            {/* =================================================
                Save
            ================================================= */}

            <Button
              variant="outline"
              onClick={
                handleSave
              }
              disabled={
                isSavingBuilder ||
                isPublishingBuilder
              }
            >
              {isSavingBuilder
                ? "Saving..."
                : "Save"}
            </Button>

            {/* =================================================
                Publish
            ================================================= */}

            <Button
              onClick={
                handlePublish
              }
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
        }
      />

      {/* ======================================================
          Builder Content
      ====================================================== */}

      <div className="mx-auto max-w-7xl space-y-8 px-8 py-12">

        {/* ==================================================
            Performance Workspace Status
        ================================================== */}

        <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-white p-6 shadow-sm">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Performance Workspace
            </p>

            <p className="mt-1 font-semibold">
              Organization Performance Sheet
            </p>
          </div>

          <div
            className={
              editMode
                ? "rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
            }
          >
            {editMode
              ? "Editing"
              : "Preview"}
          </div>

          <div className="text-sm text-muted-foreground">
            One editable Performance Workspace for the organization.
          </div>

        </div>

        {/* ==================================================
            Status Message
        ================================================== */}

        {statusMessage && (
          <div className="rounded-lg border bg-white px-4 py-3">
            <p className="text-sm font-medium">
              {statusMessage}
            </p>
          </div>
        )}

        {/* ==================================================
            Error
        ================================================== */}

        {builderError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {builderError}
            </p>
          </div>
        )}

        {/* ==================================================
            Validation
        ================================================== */}

        {validationResult && (
          <ValidationPanel
            result={
              validationResult
            }
            onClose={() =>
              setValidationResult(
                null
              )
            }
          />
        )}

        {/* ==================================================
            Organization
        ================================================== */}

        <OrganizationSection />

        {/* ==================================================
            Navigation Tabs
        ================================================== */}

        <NavigationTabsManager />

        {/* ==================================================
            Performance Sheet
        ================================================== */}

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
    <Suspense
      fallback={
        <BuilderLoadingFallback />
      }
    >
      <BuilderProvider>
        <BuilderContent />
      </BuilderProvider>
    </Suspense>
  );
}