import type {
  BuilderObjective,
} from "@/lib/types/builderdocument";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

import KeyResultRow from "../keyresults/keyresultrow";

interface ObjectiveCardProps {
  objective: BuilderObjective;

  keyResultProgress: KeyResultProgress[];

  organizationId: string;

  performanceInstanceId: string;
}

export default function ObjectiveCard({
  objective,
  keyResultProgress,
  organizationId,
  performanceInstanceId,
}: ObjectiveCardProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

      {/* ==========================================
          Objective Header
      ========================================== */}

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

      {/* ==========================================
          Runtime Key Results
      ========================================== */}

      <div className="space-y-4">

        {objective.keyResults.map(
          (keyResult) => {

            const progress =
              keyResultProgress.find(
                (item) =>
                  item.keyResultId ===
                  keyResult.id
              );

            return (
              <KeyResultRow
                key={keyResult.id}
                keyResult={keyResult}
                progress={progress}
                organizationId={
                  organizationId
                }
                performanceInstanceId={
                  performanceInstanceId
                }
              />
            );
          }
        )}

      </div>

    </section>
  );
}