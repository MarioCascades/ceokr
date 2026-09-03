"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  listOrganizations,
} from "@/services/organization.service";

import type { Organization } from "@/lib/types/organization";

export default function AdminOrganizationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedOrganizationId =
    searchParams.get("organizationId") ?? "";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const records = await listOrganizations();

        if (!active) return;

        setOrganizations(records);

        if (
          records.length > 0 &&
          !records.some(
            (organization) =>
              organization.id === selectedOrganizationId
          )
        ) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("organizationId", records[0].id);
          router.replace(`${pathname}?${params.toString()}`);
        }
      } catch (error) {
        console.error(
          "Failed to load organization selector:",
          error
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [
    pathname,
    router,
    searchParams,
    selectedOrganizationId,
  ]);

  function handleChange(organizationId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("organizationId", organizationId);
    params.delete("departmentId");
    params.delete("teamId");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="min-w-[220px]">
      <label
        htmlFor="admin-organization"
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Organization
      </label>

      <select
        id="admin-organization"
        value={selectedOrganizationId}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        disabled={loading || organizations.length === 0}
        className="h-9 w-full rounded-md border bg-white px-3 text-sm"
      >
        {organizations.length === 0 ? (
          <option value="">
            {loading ? "Loading..." : "No organizations"}
          </option>
        ) : (
          organizations.map((organization) => (
            <option
              key={organization.id}
              value={organization.id}
            >
              {organization.company_name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
