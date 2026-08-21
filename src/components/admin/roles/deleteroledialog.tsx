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

interface DeleteRoleDialogProps {
  open: boolean;

  roleName?: string;

  onOpenChange: (
    open: boolean
  ) => void;

  onConfirm: () => Promise<void>;

  isDeleting?: boolean;
}

export default function DeleteRoleDialog({
  open,

  roleName,

  onOpenChange,

  onConfirm,

  isDeleting = false,
}: DeleteRoleDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(
            nextOpen
          );
        }
      }}
    >
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle>
            Delete Role
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>
              {roleName ??
                "this role"}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(
                false
              )
            }
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={
              handleConfirm
            }
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Role"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}