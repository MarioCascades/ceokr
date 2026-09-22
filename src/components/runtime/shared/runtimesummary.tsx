import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

interface RuntimeSummaryProps {
  performanceInstance: PerformanceInstance;
}

function formatScore(
  score: number
) {
  return `${Math.round(score)}%`;
}

function formatProgress(
  progress: number
) {
  return `${Math.round(progress)}%`;
}

function formatStatus(
  status: PerformanceInstance["status"]
) {
  return status.replaceAll(
    "_",
    " "
  );
}

function getStatusDescription(
  status: PerformanceInstance["status"]
) {
  switch (status) {
    case "not_started":
      return "Performance has not started yet.";

    case "in_progress":
      return "Performance is currently being updated.";

    case "submitted":
      return "Submitted and awaiting manager review.";

    case "approved":
      return "Approved and ready for completion.";

    case "completed":
      return "This performance period is complete.";

    default:
      return "Current performance status.";
  }
}

export default function RuntimeSummary({
  performanceInstance,
}: RuntimeSummaryProps) {
  const score =
    performanceInstance.overallScore ?? 0;

  const progress =
    performanceInstance.progress ?? 0;

  const status =
    performanceInstance.status;

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">
          Performance Overview
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">
          Performance Summary
        </h2>

        <p className="text-sm text-muted-foreground">
          A current snapshot of this monthly
          performance instance.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Overall Score */}

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Overall Score
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {formatScore(score)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Current performance score
          </p>
        </div>

        {/* Progress */}

        <div className="rounded-xl border bg-background p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Progress
            </p>

            <p className="text-sm font-semibold">
              {formatProgress(progress)}
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(
                  Math.max(
                    progress,
                    0
                  ),
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Monthly performance completion
          </p>
        </div>

        {/* Status */}

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Performance Status
          </p>

          <p className="mt-2 text-xl font-bold capitalize">
            {formatStatus(status)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {getStatusDescription(status)}
          </p>
        </div>

      </div>
    </section>
  );
}