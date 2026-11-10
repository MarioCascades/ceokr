
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

import { useEffect, useMemo, useRef, useState } from "react";
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
  SaveClientPerformanceWorkspaceInput,
} from "@/lib/types/domain/clientperformance";

/* ==========================================================
   Props and Local Types
========================================================== */

type ClientPerformanceWorkspaceProps = {
  organizationId: string;
  clients: ClientPerformanceClient[];
  initialWorkspace: ClientPerformanceWorkspace;
  canManage: boolean;
  organizationName: string;
  organizationLogoUrl?: string | null;
};

type MetricField =
  | "production"
  | "collection"
  | "starts"
  | "daysWorked"
  | "avgProdPerDay";

type InitiativeField =
  | "title"
  | "description"
  | "completionMonth"
  | "notes";

const ADDITIONAL_DATA_NOTES_START = "[Preserved Additional Data]";
const ADDITIONAL_DATA_NOTES_END = "[End Preserved Additional Data]";

function mergeAdditionalDataIntoNotes(
  notes: string | null | undefined,
  additionalData: Record<string, unknown> | null | undefined
): string {
  const currentNotes = notes ?? "";
  const hasAdditionalData =
    additionalData !== null &&
    additionalData !== undefined &&
    Object.keys(additionalData).length > 0;
  const startIndex = currentNotes.indexOf(ADDITIONAL_DATA_NOTES_START);
  const endIndex =
    startIndex >= 0
      ? currentNotes.indexOf(ADDITIONAL_DATA_NOTES_END, startIndex)
      : -1;

  if (!hasAdditionalData) {
    if (startIndex >= 0 && endIndex >= 0) {
      return `${currentNotes.slice(0, startIndex).trimEnd()}${currentNotes
        .slice(endIndex + ADDITIONAL_DATA_NOTES_END.length)
        .trimStart()}`.trim();
    }
    return currentNotes;
  }

  const preservedBlock = `${ADDITIONAL_DATA_NOTES_START}\n${JSON.stringify(
    additionalData,
    null,
    2
  )}\n${ADDITIONAL_DATA_NOTES_END}`;

  if (startIndex >= 0 && endIndex >= 0) {
    return `${currentNotes.slice(0, startIndex)}${preservedBlock}${currentNotes.slice(
      endIndex + ADDITIONAL_DATA_NOTES_END.length
    )}`;
  }

  return `${currentNotes.trimEnd()}${currentNotes.trim() ? "\n\n" : ""}${preservedBlock}`;
}

function normalizeWorkspaceInitiativeNotes(
  workspace: ClientPerformanceWorkspace
): ClientPerformanceWorkspace {
  return {
    ...workspace,
    initiatives: workspace.initiatives.map((initiative) => ({
      ...initiative,
      notes: mergeAdditionalDataIntoNotes(
        initiative.notes,
        initiative.additionalData
      ),
    })),
  };
}

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

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

