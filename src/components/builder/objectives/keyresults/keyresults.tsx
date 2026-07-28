"use client";

import {
  BuilderObjective,
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

import KeyResultRow from "./keyresultrow";
import { Button } from "@/components/ui/button";

interface KeyResultsProps {
  objective: BuilderObjective;

  editMode: boolean;

  onAdd?: () => void;

  onEdit?: (keyResult: BuilderKeyResult) => void;

  onDelete?: (id: string) => void;
}

export default function KeyResults({
  objective,
  editMode,
  onAdd,
  onEdit,
  onDelete,
}: KeyResultsProps) {
  return (
    <div className="space-y-4">
      {objective.keyResults.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No Key Results have been added yet.
          </p>
        </div>
      ) : (
        objective.keyResults.map((keyResult) => (
          <KeyResultRow
            key={keyResult.id}
            objectiveId={objective.id}
            keyResult={keyResult}
            editMode={editMode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      {editMode && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onAdd}
        >
          + Add Key Result
        </Button>
      )}
    </div>
  );
}