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


/* ==========================================================
   Helpers
========================================================== */

function getDisplayName(
  record: UserManagementRecord
): string {

  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}


/* ==========================================================
   Performance Month Helpers

   Runtime always exposes:

   Current Month
   +
   Previous 12 Months

   This gives the user a fixed 13-month working window for
   entering and reviewing historical performance.
========================================================== */

function getCurrentPerformanceMonth(): string {

  const now =
    new Date();

  return [
    now
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),

    (
      now.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


function addMonths(
  performanceMonth: string,
  amount: number
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

  date.setUTCMonth(
    date.getUTCMonth() +
      amount
  );

  return [
    date
      .getUTCFullYear()
      .toString()
      .padStart(4, "0"),

    (
      date.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0"),

    "01",
  ].join("-");
}


function getAvailablePerformanceMonths(): string[] {

  const currentMonth =
    getCurrentPerformanceMonth();

  return Array.from(
    {
      length: 13,
    },
    (
      _,
      index
    ) =>
      addMonths(
        currentMonth,
        -index
      )
  );
}


function formatMonthName(
  month: number
): string {

  const date =
    new Date(
      Date.UTC(
        2026,
        month - 1,
        1
      )
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      timeZone: "UTC",
    }
  ).format(
    date
  );
}


function getYear(
  performanceMonth: string
): string {

  return performanceMonth.slice(
    0,
    4
  );
}


function getMonthNumber(
  performanceMonth: string
): string {

  return performanceMonth.slice(
    5,
    7
  );
}


/* ==========================================================
   Runtime URL
========================================================== */

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


/* ==========================================================
   Runtime Navigation
========================================================== */

export default function RuntimeNavigation({

  organizationId,

  members,

  selectedSubjectId,

  performanceMonth,

  performanceMonths,

}: RuntimeNavigationProps) {

  /*
   * The prop is retained for compatibility with existing
   * Runtime components.
   *
   * The navigation itself intentionally provides the full
   * current + previous 12 month window regardless of whether
   * a Performance Instance already exists.
   */
  const availablePerformanceMonths =
    getAvailablePerformanceMonths();

  const currentYear =
    getYear(
      performanceMonth
    );

  const currentMonth =
    getMonthNumber(
      performanceMonth
    );


  /* ========================================================
     Available Years
  ======================================================== */

  const availableYears =
    Array.from(
      new Set(
        availablePerformanceMonths.map(
          (month) =>
            getYear(month)
        )
      )
    ).sort(
      (a, b) =>
        Number(b) -
        Number(a)
    );


  /* ========================================================
     Available Months For Selected Year
  ======================================================== */

  const availableMonthsForYear =
    availablePerformanceMonths
      .filter(
        (month) =>
          getYear(month) ===
          currentYear
      )
      .map(
        (month) =>
          getMonthNumber(month)
      )
      .sort(
        (a, b) =>
          Number(a) -
          Number(b)
      );


  /* ========================================================
     Dashboard URL
  ======================================================== */

  const dashboardHref =
    buildRuntimeHref(
      organizationId,
      undefined,
      performanceMonth
    );


  /* ========================================================
     Year Change
  ======================================================== */

  function handleYearChange(
    event:
      React.ChangeEvent<HTMLSelectElement>
  ) {

    const selectedYear =
      event.target.value;

    if (
      !selectedYear
    ) {
      return;
    }

    /*
     * Keep the current month if it exists in the selected
     * year. Otherwise select the first valid month available
     * in that year.
     */
    const currentMonthStillValid =
      availablePerformanceMonths.includes(
        `${selectedYear}-${currentMonth}-01`
      ) ||
      availablePerformanceMonths.includes(
        `${selectedYear}-${currentMonth}`
      );

    let nextMonth =
      currentMonth;

    if (
      !currentMonthStillValid
    ) {

      const firstAvailable =
        availablePerformanceMonths.find(
          (month) =>
            getYear(month) ===
            selectedYear
        );

      if (
        firstAvailable
      ) {

        nextMonth =
          getMonthNumber(
            firstAvailable
          );

      }

    }

    const nextPerformanceMonth =
      `${selectedYear}-${nextMonth}`;

    window.location.href =
      buildRuntimeHref(
        organizationId,
        selectedSubjectId,
        nextPerformanceMonth
      );
  }


  /* ========================================================
     Month Change
  ======================================================== */

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

    const nextPerformanceMonth =
      `${currentYear}-${selectedMonth}`;

    /*
     * Only allow months that are inside the 13-month Runtime
     * window.
     */
    const normalizedMonth =
      `${nextPerformanceMonth}-01`;

    if (
      !availablePerformanceMonths.includes(
        normalizedMonth
      )
    ) {
      return;
    }

    window.location.href =
      buildRuntimeHref(
        organizationId,
        selectedSubjectId,
        nextPerformanceMonth
      );
  }


  return (

    <nav
      aria-label="Performance navigation"
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
          flex
          flex-col
          gap-2
          border-b
          border-border/70
          bg-background
          px-2
          py-2
          md:flex-row
          md:items-center
          md:gap-1
          md:px-3
        "
      >

        {/* ==================================================
            Platform Label
        ================================================== */}

        <div
          className="
            hidden
            items-center
            border-r
            border-border
            pr-3
            md:mr-1
            md:flex
          "
        >

          <span
            className="
              text-[10px]
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
            rounded-lg
            px-3
            py-1.5
            text-xs
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
                -bottom-1.5
                h-0.5
                rounded-full
                bg-primary
              "
            />

          )}

        </a>


        {/* ==================================================
            Performance Subjects
        ================================================== */}

        {members.length > 0 && (

          <div
            aria-hidden="true"
            className="
              mx-1
              hidden
              h-5
              w-px
              bg-border
              md:block
            "
          />

        )}


        <div
          className="
            flex
            min-w-0
            gap-0.5
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
                    rounded-lg
                    px-3
                    py-1.5
                    text-xs
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
            Performance Month
        ================================================== */}

        <div
          className="
            flex
            w-full
            shrink-0
            items-center
            gap-2
            border-t
            border-border/70
            pt-2
            md:ml-auto
            md:w-auto
            md:border-t-0
            md:border-l
            md:pl-3
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
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-muted-foreground
              "
            >
              Performance Month
            </p>

          </div>


          {/* ==================================================
              Year Selector
          ================================================== */}

          <label
            htmlFor="runtime-performance-year"
            className="sr-only"
          >
            Select performance year
          </label>

          <select
            id="runtime-performance-year"
            value={
              currentYear
            }
            onChange={
              handleYearChange
            }
            className="
              rounded-lg
              border
              border-input
              bg-background
              px-2.5
              py-1.5
              text-xs
              font-bold
              text-primary
              outline-none
              transition-all
              duration-200
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          >

            {availableYears.map(
              (
                year
              ) => (

                <option
                  key={
                    year
                  }
                  value={
                    year
                  }
                >
                  {
                    year
                  }
                </option>

              )
            )}

          </select>


          {/* ==================================================
              Month Selector
          ================================================== */}

          <label
            htmlFor="runtime-performance-month"
            className="sr-only"
          >
            Select performance month
          </label>

          <select
            id="runtime-performance-month"
            value={
              currentMonth
            }
            onChange={
              handleMonthChange
            }
            className="
              min-w-0
              rounded-lg
              border
              border-input
              bg-background
              px-2.5
              py-1.5
              text-xs
              font-bold
              text-primary
              outline-none
              transition-all
              duration-200
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
              md:w-[130px]
            "
          >

            {availableMonthsForYear.map(
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
                    formatMonthName(
                      Number(month)
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