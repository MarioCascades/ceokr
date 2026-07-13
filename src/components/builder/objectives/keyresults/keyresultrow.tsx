"use client";

import { Button } from "@/components/ui/button";

import type { BuilderKeyResult } from "@/lib/types/builderdocument";

interface KeyResultRowProps {
  keyResult: BuilderKeyResult;
}

export default function KeyResultRow({
  keyResult,
}: KeyResultRowProps) {
  return (
    <div className="rounded-lg border bg-white p-5">

      {/* ================= Title ================= */}

      <h5 className="text-lg font-semibold">
        {keyResult.title}
      </h5>

      {/* ================= Metrics ================= */}

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

      {/* ================= Actions ================= */}

      <div className="mt-6 flex justify-end">

        <Button
          variant="outline"
          size="sm"
        >
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

function Metric({
  label,
  value,
}: MetricProps) {
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