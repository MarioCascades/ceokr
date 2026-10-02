import { BuilderDocument } from "@/lib/types/builderdocument";

interface PerformanceHeaderProps {
  document: BuilderDocument;
}

export default function PerformanceHeader({
  document,
}: PerformanceHeaderProps) {
  const header =
    document.performanceHeader;

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2">

        {/* ==================================================
            Organization
        ================================================== */}

        <h1 className="text-3xl font-bold">
          {document.organization.companyName}
        </h1>

        {/* ==================================================
            Performance Header
        ================================================== */}

        {header.title && (
          <h2 className="text-xl font-semibold">
            {header.title}
          </h2>
        )}

        {header.subtitle && (
          <p className="text-muted-foreground">
            {header.subtitle}
          </p>
        )}

        {header.description && (
          <p className="text-sm leading-6 text-muted-foreground">
            {header.description}
          </p>
        )}

      </div>

      {/* ==================================================
          Metrics
      ================================================== */}

      {header.metrics.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          {header.metrics.map(
            (metric) => (
              <div
                key={metric.id}
                className="rounded-md border p-3"
              >
                <p className="text-sm text-muted-foreground">
                  {metric.title}
                </p>

                <p className="text-xl font-semibold">
                  {metric.value}
                </p>
              </div>
            )
          )}

        </div>
      )}
    </section>
  );
}