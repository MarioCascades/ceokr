"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface DeleteDepartmentDialogProps {
  open: boolean;
  departmentName?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteDepartmentDialog({
  open,
  departmentName,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteDepartmentDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle>
            Delete Department
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>
              {departmentName ?? "this department"}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>

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
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Department"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}