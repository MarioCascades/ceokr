"use client";

import { Button } from "@/components/ui/button";

import type { Role } from "@/lib/types/domain/role";

interface RolesListProps {
  roles: Role[];

  onEdit: (role: Role) => void;

  onDelete: (role: Role) => void;
}

export default function RolesList({
  roles,
  onEdit,
  onDelete,
}: RolesListProps) {
  if (roles.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          No roles have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {roles.map((role) => (
        <div
          key={role.id}
          className="p-6"
        >
          <div className="flex items-center justify-between gap-4">

            <div>
              <h3 className="font-semibold">
                {role.name}
              </h3>

              {role.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {role.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">

              <span className="text-sm text-muted-foreground">
                {role.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onEdit(role)
                }
              >
                Edit
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  onDelete(role)
                }
              >
                Delete
              </Button>

            </div>

          </div>
        </div>
      ))}
    </div>
  );
}