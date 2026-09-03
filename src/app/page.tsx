"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { listOrganizations } from "@/services/organization.service";
import { listUserManagementRecords } from "@/services/user.service";

import type { UserManagementRecord } from "@/lib/types/domain/usermanagement";

type DemoRole =
  | "super_admin"
  | "organization_admin"
  | "member";

type Organization = {
  id: string;
  company_name: string;
};

const DEMO_ROLE_LABELS: Record<
  DemoRole,
  string
> = {
  super_admin: "Super Admin",
  organization_admin: "Organization Admin",
  member: "Member",
};

function getUserDisplayName(
  record: UserManagementRecord
) {
  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}

export default function Home() {
  const [role, setRole] =
    useState<DemoRole>("super_admin");

  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [
    selectedOrganizationId,
    setSelectedOrganizationId,
  ] = useState("");

  const [userRecords, setUserRecords] =
    useState<UserManagementRecord[]>([]);

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState("");

  const [
    isLoadingMembers,
    setIsLoadingMembers,
  ] = useState(false);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data =
          await listOrganizations();

        setOrganizations(
          data ?? []
        );

        if (data?.length) {
          setSelectedOrganizationId(
            data[0].id
          );
        }
      } catch (error) {
        console.error(
          "Failed to load organizations:",
          error
        );
      }
    }

    loadOrganizations();
  }, []);

  useEffect(() => {
    async function loadMembers() {
      if (
        !selectedOrganizationId ||
        role !== "member"
      ) {
        setUserRecords([]);
        setSelectedMemberId("");
        return;
      }

      try {
        setIsLoadingMembers(true);

        const records =
          await listUserManagementRecords(
            selectedOrganizationId
          );

        const activeRecords =
          records.filter(
            (record) =>
              record.user.is_active !== false
          );

        setUserRecords(
          activeRecords
        );

        setSelectedMemberId(
          activeRecords[0]?.user.id ??
            ""
        );
      } catch (error) {
        console.error(
          "Failed to load organization members:",
          error
        );

        setUserRecords([]);
        setSelectedMemberId("");
      } finally {
        setIsLoadingMembers(false);
      }
    }

    loadMembers();
  }, [
    selectedOrganizationId,
    role,
  ]);

  const selectedOrganization =
    organizations.find(
      (organization) =>
        organization.id ===
        selectedOrganizationId
    );

  const selectedMember =
    userRecords.find(
      (record) =>
        record.user.id ===
        selectedMemberId
    );

  const adminHref =
    selectedOrganizationId
      ? `/admin?organizationId=${selectedOrganizationId}`
      : "/admin";

  const performanceSheetsHref =
    selectedOrganizationId
      ? `/admin/performancesheets?organizationId=${selectedOrganizationId}`
      : "/admin/performancesheets";

  const builderHref =
    selectedOrganizationId
      ? `/builder?organizationId=${selectedOrganizationId}`
      : "/builder";

  const runtimeHref =
    selectedOrganizationId &&
    selectedMemberId
      ? `/runtime?organizationId=${selectedOrganizationId}&subjectId=${selectedMemberId}`
      : selectedOrganizationId
        ? `/runtime?organizationId=${selectedOrganizationId}`
        : "/runtime";

  const isMember =
    role === "member";

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Header */}

        <section className="space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to CascadEffects
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Manage and scale your organization&apos;s
            performance system.
          </p>
        </section>

        {/* Development Demo Context */}

        <section className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">

          <div>
            <h2 className="text-xl font-semibold">
              Development Workspace Demo
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Temporary development control —
              authentication and authorization
              are not being applied yet.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Role */}

            <div className="space-y-2">
              <label
                htmlFor="demo-role"
                className="text-sm font-medium"
              >
                View as
              </label>

              <select
                id="demo-role"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as DemoRole
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(
                  DEMO_ROLE_LABELS
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Organization */}

            <div className="space-y-2">
              <label
                htmlFor="organization"
                className="text-sm font-medium"
              >
                Organization
              </label>

              {role ===
              "super_admin" ? (
                <select
                  id="organization"
                  value={
                    selectedOrganizationId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedOrganizationId(
                      event.target.value
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {organizations.length ===
                  0 ? (
                    <option value="">
                      No organizations
                      available
                    </option>
                  ) : (
                    organizations.map(
                      (
                        organization
                      ) => (
                        <option
                          key={
                            organization.id
                          }
                          value={
                            organization.id
                          }
                        >
                          {
                            organization.company_name
                          }
                        </option>
                      )
                    )
                  )}
                </select>
              ) : (
                <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                  {selectedOrganization?.company_name ??
                    "Organization context"}
                </div>
              )}
            </div>
          </div>

          {/* Development Member Selector */}

          {isMember && (
            <div className="space-y-2">
              <label
                htmlFor="member"
                className="text-sm font-medium"
              >
                Member
              </label>

              {isLoadingMembers ? (
                <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  Loading organization
                  members...
                </div>
              ) : (
                <select
                  id="member"
                  value={
                    selectedMemberId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedMemberId(
                      event.target.value
                    )
                  }
                  disabled={
                    userRecords.length ===
                    0
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {userRecords.length ===
                  0 ? (
                    <option value="">
                      No active members
                      available
                    </option>
                  ) : (
                    userRecords.map(
                      (
                        record
                      ) => (
                        <option
                          key={
                            record.user.id
                          }
                          value={
                            record.user.id
                          }
                        >
                          {
                            getUserDisplayName(
                              record
                            )
                          }
                          {" — "}
                          {
                            record.user.email
                          }
                        </option>
                      )
                    )
                  )}
                </select>
              )}
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Current workspace
            </p>

            <p className="mt-1 text-lg font-semibold">
              {DEMO_ROLE_LABELS[
                role
              ]}

              {!isMember &&
                selectedOrganization?.company_name &&
                ` — ${selectedOrganization.company_name}`}

              {isMember &&
                selectedMember &&
                ` — ${getUserDisplayName(selectedMember)}`}
            </p>
          </div>
        </section>

        {/* Workspace */}

        <section className="space-y-6">

          <div>
            <h2 className="text-2xl font-semibold">
              Your Workspace
            </h2>

            <p className="mt-1 text-muted-foreground">
              Your available platform capabilities
              are determined by your current
              workspace role.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* My Performance */}

            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div>
                <h3 className="text-lg font-semibold">
                  My Performance
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Work with your assigned performance
                  sheet, objectives, key results,
                  initiatives, updates, and scores.
                </p>
              </div>

              <Button
                asChild
                className="w-full"
                disabled={
                  isMember &&
                  !selectedMemberId
                }
              >
                <Link href={runtimeHref}>
                  Open My Performance
                </Link>
              </Button>
            </div>

            {/* Team Performance */}

            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    Team Performance
                  </h3>

                  <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Preview
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review your team&apos;s performance
                  together, including team members,
                  objectives, key results, initiatives,
                  and overall team results.
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  Team Runtime View
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  The future team view will allow
                  authorized users to review each
                  member&apos;s performance sheet
                  without giving them permission to
                  edit another member&apos;s sheet.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                Team Performance —
                Coming Next
              </Button>
            </div>

            {/* Organization Performance */}

            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    Organization Performance
                  </h3>

                  <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Preview
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Organization-wide performance,
                  KPI trends, dashboards, charts,
                  and historical results.
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  Executive Runtime View
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  This will eventually provide the
                  dynamic organization dashboard
                  generated from the platform&apos;s
                  performance data.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                Organization Dashboard —
                Coming Next
              </Button>
            </div>

            {/* Administration */}

            {!isMember && (
              <div className="space-y-4 rounded-xl border bg-card p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Administration
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage organizations, users,
                    teams, assignments, performance
                    sheets, and platform configuration.
                  </p>
                </div>

                <Button
                  asChild
                  className="w-full"
                >
                  <Link href={adminHref}>
                    Open Administration
                  </Link>
                </Button>
              </div>
            )}

            {/* Builder */}

            {!isMember && (
              <div className="space-y-4 rounded-xl border bg-card p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Performance Sheet Builder
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Create and configure the
                    performance sheet that powers
                    the runtime experience.
                  </p>
                </div>

                <Button
                  asChild
                  className="w-full"
                >
                  <Link href={builderHref}>
                    Open Builder
                  </Link>
                </Button>
              </div>
            )}

          </div>
        </section>

        {/* Member explanation */}

        {isMember && (
          <section className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">
              Member Experience
            </h2>

            <p className="mt-2 text-muted-foreground">
              Members do not access Administration
              or the Performance Sheet Builder. Their
              primary product experience is Runtime,
              with access to their own performance and
              authorized team views.
            </p>
          </section>
        )}

        {/* Super Admin organization context */}

        {role ===
          "super_admin" &&
          selectedOrganizationId && (
            <section className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
              >
                <Link
                  href={
                    performanceSheetsHref
                  }
                >
                  View Performance Sheets
                </Link>
              </Button>
            </section>
          )}

      </div>
    </main>
  );
}