import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";
import { loadRuntimeExecution } from "@/lib/runtime/runtimeexecution";
import { getOrganization } from "@/services/organization.service";

interface RuntimePageProps {
  searchParams: Promise<{
    organizationId?: string;
    subjectId?: string;
  }>;
}

export default async function RuntimePage({
  searchParams,
}: RuntimePageProps) {
  const params = await searchParams;

  const organization = await getOrganization(
    params.organizationId
  );

  if (!organization) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Organization not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested organization could not be found.
        </p>
      </main>
    );
  }

  const runtimeExecution =
    await loadRuntimeExecution(
      organization.id,
      params.subjectId
    );

  if (!runtimeExecution) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Performance execution not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          No active performance execution is available
          for this organization and member.
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

      objectives={
        runtimeExecution.objectives
      }

      keyResultProgress={
        runtimeExecution.keyResultProgress
      }

      organizationId={
        organization.id
      }

      performanceInstanceId={
        runtimeExecution
          .performanceInstance.id
      }

      performanceInstance={
        runtimeExecution
          .performanceInstance
      }

      subject={
        runtimeExecution.subject
      }
    />
  );
}