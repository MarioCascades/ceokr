"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useBuilder } from "@/components/builder/context/buildercontext";

import type {
  BuilderObjective,
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

import KeyResults from "./keyresults/keyresults";
import KeyResultDialog from "./keyresults/keyresultdialog";

type ObjectiveCardProps = {
  objective: BuilderObjective;
  objectives: BuilderObjective[];
  onEdit: () => void;
  onDelete: () => void;
};

export default function ObjectiveCard({
  objective,
  objectives,
  onEdit,
  onDelete,
}: ObjectiveCardProps) {
  const {
    addKeyResult,
    updateKeyResult,
    moveKeyResult,
    deleteKeyResult,
    editMode,
  } = useBuilder();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] =
    useState<BuilderKeyResult | null>(null);

  function handleAddKeyResult() {
    setSelectedKeyResult(null);
    setDialogOpen(true);
  }

  function handleEditKeyResult(keyResult: BuilderKeyResult) {
    setSelectedKeyResult(keyResult);
    setDialogOpen(true);
  }

  function handleDeleteKeyResult(keyResultId: string) {
    deleteKeyResult(objective.id, keyResultId);
  }

  function handleSaveKeyResult(
    keyResult: BuilderKeyResult,
    targetObjectiveId?: string
  ) {
    const currentObjectiveId = objective.id;
    const targetId = targetObjectiveId ?? currentObjectiveId;
    const exists = objective.keyResults.some(
      (kr) => kr.id === keyResult.id
    );

    if (exists) {
      if (targetId !== currentObjectiveId) {
        moveKeyResult(keyResult.id, currentObjectiveId, targetId);
        updateKeyResult(targetId, keyResult);
      } else {
        updateKeyResult(currentObjectiveId, keyResult);
      }
    } else {
      addKeyResult(targetId, keyResult);
    }

    setDialogOpen(false);
    setSelectedKeyResult(null);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-[0_8px_30px_rgba(8,37,80,0.06)]">
      {/* Objective header */}
      <div className="border-b border-[#B4C2D1]/60 bg-[#E9F4F8] px-6 py-5 md:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E26D5C]">
              Objective
            </p>
            <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-[#082550]">
              {objective.title || "Untitled Objective"}
            </h3>
            {objective.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]/70">
                {objective.description}
              </p>
            )}
          </div>

          <div className="shrink-0 rounded-xl border border-[#B4C2D1]/70 bg-white px-4 py-3 text-left md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#272D2C]/55">
              Weight
            </p>
            <p className="mt-1 text-xl font-black text-[#082550]">
              {objective.weight}%
            </p>
          </div>
        </div>
      </div>

      {/* Key Result table */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="mb-3 hidden grid-cols-[minmax(260px,1fr)_120px_150px_90px_100px] gap-4 rounded-lg bg-[#082550] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white md:grid">
          <span>Key Result</span>
          <span>Target</span>
          <span>Measurement</span>
          <span>Weight</span>
          <span className="text-right">Actions</span>
        </div>

        <KeyResults
          objective={objective}
          editMode={editMode}
          onAdd={handleAddKeyResult}
          onEdit={handleEditKeyResult}
          onDelete={handleDeleteKeyResult}
        />
      </div>

      {/* Objective actions */}
      {editMode && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#B4C2D1]/50 bg-[#F8FBFC] px-6 py-4">
          <Button
            variant="outline"
            onClick={onEdit}
            className="border-[#B4C2D1] font-bold text-[#082550] hover:bg-[#E9F4F8]"
          >
            Edit Objective
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            className="border-[#E26D5C]/50 font-bold text-[#E26D5C] hover:bg-[#E26D5C]/10"
          >
            Delete Objective
          </Button>
        </div>
      )}

      <KeyResultDialog
        open={dialogOpen}
        keyResult={selectedKeyResult}
        objectives={objectives}
        currentObjectiveId={objective.id}
        onClose={() => {
          setDialogOpen(false);
          setSelectedKeyResult(null);
        }}
        onSave={handleSaveKeyResult}
      />
    </section>
  );
}
