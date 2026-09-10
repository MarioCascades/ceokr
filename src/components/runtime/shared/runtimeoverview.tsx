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
      className="
        scroll-mt-6
        space-y-7
      "
    >

      {/* ==================================================
          Dashboard Header
      ================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-border/80
          bg-card
          px-6
          py-7
          shadow-[0_10px_35px_rgba(8,37,80,0.06)]
          md:px-8
          md:py-8
        "
      >

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-48
            w-48
            rounded-full
            bg-[#e9f4f8]
            blur-3xl
          "
        />

        <div className="relative">

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-primary
            "
          >
            Organization Dashboard
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              tracking-tight
              text-primary
              md:text-4xl
            "
          >
            Performance Overview
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            A live summary of the organization&apos;s
            current performance execution data.
          </p>

        </div>

      </div>


      {/* ==================================================
          KPI Cards
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* Assignments */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-border/80
            bg-card
            p-5
            shadow-[0_6px_24px_rgba(8,37,80,0.05)]
            transition-shadow
            duration-200
            hover:shadow-[0_10px_30px_rgba(8,37,80,0.09)]
          "
        >

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-primary
            "
          />

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Assignments
          </p>

          <p
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              text-primary
            "
          >
            {
              dashboard.totalAssignments
            }
          </p>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            <span className="font-semibold text-foreground">
              {
                dashboard.activeAssignments
              }
            </span>{" "}
            active
          </p>

        </div>


        {/* Performance Instances */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-border/80
            bg-card
            p-5
            shadow-[0_6px_24px_rgba(8,37,80,0.05)]
            transition-shadow
            duration-200
            hover:shadow-[0_10px_30px_rgba(8,37,80,0.09)]
          "
        >

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-[#b4c2d1]
            "
          />

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Performance Instances
          </p>

          <p
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              text-primary
            "
          >
            {
              dashboard.totalPerformanceInstances
            }
          </p>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            <span className="font-semibold text-foreground">
              {
                dashboard.activePerformanceInstances
              }
            </span>{" "}
            active
          </p>

        </div>


        {/* Average Score */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-border/80
            bg-card
            p-5
            shadow-[0_6px_24px_rgba(8,37,80,0.05)]
            transition-shadow
            duration-200
            hover:shadow-[0_10px_30px_rgba(8,37,80,0.09)]
          "
        >

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-[#e26d5c]
            "
          />

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Average Score
          </p>

          <p
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              text-primary
            "
          >
            {
              formatPercent(
                dashboard.averageScore
              )
            }
          </p>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Across performance instances
          </p>

        </div>


        {/* Average Progress */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-border/80
            bg-card
            p-5
            shadow-[0_6px_24px_rgba(8,37,80,0.05)]
            transition-shadow
            duration-200
            hover:shadow-[0_10px_30px_rgba(8,37,80,0.09)]
          "
        >

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-[#e9f4f8]
            "
          />

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Average Progress
          </p>

          <p
            className="
              mt-3
              text-4xl
              font-black
              tracking-tight
              text-primary
            "
          >
            {
              formatPercent(
                dashboard.averageProgress
              )
            }
          </p>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Monthly execution progress
          </p>

        </div>

      </div>


      {/* ==================================================
          Distribution Panels
      ================================================== */}

      <div
        className="
          grid
          gap-5
          lg:grid-cols-2
        "
      >

        {/* ==================================================
            Performance Status
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-border/80
            bg-card
            p-6
            shadow-[0_8px_30px_rgba(8,37,80,0.05)]
            md:p-7
          "
        >

          <div>

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Lifecycle
            </p>

            <h3
              className="
                mt-2
                text-xl
                font-black
                tracking-tight
                text-primary
              "
            >
              Performance Status
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Current lifecycle distribution.
            </p>

          </div>


          <div className="mt-7 space-y-5">

            {
              dashboard.statusCounts.map(
                (item) => (
                  <div
                    key={
                      item.status
                    }
                    className="space-y-2"
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        text-sm
                      "
                    >

                      <span className="capitalize text-foreground">
                        {
                          formatStatus(
                            item.status
                          )
                        }
                      </span>

                      <span className="font-bold text-primary">
                        {
                          item.count
                        }
                      </span>

                    </div>

                    <div
                      className="
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-[#e9f4f8]
                      "
                    >

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-primary
                          transition-all
                          duration-500
                        "
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


        {/* ==================================================
            Score Distribution
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-border/80
            bg-card
            p-6
            shadow-[0_8px_30px_rgba(8,37,80,0.05)]
            md:p-7
          "
        >

          <div>

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Performance Quality
            </p>

            <h3
              className="
                mt-2
                text-xl
                font-black
                tracking-tight
                text-primary
              "
            >
              Score Distribution
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Performance instances grouped by score.
            </p>

          </div>


          <div className="mt-7 space-y-5">

            {
              dashboard.scoreBuckets.map(
                (bucket) => (
                  <div
                    key={
                      bucket.label
                    }
                    className="space-y-2"
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        text-sm
                      "
                    >

                      <span className="text-foreground">
                        {
                          bucket.label
                        }
                      </span>

                      <span className="font-bold text-primary">
                        {
                          bucket.count
                        }
                      </span>

                    </div>

                    <div
                      className="
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-[#e9f4f8]
                      "
                    >

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-[#b4c2d1]
                          transition-all
                          duration-500
                        "
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