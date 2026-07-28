"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import { useBuilder } from "@/components/builder/context/buildercontext";

import type {
  BuilderObjective,
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

import KeyResults from "./keyresults/keyresults";
import KeyResultDialog from "./keyresults/keyresultdialog";

type ObjectiveCardProps = {
  objective: BuilderObjective;

  onEdit: () => void;

  onDelete: () => void;
};

export default function ObjectiveCard({
  objective,
  onEdit,
  onDelete,
}: ObjectiveCardProps) {
  const {
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
    editMode,
  } = useBuilder();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [selectedKeyResult, setSelectedKeyResult] =
    useState<BuilderKeyResult | null>(null);

  function handleAddKeyResult() {
    setSelectedKeyResult(null);
    setDialogOpen(true);
  }

  function handleEditKeyResult(
    keyResult: BuilderKeyResult
  ) {
    setSelectedKeyResult(keyResult);
    setDialogOpen(true);
  }

  function handleDeleteKeyResult(
    keyResultId: string
  ) {
    deleteKeyResult(
      objective.id,
      keyResultId
    );
  }

  function handleSaveKeyResult(
    keyResult: BuilderKeyResult
  ) {
    const exists = objective.keyResults.some(
      (kr) => kr.id === keyResult.id
    );

    if (exists) {
      updateKeyResult(
        objective.id,
        keyResult
      );
    } else {
      addKeyResult(
        objective.id,
        keyResult
      );
    }

    setDialogOpen(false);
    setSelectedKeyResult(null);
  }

  return (
    <>
      <CECard>
        <div className="space-y-6">

          {/* ================= Header ================= */}

          <div className="flex items-start justify-between">

            <div className="flex-1">

              <h3 className="text-lg font-semibold">
                {objective.title}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {objective.description}
              </p>

            </div>

            <div className="ml-6 text-right">

              <p className="text-xs uppercase text-slate-500">
                Weight
              </p>

              <p className="text-2xl font-bold">
                {objective.weight}%
              </p>

            </div>

          </div>

          {/* ================= Key Results ================= */}

          <KeyResults
            objective={objective}
            editMode={editMode}
            onAdd={handleAddKeyResult}
            onEdit={handleEditKeyResult}
            onDelete={handleDeleteKeyResult}
          />

          {/* ================= Footer ================= */}

          <div className="flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={onEdit}
            >
              Edit Objective
            </Button>

            <Button
              variant="destructive"
              onClick={onDelete}
            >
              Delete Objective
            </Button>

          </div>

        </div>
      </CECard>

      <KeyResultDialog
        open={dialogOpen}
        keyResult={selectedKeyResult}
        onClose={() => {
          setDialogOpen(false);
          setSelectedKeyResult(null);
        }}
        onSave={handleSaveKeyResult}
      />
    </>
  );
}