"use client";

import { BuilderInitiative } from "@/lib/types/builderdocument";
import { Button } from "@/components/ui/button";

import InitiativeRow from "./initiativerow";

interface InitiativesProps {
  initiatives: BuilderInitiative[];
  editMode?: boolean;
  onAdd?: () => void;
  onEdit?: (initiative: BuilderInitiative) => void;
  onDelete?: (id: string) => void;
}

export default function Initiatives({
  initiatives,
  editMode = false,
  onAdd,
  onEdit,
  onDelete,
}: InitiativesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium">
            Initiatives
          </h5>

          <p className="text-sm text-muted-foreground">
            Record the actions being taken to achieve this Key Result.
          </p>
        </div>

        {editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
          >
            + Add Initiative
          </Button>
        )}
      </div>

      {initiatives.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No Initiatives have been added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initiatives.map((initiative) => (
            <InitiativeRow
              key={initiative.id}
              initiative={initiative}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}