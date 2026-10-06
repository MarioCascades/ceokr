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


export default function RuntimeSummary({
  performanceInstance,
}: RuntimeSummaryProps) {

  const score =
    performanceInstance.overallScore ??
    0;

  const progress =
    performanceInstance.progress ??
    0;

  const status =
    performanceInstance.status;


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
          gap-x-5
          gap-y-1.5
        "
      >

        <span
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-muted-foreground
          "
        >
          Performance Summary
        </span>


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
            Overall Score
          </span>

          <span
            className="
              text-sm
              font-black
              text-primary
            "
          >
            {
              formatScore(
                score
              )
            }
          </span>

        </div>


        <div
          className="
            flex
            min-w-[170px]
            flex-1
            items-center
            gap-2
          "
        >

          <span
            className="
              shrink-0
              text-[10px]
              text-muted-foreground
            "
          >
            Progress
          </span>


          <div
            className="
              h-1.5
              min-w-16
              flex-1
              overflow-hidden
              rounded-full
              bg-muted
            "
          >

            <div
              className="
                h-full
                rounded-full
                bg-primary
                transition-all
              "
              style={{
                width:
                  `${Math.min(
                    Math.max(
                      progress,
                      0
                    ),
                    100
                  )}%`,
              }}
            />

          </div>


          <span
            className="
              text-[10px]
              font-bold
              text-foreground
            "
          >
            {
              formatProgress(
                progress
              )
            }
          </span>

        </div>


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
            Status
          </span>

          <span
            className="
              text-xs
              font-bold
              capitalize
              text-foreground
            "
          >
            {
              formatStatus(
                status
              )
            }
          </span>

        </div>

      </div>

    </section>

  );
}