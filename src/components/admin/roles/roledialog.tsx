"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import RoleForm, {
  type RoleFormValues,
} from "@/components/admin/roles/roleform";

interface RoleDialogProps {
  open: boolean;

  mode: "create" | "edit";

  initialValues?: RoleFormValues;

  onOpenChange: (
    open: boolean
  ) => void;

  onSubmit: (
    values: RoleFormValues
  ) => Promise<void>;

  isSaving?: boolean;
}

export default function RoleDialog({
  open,

  mode,

  initialValues,

  onOpenChange,

  onSubmit,

  isSaving = false,
}: RoleDialogProps) {
  async function handleSubmit(
    values: RoleFormValues
  ) {
    await onSubmit(
      values
    );
  }

  function handleCancel() {
    if (!isSaving) {
      onOpenChange(
        false
      );
    }
  }

  const isEdit =
    mode === "edit";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(
            nextOpen
          );
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">

        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Role"
              : "Create Role"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the role information."
              : "Create a role for your organization."}
          </DialogDescription>
        </DialogHeader>

        <RoleForm
          initialValues={
            initialValues
          }

          submitLabel={
            isEdit
              ? "Save Changes"
              : "Create Role"
          }

          savingLabel={
            isEdit
              ? "Saving..."
              : "Creating..."
          }

          onSubmit={
            handleSubmit
          }

          onCancel={
            handleCancel
          }

          isSaving={
            isSaving
          }
        />

      </DialogContent>
    </Dialog>
  );
}