"use client";

import { useState } from "react";

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
  ReportingPeriod,
} from "@/lib/domain/reportingperiod";

import type {
  RuntimeSubject,
} from "@/lib/runtime/runtimeexecution";

import {
  transitionPerformanceInstanceAction,
} from "@/app/runtime/actions";

import ObjectiveCard from "./objectivecard";

import RuntimeSummary from "../shared/runtimesummary";

import EmployeeComments from "../shared/employeecomments";

interface PerformanceSheetProps {
  document: BuilderDocument;

  keyResultProgress: KeyResultProgress[];

  organizationId: string;

  performanceInstanceId: string;

  performanceInstance: PerformanceInstance;

  reportingPeriod: ReportingPeriod;

  subject: RuntimeSubject | null;
}

export default function PerformanceSheet({
  document,
  keyResultProgress,
  organizationId,
  performanceInstanceId,
  performanceInstance,
  reportingPeriod,
  subject,
}: PerformanceSheetProps) {
  const [
    currentStatus,
    setCurrentStatus,
  ] = useState(
    performanceInstance.status
  );

  const [transitioning, setTransitioning] =
    useState(false);

  const [transitionError, setTransitionError] =
    useState<string | null>(null);

  const [
    transitionSaved,
    setTransitionSaved,
  ] = useState(false);

  async function handleTransition(
    transition:
      | "start"
      | "submit"
      | "approve"
      | "complete"
  ) {
    setTransitioning(true);
    setTransitionError(null);
    setTransitionSaved(false);

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

      setTransitionSaved(true);
    } catch (error) {
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
      setTransitioning(false);
    }
  }

  /*
   * Runtime identity comes from the Assignment subject,
   * not from the immutable Builder document.
   *
   * The Builder document may still contain placeholder
   * presentation data because it represents the reusable
   * Performance Sheet definition.
   */
  const runtimeDisplayName =
    subject?.displayName ??
    document.performanceHeader.employeeName;

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8">

      {/* ==========================================
          Organization
      ========================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h1 className="text-3xl font-bold">
          {document.organization.companyName}
        </h1>

        {document.organization.tagline && (
          <p className="mt-2 text-muted-foreground">
            {document.organization.tagline}
          </p>
        )}

      </section>

      {/* ==========================================
          Performance Header
      ========================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h2 className="text-2xl font-semibold">
          {runtimeDisplayName}
        </h2>

        <p className="text-muted-foreground">
          {document.performanceHeader.employeeRole}
        </p>

        <p className="mt-2">
          {document.performanceHeader.roleDescription}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          {document.performanceHeader.metrics.map(
            (metric) => (
              <div
                key={metric.id}
                className="rounded-md border p-4"
              >

                <p className="text-sm text-muted-foreground">
                  {metric.title}
                </p>

                <p className="mt-2 text-xl font-bold">
                  {metric.value}
                </p>

              </div>
            )
          )}

        </div>

      </section>

      {/* ==========================================
          Runtime Summary
      ========================================== */}

      <RuntimeSummary
        performanceInstance={{
          ...performanceInstance,

          status:
            currentStatus,
        }}

        reportingPeriod={
          reportingPeriod
        }
      />

      {/* ==========================================
          Runtime Lifecycle
      ========================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              Performance Workflow
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Current status:{" "}
              <span className="font-medium capitalize">
                {currentStatus.replace(
                  "_",
                  " "
                )}
              </span>
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

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
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transitioning
                  ? "Starting..."
                  : "Start Performance"}
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
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transitioning
                  ? "Submitting..."
                  : "Submit Performance"}
              </button>
            )}

            {currentStatus ===
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
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transitioning
                  ? "Approving..."
                  : "Approve Performance"}
              </button>
            )}

            {currentStatus ===
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
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transitioning
                  ? "Completing..."
                  : "Complete Performance"}
              </button>
            )}

          </div>

        </div>

        {transitionSaved && (
          <p className="mt-4 text-sm text-green-600">
            Performance status updated.
          </p>
        )}

        {transitionError && (
          <p className="mt-4 text-sm text-red-600">
            {transitionError}
          </p>
        )}

      </section>

      {/* ==========================================
          Objectives
      ========================================== */}

      {document.objectives.map(
        (objective) => (
          <ObjectiveCard
            key={objective.id}
            objective={objective}
            keyResultProgress={
              keyResultProgress
            }
            organizationId={
              organizationId
            }
            performanceInstanceId={
              performanceInstanceId
            }
          />
        )
      )}

      {/* ==========================================
          Employee Comments
      ========================================== */}

      <EmployeeComments
        organizationId={
          organizationId
        }

        performanceInstanceId={
          performanceInstanceId
        }

        initialComments={
          performanceInstance.employeeComments
        }

        label="Employee Comments"

        placeholder={
          document.comments.placeholder
        }

        helpText={
          document.comments.helpText
        }
      />

    </main>
  );
}