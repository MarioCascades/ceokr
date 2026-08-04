"use client";

import { useState } from "react";

import {
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

  const [
    initiativeDialogOpen,
    setInitiativeDialogOpen,
  ] = useState(false);

  const [
    selectedInitiative,
    setSelectedInitiative,
  ] = useState<BuilderInitiative | null>(null);

  function handleAddInitiative() {
    setSelectedInitiative(null);
    setInitiativeDialogOpen(true);
  }

  function handleEditInitiative(
    initiative: BuilderInitiative
  ) {
    setSelectedInitiative(initiative);
    setInitiativeDialogOpen(true);
  }

  function handleDeleteInitiative(
    initiativeId: string
  ) {
    deleteInitiative(
      objectiveId,
      keyResult.id,
      initiativeId
    );
  }

  function handleSaveInitiative(
    initiative: BuilderInitiative
  ) {
    const exists = keyResult.initiatives.some(
      (item) => item.id === initiative.id
    );

    if (exists) {
      updateInitiative(
        objectiveId,
        keyResult.id,
        initiative
      );
    } else {
      addInitiative(
        objectiveId,
        keyResult.id,
        initiative
      );
    }

    setInitiativeDialogOpen(false);
    setSelectedInitiative(null);
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-6">

        {/* ================= Header ================= */}

        <div className="flex items-start justify-between">

          <div className="flex-1 space-y-3">

            <h4 className="text-base font-semibold">
              {keyResult.title || "Untitled Key Result"}
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">

              <div>
                <p className="text-muted-foreground">
                  Target
                </p>

                <p>{keyResult.target}</p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Current
                </p>

                <p>{keyResult.current}</p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Score
                </p>

                <p>{keyResult.score}</p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Weight
                </p>

                <p>{keyResult.weight}%</p>
              </div>

            </div>

          </div>

          {editMode && (

            <div className="flex gap-2">

              <Button
                size="icon"
                variant="outline"
                onClick={() => onEdit?.(keyResult)}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete?.(keyResult.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

            </div>

          )}

        </div>

        {/* ================= Initiatives ================= */}

        <Initiatives
          initiatives={keyResult.initiatives}
          editMode={editMode}
          onAdd={handleAddInitiative}
          onEdit={handleEditInitiative}
          onDelete={handleDeleteInitiative}
        />

      </div>

      {/* ================= Initiative Dialog ================= */}

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