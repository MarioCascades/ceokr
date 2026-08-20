"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import TeamForm, {
  type TeamFormValues,
} from "@/components/admin/teams/teamform";

import type { Department } from "@/lib/types/domain/department";

interface TeamDialogProps {
  open: boolean;
  mode: "create" | "edit";
  departments: Department[];
  initialValues?: TeamFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: TeamFormValues
  ) => Promise<void>;
  isSaving?: boolean;
}

export default function TeamDialog({
  open,
  mode,
  departments,
  initialValues,
  onOpenChange,
  onSubmit,
  isSaving = false,
}: TeamDialogProps) {
  const isEditMode =
    mode === "edit";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">

        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Edit Team"
              : "Create Team"}
          </DialogTitle>

          <DialogDescription>
            {isEditMode
              ? "Update the team information and department assignment."
              : "Create a team and assign it to a department within your organization."}
          </DialogDescription>
        </DialogHeader>

        <TeamForm
          departments={departments}
          initialValues={
            initialValues
          }
          onSubmit={onSubmit}
          onCancel={() =>
            onOpenChange(false)
          }
          isSaving={isSaving}
        />

      </DialogContent>
    </Dialog>
  );
}