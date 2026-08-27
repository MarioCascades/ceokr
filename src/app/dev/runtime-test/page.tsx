import { updateRuntimeKeyResultProgress } from "@/lib/runtime/updatekeyresultprogress";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findKeyResultProgressByPerformanceInstance,
} from "@/lib/repositories/keyresultprogressrepository";

const ORGANIZATION_ID =
  "e18bca45-874f-4120-8685-1461e992a3b6";

const ASSIGNMENT_ID =
  "305d2f52-870e-4606-9038-2d39e3e237e4";

export default async function RuntimeTestPage() {
  try {
    /*
     * Find the Performance Instance created
     * for our development assignment.
     */

    const performanceInstances =
      await findPerformanceInstancesByOrganization(
        ORGANIZATION_ID
      );

    const performanceInstance =
      performanceInstances.find(
        (instance) =>
          instance.assignmentId ===
          ASSIGNMENT_ID
      );

    if (!performanceInstance) {
      throw new Error(
        "No Performance Instance found for the development assignment."
      );
    }

    /*
     * Load Runtime Key Result Progress.
     */

    const progressRecords =
      await findKeyResultProgressByPerformanceInstance(
        performanceInstance.id
      );

    if (progressRecords.length === 0) {
      throw new Error(
        "No Key Result Progress records found for the Performance Instance."
      );
    }

    const keyResultProgress =
      progressRecords[0];

    /*
     * Execute a Runtime update.
     *
     * This is intentionally a development-only
     * mutation test.
     */

    const result =
      await updateRuntimeKeyResultProgress({
        organizationId:
          ORGANIZATION_ID,

        performanceInstanceId:
          performanceInstance.id,

        keyResultProgressId:
          keyResultProgress.id,

        currentValue:
          75,

        score:
          75,

        employeeComment:
          "Development Runtime update test.",

        managerComment:
          undefined,

        status:
          "in_progress",
      });

    return (
      <main className="mx-auto max-w-5xl space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-bold">
            Runtime Execution Test
          </h1>

          <p className="mt-2 text-muted-foreground">
            Development-only Runtime mutation test.
          </p>
        </div>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            Performance Instance
          </h2>

          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(
              result.performanceInstance,
              null,
              2
            )}
          </pre>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            Key Result Progress
          </h2>

          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(
              result.keyResultProgress,
              null,
              2
            )}
          </pre>
        </section>

        <section className="rounded-lg border border-green-300 bg-green-50 p-6">
          <h2 className="font-semibold text-green-700">
            Runtime Update Successful
          </h2>

          <p className="mt-2 text-sm text-green-700">
            The Key Result Progress record was updated
            and the Performance Instance aggregate was
            recalculated.
          </p>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-bold">
          Runtime Execution Test
        </h1>

        <section className="mt-6 rounded-lg border border-red-300 p-6">
          <p className="font-semibold text-red-600">
            Runtime execution failed
          </p>

          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
            {error instanceof Error
              ? error.message
              : String(error)}
          </pre>
        </section>
      </main>
    );
  }
}