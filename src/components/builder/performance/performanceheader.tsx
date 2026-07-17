"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import { useBuilder } from "@/components/builder/context/buildercontext";

import PerformanceHeaderDialog from "./performanceheaderdialog";

export default function PerformanceHeader() {
  const { builderDocument } = useBuilder();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <BuilderSection
        title="Performance Header"
        toolbar={
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            Configure
          </Button>
        }
      >
        <CECard>
          <div className="space-y-6">

            {/* Header */}

            <div className="flex items-start justify-between">

              <div className="max-w-3xl space-y-2">

                <h2 className="text-3xl font-bold text-slate-900">
                  {builderDocument.performanceHeader.employeeName}
                </h2>

                <p className="text-lg font-medium text-slate-600">
                  {builderDocument.performanceHeader.employeeRole}
                </p>

                <p className="text-sm leading-7 text-slate-500">
                  {builderDocument.performanceHeader.roleDescription}
                </p>

              </div>

            </div>

            {/* Metrics */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              {builderDocument.performanceHeader.metrics.map(
                (metric) => (
                  <MetricCard
                    key={metric.id}
                    title={metric.title}
                    value={metric.value}
                  />
                )
              )}

            </div>

          </div>
        </CECard>
      </BuilderSection>

      <PerformanceHeaderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        performanceHeader={
          builderDocument.performanceHeader
        }
      />
    </>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
}

function MetricCard({
  title,
  value,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-slate-50 p-5">

      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-xl font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}