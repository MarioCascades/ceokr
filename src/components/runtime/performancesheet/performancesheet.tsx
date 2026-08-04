import { BuilderDocument } from "@/lib/types/builderdocument";

interface PerformanceSheetProps {
  document: BuilderDocument;
}

export default function PerformanceSheet({
  document,
}: PerformanceSheetProps) {
  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8">

      {/* ======================================================
          Organization
      ====================================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h1 className="text-3xl font-bold">
          {document.organization.companyName}
        </h1>

        {document.organization.tagline && (
          <p className="mt-2 text-muted-foreground">
            {document.organization.tagline}
          </p>
        )}

      </section>

      {/* ======================================================
          Performance Header
      ====================================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h2 className="text-2xl font-semibold">
          {document.performanceHeader.employeeName}
        </h2>

        <p className="text-muted-foreground">
          {document.performanceHeader.employeeRole}
        </p>

        <p className="mt-2">
          {document.performanceHeader.roleDescription}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          {document.performanceHeader.metrics.map((metric) => (

            <div
              key={metric.id}
              className="rounded-md border p-4"
            >
              <p className="text-sm text-muted-foreground">
                {metric.title}
              </p>

              <p className="mt-2 text-xl font-bold">
                {metric.value}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ======================================================
          Objectives
      ====================================================== */}

      {document.objectives.map((objective) => (

        <section
          key={objective.id}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-semibold">
                {objective.title}
              </h2>

              <p className="text-muted-foreground">
                {objective.description}
              </p>

            </div>

            <div className="rounded-md border px-4 py-2">

              <p className="text-sm text-muted-foreground">
                Weight
              </p>

              <p className="text-lg font-semibold">
                {objective.weight}%
              </p>

            </div>

          </div>

          {/* ===============================================
              Key Results
          =============================================== */}

          <div className="space-y-4">

            {objective.keyResults.map((kr) => (

              <div
                key={kr.id}
                className="rounded-md border p-4"
              >

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-medium">
                    {kr.title}
                  </h3>

                  <span className="text-sm text-muted-foreground">
                    Weight {kr.weight}%
                  </span>

                </div>

                <div className="mt-6 grid grid-cols-3 gap-6">

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Target
                    </p>

                    <p>{kr.target}</p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Current
                    </p>

                    <p>{kr.current}</p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Score
                    </p>

                    <p>{kr.score}</p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

      ))}

      {/* ======================================================
          Comments
      ====================================================== */}

      <section className="rounded-lg border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          {document.comments.label}
        </h2>

        <textarea
          placeholder={document.comments.placeholder}
          className="mt-4 min-h-[140px] w-full rounded-md border p-4"
          readOnly
        />

        <p className="mt-2 text-sm text-muted-foreground">
          {document.comments.helpText}
        </p>

      </section>

    </main>
  );
}