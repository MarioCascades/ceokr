"use client";

import { useState } from "react";

import { useBuilder } from "@/components/builder/context/buildercontext";
import OrganizationDialog from "./organizationdialog";

export default function OrganizationSection() {
  const {
    builderDocument,
    organizationContext,
    editMode,
  } = useBuilder();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  /*
   * ========================================================
   * Organization Presentation
   * ========================================================
   *
   * The Performance Sheet definition owns the organization
   * presentation shown on the sheet.
   *
   * The live organization context is kept separate and is
   * used for real departments, teams, and members.
   */

  const companyName =
    builderDocument.organization.companyName ||
    "Organization";

  const tagline =
    builderDocument.organization.tagline;

  /*
   * ========================================================
   * Real Organization Context
   * ========================================================
   *
   * These values come from the organization currently
   * loaded by BuilderContext.
   *
   * They are intentionally NOT stored inside BuilderDocument.
   */

  const departmentCount =
    organizationContext?.departments.length ?? 0;

  const teamCount =
    organizationContext?.teams.length ?? 0;

  const memberCount =
    organizationContext?.members.length ?? 0;

  return (
    <>
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">

          {/* ==================================================
              Organization Header
          ================================================== */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              {/* Organization Logo */}

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">

                {builderDocument.organization.logoUrl ? (
                  <img
                    src={
                      builderDocument.organization.logoUrl
                    }
                    alt={`${companyName} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {companyName
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                )}

              </div>

              {/* Organization Identity */}

              <div className="min-w-0">

                <h2 className="text-xl font-semibold tracking-tight">
                  {companyName}
                </h2>

                {tagline ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tagline}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Performance Management
                  </p>
                )}

              </div>

            </div>

            {/* ==================================================
                Configure
            ================================================== */}

            {editMode && (
              <button
                type="button"
                onClick={() =>
                  setDialogOpen(true)
                }
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Configure
              </button>
            )}

          </div>

          {/* ==================================================
              Organization Context
          ================================================== */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* Members */}

            <div className="rounded-lg border bg-muted/30 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Members
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {memberCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Organization members
              </p>

            </div>

            {/* Departments */}

            <div className="rounded-lg border bg-muted/30 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Departments
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {departmentCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Organization departments
              </p>

            </div>

            {/* Teams */}

            <div className="rounded-lg border bg-muted/30 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Teams
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {teamCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Organization teams
              </p>

            </div>

          </div>

          {/* ==================================================
              Organization Context Note
          ================================================== */}

          {organizationContext && (
            <div className="rounded-lg border border-dashed p-4">

              <p className="text-sm font-medium">
                Builder Organization
              </p>

              <p className="mt-1 text-sm text-muted-foreground">

                This Performance Sheet is being built for{" "}

                <span className="font-medium text-foreground">
                  {companyName}
                </span>
                .

                {" "}The Builder is connected to the
                organization&apos;s real departments,
                teams, and members without duplicating
                those records inside the Performance Sheet.

              </p>

            </div>
          )}

        </div>
      </section>

      {/* ======================================================
          Organization Configuration Dialog
      ====================================================== */}

      <OrganizationDialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        organization={
          builderDocument.organization
        }
      />
    </>
  );
}