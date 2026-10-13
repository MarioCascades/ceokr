
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import UserRoles from "@/components/admin/users/userroles";

import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
} from "@/services/role.service";

import { getOrganization } from "@/services/organization.service";
import { listUserManagementRecords } from "@/services/user.service";

type Organization = NonNullable<
  Awaited<ReturnType<typeof getOrganization>>
>;

type Role = Awaited<ReturnType<typeof listRoles>>[number];

type UserManagementRecord = Awaited<
  ReturnType<typeof listUserManagementRecords>
>[number];

type OrganizationMember = UserManagementRecord & {
  membership?: { id: string } | null;
  user?: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  department?: { name?: string | null } | null;
  team?: { name?: string | null } | null;
  organization_membership_id?: string | null;
};

type RoleFormState = {
  name: string;
  description: string;
  is_active: boolean;
};

const EMPTY_ROLE_FORM: RoleFormState = {
  name: "",
  description: "",
  is_active: true,
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (value && typeof value === "object") {
    return value as UnknownRecord;
  }

  return {};
}

function getText(
  record: UnknownRecord,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getOrganizationName(organization: Organization): string {
  const record = asRecord(organization);

  return (
    getText(record, "company_name", "name", "organization_name", "display_name") ||
    "Current organization"
  );
}

function getMemberName(member: OrganizationMember): string {
  const user = asRecord(member.user);

  const displayName = getText(
    user,
    "display_name",
    "full_name",
    "name"
  );

  if (displayName) {
    return displayName;
  }

  const firstName = getText(user, "first_name", "firstName");
  const lastName = getText(user, "last_name", "lastName");
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  const memberRecord = asRecord(member);

  return (
    getText(memberRecord, "display_name", "full_name", "name") ||
    getMemberEmail(member) ||
    "Unnamed user"
  );
}

function getMemberEmail(member: OrganizationMember): string {
  const user = asRecord(member.user);
  const memberRecord = asRecord(member);

  return (
    getText(user, "email") ||
    getText(memberRecord, "email")
  );
}

function getDepartmentName(member: OrganizationMember): string {
  const department = asRecord(member.department);

  return getText(department, "name") || "Not assigned";
}

function getTeamName(member: OrganizationMember): string {
  const team = asRecord(member.team);

  return getText(team, "name") || "Not assigned";
}

function getMembershipId(
  member: OrganizationMember
): string | null {
  if (member.membership?.id) {
    return member.membership.id;
  }

  if (member.organization_membership_id) {
    return member.organization_membership_id;
  }

  const record = asRecord(member);

  return getText(record, "membership_id") || null;
}

export default function OrganizationRolesPage() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] =
    useState<RoleFormState>(EMPTY_ROLE_FORM);

  const [deleteCandidate, setDeleteCandidate] =
    useState<Role | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentOrganization = await getOrganization();

      if (!currentOrganization?.id) {
        throw new Error(
          "Unable to determine the current organization."
        );
      }

      const [organizationRoles, organizationMembers] =
        await Promise.all([
          listRoles(currentOrganization.id),
          listUserManagementRecords(currentOrganization.id),
        ]);

      setOrganization(currentOrganization);
      setRoles(organizationRoles);
      setMembers(
        (organizationMembers ?? []) as OrganizationMember[]
      );
    } catch (err) {
      console.error("Failed to load organization roles:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load organization roles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  function openCreateForm() {
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
    setShowRoleForm(true);
    setError(null);
    setNotice(null);
  }

  function openEditForm(role: Role) {
    setEditingRole(role);

    setRoleForm({
      name: role.name ?? "",
      description: role.description ?? "",
      is_active: role.is_active ?? true,
    });

    setShowRoleForm(true);
    setError(null);
    setNotice(null);
  }

  function closeRoleForm() {
    if (saving) return;

    setShowRoleForm(false);
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
  }

  async function handleSaveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!organization?.id) {
      setError("The current organization could not be identified.");
      return;
    }

    const name = roleForm.name.trim();

    if (!name) {
      setError("Enter a role name.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingRole) {
        await updateRole(editingRole.id, organization.id, {
          name,
          description: roleForm.description.trim(),
          is_active: roleForm.is_active,
        });

        setNotice("Role updated successfully.");
      } else {
        await createRole({
          organization_id: organization.id,
          name,
          description: roleForm.description.trim(),
          is_active: roleForm.is_active,
        });

        setNotice("Role created successfully.");
      }

      setShowRoleForm(false);
      setEditingRole(null);
      setRoleForm(EMPTY_ROLE_FORM);

      await loadPage();
    } catch (err) {
      console.error("Failed to save organization role:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the role."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole() {
    if (!organization?.id || !deleteCandidate) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await deleteRole(deleteCandidate.id, organization.id);

      setDeleteCandidate(null);
      setNotice("Role deleted successfully.");

      await loadPage();
    } catch (err) {
      console.error("Failed to delete organization role:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the role."
      );
    } finally {
      setSaving(false);
    }
  }

  const activeRoleCount = roles.filter(
    (role) => role.is_active
  ).length;

  const inactiveRoleCount = roles.length - activeRoleCount;

  const organizationName = organization
    ? getOrganizationName(organization)
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Roles &amp; Permissions
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage organization roles and member assignments for your organization.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading organization roles and members...
          </div>
        ) : !organization ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Organization unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The current organization could not be loaded. Verify
              your organization context and access before managing roles.
            </p>
            <button
              type="button"
              onClick={() => void loadPage()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Current organization
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {organizationName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Role management is scoped to this organization.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadPage()}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total roles
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {roles.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Active roles
                </p>
                <p className="mt-2 text-3xl font-semibold text-emerald-700">
                  {activeRoleCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Inactive roles
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-500">
                  {inactiveRoleCount}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Organization Roles
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Create, update, activate, deactivate, or remove roles belonging to this organization.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create Role
                </button>
              </div>

              {roles.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <h3 className="text-base font-semibold text-slate-900">
                    No organization roles found
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                    Create an organization role to begin managing member assignments.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                            {role.name}
                          </td>
                          <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                            {role.description?.trim() || "No description"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                role.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {role.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openEditForm(role)}
                                className="text-sm font-medium text-slate-700 hover:text-slate-950"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(role)}
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Organization Members
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View actual member names, departments, teams, and assigned roles.
                </p>
              </div>

              {members.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No organization members were found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {members.map((member, index) => {
                    const membershipId = getMembershipId(member);
                    const email = getMemberEmail(member);

                    return (
                      <div
                        key={membershipId ?? `member-${index}`}
                        className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {getMemberName(member)}
                          </p>

                          {email && (
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {email}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                              Department: {getDepartmentName(member)}
                            </span>
                            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                              Team: {getTeamName(member)}
                            </span>
                          </div>
                        </div>

                        <div className="w-full lg:max-w-xl">
                          {membershipId ? (
                            <UserRoles
                              organizationMembershipId={membershipId}
                              organizationId={organization.id}
                            />
                          ) : (
                            <p className="text-sm text-amber-700">
                              Membership ID unavailable; role assignments cannot be displayed.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {showRoleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-role-dialog-title"
            className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl"
          >
            <form onSubmit={handleSaveRole}>
              <div className="border-b border-slate-200 px-6 py-5">
                <h2
                  id="organization-role-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingRole ? "Edit Role" : "Create Role"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {organizationName}
                </p>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div>
                  <label
                    htmlFor="organization-role-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Role name
                  </label>
                  <input
                    id="organization-role-name"
                    type="text"
                    required
                    maxLength={100}
                    value={roleForm.name}
                    onChange={(event) =>
                      setRoleForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organization-role-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="organization-role-description"
                    rows={3}
                    maxLength={500}
                    value={roleForm.description}
                    onChange={(event) =>
                      setRoleForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    placeholder="Describe the role's responsibilities"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <input
                    type="checkbox"
                    checked={roleForm.is_active}
                    onChange={(event) =>
                      setRoleForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Active role
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Inactive roles should not grant active-role permissions.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeRoleForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRole
                      ? "Save Changes"
                      : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-organization-role-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-organization-role-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete Role
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteCandidate.name}
              </span>
              ? Deletion may be blocked if this role is still referenced
              by member assignments or permissions.
            </p>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setDeleteCandidate(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDeleteRole()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
