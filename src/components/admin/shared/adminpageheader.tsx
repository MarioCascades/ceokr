"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import AdminOrganizationSelector from "@/components/admin/shared/adminorganizationselector";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  showOrganizationSelector?: boolean;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
  showOrganizationSelector = true,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3">
          {showOrganizationSelector && (
            <Suspense
              fallback={
                <div className="min-w-[220px] rounded-md border px-3 py-2 text-sm text-muted-foreground">
                  Loading organization…
                </div>
              }
            >
              <AdminOrganizationSelector />
            </Suspense>
          )}

          <div className="flex items-center gap-3">
            <AdminBackToAdministration />

            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   Back to Administration
========================================================== */

function AdminBackToAdministration() {
  const searchParams = useSearchParams();

  const organizationId =
    searchParams.get("organizationId");

  const href = organizationId
    ? `/admin?organizationId=${encodeURIComponent(
        organizationId
      )}`
    : "/admin";

  return (
    <Link
      href={href}
      className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
    >
      Back to Administration
    </Link>
  );
}