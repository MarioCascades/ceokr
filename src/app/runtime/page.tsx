import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

import {
  loadRuntimeExecution,
} from "@/lib/runtime/runtimeexecution";

import {
  getOrganization,
} from "@/services/organization.service";

export default async function RuntimePage() {
  const organization =
    await getOrganization();

  if (!organization) {
    return (
      <main className="mx-auto max-w-7xl p-8">

        <h1 className="text-2xl font-semibold">
          No organization found
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create an organization before opening Runtime.
        </p>

      </main>
    );
  }

  const runtimeExecution =
    await loadRuntimeExecution(
      organization.id
    );

  if (!runtimeExecution) {
    return (
      <main className="mx-auto max-w-7xl p-8">

        <h1 className="text-2xl font-semibold">
          No active performance instance
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create an active assignment and Performance Instance before opening Runtime.
        </p>

      </main>
    );
  }

  return (
    <PerformanceSheet
      document={
        runtimeExecution
          .performanceSheet
          .document
      }

      keyResultProgress={
        runtimeExecution
          .keyResultProgress
      }

      organizationId={
        organization.id
      }

      performanceInstanceId={
        runtimeExecution
          .performanceInstance
          .id
      }

      performanceInstance={
        runtimeExecution
          .performanceInstance
      }

      reportingPeriod={
        runtimeExecution
          .reportingPeriod
      }
    />
  );
}