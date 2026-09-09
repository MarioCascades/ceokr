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
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

      <div className="px-6 py-6 md:px-8 md:py-7">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0">

            <p className="text-sm font-medium text-primary">
              {
                organizationName
              }
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              {
                displayName
              }
            </h1>

            {role && (
              <p className="mt-1 text-sm text-muted-foreground">
                {
                  role
                }
              </p>
            )}

            {isOrganizationRuntime ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Organization-wide performance view generated from
                the published Performance Sheet and current monthly
                performance data.
              </p>
            ) : (
              document.performanceHeader.roleDescription && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {
                    document
                      .performanceHeader
                      .roleDescription
                  }
                </p>
              )
            )}

          </div>


          <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-72">

            <div className="rounded-xl border bg-background px-4 py-3">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Performance Month
              </p>

              <p className="mt-1 text-base font-semibold">
                {
                  formatPerformanceMonth(
                    performanceInstance.performanceMonth
                  )
                }
              </p>

            </div>


            <div className="rounded-xl border bg-background px-4 py-3">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>

              <p className="mt-1 text-base font-semibold capitalize">
                {
                  formatStatus(
                    performanceInstance.status
                  )
                }
              </p>

            </div>

          </div>

        </div>

      </div>


      {!isOrganizationRuntime &&
        document.performanceHeader.metrics.length > 0 && (
          <div className="border-t bg-muted/20 px-6 py-5 md:px-8">

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

              {
                document.performanceHeader.metrics.map(
                  (metric) => (
                    <div
                      key={
                        metric.id
                      }
                    >

                      <p className="text-xs text-muted-foreground">
                        {
                          metric.title
                        }
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          metric.value
                        }
                      </p>

                    </div>
                  )
                )
              }

            </div>

          </div>
        )}

    </section>
  );
}