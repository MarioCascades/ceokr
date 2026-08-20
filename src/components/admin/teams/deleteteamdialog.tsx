"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface DeleteTeamDialogProps {
  open: boolean;
  teamName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteTeamDialog({
  open,
  teamName,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteTeamDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle>
            Delete Team
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{teamName}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Team"}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}