"use client";

import { Button } from "@/components/ui/button";

type KeyResult = {
  id: number;
  title: string;
  target: string;
  current: string;
  score: string;
};

type Objective = {
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
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold">
          Objectives
        </h2>

        <div className="flex gap-2">

          <Button variant="outline">
            ⚙ Configure
          </Button>

          <Button>
            + Add Objective
          </Button>

        </div>

      </div>

      {/* Objectives */}

      <div className="mt-8 space-y-8">

        {objectives.map((objective) => (

          <ObjectiveCard
            key={objective.id}
            objective={objective}
          />

        ))}

      </div>

    </section>
  );
}

interface ObjectiveCardProps {
  objective: Objective;
}

function ObjectiveCard({ objective }: ObjectiveCardProps) {
  return (
    <div className="rounded-xl border bg-slate-50 p-6">

      {/* Objective */}

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-2xl font-bold text-slate-900">
            🎯 {objective.title}
          </h3>

          <p className="mt-3 max-w-3xl text-slate-600">
            {objective.description}
          </p>

        </div>

        <div className="rounded-lg bg-white px-4 py-2 text-center shadow-sm">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Weight
          </p>

          <p className="mt-1 text-xl font-bold">
            {objective.weight}%
          </p>

        </div>

      </div>

      {/* Key Results */}

      <div className="mt-8">

        <div className="flex items-center justify-between">

          <h4 className="text-lg font-semibold">
            Key Results
          </h4>

          <Button variant="outline" size="sm">
            + Add Key Result
          </Button>

        </div>

        <div className="mt-4 grid gap-4">

          {objective.keyResults.map((kr) => (

            <KeyResultCard
              key={kr.id}
              keyResult={kr}
            />

          ))}

        </div>

      </div>

    </div>
  );
}

interface KeyResultCardProps {
  keyResult: KeyResult;
}

function KeyResultCard({ keyResult }: KeyResultCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5">

      <h5 className="text-lg font-semibold">
        {keyResult.title}
      </h5>

      <div className="mt-5 grid grid-cols-3 gap-6">

        <Metric
          label="Target"
          value={keyResult.target}
        />

        <Metric
          label="Current"
          value={keyResult.current}
        />

        <Metric
          label="Score"
          value={keyResult.score}
        />

      </div>

      <div className="mt-6 flex justify-end">

        <Button variant="outline" size="sm">
          Initiatives
        </Button>

      </div>

    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}