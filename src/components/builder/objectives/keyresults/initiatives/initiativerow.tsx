"use client";

import { BuilderInitiative } from "@/lib/types/builderdocument";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface InitiativeRowProps {
  initiative: BuilderInitiative;
  editMode: boolean;
  onEdit?: (initiative: BuilderInitiative) => void;
  onDelete?: (id: string) => void;
}

export default function InitiativeRow({
  initiative,
  editMode,
  onEdit,
  onDelete,
}: InitiativeRowProps) {
  return (
    <div className="rounded-md border bg-muted/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="whitespace-pre-wrap text-sm leading-6">
            {initiative.text || "No initiative entered."}
          </p>
        </div>

        {editMode && (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onEdit?.(initiative)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="destructive"
              onClick={() => onDelete?.(initiative.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}