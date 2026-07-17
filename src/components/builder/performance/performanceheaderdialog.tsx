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
  const { updatePerformanceHeader } = useBuilder();

  const [employeeName, setEmployeeName] = useState("");

  const [employeeRole, setEmployeeRole] = useState("");

  const [roleDescription, setRoleDescription] =
    useState("");

  const [metrics, setMetrics] = useState<
    BuilderMetric[]
  >([]);

  useEffect(() => {
    if (!open) return;

    setEmployeeName(
      performanceHeader.employeeName
    );

    setEmployeeRole(
      performanceHeader.employeeRole
    );

    setRoleDescription(
      performanceHeader.roleDescription
    );

    setMetrics(performanceHeader.metrics);
  }, [performanceHeader, open]);

  function updateMetric(
    index: number,
    value: string
  ) {
    const updated = [...metrics];

    updated[index] = {
      ...updated[index],
      value,
    };

    setMetrics(updated);
  }

  function handleSave() {
    updatePerformanceHeader({
      employeeName,
      employeeRole,
      roleDescription,
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
      description="Configure the employee header displayed on the Performance Sheet."
      size="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        <CEField
          label="Employee Name"
          required
        >
          <CEInput
            value={employeeName}
            onChange={(e) =>
              setEmployeeName(
                e.target.value
              )
            }
          />
        </CEField>

        <CEField
          label="Employee Role"
        >
          <CEInput
            value={employeeRole}
            onChange={(e) =>
              setEmployeeRole(
                e.target.value
              )
            }
          />
        </CEField>

        <CEField
          label="Role Description"
        >
          <CETextArea
            value={roleDescription}
            onChange={(e) =>
              setRoleDescription(
                e.target.value
              )
            }
          />
        </CEField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {metrics.map((metric, index) => (
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
          ))}

        </div>

      </div>
    </CEDialog>
  );
}