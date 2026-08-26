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

import RolePermissions from "@/components/admin/roles/rolepermissions";

interface RoleDialogProps {
  open: boolean;

  mode: "create" | "edit";

  roleId?: string;

  organizationId?: string;

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

  roleId,

  organizationId,

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

  const canManagePermissions =
    isEdit &&
    Boolean(roleId) &&
    Boolean(organizationId);

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">

        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Role"
              : "Create Role"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the role information and permissions."
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

        {canManagePermissions && (
          <div className="border-t pt-6">
            <RolePermissions
              roleId={
                roleId!
              }
              organizationId={
                organizationId!
              }
            />
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
