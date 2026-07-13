"use client";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import type { BuilderObjective } from "@/lib/types/builderdocument";

type ObjectiveCardProps = {
  objective: BuilderObjective;
};

export default function ObjectiveCard({
  objective,
}: ObjectiveCardProps) {
  return (
    <CECard>
      <div className="space-y-6">

        {/* ================= Header ================= */}

        <div className="flex items-start justify-between">

          <div>
            <h3 className="text-lg font-semibold">
              {objective.title}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {objective.description}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">
              Weight
            </p>

            <p className="text-xl font-bold">
              {objective.weight}%
            </p>
          </div>

        </div>

        {/* ================= Key Results ================= */}

        <div className="space-y-3">

          {objective.keyResults.map((kr) => (

            <div
              key={kr.id}
              className="rounded-md border p-4"
            >
              <div className="font-medium">
                {kr.title}
              </div>

              <div className="mt-2 flex gap-6 text-sm text-slate-600">
                <span>Target: {kr.target}</span>
                <span>Current: {kr.current}</span>
                <span>Score: {kr.score}</span>
              </div>

            </div>

          ))}

        </div>

        {/* ================= Footer ================= */}

        <div className="flex justify-end gap-2">

          <Button variant="outline">
            Edit
          </Button>

          <Button variant="outline">
            Delete
          </Button>

        </div>

      </div>
    </CECard>
  );
}