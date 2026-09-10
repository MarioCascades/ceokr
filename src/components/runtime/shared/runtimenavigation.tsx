"use client";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";


interface RuntimeNavigationProps {
  organizationId: string;

  members: UserManagementRecord[];

  selectedSubjectId?: string;

  performanceMonth: string;

  performanceMonths: string[];
}


function getDisplayName(
  record: UserManagementRecord
): string {
  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
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
  ).format(
    date
  );
}


function buildRuntimeHref(
  organizationId: string,

  subjectId: string | undefined,

  performanceMonth: string
): string {

  const params =
    new URLSearchParams();

  params.set(
    "organizationId",
    organizationId
  );

  if (subjectId) {
    params.set(
      "subjectId",
      subjectId
    );
  }

  params.set(
    "performanceMonth",
    performanceMonth
  );

  return `/runtime?${params.toString()}`;
}


export default function RuntimeNavigation({
  organizationId,

  members,

  selectedSubjectId,

  performanceMonth,

  performanceMonths,

}: RuntimeNavigationProps) {

  const dashboardHref =
    buildRuntimeHref(
      organizationId,

      undefined,

      performanceMonth
    );


  function handleMonthChange(
    event:
      React.ChangeEvent<HTMLSelectElement>
  ) {

    const selectedMonth =
      event.target.value;

    if (
      !selectedMonth
    ) {
      return;
    }

    window.location.href =
      buildRuntimeHref(
        organizationId,

        selectedSubjectId,

        selectedMonth
      );
  }


  return (
    <nav
      aria-label="Performance navigation"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border/80
        bg-card
        shadow-[0_8px_30px_rgba(8,37,80,0.06)]
      "
    >

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border/70
          bg-background
          px-3
          py-3
          md:flex-row
          md:items-center
          md:gap-1
          md:px-4
        "
      >

        {/* ==================================================
            Platform / Context Label
        ================================================== */}

        <div
          className="
            hidden
            items-center
            border-r
            border-border
            pr-4
            md:mr-2
            md:flex
          "
        >

          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-primary
            "
          >
            Performance
          </span>

        </div>


        {/* ==================================================
            Dashboard
        ================================================== */}

        <a
          href={
            dashboardHref
          }
          className={`
            relative
            rounded-xl
            px-4
            py-2.5
            text-sm
            font-semibold
            transition-all
            duration-200
            ${
              !selectedSubjectId
                ? `
                  bg-primary
                  text-primary-foreground
                  shadow-sm
                `
                : `
                  text-foreground
                  hover:bg-accent
                  hover:text-accent-foreground
                `
            }
          `}
        >
          Dashboard

          {!selectedSubjectId && (
            <span
              aria-hidden="true"
              className="
                absolute
                inset-x-3
                -bottom-2
                h-0.5
                rounded-full
                bg-primary
              "
            />
          )}
        </a>


        {/* ==================================================
            Member Divider
        ================================================== */}

        {members.length > 0 && (
          <div
            aria-hidden="true"
            className="
              mx-2
              hidden
              h-6
              w-px
              bg-border
              md:block
            "
          />
        )}


        {/* ==================================================
            Members
        ================================================== */}

        <div
          className="
            flex
            min-w-0
            gap-1
            overflow-x-auto
            pb-1
            md:pb-0
          "
        >

          {members.map(
            (
              member
            ) => {

              const href =
                buildRuntimeHref(
                  organizationId,

                  member.user.id,

                  performanceMonth
                );

              const isSelected =
                selectedSubjectId ===
                member.user.id;

              return (
                <a
                  key={
                    member.user.id
                  }
                  href={
                    href
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      isSelected
                        ? `
                          bg-accent
                          text-accent-foreground
                          ring-1
                          ring-primary/15
                        `
                        : `
                          text-foreground
                          hover:bg-accent
                          hover:text-accent-foreground
                        `
                    }
                  `}
                >
                  {
                    getDisplayName(
                      member
                    )
                  }
                </a>
              );
            }
          )}

        </div>


        {/* ==================================================
            Month Navigation
        ================================================== */}

        <div
          className="
            flex
            w-full
            shrink-0
            items-center
            gap-3
            border-t
            border-border/70
            pt-3
            md:ml-auto
            md:w-auto
            md:border-t-0
            md:border-l
            md:pl-4
            md:pt-0
          "
        >

          <div
            className="
              hidden
              shrink-0
              lg:block
            "
          >

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-muted-foreground
              "
            >
              Performance Month
            </p>

          </div>


          <label
            htmlFor="runtime-performance-month"
            className="
              sr-only
            "
          >
            Select performance month
          </label>

          <select
            id="runtime-performance-month"
            value={
              performanceMonth
            }
            onChange={
              handleMonthChange
            }
            className="
              min-w-0
              flex-1
              rounded-xl
              border
              border-[#b4c2d1]
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-primary
              outline-none
              transition-all
              duration-200
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
              md:w-[210px]
              md:flex-none
            "
          >

            {performanceMonths.map(
              (
                month
              ) => (

                <option
                  key={
                    month
                  }
                  value={
                    month
                  }
                >
                  {
                    formatPerformanceMonth(
                      month
                    )
                  }
                </option>

              )
            )}

          </select>

        </div>

      </div>

    </nav>
  );
}