function toSnapshotKeySuffix(columnKey: string): string {
  return columnKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function getComparisonSnapshotKey(
  row: "base" | "current",
  field: ClientPerformanceSnapshotField
): string {
  return `${row}_${toSnapshotKeySuffix(field.columnKey)}`;
}

function isStartDateField(field: ClientPerformanceSnapshotField): boolean {
  return (
    field.dataType === "date" ||
    field.columnKey.toLowerCase() === "start" ||
    field.columnKey.toLowerCase() === "startdate" ||
    field.label.trim().toLowerCase() === "start"
  );
}

function formatSnapshotMetric(
  field: ClientPerformanceSnapshotField,
  value: string
): string {
  if (!value) return "Not entered";
  const key = field.columnKey.toLowerCase();
  if (
    key === "production" ||
    key === "collection" ||
    key === "avgprodperday"
  ) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? formatCurrency(parsed) : value;
  }
  return value;
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
  organizationName,
  organizationLogoUrl,
}: ClientPerformanceWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Keep the workspace controls visible directly below Runtime Navigation.
  // The navigation's actual bottom edge changes depending on whether the
  // organization return bar is present and as the page scrolls.
  const workspaceHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStickyOffset = () => {
      const navigation = document.querySelector<HTMLElement>(
        'nav[aria-label="Performance navigation"]'
      );

      if (!navigation) return;

      const nextTop = Math.max(
        0,
        Math.ceil(navigation.getBoundingClientRect().bottom + 12)
      );

      if (workspaceHeaderRef.current) {
        workspaceHeaderRef.current.style.top = `${nextTop}px`;
      }
    };

    updateStickyOffset();

    window.addEventListener("scroll", updateStickyOffset, { passive: true });
    window.addEventListener("resize", updateStickyOffset);

    return () => {
      window.removeEventListener("scroll", updateStickyOffset);
      window.removeEventListener("resize", updateStickyOffset);
    };
  }, []);

  const [workspace, setWorkspace] = useState<ClientPerformanceWorkspace>(() =>
    normalizeWorkspaceInitiativeNotes(initialWorkspace)
  );
  const [savedWorkspace, setSavedWorkspace] =
    useState<ClientPerformanceWorkspace>(initialWorkspace);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setWorkspace(normalizeWorkspaceInitiativeNotes(initialWorkspace));
    setSavedWorkspace(initialWorkspace);
    setIsEditing(false);
  }, [initialWorkspace]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  async function runSave(
    operation: () => Promise<unknown>,
    successMessage: string,
    resultIsTimestamp = true
  ): Promise<void> {
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
  }

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(workspace) !== JSON.stringify(savedWorkspace),
    [workspace, savedWorkspace]
  );

  function beginEditing() {
    setError("");
    setNotice("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setWorkspace(normalizeWorkspaceInitiativeNotes(savedWorkspace));
    setIsEditing(false);
    setError("");
    setNotice("Unsaved changes were discarded.");
  }

  async function saveWorkspaceEdits() {
    const snapshotChanges: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(workspace.snapshot.snapshotData)) {
      if (JSON.stringify(value) !== JSON.stringify(savedWorkspace.snapshot.snapshotData[key])) {
        const field = workspace.client.snapshotFields.find((item) => item.columnKey === key);
        const comparisonMatch = key.match(/^(base|current)_(.+)$/);
        const comparisonField = comparisonMatch
          ? workspace.client.snapshotFields.find(
              (item) => toSnapshotKeySuffix(item.columnKey) === comparisonMatch[2]
            )
          : undefined;
        let parsedValue: unknown = value;
        if (
          (field?.dataType === "number" || comparisonField?.dataType === "number") &&
          typeof value === "string"
        ) {
          parsedValue = parseNumber(value);
        } else if (field?.dataType === "boolean" && typeof value === "string") {
          parsedValue = value === "true";
        } else if (typeof value === "string" && value.trim() === "") {
          parsedValue = null;
        }
        snapshotChanges[key] = parsedValue;
      }
    }

    const metricFields: MetricField[] = ["production", "collection", "starts", "daysWorked", "avgProdPerDay"];
    const monthlyChanges = workspace.monthlyMetrics.flatMap((metric) => {
      const original = savedWorkspace.monthlyMetrics.find((item) => item.id === metric.id);
      if (!original) return [];
      const changes: Record<string, number | null> = {};
      for (const field of metricFields) {
        let value = metric[field];
        if (field === "starts" && value !== null) value = Math.trunc(value);
        if (value !== original[field]) changes[field] = value;
      }
      return Object.keys(changes).length ? [{ id: metric.id, changes }] : [];
    });

    const initiativeChanges = workspace.initiatives.flatMap((initiative) => {
      const original = savedWorkspace.initiatives.find((item) => item.id === initiative.id);
      if (!original) return [];
      const changes: Record<string, unknown> = {};
      for (const field of ["title", "description", "completionMonth", "notes"] as const) {
        if (initiative[field] !== original[field]) changes[field] = initiative[field];
      }
      return Object.keys(changes).length ? [{ id: initiative.id, changes }] : [];
    });

    const hasSnapshot = Object.keys(snapshotChanges).length > 0;
    if (!hasSnapshot && monthlyChanges.length === 0 && initiativeChanges.length === 0) {
      setIsEditing(false);
      setNotice("There are no changes to save.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saveInput: SaveClientPerformanceWorkspaceInput = {
        clientId: workspace.client.id,
        ...(hasSnapshot ? { snapshot: { snapshotData: snapshotChanges } } : {}),
        ...(monthlyChanges.length ? { monthlyMetrics: monthlyChanges as NonNullable<SaveClientPerformanceWorkspaceInput["monthlyMetrics"]> } : {}),
        ...(initiativeChanges.length ? { initiatives: initiativeChanges as NonNullable<SaveClientPerformanceWorkspaceInput["initiatives"]> } : {}),
      };
      const result = await saveClientPerformanceWorkspaceAction({
        organizationId,
        workspace: saveInput,
      });

      const timestamp = typeof result === "string" && result ? result : new Date().toISOString();
      const saved = { ...workspace, client: { ...workspace.client, lastUpdatedAt: timestamp } };
      setWorkspace(saved);
      setSavedWorkspace(saved);
      setIsEditing(false);
      setNotice("Client Performance workspace saved successfully.");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The workspace could not be saved.");
    } finally {
      setBusy(false);
    }
  }

    /* ========================================================
     Client Selection
  ======================================================== */

  function handleClientChange(clientId: string) {
    if (!clientId || clientId === workspace.client.id) {
      return;
    }

    if (isEditing && hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Discard them and switch clients?");
      if (!confirmed) return;
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

      {/* Unified Branded Workspace Header */}
      <div
        ref={workspaceHeaderRef}
        className="sticky top-0 z-30 overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm"
      >
        <div className="relative overflow-hidden bg-[#082550] px-4 py-3 text-white sm:px-5">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                {organizationLogoUrl ? (
                  <div className="flex h-7 max-w-[120px] shrink-0 items-center overflow-hidden rounded-md border border-white/15 bg-white/10 px-2">
                    <img src={organizationLogoUrl} alt={`${organizationName} logo`} className="block max-h-5 max-w-[104px] w-auto object-contain object-left" />
                  </div>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#B4C2D1]">{organizationName}</span>
                )}
                {organizationLogoUrl && <p className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#B4C2D1]">{organizationName}</p>}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-xl font-black uppercase leading-none tracking-tight sm:text-2xl">Client Performance</h2>
                <p className="text-xs font-semibold text-[#E26D5C] sm:text-sm">Organization Performance</p>
              </div>
            </div>
            <div className="flex h-10 shrink-0 items-center justify-end overflow-hidden">
              <img src="/logos/CECleanlogo.png" alt="CascadEffects" className="block h-10 w-auto max-w-[88px] object-contain" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-3 border-t border-[#B4C2D1]/50 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(280px,420px)_minmax(0,1fr)] sm:gap-4 sm:px-5">
          <div className="hidden min-w-0 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E26D5C]">CascadEffects Operations Project Management</p>
          </div>
          <div className="flex w-full flex-col items-center gap-1.5 text-center sm:col-start-2">
            <label htmlFor="client-performance-client" className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#082550]">Select Client</label>
            <select
              id="client-performance-client"
              value={workspace.client.id}
              disabled={busy}
              onChange={(event) => handleClientChange(event.target.value)}
              className="w-full cursor-pointer rounded-lg border border-[#082550]/35 bg-[#E9F4F8] px-4 py-2.5 text-center text-base font-bold text-[#082550] shadow-sm outline-none transition hover:border-[#082550] focus:border-[#082550] focus:ring-2 focus:ring-[#082550]/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clients.filter((client) => client.isEnabled).map((client) => (
                <option key={client.id} value={client.id}>{client.displayName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-center gap-2 sm:col-start-3 sm:items-end">
            {canManage && (
              <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                {isEditing ? (
                  <>
                    <button type="button" disabled={busy} onClick={() => void saveWorkspaceEdits()} className={PRIMARY_BUTTON_CLASS}>Save Changes</button>
                    <button type="button" disabled={busy} onClick={cancelEditing} className={BUTTON_CLASS}>Cancel</button>
                  </>
                ) : (
                  <button type="button" disabled={busy} onClick={beginEditing} className={PRIMARY_BUTTON_CLASS}>Edit</button>
                )}
              </div>
            )}
            <p className="text-xs font-bold text-[#082550]">Last Updated</p>
            <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#E9F4F8]/60 px-3 py-2">
              <p className="text-xs font-semibold tabular-nums text-[#082550]">{formatDateTime(workspace.client.lastUpdatedAt)}</p>
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
            description="Current client performance overview. Use Edit to make changes, then save the workspace together."
          />

          {snapshotFields.length > 0 ? (
            <>
              {snapshotFields.filter(isStartDateField).map((field) => {
                const value = getSnapshotValue(workspace, field);

                return (
                  <div
                    key={field.id}
                    className="mt-5 max-w-sm rounded-xl border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4"
                  >
                    <label
                      htmlFor={`snapshot-${field.columnKey}`}
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500"
                    >
                      {field.label}
                      {field.isRequired && (
                        <span className="ml-1 text-[#E26D5C]">*</span>
                      )}
                    </label>
                    {canManage && field.isEditable && isEditing ? (
                      <input
                        id={`snapshot-${field.columnKey}`}
                        type={getSnapshotInputType(field)}
                        value={value}
                        disabled={busy}
                        onChange={(event) =>
                          updateSnapshotLocal(field.columnKey, event.target.value)
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

              {snapshotFields.filter((field) => !isStartDateField(field)).length > 0 ? (
                <div className="mt-5 overflow-x-auto rounded-xl border border-[#B4C2D1]/70">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-[#E9F4F8] text-[#082550]">
                        <th className="w-44 px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                          Performance
                        </th>
                        {snapshotFields
                          .filter((field) => !isStartDateField(field))
                          .map((field) => (
                            <th
                              key={field.id}
                              className="min-w-36 px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {field.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#B4C2D1]/50">
                      {(["base", "current"] as const).map((row) => (
                        <tr
                          key={row}
                          className={row === "base" ? "bg-white" : "bg-[#F7F9FB]"}
                        >
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-wide text-[#082550]">
                            {row === "base" ? "Base (before CE)" : "Current (with CE)"}
                          </th>
                          {snapshotFields
                            .filter((field) => !isStartDateField(field))
                            .map((field) => {
                              const comparisonKey = getComparisonSnapshotKey(row, field);
                              const legacyCurrentValue =
                                row === "current"
                                  ? workspace.snapshot.snapshotData[field.columnKey]
                                  : undefined;
                              const rawValue =
                                workspace.snapshot.snapshotData[comparisonKey] ??
                                legacyCurrentValue;
                              const value = displayValue(rawValue);
                              const editable =
                                canManage && field.isEditable && isEditing;

                              return (
                                <td key={field.id} className="min-w-36 px-3 py-2">
                                  {editable ? (
                                    field.dataType === "text" && field.columnKey.toLowerCase() === "notes" ? (
                                      <textarea
                                        value={value}
                                        rows={2}
                                        disabled={busy}
                                        aria-label={`${row} ${field.label}`}
                                        onChange={(event) =>
                                          updateSnapshotLocal(comparisonKey, event.target.value)
                                        }
                                        className={`${CELL_INPUT_CLASS} resize-y`}
                                      />
                                    ) : (
                                      <input
                                        type={field.dataType === "number" ? "number" : "text"}
                                        step={field.dataType === "number" ? "any" : undefined}
                                        value={value}
                                        disabled={busy}
                                        aria-label={`${row} ${field.label}`}
                                        onChange={(event) =>
                                          updateSnapshotLocal(comparisonKey, event.target.value)
                                        }
                                        className={CELL_INPUT_CLASS}
                                      />
                                    )
                                  ) : (
                                    <span className="px-2.5 py-2 text-sm tabular-nums text-[#272D2C]">
                                      {formatSnapshotMetric(field, value)}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
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
            description="Monthly production, collection, starts, and days worked. Kirkland & Redmond also includes average production per day."
            action={
              canManage ? (
                <button
                  type="button"
                  disabled={busy || isEditing}
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
                          disabled={busy || isEditing}
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
                      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
                            {workspace.client.clientKey === "kirkland-redmond" && (
                              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Avg Prod per Day</th>
                            )}
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
                              ...(workspace.client.clientKey === "kirkland-redmond" ? [{ key: "avgProdPerDay" as const, value: metric.avgProdPerDay }] : []),
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
                                    {canManage && isEditing ? (
                                      <input
                                        type="number"
                                        step="any"
                                        value={field.value ?? ""}
                                        disabled={busy}
                                        aria-label={`${formatMonth(metric.performanceMonth)} ${year} ${field.key}`}
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
                                        {field.key === "production" || field.key === "collection" || field.key === "avgProdPerDay" ? formatCurrency(field.value) : field.value ?? "—"}
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
                        disabled={busy || isEditing}
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
            description="Track key initiatives, completed work, completion month, and notes."
            action={
              canManage ? (
                <button
                  type="button"
                  disabled={busy || isEditing}
                  onClick={() => void handleAddInitiative()}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  + Add Initiative
                </button>
              ) : undefined
            }
          />

          <div className="mt-5 overflow-x-auto rounded-xl border border-[#B4C2D1]/70">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
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

                  <th className="min-w-[28rem] px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
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
                        {canManage && isEditing ? (
                          <textarea
                            value={initiative.title}
                            onChange={(event) => updateInitiativeLocal(initiative.id, "title", event.target.value)}
                            rows={2}
                            disabled={busy}
                            className={`${CELL_INPUT_CLASS} resize-y`}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap px-2.5 py-2">
                            {initiative.title || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage && isEditing ? (
                          <textarea
                            value={initiative.description}
                            onChange={(event) => updateInitiativeLocal(initiative.id, "description", event.target.value)}
                            rows={2}
                            disabled={busy}
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
                            type="text"
                            value={initiative.completionMonth ?? ""}
                            onChange={(event) => updateInitiativeLocal(initiative.id, "completionMonth", event.target.value) }
                            placeholder="Month"
                            disabled={busy}
                            className={CELL_INPUT_CLASS}
                          />
                        ) : (
                          <p className="px-2.5 py-2">
                            {initiative.completionMonth || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {canManage && isEditing ? (
                          <textarea
                            value={initiative.notes}
                            onChange={(event) => updateInitiativeLocal(initiative.id, "notes", event.target.value)}
                            rows={2}
                            disabled={busy}
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
                      colSpan={5}
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
                      colSpan={5}
                      className="border-t border-[#B4C2D1]/60 px-4 py-3"
                    >
                      <button
                        type="button"
                        disabled={busy || isEditing}
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
