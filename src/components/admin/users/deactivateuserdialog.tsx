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

interface DeactivateUserDialogProps {
  open: boolean;

  userName: string;

  onOpenChange: (
    open: boolean
  ) => void;

  onConfirm: () => Promise<void>;

  isDeactivating?: boolean;
}

export default function DeactivateUserDialog({
  open,
  userName,
  onOpenChange,
  onConfirm,
  isDeactivating = false,
}: DeactivateUserDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeactivating) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Deactivate User
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-medium text-foreground">
              {userName}
            </span>
            ?
            {" "}
            The user will remain in the organization
            but will no longer be active.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={
              isDeactivating
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={
              handleConfirm
            }
            disabled={
              isDeactivating
            }
          >
            {isDeactivating
              ? "Deactivating..."
              : "Deactivate User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}