"use client";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import ObjectiveCard from "./objectivecard";

export type KeyResult = {
  id: number;
  title: string;
  target: string;
  current: string;
  score: string;
};

export type Objective = {
  id: number;
  title: string;
  description: string;
  weight: number;
  keyResults: KeyResult[];
};

const objectives: Objective[] = [
  {
    id: 1,
    title: "Objective Placeholder",
    description:
      "Objective description placeholder. This area will contain a description of the objective and explain the intended outcome.",
    weight: 30,
    keyResults: [
      {
        id: 1,
        title: "Key Result Placeholder",
        target: "—",
        current: "—",
        score: "—",
      },
      {
        id: 2,
        title: "Key Result Placeholder",
        target: "—",
        current: "—",
        score: "—",
      },
      {
        id: 3,
        title: "Key Result Placeholder",
        target: "—",
        current: "—",
        score: "—",
      },
    ],
  },
];

export default function Objectives() {
  return (
    <BuilderSection
      title="Objectives"
      toolbar={
        <div className="flex gap-2">
          <Button variant="outline">
            Configure
          </Button>

          <Button>
            + Add Objective
          </Button>
        </div>
      }
    >
      <CECard>
        <div className="space-y-8">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
            />
          ))}
        </div>
      </CECard>
    </BuilderSection>
  );
}