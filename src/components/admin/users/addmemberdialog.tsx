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

import type { Department } from "@/lib/types/domain/department";
import type { Team } from "@/lib/types/domain/team";


/* ==========================================================
   Props
========================================================== */

interface AddMemberDialogProps {
  open: boolean;

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


/* ==========================================================
   Component
========================================================== */

export default function AddMemberDialog({
  open,

  departments,

  teams,

  onOpenChange,

  onSubmit,

  isSaving = false,
}: AddMemberDialogProps) {


  async function handleSubmit(
    values: UserFormValues
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
            Add Member
          </DialogTitle>

          <DialogDescription>
            Create a member account immediately.
            The member will be added to your
            organization and assigned the Member role.
          </DialogDescription>

        </DialogHeader>

        <UserForm
          departments={
            departments
          }

          teams={
            teams
          }

          submitLabel="Create Member"

          savingLabel="Creating..."

          showPassword

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