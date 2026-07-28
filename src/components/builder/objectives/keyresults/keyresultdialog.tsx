"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CEInput from "@/components/ui/ceinput";

import { BuilderKeyResult } from "@/lib/types/builderdocument";

interface KeyResultDialogProps {
  keyResult: BuilderKeyResult | null;

  open: boolean;

  onClose: () => void;

  onSave: (keyResult: BuilderKeyResult) => void;
}

export default function KeyResultDialog({
  keyResult,
  open,
  onClose,
  onSave,
}: KeyResultDialogProps) {
  const [title, setTitle] = useState("");

  const [target, setTarget] = useState("");

  const [current, setCurrent] = useState("");

  const [score, setScore] = useState("");

  const [weight, setWeight] = useState(0);

  useEffect(() => {
    if (!open) return;

    if (keyResult) {
      setTitle(keyResult.title);
      setTarget(keyResult.target);
      setCurrent(keyResult.current);
      setScore(keyResult.score);
      setWeight(keyResult.weight);
    } else {
      setTitle("");
      setTarget("");
      setCurrent("");
      setScore("");
      setWeight(0);
    }
  }, [keyResult, open]);

  function handleSave() {
    const updatedKeyResult: BuilderKeyResult = {
      id: keyResult?.id ?? crypto.randomUUID(),

      title,

      target,

      current,

      score,

      weight,
    };

    onSave(updatedKeyResult);

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
      description="Configure the key result details."
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
        <CEField
          label="Key Result Title"
          required
        >
          <CEInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Increase Monthly Recurring Revenue"
          />
        </CEField>

        <CEField label="Target">
          <CEInput
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="£100,000"
          />
        </CEField>

        <CEField label="Current">
          <CEInput
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="£62,500"
          />
        </CEField>

        <CEField label="Score">
          <CEInput
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="62.5%"
          />
        </CEField>

        <CEField label="Weight (%)">
          <CEInput
            type="number"
            min={0}
            max={100}
            value={weight}
            onChange={(e) =>
              setWeight(Number(e.target.value))
            }
          />
        </CEField>
      </div>
    </CEDialog>
  );
}