"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UserForm, {
  type UserFormValues,
} from "@/components/admin/users/userform";

import UserRoles from "@/components/admin/users/userroles";

import type { Department } from "@/lib/types/domain/department";
import type { Team } from "@/lib/types/domain/team";
import type { UserManagementRecord } from "@/lib/types/domain/usermanagement";

interface UserEditDialogProps {
  open: boolean;

  record: UserManagementRecord | null;

  organizationId: string;

  departments: Department[];

  teams: Team[];

  onOpenChange: (
    open: boolean
  ) => void;

  onSubmit: (
    values: UserFormValues
  ) => Promise<void>;

  isSaving?: boolean;
}

export default function UserEditDialog({
  open,
  record,
  organizationId,
  departments,
  teams,
  onOpenChange,
  onSubmit,
  isSaving = false,
}: UserEditDialogProps) {
  if (!record) {
    return null;
  }

  const { user, membership } = record;

  const initialValues: UserFormValues = {
    first_name:
      user.first_name,

    last_name:
      user.last_name,

    display_name:
      user.display_name ?? "",

    email:
      user.email,

    department_id:
      membership?.department_id ?? "",

    team_id:
      membership?.team_id ?? "",

    is_active:
      user.is_active,
  };

  async function handleSubmit(
    values: UserFormValues
  ) {
    await onSubmit(values);
  }

  function handleCancel() {
    if (!isSaving) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit User
          </DialogTitle>

          <DialogDescription>
            Update user information, organizational
            assignments, and roles.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          departments={departments}
          teams={teams}
          initialValues={initialValues}
          submitLabel="Save Changes"
          savingLabel="Saving..."
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSaving={isSaving}
        />

        {membership && (
          <div className="border-t pt-6">
            <UserRoles
              organizationMembershipId={
                membership.id
              }
              organizationId={
                organizationId
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}