"use client";

import { BuilderKeyResult } from "@/lib/types/builderdocument";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface KeyResultRowProps {
  keyResult: BuilderKeyResult;
  editMode: boolean;
  onEdit?: (keyResult: BuilderKeyResult) => void;
  onDelete?: (id: string) => void;
}

export default function KeyResultRow({
  keyResult,
  editMode,
  onEdit,
  onDelete,
}: KeyResultRowProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <h4 className="font-semibold text-base">
            {keyResult.title || "Untitled Key Result"}
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Target</p>
              <p>{keyResult.target}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Current</p>
              <p>{keyResult.current}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Score</p>
              <p>{keyResult.score}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Weight</p>
              <p>{keyResult.weight}%</p>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="ml-4 flex gap-2">
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
    </div>
  );
}