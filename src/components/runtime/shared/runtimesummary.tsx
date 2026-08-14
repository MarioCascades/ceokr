import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  ReportingPeriod,
} from "@/lib/domain/reportingperiod";

interface RuntimeSummaryProps {
  performanceInstance: PerformanceInstance;

  reportingPeriod: ReportingPeriod;
}

export default function RuntimeSummary({
  performanceInstance,
  reportingPeriod,
}: RuntimeSummaryProps) {
  const startDate =
    new Date(
      reportingPeriod.startDate
    ).toLocaleDateString();

  const endDate =
    new Date(
      reportingPeriod.endDate
    ).toLocaleDateString();

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        Performance Summary
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            Reporting Period
          </p>

          <p className="mt-2 text-xl font-bold">
            {reportingPeriod.name}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {startDate} – {endDate}
          </p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            Overall Score
          </p>

          <p className="mt-2 text-2xl font-bold">
            {performanceInstance.overallScore}
          </p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            Progress
          </p>

          <p className="mt-2 text-2xl font-bold">
            {performanceInstance.progress}%
          </p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-2xl font-bold capitalize">
            {performanceInstance.status.replace(
              "_",
              " "
            )}
          </p>
        </div>

      </div>

    </section>
  );
}