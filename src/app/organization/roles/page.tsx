"use client";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

const plannedRoles = [
  {
    name: "Platform Administrator",
    description:
      "Platform-level authority across organizations.",
    status: "Planned",
  },
  {
    name: "Organization Administrator",
    description:
      "Administrative authority within an organization.",
    status: "Planned",
  },
  {
    name: "Manager",
    description:
      "Manages people, performance, and team-level activity.",
    status: "Planned",
  },
  {
    name: "Employee",
    description:
      "Participates in performance management and assigned work.",
    status: "Planned",
  },
];

const plannedPermissions = [
  "Organization Management",
  "People & Structure",
  "Performance Management",
  "Analytics",
  "Configuration",
];

const permissionMatrix = [
  {
    capability: "Organization",
    platformAdmin: "Planned",
    organizationAdmin: "Planned",
    manager: "—",
    employee: "—",
  },
  {
    capability: "Users",
    platformAdmin: "Planned",
    organizationAdmin: "Planned",
    manager: "Planned",
    employee: "—",
  },
  {
    capability: "Performance",
    platformAdmin: "Planned",
    organizationAdmin: "Planned",
    manager: "Planned",
    employee: "Planned",
  },
  {
    capability: "Reports",
    platformAdmin: "Planned",
    organizationAdmin: "Planned",
    manager: "Planned",
    employee: "Planned",
  },
];

export default function OrganizationRolesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        <AdminPageHeader
          title="Roles & Permissions"
          description="Preview of the organization authorization model."
          showOrganizationSelector={false}
        />

        {/* Authorization Status */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-gray-400" />

            <div>
              <h2 className="text-lg font-semibold">
                Authorization Status
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Authentication and authorization are not
                currently enabled in the platform.
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                This page is a read-only architectural
                preview. No permissions are currently
                enforced from this screen.
              </p>
            </div>
          </div>
        </section>

        {/* Planned Roles */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Planned Roles
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Initial role concepts for the platform.
            </p>
          </div>

          <div className="divide-y">
            {plannedRoles.map((role) => (
              <div
                key={role.name}
                className="flex items-center justify-between gap-6 p-6"
              >
                <div>
                  <h3 className="font-medium">
                    {role.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {role.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Planned Permission Areas */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Planned Permission Areas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Permission domains that will eventually be
              controlled by the authorization system.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {plannedPermissions.map(
              (permission) => (
                <div
                  key={permission}
                  className="rounded-lg border p-4"
                >
                  <p className="font-medium">
                    {permission}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Planned
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Permission Matrix Preview */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Permission Matrix Preview
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Example of how role capabilities may be
              represented once authorization is implemented.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left font-medium">
                    Capability
                  </th>

                  <th className="px-6 py-4 text-left font-medium">
                    Platform Admin
                  </th>

                  <th className="px-6 py-4 text-left font-medium">
                    Org Admin
                  </th>

                  <th className="px-6 py-4 text-left font-medium">
                    Manager
                  </th>

                  <th className="px-6 py-4 text-left font-medium">
                    Employee
                  </th>
                </tr>
              </thead>

              <tbody>
                {permissionMatrix.map(
                  (row) => (
                    <tr
                      key={row.capability}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium">
                        {row.capability}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {row.platformAdmin}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {row.organizationAdmin}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {row.manager}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {row.employee}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Future Implementation */}
        <section className="rounded-xl border border-dashed bg-white p-6">
          <h2 className="text-lg font-semibold">
            Future Authorization Architecture
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The eventual authorization layer will connect
            authenticated users to organization memberships,
            roles, permissions, and database-level tenant
            protection. This preview intentionally contains
            no active authorization logic.
          </p>
        </section>

      </div>
    </main>
  );
}