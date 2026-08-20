"use client";

import type { Team } from "@/lib/types/domain/team";
import type { Department } from "@/lib/types/domain/department";

interface TeamsListProps {
  teams: Team[];
  departments: Department[];
}

export default function TeamsList({
  teams,
  departments,
}: TeamsListProps) {
  function getDepartmentName(
    departmentId: string
  ) {
    return (
      departments.find(
        (department) =>
          department.id === departmentId
      )?.name ?? "Unknown Department"
    );
  }

  if (teams.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          No teams have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {teams.map((team) => (
        <div
          key={team.id}
          className="p-6"
        >
          <div className="flex items-center justify-between gap-4">

            <div>
              <h3 className="font-semibold">
                {team.name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Department:{" "}
                {getDepartmentName(
                  team.department_id
                )}
              </p>

              {team.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {team.description}
                </p>
              )}
            </div>

            <span className="text-sm text-muted-foreground">
              {team.is_active
                ? "Active"
                : "Inactive"}
            </span>

          </div>
        </div>
      ))}
    </div>
  );
}