"use client";

import { useState } from "react";

import type {
  BuilderInitiative,
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

import { useBuilder } from "@/components/builder/context/buildercontext";

import Initiatives from "./initiatives/initiatives";
import InitiativeDialog from "./initiatives/initiativedialog";

interface KeyResultRowProps {
  objectiveId: string;
  keyResult: BuilderKeyResult;
  editMode: boolean;
  onEdit?: (keyResult: BuilderKeyResult) => void;
  onDelete?: (id: string) => void;
}

export default function KeyResultRow({
  objectiveId,
  keyResult,
  editMode,
  onEdit,
  onDelete,
}: KeyResultRowProps) {
  const {
    addInitiative,
    updateInitiative,
    deleteInitiative,
  } = useBuilder();

  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] =
    useState<BuilderInitiative | null>(null);

  function handleAddInitiative() {
    if (keyResult.initiatives.length >= 3) return;
    setSelectedInitiative(null);
    setInitiativeDialogOpen(true);
  }

  function handleEditInitiative(initiative: BuilderInitiative) {
    setSelectedInitiative(initiative);
    setInitiativeDialogOpen(true);
  }

  function handleDeleteInitiative(initiativeId: string) {
    deleteInitiative(objectiveId, keyResult.id, initiativeId);
  }

  function handleSaveInitiative(initiative: BuilderInitiative) {
    const exists = keyResult.initiatives.some(
      (item) => item.id === initiative.id
    );

    if (exists) {
      updateInitiative(objectiveId, keyResult.id, initiative);
    } else {
      addInitiative(objectiveId, keyResult.id, initiative);
    }

    setInitiativeDialogOpen(false);
    setSelectedInitiative(null);
  }

  const measurementLabel =
    keyResult.measurementType === "percentage"
      ? "Percentage"
      : keyResult.measurementType === "financial"
        ? "Financial ($)"
        : "Numeric";

  const scoringLabel =
    keyResult.scoringMethod === "percent_into_period"
      ? "% Into Period"
      : "Percentage of Target";

  return (
    <>
      <div className="rounded-xl border border-[#B4C2D1]/60 bg-white p-4 transition hover:border-[#082550]/30 hover:shadow-sm md:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(260px,1fr)_120px_150px_90px_100px] md:items-start">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#272D2C]/50">
              Key Result
            </p>
            <h4 className="mt-1 text-base font-bold text-[#272D2C]">
              {keyResult.title || "Untitled Key Result"}
            </h4>
            <div className="mt-3 flex flex-wrap gap-2 md:hidden">
              <span className="rounded-full bg-[#E9F4F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#082550]">
                {measurementLabel}
              </span>
              <span className="rounded-full bg-[#E9F4F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#082550]">
                {scoringLabel}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#272D2C]/50 md:hidden">
              Target
            </p>
            <p className="mt-1 text-lg font-black text-[#082550] md:mt-0">
              {keyResult.target || "—"}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-bold text-[#272D2C]">{measurementLabel}</p>
            <p className="mt-1 text-xs text-[#272D2C]/55">{scoringLabel}</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#272D2C]/50 md:hidden">
              Weight
            </p>
            <p className="mt-1 text-sm font-bold text-[#082550] md:mt-0">
              {keyResult.weight}%
            </p>
          </div>

          <div className="flex items-center justify-start gap-2 md:justify-end">
            {editMode && (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit?.(keyResult)}
                  className="border-[#B4C2D1] text-[#082550] hover:bg-[#E9F4F8]"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onDelete?.(keyResult.id)}
                  className="border-[#E26D5C]/50 text-[#E26D5C] hover:bg-[#E26D5C]/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-[#B4C2D1]/40 pt-4">
          <Initiatives
            initiatives={keyResult.initiatives}
            editMode={editMode}
            onAdd={handleAddInitiative}
            onEdit={handleEditInitiative}
            onDelete={handleDeleteInitiative}
          />
        </div>
      </div>

      <InitiativeDialog
        open={initiativeDialogOpen}
        initiative={selectedInitiative}
        onClose={() => {
          setInitiativeDialogOpen(false);
          setSelectedInitiative(null);
        }}
        onSave={handleSaveInitiative}
      />
    </>
  );
}
