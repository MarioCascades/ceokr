
"use client";

/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Workspace
 * ----------------------------------------------------------
 * Dedicated Runtime workspace for CascadEffects client
 * performance reporting.
 *
 * Sections:
 * 1. Current Performance Snapshot
 * 2. Monthly Metrics
 * 3. Key Initiatives Tracker
 *
 * This component uses dedicated Client Performance domain
 * records and does not use generic Custom Table rows.
 * ==========================================================
 */

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  addClientPerformanceInitiativeAction,
  addClientPerformanceYearAction,
  hideClientPerformanceYearAction,
  restoreClientPerformanceYearAction,
  saveClientPerformanceWorkspaceAction,
} from "@/app/runtime/actions";

import type {
  ClientPerformanceClient,
  ClientPerformanceInitiative,
  ClientPerformanceMonthlyMetric,
  ClientPerformanceSnapshotField,
  ClientPerformanceWorkspace,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Props and Local Types
========================================================== */

type ClientPerformanceWorkspaceProps = {
  organizationId: string;
  clients: ClientPerformanceClient[];
  initialWorkspace: ClientPerformanceWorkspace;
  canManage: boolean;
};

type MetricField =
  | "production"
  | "collection"
  | "starts"
  | "daysWorked";

type InitiativeField =
  | "title"
  | "description"
  | "completionMonth"
  | "notes";

type SaveHandler = (
  operation: () => Promise<unknown>,
  successMessage: string,
  resultIsTimestamp?: boolean
) => Promise<void>;

/* ==========================================================
   Styling
========================================================== */

const BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-[#B4C2D1] bg-white px-3 py-2 text-xs font-semibold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-40";

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-[#082550] bg-[#082550] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12396C] disabled:cursor-not-allowed disabled:opacity-40";

const INPUT_CLASS =
  "w-full min-w-0 rounded-lg border border-[#B4C2D1]/80 bg-white px-3 py-2 text-sm text-[#272D2C] outline-none transition focus:border-[#E26D5C] focus:ring-1 focus:ring-[#E26D5C]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70";

const CELL_INPUT_CLASS =
  "block min-h-9 w-full min-w-28 rounded-md border border-transparent bg-transparent px-2.5 py-2 text-sm text-[#272D2C] outline-none transition hover:border-[#B4C2D1] focus:border-[#E26D5C] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

/* ==========================================================
   Formatting Helpers
========================================================== */

function formatDateTime(value: string | null): string {
  if (!value) {
    return "No saved changes";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMonth(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString(
    "en-US",
    { month: "long" }
  );
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function getSnapshotInputType(
  field: ClientPerformanceSnapshotField
): string {
  switch (field.dataType) {
    case "number":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}

function getSnapshotValue(
  workspace: ClientPerformanceWorkspace,
  field: ClientPerformanceSnapshotField
): string {
  return displayValue(
    workspace.snapshot.snapshotData[field.columnKey]
  );
}

function getYearVisibility(
  workspace: ClientPerformanceWorkspace,
  year: number
): boolean {
  return (
    workspace.yearVisibility.find(
      (item) => item.performanceYear === year
    )?.isHidden ?? false
  );
}

/* ==========================================================
   Section Header
========================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#B4C2D1]/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E26D5C]">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-[#082550]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-600">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   Workspace Component
========================================================== */

export default function ClientPerformanceWorkspace({
  organizationId,
  clients,
  initialWorkspace,
  canManage,
}: ClientPerformanceWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [workspace, setWorkspace] =
    useState<ClientPerformanceWorkspace>(initialWorkspace);

  useEffect(() => {
    setWorkspace(initialWorkspace);
  }, [initialWorkspace]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingAdditionalData, setEditingAdditionalData] =
    useState<Record<string, string>>({});

  const snapshotFields = useMemo(
    () =>
      [...workspace.client.snapshotFields]
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
    [workspace.client.snapshotFields]
  );

  const monthlyYears = useMemo(() => {
    const years = [
      ...new Set(
        workspace.monthlyMetrics.map(
          (metric) => metric.performanceYear
        )
      ),
    ];

    return years.sort((a, b) => b - a);
  }, [workspace.monthlyMetrics]);

  const visibleYears = useMemo(
    () =>
      monthlyYears.filter(
        (year) => !getYearVisibility(workspace, year)
      ),
    [monthlyYears, workspace.yearVisibility]
  );

  const hiddenYears = useMemo(
    () =>
      monthlyYears.filter(
        (year) => getYearVisibility(workspace, year)
      ),
    [monthlyYears, workspace.yearVisibility]
  );

  const sortedInitiatives = useMemo(
    () =>
      [...workspace.initiatives].sort(
        (a, b) => a.position - b.position
      ),
    [workspace.initiatives]
  );

  const runSave: SaveHandler = async (
    operation,
    successMessage,
    resultIsTimestamp = true
  ) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await operation();

      if (
        resultIsTimestamp &&
        typeof result === "string" &&
        result
      ) {
        setWorkspace((current) => ({
          ...current,
          client: {
            ...current.client,
            lastUpdatedAt: result,
          },
        }));
      }

      setNotice(successMessage);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The operation could not be completed."
      );
    } finally {
      setBusy(false);
    }
  };

    /* ========================================================
     Client Selection
  ======================================================== */

  function handleClientChange(clientId: string) {
    if (!clientId || clientId === workspace.client.id) {
      return;
    }

    const nextParams = new URLSearchParams(
      searchParams.toString()
    );

    nextParams.set("clientPerformanceClientId", clientId);

    router.push(`${pathname}?${nextParams.toString()}`);
  }

  /* ========================================================
     Snapshot Editing
  ======================================================== */

  function updateSnapshotLocal(
    columnKey: string,
    value: unknown
  ) {
    setWorkspace((current) => ({
      ...current,
      snapshot: {
        ...current.snapshot,
        snapshotData: {
          ...current.snapshot.snapshotData,
          [columnKey]: value,
        },
      },
    }));
  }

  async function saveSnapshotField(
    field: ClientPerformanceSnapshotField,
    rawValue: string
  ) {
    let value: unknown = rawValue;

    if (field.dataType === "number") {
      value = parseNumber(rawValue);
    } else if (field.dataType === "boolean") {
      value = rawValue === "true";
    } else if (rawValue.trim() === "") {
      value = null;
    }

    if (
      displayValue(
        workspace.snapshot.snapshotData[field.columnKey]
      ) === displayValue(value)
    ) {
      return;
    }

    await runSave(
      () =>
        saveClientPerformanceWorkspaceAction({
          organizationId,
          workspace: {
            clientId: workspace.client.id,
            snapshot: {
              snapshotData: {
                [field.columnKey]: value,
              },
            },
          },
        }),
      "Snapshot changes saved."
    );
  }

  /* ========================================================
     Monthly Metrics
  ======================================================== */

  function updateMetricLocal(
    metricId: string,
    field: MetricField,
    value: number | null
  ) {
    setWorkspace((current) => ({
      ...current,
      monthlyMetrics: current.monthlyMetrics.map((metric) =>
        metric.id === metricId
          ? {
              ...metric,
              [field]: value,
            }
          : metric
      ),
    }));
  }

  async function saveMetricField(
    metric: ClientPerformanceMonthlyMetric,
    field: MetricField,
    rawValue: string
  ) {
    const value =
      field === "starts"
        ? parseNumber(rawValue) === null
          ? null
          : Math.trunc(parseNumber(rawValue) as number)
        : parseNumber(rawValue);

    if (metric[field] === value) {
      return;
    }

    updateMetricLocal(metric.id, field, value);

    await runSave(
      () =>
        saveClientPerformanceWorkspaceAction({
          organizationId,
          workspace: {
            clientId: workspace.client.id,
            monthlyMetrics: [
              {
                id: metric.id,
                changes: {
                  [field]: value,
                },
              },
            ],
          },
        }),
      `${formatMonth(metric.performanceMonth)} ${metric.performanceYear} metrics saved.`
    );
  }

  function getMetricsForYear(
    year: number
  ): ClientPerformanceMonthlyMetric[] {
    return workspace.monthlyMetrics
      .filter((metric) => metric.performanceYear === year)
      .sort(
        (a, b) => a.performanceMonth - b.performanceMonth
      );
  }

  /* ========================================================
     Year Management
  ======================================================== */

  async function handleAddYear() {
    await runSave(
      () =>
        addClientPerformanceYearAction({
          organizationId,
          clientId: workspace.client.id,
        }),
      "The next performance year has been added."
    );
  }

  async function handleYearVisibility(
    year: number,
    currentlyHidden: boolean
  ) {
    await runSave(
      () =>
        currentlyHidden
          ? restoreClientPerformanceYearAction({
              organizationId,
              clientId: workspace.client.id,
              performanceYear: year,
            })
          : hideClientPerformanceYearAction({
              organizationId,
              clientId: workspace.client.id,
              performanceYear: year,
            }),
      currentlyHidden
        ? `${year} has been restored.`
        : `${year} has been hidden.`
    );
  }

  /* ========================================================
     Initiative Tracker
  ======================================================== */

  function updateInitiativeLocal(
    initiativeId: string,
    field: InitiativeField,
    value: string
  ) {
    setWorkspace((current) => ({
      ...current,
      initiatives: current.initiatives.map((initiative) =>
        initiative.id === initiativeId
          ? {
              ...initiative,
              [field]: value,
            }
          : initiative
      ),
    }));
  }

  async function saveInitiativeField(
    initiative: ClientPerformanceInitiative,
    field: InitiativeField,
    value: string
  ) {
    if (initiative[field] === value) {
      return;
    }

    updateInitiativeLocal(
      initiative.id,
      field,
      value
    );

    await runSave(
      () =>
        saveClientPerformanceWorkspaceAction({
          organizationId,
          workspace: {
            clientId: workspace.client.id,
            initiatives: [
              {
                id: initiative.id,
                changes: {
                  [field]: value,
                },
              },
            ],
          },
        }),
      "Initiative changes saved."
    );
  }

  async function saveAdditionalData(
    initiative: ClientPerformanceInitiative,
    rawValue: string
  ) {
    let parsedValue: Record<string, unknown>;

    try {
      const parsed: unknown = JSON.parse(rawValue);

      if (
        parsed === null ||
        Array.isArray(parsed) ||
        typeof parsed !== "object"
      ) {
        throw new Error(
          "The additional data must be a JSON object."
        );
      }

      parsedValue = parsed as Record<string, unknown>;
    } catch {
      setError(
        "The unlabeled initiative column must contain a valid JSON object."
      );
      return;
    }

    await runSave(
      () =>
        saveClientPerformanceWorkspaceAction({
          organizationId,
          workspace: {
            clientId: workspace.client.id,
            initiatives: [
              {
                id: initiative.id,
                changes: {
                  additionalData: parsedValue,
                },
              },
            ],
          },
        }),
      "Initiative additional data saved."
    );
  }

  async function handleAddInitiative() {
    await runSave(
      () =>
        addClientPerformanceInitiativeAction({
          organizationId,
          clientId: workspace.client.id,
        }),
      "A new initiative row has been added.",
      false
    );
  }

    /* ========================================================
     Render
  ======================================================== */

  return (
    <section className="space-y-6 text-[#272D2C]">

      {/* Workspace Header */}

      <div className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="h-1.5 bg-[#082550]" />

        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E26D5C]">
              CascadEffects Operations Project Management
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#082550]">
              Client Performance
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Persistent client performance records and monthly history.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[440px]">
            <div>
              <label
                htmlFor="client-performance-client"
                className="mb-1.5 block text-xs font-bold text-[#082550]"
              >
                Select Client
              </label>

              <select
                id="client-performance-client"
                value={workspace.client.id}
                disabled={busy}
                onChange={(event) =>
                  handleClientChange(event.target.value)
                }
                className={INPUT_CLASS}
              >
                {clients
                  .filter((client) => client.isEnabled)
                  .map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.displayName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-[#082550]">
                Last Updated
              </p>

              <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#E9F4F8]/60 px-3 py-2">
                <p className="text-sm font-semibold tabular-nums text-[#082550]">
                  {formatDateTime(workspace.client.lastUpdatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-bold text-red-800">
            The operation could not be completed
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="mt-2 text-xs font-bold text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {notice && !error && (
        <div
          role="status"
          className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] px-4 py-3"
        >
          <p className="text-sm font-medium text-[#082550]">
            {notice}
          </p>
        </div>
      )}

      {busy && (
        <p className="text-xs font-medium text-[#082550]">
          Saving changes...
        </p>
      )}

      {/* ====================================================
         1. Current Performance Snapshot
      ==================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="p-5">
          <SectionHeader
            eyebrow="Section 1"
            title="Current Performance Snapshot"
            description="Current client performance overview. Changes are saved when you leave an edited field."
          />

          {snapshotFields.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {snapshotFields.map((field) => {
                const value = getSnapshotValue(
                  workspace,
                  field
                );

                return (
                  <div
                    key={field.id}
                    className="min-w-0 rounded-xl border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4"
                  >
                    <label
                      htmlFor={`snapshot-${field.columnKey}`}
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500"
                    >
                      {field.label}
                      {field.isRequired && (
                        <span className="ml-1 text-[#E26D5C]">
                          *
                        </span>
                      )}
                    </label>

                    {canManage && field.isEditable ? (
                      <input
                        id={`snapshot-${field.columnKey}`}
                        type={getSnapshotInputType(field)}
                        step={
                          field.dataType === "number"
                            ? "any"
                            : undefined
                        }
                        value={value}
                        disabled={busy}
                        onChange={(event) =>
                          updateSnapshotLocal(
                            field.columnKey,
                            event.target.value
                          )
                        }
                        onBlur={(event) =>
                          void saveSnapshotField(
                            field,
                            event.currentTarget.value
                          )
                        }
                        className="w-full border-0 border-b border-[#B4C2D1] bg-transparent px-0 py-2 text-xl font-black tabular-nums text-[#082550] outline-none focus:border-[#E26D5C] disabled:opacity-60"
                      />
                    ) : (
                      <p className="min-h-9 break-words py-2 text-xl font-black tabular-nums text-[#082550]">
                        {value || "Not entered"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-[#F7F9FB] p-5 text-sm text-gray-500">
              No visible snapshot fields are configured for this client.
            </p>
          )}
        </div>
      </section>

      {/* ====================================================
         2. Monthly Metrics
      ==================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="p-5">
          <SectionHeader
            eyebrow="Section 2"
            title="Monthly Metrics"
            description="Monthly production, collection, starts, and days worked. Each year is maintained independently."
            action={
              canManage ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAddYear()}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  + Add Another Year
                </button>
              ) : undefined
            }
          />

          <div className="mt-5 space-y-6">
            {visibleYears.length > 0 ? (
              visibleYears.map((year) => {
                const yearMetrics = getMetricsForYear(year);

                return (
                  <div
                    key={year}
                    className="overflow-hidden rounded-xl border border-[#B4C2D1]/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082550] px-4 py-3">
                      <h4 className="text-sm font-black uppercase tracking-wide text-white">
                        {year}
                      </h4>

                      {canManage && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void handleYearVisibility(year, false)
                          }
                          className="rounded-md border border-white/40 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
                        >
                          Hide Year
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-[#E9F4F8] text-[#082550]">
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                              Month
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                              Production
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                              Collection
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                              Starts
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                              Days Worked
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#B4C2D1]/50">
                          {yearMetrics.map((metric, index) => {
                            const fields: {
                              key: MetricField;
                              value: number | null;
                            }[] = [
                              {
                                key: "production",
                                value: metric.production,
                              },
                              {
                                key: "collection",
                                value: metric.collection,
                              },
                              {
                                key: "starts",
                                value: metric.starts,
                              },
                              {
                                key: "daysWorked",
                                value: metric.daysWorked,
                              },
                            ];

                            return (
                              <tr
                                key={metric.id}
                                className={
                                  index % 2 === 0
                                    ? "bg-white"
                                    : "bg-[#F7F9FB]"
                                }
                              >
                                <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#082550]">
                                  {formatMonth(metric.performanceMonth)}
                                </td>

                                {fields.map((field) => (
                                  <td
                                    key={field.key}
                                    className="min-w-36 px-3 py-2"
                                  >
                                    {canManage ? (
                                      <input
                                        type="number"
                                        step="any"
                                        value={field.value ?? ""}
                                        disabled={busy}
                                        aria-label={`${formatMonth(metric.performanceMonth)} ${year} ${field.key}`}
                                        onBlur={(event) =>
                                          void saveMetricField(
                                            metric,
                                            field.key,
                                            event.currentTarget.value
                                          )
                                        }
                                        onChange={(event) => {
                                          const value =
                                            parseNumber(
                                              event.target.value
                                            );

                                          updateMetricLocal(
                                            metric.id,
                                            field.key,
                                            value
                                          );
                                        }}
                                        className={CELL_INPUT_CLASS}
                                      />
                                    ) : (
                                      <span className="px-2.5 py-2 text-sm tabular-nums text-[#272D2C]">
                                        {field.value ?? "—"}
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-[#F7F9FB] p-5 text-sm text-gray-500">
                No visible performance years are currently available.
              </p>
            )}
          </div>

          {hiddenYears.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#B4C2D1]/70 bg-[#F7F9FB] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide text-[#082550]">
                    Hidden Years
                  </h4>

                  <p className="mt-1 text-xs text-gray-600">
                    Hidden years retain their monthly records and can be restored.
                  </p>
                </div>

                {canManage && (
                  <div className="flex flex-wrap gap-2">
                    {hiddenYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleYearVisibility(year, true)
                        }
                        className={BUTTON_CLASS}
                      >
                        Restore {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!canManage && (
                <p className="mt-3 text-sm text-gray-600">
                  {hiddenYears.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
         3. Key Initiatives Tracker
      ==================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="p-5">
          <SectionHeader
            eyebrow="Section 3"
            title="Key Initiatives Tracker"
            description="Track key initiatives, completed work, completion month, the preserved additional field, and notes."
            action={
              canManage ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAddInitiative()}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  + Add Initiative
                </button>
              ) : undefined
            }
          />

          <div className="mt-5 overflow-x-auto rounded-xl border border-[#B4C2D1]/70">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#082550] text-white">
                  <th className="w-12 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                    #
                  </th>

                  <th className="min-w-52 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Key Initiative
                  </th>

                  <th className="min-w-64 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Description / What Was Completed
                  </th>

                  <th className="min-w-40 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Month Completed
                  </th>

                  <th
                    aria-label="Additional data"
                    className="min-w-48 px-4 py-4"
                  />

                  <th className="min-w-56 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#B4C2D1]/60">
                {sortedInitiatives.length > 0 ? (
                  sortedInitiatives.map((initiative, index) => (
                    <tr
                      key={initiative.id}
                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-[#F7F9FB]"
                      }
                    >
                      <td className="px-3 py-3 text-center text-xs font-bold tabular-nums text-[#082550]/70">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage ? (
                          <textarea
                            key={`${initiative.id}-title-${initiative.title}`}
                            defaultValue={initiative.title}
                            rows={2}
                            disabled={busy}
                            onBlur={(event) =>
                              void saveInitiativeField(
                                initiative,
                                "title",
                                event.currentTarget.value
                              )
                            }
                            className={`${CELL_INPUT_CLASS} resize-y`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap px-2.5 py-2">
                            {initiative.title || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage ? (
                          <textarea
                            key={`${initiative.id}-description-${initiative.description}`}
                            defaultValue={initiative.description}
                            rows={2}
                            disabled={busy}
                            onBlur={(event) =>
                              void saveInitiativeField(
                                initiative,
                                "description",
                                event.currentTarget.value
                              )
                            }
                            className={`${CELL_INPUT_CLASS} resize-y`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap px-2.5 py-2">
                            {initiative.description || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage ? (
                          <input
                            key={`${initiative.id}-month-${initiative.completionMonth ?? ""}`}
                            type="text"
                            defaultValue={initiative.completionMonth ?? ""}
                            placeholder="Month"
                            disabled={busy}
                            onBlur={(event) =>
                              void saveInitiativeField(
                                initiative,
                                "completionMonth",
                                event.currentTarget.value
                              )
                            }
                            className={CELL_INPUT_CLASS}
                          />
                        ) : (
                          <p className="px-2.5 py-2">
                            {initiative.completionMonth || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage ? (
                          <textarea
                            value={
                              editingAdditionalData[initiative.id] ??
                              JSON.stringify(
                                initiative.additionalData ?? {}
                              )
                            }
                            rows={2}
                            disabled={busy}
                            onChange={(event) =>
                              setEditingAdditionalData((current) => ({
                                ...current,
                                [initiative.id]: event.target.value,
                              }))
                            }
                            onBlur={(event) =>
                              void saveAdditionalData(
                                initiative,
                                event.currentTarget.value
                              )
                            }
                            aria-label={`Unlabeled additional data for initiative ${index + 1}`}
                            className={`${CELL_INPUT_CLASS} resize-y font-mono text-xs`}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap break-words px-2.5 py-2 text-xs">
                            {JSON.stringify(
                              initiative.additionalData ?? {},
                              null,
                              2
                            )}
                          </pre>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage ? (
                          <textarea
                            key={`${initiative.id}-notes-${initiative.notes}`}
                            defaultValue={initiative.notes}
                            rows={2}
                            disabled={busy}
                            onBlur={(event) =>
                              void saveInitiativeField(
                                initiative,
                                "notes",
                                event.currentTarget.value
                              )
                            }
                            className={`${CELL_INPUT_CLASS} resize-y`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap px-2.5 py-2">
                            {initiative.notes || "—"}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center"
                    >
                      <p className="text-sm font-bold text-[#082550]">
                        No initiatives recorded
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        {canManage
                          ? "Add an initiative to start tracking client work."
                          : "No initiative records are currently available."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              {canManage && (
                <tfoot>
                  <tr className="bg-[#E9F4F8]/55">
                    <td
                      colSpan={6}
                      className="border-t border-[#B4C2D1]/60 px-4 py-3"
                    >
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAddInitiative()}
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B4C2D1] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#082550] transition hover:border-[#E26D5C] disabled:opacity-40"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#082550] text-lg font-normal leading-none text-white">
                          +
                        </span>
                        Add Initiative
                      </button>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </section>

      <p className="text-right text-[11px] font-medium text-[#082550]/70">
        {workspace.client.displayName} · CascadEffects Operations Project Management
      </p>
    </section>
  );
}
