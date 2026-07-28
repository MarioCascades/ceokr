"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CETextArea from "@/components/ui/cetextarea";

import { BuilderInitiative } from "@/lib/types/builderdocument";

interface InitiativeDialogProps {
  initiative: BuilderInitiative | null;

  open: boolean;

  onClose: () => void;

  onSave: (initiative: BuilderInitiative) => void;
}

export default function InitiativeDialog({
  initiative,
  open,
  onClose,
  onSave,
}: InitiativeDialogProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;

    if (initiative) {
      setText(initiative.text);
    } else {
      setText("");
    }
  }, [initiative, open]);

  function handleSave() {
    const updatedInitiative: BuilderInitiative = {
      id: initiative?.id ?? crypto.randomUUID(),

      text,
    };

    onSave(updatedInitiative);

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
        initiative
          ? "Edit Initiative"
          : "Add Initiative"
      }
      description="Describe the actions being taken to achieve this Key Result."
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
          label="Initiative"
          required
        >
          <CETextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the actions you are taking to achieve this Key Result..."
            rows={8}
          />
        </CEField>
      </div>
    </CEDialog>
  );
}