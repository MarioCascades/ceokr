"use client";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import type { BuilderObjective } from "@/lib/types/builderdocument";

type ObjectiveCardProps = {
  objective: BuilderObjective;

  onEdit: () => void;

  onDelete: () => void;
};

export default function ObjectiveCard({
  objective,
  onEdit,
  onDelete,
}: ObjectiveCardProps) {
  return (
    <CECard>
      <div className="space-y-6">

        {/* ================= Header ================= */}

        <div className="flex items-start justify-between">

          <div className="flex-1">

            <h3 className="text-lg font-semibold">
              {objective.title}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {objective.description}
            </p>

          </div>

          <div className="ml-6 text-right">

            <p className="text-xs uppercase text-slate-500">
              Weight
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {objective.weight}%
            </p>

          </div>

        </div>

        {/* ================= Key Results ================= */}

        <div className="space-y-3">

          {objective.keyResults.length === 0 ? (

            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">

              <p className="text-sm text-slate-400">
                No Key Results have been added yet.
              </p>

            </div>

          ) : (

            objective.keyResults.map((kr) => (

              <div
                key={kr.id}
                className="rounded-lg border bg-slate-50 p-4"
              >

                <div className="font-medium">
                  {kr.title}
                </div>

                <div className="mt-3 flex flex-wrap gap-6 text-sm text-slate-600">

                  <span>
                    Target: {kr.target}
                  </span>

                  <span>
                    Current: {kr.current}
                  </span>

                  <span>
                    Score: {kr.score}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

        {/* ================= Footer ================= */}

        <div className="flex justify-between">

          <Button>
            + Add Key Result
          </Button>

          <div className="flex gap-2">

            <Button
              variant="outline"
              onClick={onEdit}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </Button>

          </div>

        </div>

      </div>
    </CECard>
  );
}