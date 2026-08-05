import { BuilderObjective } from "@/lib/types/builderdocument";

interface ObjectiveCardProps {
  objective: BuilderObjective;
}

export default function ObjectiveCard({
  objective,
}: ObjectiveCardProps) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">

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

      <div className="space-y-4">

        {objective.keyResults.map((kr) => (

          <div
            key={kr.id}
            className="rounded-lg border bg-gray-50 p-5"
          >

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold">
                {kr.title}
              </h3>

              <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {kr.weight}% Weight
              </span>

            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">

              <div>

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Target
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {kr.target}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Current
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {kr.current}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Score
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {kr.score}
                </p>

              </div>

            </div>

            <div className="mt-6">

              <div className="h-3 w-full rounded-full bg-gray-200">

                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{ width: "0%" }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}