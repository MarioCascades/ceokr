import { BuilderDocument } from "@/lib/types/builderdocument";

interface PerformanceHeaderProps {
  document: BuilderDocument;
}

export default function PerformanceHeader({
  document,
}: PerformanceHeaderProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {document.organization.companyName}
        </h1>

        <p className="text-muted-foreground">
          {document.performanceHeader.employeeName}
        </p>

        <p className="text-muted-foreground">
          {document.performanceHeader.employeeRole}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {document.performanceHeader.metrics.map((metric) => (
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
        ))}
      </div>
    </section>
  );
}