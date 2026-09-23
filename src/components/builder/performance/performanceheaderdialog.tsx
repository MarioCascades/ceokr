"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CEInput from "@/components/ui/ceinput";
import CETextArea from "@/components/ui/cetextarea";

import { useBuilder } from "@/components/builder/context/buildercontext";

import {
  BuilderPerformanceHeader,
  BuilderMetric,
} from "@/lib/types/builderdocument";

interface PerformanceHeaderDialogProps {
  performanceHeader: BuilderPerformanceHeader;

  open: boolean;

  onClose: () => void;
}

export default function PerformanceHeaderDialog({
  performanceHeader,
  open,
  onClose,
}: PerformanceHeaderDialogProps) {
  const {
    updatePerformanceHeader,
  } = useBuilder();

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    subtitle,
    setSubtitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    metrics,
    setMetrics,
  ] = useState<BuilderMetric[]>(
    []
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(
      performanceHeader.title
    );

    setSubtitle(
      performanceHeader.subtitle
    );

    setDescription(
      performanceHeader.description
    );

    setMetrics(
      performanceHeader.metrics
    );
  }, [
    performanceHeader,
    open,
  ]);

  function updateMetric(
    index: number,
    value: string
  ) {
    const updated = [
      ...metrics,
    ];

    updated[index] = {
      ...updated[index],
      value,
    };

    setMetrics(updated);
  }

  function handleSave() {
    updatePerformanceHeader({
      title,
      subtitle,
      description,
      metrics,
    });

    onClose();
  }

  return (
    <CEDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
      title="Configure Performance Header"
      description="Configure the reusable header displayed on the Performance Sheet."
      size="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        {/* ==================================================
            Title
        ================================================== */}

        <CEField
          label="Header Title"
          required
        >
          <CEInput
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Performance Review"
          />
        </CEField>

        {/* ==================================================
            Subtitle
        ================================================== */}

        <CEField
          label="Subtitle"
        >
          <CEInput
            value={subtitle}
            onChange={(e) =>
              setSubtitle(
                e.target.value
              )
            }
            placeholder="Performance Management"
          />
        </CEField>

        {/* ==================================================
            Description
        ================================================== */}

        <CEField
          label="Description"
        >
          <CETextArea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Describe the purpose or context of this performance sheet."
          />
        </CEField>

        {/* ==================================================
            Metrics
        ================================================== */}

        {metrics.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {metrics.map(
              (metric, index) => (
                <CEField
                  key={metric.id}
                  label={metric.title}
                >
                  <CEInput
                    value={metric.value}
                    onChange={(e) =>
                      updateMetric(
                        index,
                        e.target.value
                      )
                    }
                  />
                </CEField>
              )
            )}

          </div>
        )}

      </div>
    </CEDialog>
  );
}