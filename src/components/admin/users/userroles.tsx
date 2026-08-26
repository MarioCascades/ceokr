"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  listRoles,
} from "@/services/role.service";

import {
  listMembershipRoles,
  createMembershipRole,
  deleteMembershipRole,
} from "@/services/membershiprole.service";

import type { Role } from "@/lib/types/domain/role";
import type { MembershipRole } from "@/lib/types/domain/membershiprole";

interface UserRolesProps {
  organizationMembershipId: string;
  organizationId: string;
}

export default function UserRoles({
  organizationMembershipId,
  organizationId,
}: UserRolesProps) {
  const [roles, setRoles] =
    useState<Role[]>([]);

  const [membershipRoles, setMembershipRoles] =
    useState<MembershipRole[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [savingRoleId, setSavingRoleId] =
    useState<string | null>(null);

  const assignedRoleIds = useMemo(
    () =>
      new Set(
        membershipRoles.map(
          (membershipRole) =>
            membershipRole.role_id
        )
      ),
    [membershipRoles]
  );

  async function loadRoles() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        availableRoles,
        assignedRoles,
      ] = await Promise.all([
        listRoles(
          organizationId
        ),

        listMembershipRoles(
          organizationMembershipId,
          organizationId
        ),
      ]);

      setRoles(
        availableRoles
      );

      setMembershipRoles(
        assignedRoles
      );
    } catch (error) {
      console.error(
        "Failed to load user roles:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load roles."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      !organizationMembershipId ||
      !organizationId
    ) {
      return;
    }

    loadRoles();
  }, [
    organizationMembershipId,
    organizationId,
  ]);

  async function handleToggleRole(
    role: Role
  ) {
    setSavingRoleId(
      role.id
    );

    setErrorMessage(null);

    try {
      const existingMembershipRole =
        membershipRoles.find(
          (membershipRole) =>
            membershipRole.role_id ===
            role.id
        );

      if (existingMembershipRole) {
        await deleteMembershipRole(
          existingMembershipRole.id,
          organizationId
        );

        setMembershipRoles(
          (current) =>
            current.filter(
              (membershipRole) =>
                membershipRole.id !==
                existingMembershipRole.id
            )
        );
      } else {
        const createdMembershipRole =
          await createMembershipRole({
            organization_membership_id:
              organizationMembershipId,

            role_id:
              role.id,

            organization_id:
              organizationId,
          });

        setMembershipRoles(
          (current) => [
            ...current,
            createdMembershipRole,
          ]
        );
      }
    } catch (error) {
      console.error(
        "Failed to update user role:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update role."
      );
    } finally {
      setSavingRoleId(
        null
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="text-sm text-muted-foreground">
          Loading roles...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">
          Roles
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Select the roles assigned to this organization membership.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {roles.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-sm text-muted-foreground">
            No roles are available.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {roles.map(
            (role) => {
              const isAssigned =
                assignedRoleIds.has(
                  role.id
                );

              const isSaving =
                savingRoleId ===
                role.id;

              return (
                <div
                  key={role.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {role.name}
                    </p>

                    {role.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.is_active
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant={
                      isAssigned
                        ? "outline"
                        : "default"
                    }
                    size="sm"
                    disabled={
                      isSaving ||
                      !role.is_active
                    }
                    onClick={() =>
                      handleToggleRole(
                        role
                      )
                    }
                  >
                    {isSaving
                      ? "Saving..."
                      : isAssigned
                        ? "Remove"
                        : "Assign"}
                  </Button>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}