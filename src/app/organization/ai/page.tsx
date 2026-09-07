import { Suspense } from "react";

function AiConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-950">
          AI Configuration
        </h1>

        <p className="mt-2 text-muted-foreground">
          Configure AI-assisted planning, recommendations, analysis, and
          reporting.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Coming Soon
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              AI configuration will be introduced after the core performance
              management workflows and data models are established.
            </p>
          </div>

          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Future
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AiConfigurationPage />
    </Suspense>
  );
}