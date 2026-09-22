"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CEInput from "@/components/ui/ceinput";

import type {
  BuilderKeyResult,
  BuilderObjective,
} from "@/lib/types/builderdocument";

interface KeyResultDialogProps {
  keyResult: BuilderKeyResult | null;

  objectives: BuilderObjective[];

  currentObjectiveId: string;

  open: boolean;

  onClose: () => void;

  onSave: (
    keyResult: BuilderKeyResult,
    targetObjectiveId: string
  ) => void;
}

export default function KeyResultDialog({
  keyResult,
  objectives,
  currentObjectiveId,
  open,
  onClose,
  onSave,
}: KeyResultDialogProps) {
  const [title, setTitle] = useState("");

  const [target, setTarget] = useState("");

  const [weight, setWeight] = useState(0);

  const [measurementType, setMeasurementType] =
    useState<
      "percentage" |
      "numeric" |
      "financial"
    >("numeric");

  const [scoringMethod, setScoringMethod] =
    useState<
      "percent_into_period" |
      "percentage_of_target"
    >("percentage_of_target");

  const [targetObjectiveId, setTargetObjectiveId] =
    useState(currentObjectiveId);

  useEffect(() => {
    if (!open) return;

    if (keyResult) {
      setTitle(keyResult.title);

      setTarget(keyResult.target);

      setWeight(keyResult.weight);

      setMeasurementType(
        keyResult.measurementType ??
          "numeric"
      );

      setScoringMethod(
        keyResult.scoringMethod ??
          "percentage_of_target"
      );

      setTargetObjectiveId(
        currentObjectiveId
      );
    } else {
      setTitle("");

      setTarget("");

      setWeight(0);

      setMeasurementType("numeric");

      setScoringMethod(
        "percentage_of_target"
      );

      setTargetObjectiveId(
        currentObjectiveId
      );
    }
  }, [
    keyResult,
    open,
    currentObjectiveId,
  ]);

  function handleSave() {
    const updatedKeyResult: BuilderKeyResult = {
      id:
        keyResult?.id ??
        crypto.randomUUID(),

      title,

      target,

      /*
       * Runtime-owned values remain preserved
       * when editing an existing KR.
       *
       * New KRs start with empty runtime values.
       */
      current:
        keyResult?.current ?? "",

      score:
        keyResult?.score ?? "",

      weight,

      measurementType,

      scoringMethod,

      initiatives:
        keyResult?.initiatives ?? [],
    };

    onSave(
      updatedKeyResult,
      targetObjectiveId
    );

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
      title={
        keyResult
          ? "Edit Key Result"
          : "Add Key Result"
      }
      description="Configure the key result definition."
      size="lg"
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

        {/* ================= Objective ================= */}

        <CEField
          label="Objective"
          required
        >
          <select
            value={targetObjectiveId}
            onChange={(e) =>
              setTargetObjectiveId(
                e.target.value
              )
            }
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {objectives.map(
              (objective) => (
                <option
                  key={objective.id}
                  value={objective.id}
                >
                  {objective.title}
                </option>
              )
            )}
          </select>
        </CEField>

        {/* ================= Title ================= */}

        <CEField
          label="Key Result Title"
          required
        >
          <CEInput
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Increase Monthly Recurring Revenue"
          />
        </CEField>

        {/* ================= Target ================= */}

        <CEField label="Target">
          <CEInput
            value={target}
            onChange={(e) =>
              setTarget(e.target.value)
            }
            placeholder="100"
          />
        </CEField>

        {/* ================= Measurement ================= */}

        <CEField
          label="Measurement Type"
          required
        >
          <select
            value={measurementType}
            onChange={(e) =>
              setMeasurementType(
                e.target.value as
                  | "percentage"
                  | "numeric"
                  | "financial"
              )
            }
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="numeric">
              Numeric
            </option>

            <option value="financial">
              Financial ($)
            </option>
          </select>
        </CEField>

        {/* ================= Scoring ================= */}

        <CEField
          label="Scoring Method"
          required
        >
          <select
            value={scoringMethod}
            onChange={(e) =>
              setScoringMethod(
                e.target.value as
                  | "percent_into_period"
                  | "percentage_of_target"
              )
            }
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="percent_into_period">
              % Into Period
            </option>

            <option value="percentage_of_target">
              Percentage of Target
            </option>
          </select>
        </CEField>

        {/* ================= Weight ================= */}

        <CEField label="Weight (%)">
          <CEInput
            type="number"
            min={0}
            max={100}
            value={weight}
            onChange={(e) =>
              setWeight(
                Number(e.target.value)
              )
            }
          />
        </CEField>

      </div>
    </CEDialog>
  );
}