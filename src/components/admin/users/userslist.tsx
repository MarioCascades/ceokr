"use client";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

interface UsersListProps {
  records: UserManagementRecord[];

  onEdit: (
    record: UserManagementRecord
  ) => void;

  onDeactivate: (
    record: UserManagementRecord
  ) => void;
}

export default function UsersList({
  records,
  onEdit,
  onDeactivate,
}: UsersListProps) {
  if (records.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          No users have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {records.map((record) => {
        const user = record.user;

        const departmentName =
          record.department?.name ??
          "Unassigned";

        const teamName =
          record.team?.name ??
          "Unassigned";

        return (
          <div
            key={user.id}
            className="flex items-center justify-between gap-6 p-6"
          >
            <div className="min-w-0">
              <h3 className="font-semibold">
                {user.display_name ||
                  `${user.first_name} ${user.last_name}`}
              </h3>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  Department:{" "}
                  {departmentName}
                </span>

                <span>
                  Team:{" "}
                  {teamName}
                </span>

                <span>
                  {user.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-sm"
                onClick={() =>
                  onEdit(record)
                }
              >
                Edit
              </button>

              {user.is_active && (
                <button
                  type="button"
                  className="rounded-md border px-3 py-1.5 text-sm"
                  onClick={() =>
                    onDeactivate(record)
                  }
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}