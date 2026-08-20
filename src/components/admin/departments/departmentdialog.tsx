"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DepartmentForm, {
  type DepartmentFormValues,
} from "@/components/admin/departments/departmentform";

interface DepartmentDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: DepartmentFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: DepartmentFormValues
  ) => Promise<void>;
  isSaving?: boolean;
}

export default function DepartmentDialog({
  open,
  mode,
  initialValues,
  onOpenChange,
  onSubmit,
  isSaving = false,
}: DepartmentDialogProps) {
  async function handleSubmit(
    values: DepartmentFormValues
  ) {
    await onSubmit(values);
  }

  function handleCancel() {
    if (!isSaving) {
      onOpenChange(false);
    }
  }

  const isEdit =
    mode === "edit";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">

        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Department"
              : "Create Department"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the department information."
              : "Create a department for your organization."}
          </DialogDescription>
        </DialogHeader>

        <DepartmentForm
          initialValues={
            initialValues
          }
          submitLabel={
            isEdit
              ? "Save Changes"
              : "Create Department"
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