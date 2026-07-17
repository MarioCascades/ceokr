"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CEInput from "@/components/ui/ceinput";
import CETextArea from "@/components/ui/cetextarea";

import { BuilderObjective } from "@/lib/types/builderdocument";

interface ObjectiveDialogProps {
  objective: BuilderObjective | null;

  open: boolean;

  onClose: () => void;

  onSave: (objective: BuilderObjective) => void;
}

export default function ObjectiveDialog({
  objective,
  open,
  onClose,
  onSave,
}: ObjectiveDialogProps) {
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [weight, setWeight] = useState(0);

  useEffect(() => {
    if (!open) return;

    if (objective) {
      setTitle(objective.title);

      setDescription(objective.description);

      setWeight(objective.weight);
    } else {
      setTitle("");

      setDescription("");

      setWeight(0);
    }
  }, [objective, open]);

  function handleSave() {
    const updatedObjective: BuilderObjective = {
      id: objective?.id ?? crypto.randomUUID(),

      title,

      description,

      weight,

      keyResults: objective?.keyResults ?? [],
    };

    onSave(updatedObjective);

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
        objective
          ? "Edit Objective"
          : "Add Objective"
      }
      description="Configure the objective details."
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
          label="Objective Title"
          required
        >
          <CEInput
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Increase Customer Satisfaction"
          />
        </CEField>

        <CEField
          label="Description"
        >
          <CETextArea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe the purpose of this objective..."
          />
        </CEField>

        <CEField
          label="Weight (%)"
        >
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