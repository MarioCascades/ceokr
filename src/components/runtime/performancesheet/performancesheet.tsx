import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import ObjectiveCard from "./objectivecard";

import RuntimeSummary from "../shared/runtimesummary";

interface PerformanceSheetProps {
  document: BuilderDocument;

  keyResultProgress: KeyResultProgress[];

  organizationId: string;

  performanceInstanceId: string;

  performanceInstance: PerformanceInstance;
}

export default function PerformanceSheet({
  document,
  keyResultProgress,
  organizationId,
  performanceInstanceId,
  performanceInstance,
}: PerformanceSheetProps) {
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
          {document.performanceHeader.employeeName}
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
        performanceInstance={
          performanceInstance
        }
      />

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
          Comments
      ========================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          {document.comments.label}
        </h2>

        <textarea
          readOnly
          placeholder={
            document.comments.placeholder
          }
          className="mt-4 min-h-[140px] w-full rounded-md border p-4"
        />

        <p className="mt-2 text-sm text-muted-foreground">
          {document.comments.helpText}
        </p>

      </section>

    </main>
  );
}