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

import ObjectiveCard from "./objectivecard";

import RuntimeSummary from "../shared/runtimesummary";

import EmployeeComments from "../shared/employeecomments";

import ManagerComments from "../shared/managercomments";

interface PerformanceSheetProps {
  document: BuilderDocument;

  keyResultProgress: KeyResultProgress[];

  organizationId: string;

  performanceInstanceId: string;

  performanceInstance: PerformanceInstance;

  reportingPeriod: ReportingPeriod;
}

export default function PerformanceSheet({
  document,
  keyResultProgress,
  organizationId,
  performanceInstanceId,
  performanceInstance,
  reportingPeriod,
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

        reportingPeriod={
          reportingPeriod
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

      {/* ==========================================
          Manager Comments
      ========================================== */}

      <ManagerComments
        organizationId={
          organizationId
        }

        performanceInstanceId={
          performanceInstanceId
        }

        initialComments={
          performanceInstance.managerComments
        }

        label="Manager Comments"

        placeholder="Enter manager comments"

        helpText="Manager comments are stored with this Performance Instance."
      />

    </main>
  );
}