import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";


interface RuntimeSummaryProps {
  performanceInstance: PerformanceInstance;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
}


/* ==========================================================
   Formatting
========================================================== */

function formatDateUpdated(
  updatedAt: string
) {
  const date =
    new Date(updatedAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}


/* ==========================================================
   Percentage Into Performance Period
========================================================== */

function getPercentIntoPeriod(
  performanceMonth: string
) {
  const periodStart =
    new Date(
      `${performanceMonth}T00:00:00`
    );

  if (
    Number.isNaN(
      periodStart.getTime()
    )
  ) {
    return 0;
  }

  const periodEnd =
    new Date(
      periodStart.getFullYear(),
      periodStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

  const now =
    new Date();

  if (
    now <= periodStart
  ) {
    return 0;
  }

  if (
    now >= periodEnd
  ) {
    return 100;
  }

  const totalPeriod =
    periodEnd.getTime() -
    periodStart.getTime();

  const elapsed =
    now.getTime() -
    periodStart.getTime();

  return Math.min(
    Math.max(
      (elapsed / totalPeriod) * 100,
      0
    ),
    100
  );
}


/* ==========================================================
   Component
========================================================== */

export default function RuntimeSummary({
  performanceInstance,
  editing,
  saving,
  onEdit,
  onSave,
}: RuntimeSummaryProps) {

  const percentIntoPeriod =
    getPercentIntoPeriod(
      performanceInstance.performanceMonth
    );

  return (
    <section
      className="
        rounded-lg
        border
        border-border/70
        bg-card
        px-3
        py-2
        shadow-sm
        sm:px-4
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-x-4
          gap-y-2
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-wrap
            items-center
            gap-x-5
            gap-y-1.5
          "
        >
          <span
            className="
              shrink-0
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Monthly Performance Summary
          </span>

          {/* Date Updated */}
          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <span
              className="
                text-[10px]
                text-muted-foreground
              "
            >
              Date Updated
            </span>

            <span
              className="
                whitespace-nowrap
                text-xs
                font-bold
                text-foreground
              "
            >
              {
                formatDateUpdated(
                  performanceInstance.updatedAt
                )
              }
            </span>
          </div>

          {/* % Into Period */}
          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <span
              className="
                text-[10px]
                text-muted-foreground
              "
            >
              % Into Period
            </span>

            <span
              className="
                whitespace-nowrap
                text-xs
                font-bold
                text-foreground
              "
            >
              {
                Math.round(
                  percentIntoPeriod
                )
              }%
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!editing && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
            >
              Edit
            </button>
          )}

          {editing && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
