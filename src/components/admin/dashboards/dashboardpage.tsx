"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  loadDashboard,
  type DashboardData,
} from "@/services/dashboard.service";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

/* ==========================================================
   Dashboard Page
========================================================== */

export default function DashboardsPage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!organizationId) {
          setError("Select an organization to load the dashboard.");
          return;
        }

        const data =
          await loadDashboard(
            organizationId
          );

        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [organizationId]);

  /* ========================================================
     Loading
  ======================================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Loading organizational performance...
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  /* ========================================================
     Error
  ======================================================== */

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organizational performance overview
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  /* ========================================================
     Render
  ======================================================== */

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Current organizational performance overview."
      />

      {/* ====================================================
          Summary
      ==================================================== */}

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">

          <MetricCard
            label="Total Assignments"
            value={dashboard.totalAssignments}
          />

          <MetricCard
            label="Active Assignments"
            value={dashboard.activeAssignments}
          />

          <MetricCard
            label="Completed Assignments"
            value={dashboard.completedAssignments}
          />

          <MetricCard
            label="Performance Instances"
            value={dashboard.totalPerformanceInstances}
          />

          <MetricCard
            label="Average Score"
            value={`${dashboard.averageScore}%`}
          />

          <MetricCard
            label="Average Progress"
            value={`${dashboard.averageProgress}%`}
          />

        </div>
      </section>

      {/* ====================================================
          Performance Overview
      ==================================================== */}

      <section className="grid gap-6 lg:grid-cols-2">

        {/* Status Distribution */}

        <div className="rounded-lg border bg-white p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Performance Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current status of performance instances.
            </p>
          </div>

          <div className="space-y-4">

            {dashboard.statusCounts.map(
              (item) => (
                <StatusRow
                  key={item.status}
                  label={formatStatus(
                    item.status
                  )}
                  count={item.count}
                  total={
                    dashboard.totalPerformanceInstances
                  }
                />
              )
            )}

          </div>
        </div>

        {/* Score Distribution */}

        <div className="rounded-lg border bg-white p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Score Distribution
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current performance scores.
            </p>
          </div>

          <div className="space-y-4">

            {dashboard.scoreBuckets.map(
              (bucket) => (
                <StatusRow
                  key={bucket.label}
                  label={bucket.label}
                  count={bucket.count}
                  total={
                    dashboard.totalPerformanceInstances
                  }
                />
              )
            )}

          </div>
        </div>

      </section>

      {/* ====================================================
          Performance Results
      ==================================================== */}

      <section className="rounded-lg border bg-white">

        <div className="border-b p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Results
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current performance instance results.
          </p>
        </div>

        {dashboard.performanceRows.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No performance results are available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b bg-gray-50">
                <tr>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Performance Sheet
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Assignment Type
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Score
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Progress
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Created
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y">

                {dashboard.performanceRows.map(
                  (row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-medium text-gray-900">
                          {row.performanceSheetName}
                        </div>

                        {row.performanceSheetVersion >
                          0 && (
                          <div className="text-xs text-gray-500">
                            Version{" "}
                            {
                              row.performanceSheetVersion
                            }
                          </div>
                        )}

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatStatus(
                          row.assignmentType
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {row.score}%
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">

                            <div
                              className="h-full rounded-full bg-gray-900"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    row.progress,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                          <span className="text-gray-600">
                            {row.progress}%
                          </span>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {formatStatus(
                            row.status
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(
                          row.createdAt
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

/* ==========================================================
   Metric Card
========================================================== */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-white p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   Status Row
========================================================== */

function StatusRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (count / total) * 100
        );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between text-sm">

        <span className="font-medium text-gray-700">
          {label}
        </span>

        <span className="text-gray-500">
          {count} ({percentage}%)
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">

        <div
          className="h-full rounded-full bg-gray-900"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* ==========================================================
   Formatting
========================================================== */

function formatStatus(
  value: string
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(
  value: string
): string {
  return new Date(value).toLocaleDateString();
}