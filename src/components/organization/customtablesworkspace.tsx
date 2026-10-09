
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  CustomTableListItem,
} from "@/lib/types/domain/customtable";

type CustomTablesWorkspaceProps = {
  organizationId: string;
  tables: CustomTableListItem[];
  canManage: boolean;
};

type TableFilter = "all" | "enabled" | "disabled";

export default function CustomTablesWorkspace({
  organizationId,
  tables,
  canManage,
}: CustomTablesWorkspaceProps) {
  const [filter, setFilter] = useState<TableFilter>("all");
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "enabled" && table.isEnabled) ||
        (filter === "disabled" && !table.isEnabled);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        table.name.toLowerCase().includes(normalizedSearch) ||
        table.tableKey.toLowerCase().includes(normalizedSearch) ||
        (table.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, tables]);

  const enabledCount = tables.filter(
    (table) => table.isEnabled
  ).length;

  const disabledCount = tables.length - enabledCount;

  const getTableHref = (tableId: string) => {
    const params = new URLSearchParams({
      organizationId,
    });

    return `/organization/customtables/${encodeURIComponent(
      tableId
    )}?${params.toString()}`;
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Tables"
          value={tables.length}
          description="Configured operational tables"
        />

        <SummaryCard
          label="Enabled"
          value={enabledCount}
          description="Available for eligible Runtime use"
          accent="green"
        />

        <SummaryCard
          label="Disabled"
          value={disabledCount}
          description="Unavailable in Runtime"
          accent="amber"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-950">
              Table Definitions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Browse and manage this organization&apos;s
              operational tables.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="custom-table-search">
              Search tables
            </label>

            <input
              id="custom-table-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search tables..."
              className="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
            />

            <label className="sr-only" htmlFor="custom-table-filter">
              Filter tables
            </label>

            <select
              id="custom-table-filter"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as TableFilter)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All tables</option>
              <option value="enabled">Enabled only</option>
              <option value="disabled">Disabled only</option>
            </select>
          </div>
        </div>

        {filteredTables.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                />
                <path d="M3 10h18M9 4v16" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {tables.length === 0
                ? "No custom tables yet"
                : "No matching tables"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {tables.length === 0
                ? canManage
                  ? "Create your first operational table to begin configuring reusable columns and monthly records."
                  : "No operational tables have been configured for this organization yet."
                : "Try changing your search or filter to find a table."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Table
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Table Key
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Columns
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Runtime
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTables.map((table) => (
                  <tr
                    key={table.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-950">
                        {table.name}
                      </div>

                      {table.description && (
                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                          {table.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {table.tableKey}
                      </code>
                    </td>

                    <td className="px-5 py-4 tabular-nums text-gray-700">
                      {table.columnCount}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-gray-700">
                        {table.runtimeTabKey || "Not assigned"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge enabled={table.isEnabled} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={getTableHref(table.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-100"
                      >
                        {canManage ? "Configure" : "View"}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-gray-200 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredTables.length} of {tables.length} tables
          </span>

          <span>
            Table configuration is restricted to authorized administrators.
          </span>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  description,
  accent = "gray",
}: {
  label: string;
  value: number;
  description: string;
  accent?: "gray" | "green" | "amber";
}) {
  const accentClasses = {
    gray: "border-gray-200",
    green: "border-green-200",
    amber: "border-amber-200",
  };

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${accentClasses[accent]}`}
    >
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950 tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
        enabled
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          enabled ? "bg-green-600" : "bg-gray-400"
        }`}
      />

      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}
