"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import { Button } from "@/components/ui/button";

import {
  applyOrganizationKeyResultTemplateToMember,
  applyOrganizationObjectiveTemplateToMember,
  loadMemberObjectivesForTemplateAssignment,
  type TemplateAssignmentMemberObjective,
} from "@/app/organization/okrtemplates/actions";

import type { UserManagementRecord } from "@/lib/types/domain/usermanagement";

interface AssignOrganizationTemplateDialogProps {
  organizationId: string;
  templateType: "objective" | "keyResult";
  templateId: string;
  templateTitle: string;
  members: UserManagementRecord[];
}

function getMemberDisplayName(
  member: UserManagementRecord
): string {
  const displayName =
    member.user.display_name?.trim();

  if (displayName) {
    return displayName;
  }

  const fullName = [
    member.user.first_name,
    member.user.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  return member.user.email;
}

export default function AssignOrganizationTemplateDialog({
  organizationId,
  templateType,
  templateId,
  templateTitle,
  members,
}: AssignOrganizationTemplateDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [objectives, setObjectives] =
    useState<TemplateAssignmentMemberObjective[]>([]);
  const [selectedObjectiveId, setSelectedObjectiveId] =
    useState("");

  const [loadingObjectives, setLoadingObjectives] =
    useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] =
    useTransition();

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) =>
        getMemberDisplayName(a).localeCompare(
          getMemberDisplayName(b)
        )
      ),
    [members]
  );

  const isKeyResult =
    templateType === "keyResult";

  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setObjectives([]);
      setSelectedObjectiveId("");
      setError("");
    }
  }, [open]);

  async function handleMemberChange(
    userId: string
  ) {
    setSelectedUserId(userId);
    setSelectedObjectiveId("");
    setObjectives([]);
    setError("");

    if (!userId || !isKeyResult) {
      return;
    }

    setLoadingObjectives(true);

    try {
      const memberObjectives =
        await loadMemberObjectivesForTemplateAssignment(
          organizationId,
          userId
        );

      setObjectives(memberObjectives);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the selected member's objectives."
      );
    } finally {
      setLoadingObjectives(false);
    }
  }

  function handleAssign() {
    setError("");

    if (!selectedUserId) {
      setError("Please select a member.");
      return;
    }

    if (
      isKeyResult &&
      !selectedObjectiveId
    ) {
      setError(
        "Please select the Objective that should receive this Key Result."
      );
      return;
    }

    startTransition(async () => {
      try {
        if (templateType === "objective") {
          await applyOrganizationObjectiveTemplateToMember(
            organizationId,
            templateId,
            selectedUserId
          );
        } else {
          await applyOrganizationKeyResultTemplateToMember(
            organizationId,
            templateId,
            selectedUserId,
            selectedObjectiveId
          );
        }

        setOpen(false);
        router.refresh();
      } catch (assignError) {
        setError(
          assignError instanceof Error
            ? assignError.message
            : "Unable to assign the template."
        );
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Assign
      </Button>

      <CEDialog
        open={open}
        onOpenChange={setOpen}
        title={
          isKeyResult
            ? "Assign Key Result to Member"
            : "Assign Objective to Member"
        }
        description={
          isKeyResult
            ? "Choose a member and then select the Objective where this Key Result should be copied."
            : "Choose the organization member who should receive a copy of this Objective."
        }
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleAssign}
              disabled={
                isPending ||
                loadingObjectives ||
                !selectedUserId ||
                (isKeyResult &&
                  !selectedObjectiveId)
              }
            >
              {isPending
                ? "Assigning..."
                : isKeyResult
                  ? "Assign Key Result"
                  : "Assign Objective"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Template
            </p>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {templateTitle}
            </p>
          </div>

          <CEField
            label="Member"
            required
          >
            <select
              value={selectedUserId}
              onChange={(event) =>
                handleMemberChange(
                  event.target.value
                )
              }
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                Select a member...
              </option>

              {sortedMembers.map((member) => (
                <option
                  key={member.user.id}
                  value={member.user.id}
                >
                  {getMemberDisplayName(member)}
                </option>
              ))}
            </select>
          </CEField>

          {isKeyResult && (
            <CEField
              label="Objective"
              required
            >
              <select
                value={selectedObjectiveId}
                onChange={(event) =>
                  setSelectedObjectiveId(
                    event.target.value
                  )
                }
                disabled={
                  isPending ||
                  loadingObjectives ||
                  !selectedUserId
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {loadingObjectives
                    ? "Loading objectives..."
                    : !selectedUserId
                      ? "Select a member first..."
                      : objectives.length === 0
                        ? "No objectives found"
                        : "Select an objective..."}
                </option>

                {objectives.map((objective) => (
                  <option
                    key={objective.id}
                    value={objective.id}
                  >
                    {objective.title}
                  </option>
                ))}
              </select>
            </CEField>
          )}

          {isKeyResult &&
            selectedUserId &&
            !loadingObjectives &&
            objectives.length === 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                This member does not have any Objectives yet. Create an Objective for the member first, then assign this Key Result.
              </div>
            )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </CEDialog>
    </>
  );
}