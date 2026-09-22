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

interface InviteUserDialogProps {
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

export default function InviteUserDialog({
  open,

  departments,

  teams,

  onOpenChange,

  onSubmit,

  isSaving = false,
}: InviteUserDialogProps) {


  /* ========================================================
     Submit
  ======================================================== */

  async function handleSubmit(
    values: UserFormValues
  ) {

    await onSubmit(
      values
    );
  }


  /* ========================================================
     Cancel
  ======================================================== */

  function handleCancel() {

    if (!isSaving) {

      onOpenChange(
        false
      );

    }
  }


  /* ========================================================
     Render
  ======================================================== */

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
            Invite User
          </DialogTitle>

          <DialogDescription>
            Add a user to your organization
            and optionally assign their
            department or team.
          </DialogDescription>

        </DialogHeader>

        <UserForm
          departments={
            departments
          }

          teams={
            teams
          }

          submitLabel="Send Invite"

          savingLabel="Sending..."

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