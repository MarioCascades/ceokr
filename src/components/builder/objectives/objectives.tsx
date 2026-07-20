"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";

import { useBuilder } from "@/components/builder/context/buildercontext";

import type { BuilderObjective } from "@/lib/types/builderdocument";

import ObjectiveCard from "./objectivecard";
import ObjectiveDialog from "./objectivedialog";

export default function Objectives() {
  console.log("OBJECTIVES COMPONENT LOADED");
  const {
    builderDocument,
    addObjective,
    updateObjective,
    deleteObjective,
  } = useBuilder();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedObjective, setSelectedObjective] =
    useState<BuilderObjective | null>(null);

  useEffect(() => {
    console.log("Objectives dialogOpen:", dialogOpen);
  }, [dialogOpen]);

  function handleAddObjective() {
    console.log("Add Objective button clicked");

    setSelectedObjective(null);

    setDialogOpen(true);
  }

  function handleEditObjective(
    objective: BuilderObjective
  ) {
    console.log("Edit Objective button clicked");

    setSelectedObjective(objective);

    setDialogOpen(true);
  }

  function handleSaveObjective(
    objective: BuilderObjective
  ) {
    console.log("Saving objective", objective);

    const exists = builderDocument.objectives.some(
      (o) => o.id === objective.id
    );

    if (exists) {
      updateObjective(objective);
    } else {
      addObjective(objective);
    }

    setDialogOpen(false);
    setSelectedObjective(null);
  }

  function handleDeleteObjective(
    objectiveId: string
  ) {
    deleteObjective(objectiveId);
  }

  return (
    <>
      <BuilderSection
        title="Objectives"
        toolbar={
          <div className="flex gap-2">
            <Button variant="outline">
              Configure
            </Button>

            <Button onClick={handleAddObjective}>
              + Add Objective
            </Button>
          </div>
        }
      >
        <CECard>
          <div className="space-y-8">
            {builderDocument.objectives.map(
              (objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  onEdit={() =>
                    handleEditObjective(objective)
                  }
                  onDelete={() =>
                    handleDeleteObjective(
                      objective.id
                    )
                  }
                />
              )
            )}
          </div>
        </CECard>
      </BuilderSection>

      <ObjectiveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        objective={selectedObjective}
        onSave={handleSaveObjective}
      />
    </>
  );
}