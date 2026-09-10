import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  RuntimeSubject,
} from "@/lib/runtime/runtimeexecution";

interface RuntimeHeaderProps {
  document: BuilderDocument;

  performanceInstance: PerformanceInstance;

  subject: RuntimeSubject | null;
}

function formatPerformanceMonth(
  performanceMonth: string
): string {
  const date =
    new Date(
      `${performanceMonth}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return performanceMonth;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

function formatStatus(
  status: PerformanceInstance["status"]
): string {
  return status.replaceAll(
    "_",
    " "
  );
}

function getStatusClasses(
  status: PerformanceInstance["status"]
): string {
  switch (status) {
    case "completed":
      return "bg-[#e9f4f8] text-[#082550] ring-[#b4c2d1]";

    case "approved":
      return "bg-[#e9f4f8] text-[#082550] ring-[#b4c2d1]";

    case "submitted":
      return "bg-[#f7eee9] text-[#8f4035] ring-[#e26d5c]/30";

    case "in_progress":
      return "bg-[#eef3f7] text-[#082550] ring-[#b4c2d1]";

    case "not_started":
    default:
      return "bg-[#f5f7f9] text-[#5f6d78] ring-[#d7e0e7]";
  }
}

export default function RuntimeHeader({
  document,

  performanceInstance,

  subject,

}: RuntimeHeaderProps) {

  const isOrganizationRuntime =
    subject === null;

  const displayName =
    subject?.displayName ??
    document.organization.companyName;

  const role =
    subject
      ? document.performanceHeader.employeeRole
      : "Organization Performance";

  const organizationName =
    document.organization.companyName;

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border/80
        bg-card
        shadow-[0_12px_40px_rgba(8,37,80,0.07)]
      "
    >

      {/* ==================================================
          Primary Header
      ================================================== */}

      <div
        className="
          relative
          overflow-hidden
          bg-primary
          px-6
          py-7
          text-primary-foreground
          md:px-8
          md:py-8
        "
      >

        {/* Decorative brand field */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-56
            w-56
            rounded-full
            bg-[#b4c2d1]/10
            blur-2xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-24
            right-24
            h-40
            w-40
            rounded-full
            bg-[#e9f4f8]/10
            blur-2xl
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-7
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          {/* ==================================================
              Identity
          ================================================== */}

          <div className="min-w-0">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#b4c2d1]
              "
            >
              {organizationName}
            </p>

            <h1
              className="
                mt-3
                max-w-4xl
                text-3xl
                font-black
                leading-tight
                tracking-tight
                md:text-4xl
                lg:text-5xl
              "
            >
              {displayName}
            </h1>

            {role && (
              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-[#e9f4f8]
                  md:text-base
                "
              >
                {role}
              </p>
            )}

          </div>


          {/* ==================================================
              Context
          ================================================== */}

          <div
            className="
              grid
              shrink-0
              grid-cols-2
              gap-2
              sm:gap-3
            "
          >

            <div
              className="
                min-w-36
                rounded-xl
                border
                border-white/15
                bg-white/10
                px-4
                py-3
                backdrop-blur-sm
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#b4c2d1]
                "
              >
                Performance Month
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-bold
                  text-white
                  sm:text-base
                "
              >
                {
                  formatPerformanceMonth(
                    performanceInstance.performanceMonth
                  )
                }
              </p>

            </div>


            <div
              className="
                min-w-36
                rounded-xl
                border
                border-white/15
                bg-white/10
                px-4
                py-3
                backdrop-blur-sm
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#b4c2d1]
                "
              >
                Status
              </p>

              <div className="mt-1">

                <span
                  className={`
                    inline-flex
                    items-center
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-bold
                    capitalize
                    ring-1
                    ring-inset
                    ${getStatusClasses(
                      performanceInstance.status
                    )}
                  `}
                >
                  {
                    formatStatus(
                      performanceInstance.status
                    )
                  }
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          Description / Metrics
      ================================================== */}

      <div
        className="
          border-t
          border-border/80
          bg-card
          px-6
          py-6
          md:px-8
        "
      >

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >

          {/* Description */}

          <div className="max-w-3xl">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              {isOrganizationRuntime
                ? "Organization Performance"
                : "Performance Context"}
            </p>

            {isOrganizationRuntime ? (
              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Organization-wide performance view generated from
                the published Performance Sheet and current monthly
                performance data.
              </p>
            ) : (
              document.performanceHeader.roleDescription && (
                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  {
                    document
                      .performanceHeader
                      .roleDescription
                  }
                </p>
              )
            )}

          </div>


          {/* Employee Metrics */}

          {!isOrganizationRuntime &&
            document.performanceHeader.metrics.length > 0 && (

            <div
              className="
                grid
                shrink-0
                grid-cols-2
                gap-x-8
                gap-y-4
                border-t
                border-border/70
                pt-5
                sm:grid-cols-4
                lg:border-l
                lg:border-t-0
                lg:pl-8
                lg:pt-0
              "
            >

              {
                document.performanceHeader.metrics.map(
                  (metric) => (
                    <div
                      key={
                        metric.id
                      }
                      className="min-w-24"
                    >

                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-muted-foreground
                        "
                      >
                        {
                          metric.title
                        }
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-bold
                          text-primary
                        "
                      >
                        {
                          metric.value
                        }
                      </p>

                    </div>
                  )
                )
              }

            </div>

          )}

        </div>

      </div>

    </section>
  );
}