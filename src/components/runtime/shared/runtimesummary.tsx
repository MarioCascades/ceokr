import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

interface RuntimeSummaryProps {
  performanceInstance: PerformanceInstance;
}

export default function RuntimeSummary({
  performanceInstance,
}: RuntimeSummaryProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        Performance Summary
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

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