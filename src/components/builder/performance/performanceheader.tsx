export default function performanceheader() {
  return (
    <section className="rounded-xl border bg-white shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900">
            Employee Name Placeholder
          </h2>

          <p className="text-lg font-medium text-slate-600">
            Role Placeholder
          </p>

          <p className="text-sm leading-7 text-slate-500">
            Role description placeholder. This area will contain a brief
            description of the employee's responsibilities and expectations
            within the organization.
          </p>
        </div>

        <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Configure
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="OKR Timeframe"
          value="July 2026"
        />

        <MetricCard
          title="10-State"
          value="8 / 10"
        />

        <MetricCard
          title="Date Updated"
          value="July 7, 2026"
        />

        <MetricCard
          title="% Into Period"
          value="20%"
        />
      </div>
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-slate-50 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}