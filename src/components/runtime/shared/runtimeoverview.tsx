import type {
  DashboardData,
} from "@/services/dashboard.service";

interface RuntimeOverviewProps {
  dashboard: DashboardData;
}

function formatPercent(
  value: number
): string {
  return `${Math.round(value)}%`;
}

function formatStatus(
  status: string
): string {
  return status.replaceAll(
    "_",
    " "
  );
}

function getBarWidth(
  count: number,
  maximum: number
): string {
  if (
    maximum <= 0 ||
    count <= 0
  ) {
    return "0%";
  }

  return `${Math.round(
    (count / maximum) * 100
  )}%`;
}

export default function RuntimeOverview({
  dashboard,
}: RuntimeOverviewProps) {

  const statusMaximum =
    Math.max(
      ...dashboard.statusCounts.map(
        (item) =>
          item.count
      ),
      1
    );

  const scoreMaximum =
    Math.max(
      ...dashboard.scoreBuckets.map(
        (item) =>
          item.count
      ),
      1
    );

  return (
    <section
      id="dashboard"
      className="scroll-mt-6 space-y-6 rounded-2xl border bg-card p-6 shadow-sm md:p-8"
    >

      {/* Header */}

      <div>
        <p className="text-sm font-medium text-primary">
          Organization Dashboard
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Performance Overview
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          A live summary of the organization&apos;s
          current performance execution data.
        </p>
      </div>


      {/* KPI Cards */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Assignments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              dashboard.totalAssignments
            }
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {
              dashboard.activeAssignments
            }{" "}
            active
          </p>
        </div>


        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Performance Instances
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              dashboard.totalPerformanceInstances
            }
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {
              dashboard.activePerformanceInstances
            }{" "}
            active
          </p>
        </div>


        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Average Score
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              formatPercent(
                dashboard.averageScore
              )
            }
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Across performance instances
          </p>
        </div>


        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Average Progress
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              formatPercent(
                dashboard.averageProgress
              )
            }
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Monthly execution progress
          </p>
        </div>

      </div>


      {/* Visualizations */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Status Distribution */}

        <section className="rounded-xl border bg-background p-5">

          <div>
            <h3 className="text-lg font-semibold">
              Performance Status
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Current lifecycle distribution.
            </p>
          </div>

          <div className="mt-6 space-y-4">

            {
              dashboard.statusCounts.map(
                (item) => (
                  <div
                    key={
                      item.status
                    }
                    className="space-y-2"
                  >

                    <div className="flex items-center justify-between gap-4 text-sm">

                      <span className="capitalize">
                        {
                          formatStatus(
                            item.status
                          )
                        }
                      </span>

                      <span className="font-semibold">
                        {
                          item.count
                        }
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">

                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width:
                            getBarWidth(
                              item.count,
                              statusMaximum
                            ),
                        }}
                      />

                    </div>

                  </div>
                )
              )
            }

          </div>

        </section>


        {/* Score Distribution */}

        <section className="rounded-xl border bg-background p-5">

          <div>
            <h3 className="text-lg font-semibold">
              Score Distribution
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Performance instances grouped by score.
            </p>
          </div>

          <div className="mt-6 space-y-4">

            {
              dashboard.scoreBuckets.map(
                (bucket) => (
                  <div
                    key={
                      bucket.label
                    }
                    className="space-y-2"
                  >

                    <div className="flex items-center justify-between gap-4 text-sm">

                      <span>
                        {
                          bucket.label
                        }
                      </span>

                      <span className="font-semibold">
                        {
                          bucket.count
                        }
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">

                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width:
                            getBarWidth(
                              bucket.count,
                              scoreMaximum
                            ),
                        }}
                      />

                    </div>

                  </div>
                )
              )
            }

          </div>

        </section>

      </div>

    </section>
  );
}