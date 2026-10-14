
"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

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
    searchParams.get("organizationId")?.trim() ?? "";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const records = await listOrganizations();

        if (!active) return;

        setOrganizations(records);
      } catch (error) {
        console.error(
          "Failed to load organization selector:",
          error
        );

        if (active) {
          setOrganizations([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(organizationId: string) {
    const normalizedOrganizationId = organizationId.trim();

    if (
      !normalizedOrganizationId ||
      !organizations.some(
        (organization) =>
          organization.id === normalizedOrganizationId
      )
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("organizationId", normalizedOrganizationId);
    params.delete("departmentId");
    params.delete("teamId");

    router.push(`${pathname}?${params.toString()}`);
  }

  const selectedOrganizationExists = organizations.some(
    (organization) =>
      organization.id === selectedOrganizationId
  );

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
        value={
          selectedOrganizationExists
            ? selectedOrganizationId
            : ""
        }
        onChange={(event) =>
          handleChange(event.target.value)
        }
        disabled={loading || organizations.length === 0}
        className="h-9 w-full rounded-md border bg-white px-3 text-sm"
      >
        <option value="">
          {loading
            ? "Loading..."
            : organizations.length === 0
              ? "No organizations"
              : "Select an organization"}
        </option>

        {organizations.map((organization) => (
          <option
            key={organization.id}
            value={organization.id}
          >
            {organization.company_name}
          </option>
        ))}
      </select>

      {!loading &&
        organizations.length > 0 &&
        selectedOrganizationId &&
        !selectedOrganizationExists && (
          <p className="mt-2 text-xs text-amber-700">
            The organization in the current URL is unavailable.
            Please select the intended organization explicitly.
          </p>
        )}
    </div>
  );
}
