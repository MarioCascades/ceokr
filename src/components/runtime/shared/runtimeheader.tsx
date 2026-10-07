import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import type {
  RuntimeSubject,
} from "@/lib/runtime/runtimeexecution";


interface RuntimeOrganization {
  id: string;
  company_name: string;
  logo_url: string | null;
}

interface RuntimeHeaderProps {
  document: BuilderDocument;
  organization: RuntimeOrganization;
  performanceInstance: PerformanceInstance;
  subject: RuntimeSubject | null;
}


function formatPerformanceMonth(
  performanceMonth: string
): string {
  const date = new Date(
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
    case "approved":
      return "bg-accent text-primary ring-border";

    case "submitted":
      return "bg-destructive/10 text-destructive ring-destructive/20";

    case "in_progress":
      return "bg-secondary text-primary ring-border";

    case "not_started":
    default:
      return "bg-muted text-muted-foreground ring-border";
  }
}


export default function RuntimeHeader({
  document,
  organization,
  performanceInstance,
  subject,
}: RuntimeHeaderProps) {

  const isOrganizationRuntime =
    subject === null;

  const displayName =
    subject?.displayName ??
    organization.company_name;

  const role =
    subject
      ? subject.roleTitle ||
        document.performanceHeader.title ||
        document.performanceHeader.subtitle
      : "Organization Performance";


  return (

    <section
      className="
        overflow-hidden
        rounded-xl
        border
        border-border/80
        bg-card
        shadow-sm
      "
    >

      <div
        className="
          relative
          overflow-hidden
          bg-primary
          px-3
          py-2.5
          text-primary-foreground
          sm:px-4
        "
      >

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-12
            -top-16
            h-32
            w-32
            rounded-full
            bg-secondary/10
            blur-2xl
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-2
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div
            className="
              min-w-0
              flex-1
            "
          >

            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >

              {organization.logo_url ? (

                <div
                  className="
                    flex
                    h-8
                    max-w-[140px]
                    shrink-0
                    items-center
                    overflow-hidden
                    rounded-md
                    border
                    border-white/15
                    bg-white/10
                    px-2
                  "
                >

                  <img
                    src={organization.logo_url}
                    alt={`${organization.company_name} logo`}
                    className="
                      block
                      max-h-6
                      max-w-[120px]
                      w-auto
                      object-contain
                      object-left
                    "
                  />

                </div>

              ) : (

                <div
                  className="
                    flex
                    h-8
                    shrink-0
                    items-center
                    rounded-md
                    border
                    border-white/10
                    bg-white/5
                    px-2
                  "
                >

                  <span
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-white/60
                    "
                  >
                    Organization
                  </span>

                </div>

              )}


              <p
                className="
                  min-w-0
                  truncate
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-secondary
                "
              >
                {
                  organization.company_name
                }
              </p>

            </div>


            <div
              className="
                mt-0.5
                flex
                flex-wrap
                items-baseline
                gap-x-2
                gap-y-0.5
              "
            >

              <h1
                className="
                  text-xl
                  font-black
                  leading-none
                  tracking-tight
                  sm:text-2xl
                "
              >
                {
                  displayName
                }
              </h1>


              {role && (

                <p
                  className="
                    text-xs
                    font-semibold
                    text-accent
                    sm:text-sm
                  "
                >
                  {role}
                </p>

              )}

            </div>

          </div>


          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5
            "
          >

            <div
              className="
                rounded-md
                border
                border-white/15
                bg-white/10
                px-2.5
                py-1
              "
            >

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-secondary
                "
              >
                Performance Month
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-bold
                  text-white
                  sm:text-sm
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
                rounded-md
                border
                border-white/15
                bg-white/10
                px-2.5
                py-1
              "
            >

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-secondary
                "
              >
                Status
              </p>

              <div
                className="
                  mt-0.5
                "
              >

                <span
                  className={`
                    inline-flex
                    items-center
                    rounded-full
                    px-2
                    py-0.5
                    text-[10px]
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


            {/* =====================================================
                CascadEffects Platform Branding
                -----------------------------------------------------
                This logo is always shown regardless of tenant.
                It uses the existing CECleanlogo.png asset.
               ===================================================== */}

            <div
              className="
                ml-1
                flex
                h-[52px]
                min-w-[170px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-md
                border
                border-white/15
                bg-white
                px-4
                py-2
                shadow-sm
              "
            >

              <img
                src="/logos/CECleanlogo.png"
                alt="CascadEffects"
                className="
                  block
                  h-auto
                  max-h-10
                  w-auto
                  max-w-[150px]
                  object-contain
                "
              />

            </div>

          </div>

        </div>

      </div>


      <div
        className="
          border-t
          border-border/70
          bg-card
          px-3
          py-1.5
          sm:px-4
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >

          <p
            className="
              shrink-0
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-primary
            "
          >
            {
              isOrganizationRuntime
                ? "Organization Performance"
                : "Performance Context"
            }
          </p>


          {!isOrganizationRuntime &&
            (
              subject?.roleDescription ||
              document.performanceHeader.description
            ) && (

            <p
              className="
                min-w-0
                truncate
                text-xs
                text-muted-foreground
              "
            >
              {
                subject?.roleDescription ||
                document.performanceHeader.description
              }
            </p>

          )}


          {!isOrganizationRuntime &&
            document.performanceHeader.metrics.length > 0 && (

            <div
              className="
                ml-auto
                hidden
                shrink-0
                items-center
                gap-5
                lg:flex
              "
            >

              {document.performanceHeader.metrics.map(
                (metric) => (

                  <div
                    key={
                      metric.id
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <span
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-muted-foreground
                      "
                    >
                      {
                        metric.title
                      }
                    </span>

                    <span
                      className="
                        text-xs
                        font-bold
                        text-primary
                      "
                    >
                      {
                        metric.value
                      }
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </section>

  );
}