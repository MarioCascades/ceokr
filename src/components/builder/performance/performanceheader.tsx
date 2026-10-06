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
        <CECard className="border-[#B4C2D1]/70 bg-white shadow-[0_8px_30px_rgba(8,37,80,0.06)]">
          <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="flex items-start justify-between">

              <div className="max-w-3xl space-y-2">

                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E26D5C]">
                  Performance Header
                </p>

                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-[#082550]">
                  {header.title ||
                    "Performance Header"}
                </h2>

                {header.subtitle && (
                  <p className="text-lg font-medium text-[#272D2C]/70">
                    {header.subtitle}
                  </p>
                )}

                {header.description && (
                  <p className="text-sm leading-7 text-[#272D2C]/65">
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
                <div className="rounded-xl border border-dashed border-[#B4C2D1] bg-[#E9F4F8]/60 p-8 text-center">

                  <p className="text-sm font-bold text-[#082550]">
                    Performance Header
                  </p>

                  <p className="mt-1 text-sm text-[#272D2C]/65">
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
    <div className="rounded-xl border border-[#B4C2D1]/60 bg-[#F8FBFC] p-5">

      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#272D2C]/55">
        {title}
      </p>

      <p className="mt-3 text-xl font-black text-[#082550]">
        {value}
      </p>

    </div>
  );
}