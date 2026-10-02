"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import { useBuilder } from "@/components/builder/context/buildercontext";

import PerformanceHeaderDialog from "./performanceheaderdialog";

export default function PerformanceHeader() {
  const {
    builderDocument,
    editMode,
  } = useBuilder();

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const header =
    builderDocument.performanceHeader;

  return (
    <>
      <BuilderSection
        title="Performance Header"
        toolbar={
          editMode ? (
            <Button
              variant="outline"
              onClick={() =>
                setDialogOpen(true)
              }
            >
              Configure
            </Button>
          ) : undefined
        }
      >
        <CECard>
          <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="flex items-start justify-between">

              <div className="max-w-3xl space-y-2">

                <h2 className="text-3xl font-bold text-slate-900">
                  {header.title ||
                    "Performance Header"}
                </h2>

                {header.subtitle && (
                  <p className="text-lg font-medium text-slate-600">
                    {header.subtitle}
                  </p>
                )}

                {header.description && (
                  <p className="text-sm leading-7 text-slate-500">
                    {header.description}
                  </p>
                )}

              </div>

            </div>

            {/* ==================================================
                Metrics
            ================================================== */}

            {header.metrics.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                {header.metrics.map(
                  (metric) => (
                    <MetricCard
                      key={metric.id}
                      title={metric.title}
                      value={metric.value}
                    />
                  )
                )}

              </div>
            )}

            {/* ==================================================
                Empty State
            ================================================== */}

            {!header.title &&
              !header.subtitle &&
              !header.description &&
              header.metrics.length === 0 && (
                <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center">

                  <p className="text-sm font-medium text-slate-700">
                    Performance Header
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure the reusable header
                    for this Performance Sheet.
                  </p>

                  {editMode && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        setDialogOpen(true)
                      }
                    >
                      Configure Header
                    </Button>
                  )}

                </div>
              )}

          </div>
        </CECard>
      </BuilderSection>

      <PerformanceHeaderDialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
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