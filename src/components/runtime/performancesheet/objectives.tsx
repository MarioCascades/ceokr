import { BuilderDocument } from "@/lib/types/builderdocument";

interface ObjectivesProps {
  document: BuilderDocument;
}

export default function Objectives({
  document,
}: ObjectivesProps) {
  return (
    <section className="space-y-6">
      {document.objectives.map((objective) => (
        <div
          key={objective.id}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {objective.title}
              </h2>

              <p className="text-muted-foreground">
                {objective.description}
              </p>
            </div>

            <div className="rounded-md border px-3 py-2">
              <p className="text-sm text-muted-foreground">
                Weight
              </p>

              <p className="font-semibold">
                {objective.weight}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {objective.keyResults.map((kr) => (
              <div
                key={kr.id}
                className="rounded-md border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {kr.title}
                  </h3>

                  <span className="text-sm text-muted-foreground">
                    Weight {kr.weight}%
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
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
        </div>
      ))}
    </section>
  );
}