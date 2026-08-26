"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  listPermissions,
} from "@/services/permission.service";

import {
  listRolePermissions,
  createRolePermission,
  deleteRolePermission,
} from "@/services/rolepermission.service";

import type { Permission } from "@/lib/types/domain/permission";
import type { RolePermission } from "@/lib/types/domain/rolepermission";

interface RolePermissionsProps {
  roleId: string;
  organizationId: string;
}

export default function RolePermissions({
  roleId,
  organizationId,
}: RolePermissionsProps) {
  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [rolePermissions, setRolePermissions] =
    useState<RolePermission[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [savingPermissionId, setSavingPermissionId] =
    useState<string | null>(null);

  const assignedPermissionIds = useMemo(
    () =>
      new Set(
        rolePermissions.map(
          (rolePermission) =>
            rolePermission.permission_id
        )
      ),
    [rolePermissions]
  );

  async function loadPermissions() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        availablePermissions,
        assignedPermissions,
      ] = await Promise.all([
        listPermissions(),

        listRolePermissions(
          roleId,
          organizationId
        ),
      ]);

      setPermissions(
        availablePermissions
      );

      setRolePermissions(
        assignedPermissions
      );
    } catch (error) {
      console.error(
        "Failed to load role permissions:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load permissions."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      !roleId ||
      !organizationId
    ) {
      return;
    }

    loadPermissions();
  }, [
    roleId,
    organizationId,
  ]);

  async function handleTogglePermission(
    permission: Permission
  ) {
    setSavingPermissionId(
      permission.id
    );

    setErrorMessage(null);

    try {
      const existingRolePermission =
        rolePermissions.find(
          (rolePermission) =>
            rolePermission.permission_id ===
            permission.id
        );

      if (existingRolePermission) {
        await deleteRolePermission(
          existingRolePermission.id,
          organizationId
        );

        setRolePermissions(
          (current) =>
            current.filter(
              (rolePermission) =>
                rolePermission.id !==
                existingRolePermission.id
            )
        );
      } else {
        const createdRolePermission =
          await createRolePermission(
            {
              role_id: roleId,
              permission_id:
                permission.id,
            },
            organizationId
          );

        setRolePermissions(
          (current) => [
            ...current,
            createdRolePermission,
          ]
        );
      }
    } catch (error) {
      console.error(
        "Failed to update role permission:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update permission."
      );
    } finally {
      setSavingPermissionId(
        null
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="text-sm text-muted-foreground">
          Loading permissions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">
          Permissions
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Select the permissions this role should have.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {permissions.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-sm text-muted-foreground">
            No permissions are available.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {permissions.map(
            (permission) => {
              const isAssigned =
                assignedPermissionIds.has(
                  permission.id
                );

              const isSaving =
                savingPermissionId ===
                permission.id;

              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {permission.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {permission.key}
                    </p>

                    {permission.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant={
                      isAssigned
                        ? "outline"
                        : "default"
                    }
                    size="sm"
                    disabled={isSaving}
                    onClick={() =>
                      handleTogglePermission(
                        permission
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