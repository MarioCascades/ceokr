"use client";

import { useCallback, useMemo, useState } from "react";

import type { CustomTableColumn } from "@/lib/types/domain/customtable";

import {
  addCustomTableOperationalRowAction,
  editCustomTableOperationalRowAction,
  hideCustomTableOperationalRowAction,
  listCustomTableOperationalRowsAction,
  reorderCustomTableOperationalRowsAction,
  restoreCustomTableOperationalRowAction,
} from "@/app/organization/customtables/[tableId]/workspaceactions";

type OperationalRow = Awaited<
  ReturnType<typeof listCustomTableOperationalRowsAction>
>[number];

type OperationalStatus = OperationalRow["operationalStatus"];

type AddRowInput = Parameters<
  typeof addCustomTableOperationalRowAction
>[0];

type EditRowInput = Parameters<
  typeof editCustomTableOperationalRowAction
>[3];

type CustomTableOperationalWorkspaceProps = {
  organizationId: string;
  tableDefinitionId: string;
  tableName: string;
  columns: CustomTableColumn[];
  initialRows: OperationalRow[];
  canEditRows: boolean;
};

type MoveDirection = "up" | "down" | "top" | "bottom";

type SortDirection = "asc" | "desc";

const STATUS_OPTIONS: {
  value: OperationalStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "in_progress" as OperationalStatus,
    label: "In Progress",
    className: "border-orange-300 bg-orange-50 text-orange-800",
  },
  {
    value: "on_hold" as OperationalStatus,
    label: "On Hold",
    className: "border-yellow-300 bg-yellow-50 text-yellow-800",
  },
  {
    value: "completed" as OperationalStatus,
    label: "Completed",
    className: "border-green-300 bg-green-50 text-green-800",
  },
  {
    value: "cancelled" as OperationalStatus,
    label: "Cancelled",
    className: "border-red-300 bg-red-50 text-red-800",
  },
];

const BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-40";

const INPUT_CLASS =
  "w-full rounded-lg border border-[#B4C2D1]/80 bg-white px-3 py-2 text-sm text-[#272D2C] outline-none transition focus:border-[#E26D5C] focus:ring-1 focus:ring-[#E26D5C]/20 disabled:cursor-not-allowed disabled:opacity-60";

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getCellValue(
  row: OperationalRow,
  column: CustomTableColumn
): string {
  const value = row.rowData[column.columnKey];

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getStatusLabel(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status.replaceAll("_", " ")
  );
}

function getStatusClass(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.className ??
    "border-gray-200 bg-gray-50 text-gray-700"
  );
}

function getNumericValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

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

function findColumn(
  columns: CustomTableColumn[],
  aliases: string[]
): CustomTableColumn | undefined {
  const normalizedAliases = aliases.map(normalizeText);

  return columns.find((column) => {
    const normalizedKey = normalizeText(column.columnKey);
    const normalizedLabel = normalizeText(column.label);

    return normalizedAliases.some(
      (alias) => alias === normalizedKey || alias === normalizedLabel
    );
  });
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function compareValues(
  left: unknown,
  right: unknown,
  dataType: string
): number {
  const leftNumber = getNumericValue(left);
  const rightNumber = getNumericValue(right);

  if (
    leftNumber !== null &&
    rightNumber !== null &&
    (dataType === "number" ||
      dataType === "numeric" ||
      dataType === "integer" ||
      dataType === "decimal")
  ) {
    return leftNumber - rightNumber;
  }

  return compareText(String(left ?? ""), String(right ?? ""));
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#B4C2D1]/70 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-black tabular-nums text-[#082550]">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function CustomTableOperationalWorkspace({
  organizationId,
  tableDefinitionId,
  tableName,
  columns,
  initialRows,
  canEditRows,
}: CustomTableOperationalWorkspaceProps) {
  const [rows, setRows] = useState<OperationalRow[]>(initialRows);
  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchText, setSearchText] = useState("");
  const [sortColumnKey, setSortColumnKey] = useState("__position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [minimumHours, setMinimumHours] = useState("");
  const [maximumHours, setMaximumHours] = useState("");

  const visibleColumns = useMemo(
    () =>
      [...columns]
        .filter((column) => column.isVisible)
        .sort((a, b) => a.position - b.position),
    [columns]
  );

  const activeRows = useMemo(
    () =>
      [...rows]
        .filter((row) => !row.isHidden)
        .sort((a, b) => a.position - b.position),
    [rows]
  );

  const hiddenRows = useMemo(
    () =>
      [...rows]
        .filter((row) => row.isHidden)
        .sort((a, b) => a.position - b.position),
    [rows]
  );

  const isVaRoster = useMemo(() => {
    const normalizedName = normalizeText(tableName);

    return normalizedName === "varoster" || normalizedName === "valist";
  }, [tableName]);

  const nameColumn = useMemo(
    () =>
      findColumn(columns, [
        "VA Name",
        "Name",
        "Virtual Assistant Name",
        "va_name",
      ]),
    [columns]
  );

  const clientColumn = useMemo(
    () =>
      findColumn(columns, [
        "Client / Account",
        "Client",
        "Account",
        "Client Account",
        "client_account",
      ]),
    [columns]
  );

  const hoursColumn = useMemo(
    () =>
      findColumn(columns, [
        "Pre-Defined Hours / Week",
        "Predefined Hours Per Week",
        "Hours / Week",
        "Hours Per Week",
        "Weekly Hours",
        "weekly_hours",
      ]),
    [columns]
  );

  const latestUpdatedAt = useMemo(() => {
    const timestamps = activeRows
      .map((row) => new Date(row.updatedAt).getTime())
      .filter((timestamp) => Number.isFinite(timestamp));

    if (timestamps.length === 0) {
      return null;
    }

    return new Date(Math.max(...timestamps)).toISOString();
  }, [activeRows]);

  const totalWeeklyHours = useMemo(
    () =>
      activeRows.reduce((total, row) => {
        if (!hoursColumn) {
          return total;
        }

        return (
          total +
          (getNumericValue(row.rowData[hoursColumn.columnKey]) ?? 0)
        );
      }, 0),
    [activeRows, hoursColumn]
  );

  const actualVaCount = useMemo(() => {
    if (!nameColumn) {
      return activeRows.length;
    }

    return activeRows.filter(
      (row) => getCellValue(row, nameColumn).trim().length > 0
    ).length;
  }, [activeRows, nameColumn]);

  const hasActiveViewFilters =
    searchText.trim().length > 0 ||
    minimumHours.trim().length > 0 ||
    maximumHours.trim().length > 0 ||
    sortColumnKey !== "__position";

  const displayedRows = useMemo(() => {
    const sourceRows = showHidden ? hiddenRows : activeRows;
    const normalizedSearch = searchText.trim().toLowerCase();
    const min = minimumHours.trim() === "" ? null : Number(minimumHours);
    const max = maximumHours.trim() === "" ? null : Number(maximumHours);

    const filteredRows = sourceRows.filter((row) => {
      if (normalizedSearch) {
        const matchesSearch = visibleColumns.some((column) =>
          getCellValue(row, column)
            .toLowerCase()
            .includes(normalizedSearch)
        );

        if (!matchesSearch) {
          return false;
        }
      }

      if (isVaRoster && hoursColumn) {
        const hours = getNumericValue(
          row.rowData[hoursColumn.columnKey]
        );

        if (min !== null && Number.isFinite(min)) {
          if (hours === null || hours < min) {
            return false;
          }
        }

        if (max !== null && Number.isFinite(max)) {
          if (hours === null || hours > max) {
            return false;
          }
        }
      }

      return true;
    });

    if (sortColumnKey === "__position") {
      return filteredRows.sort((a, b) => a.position - b.position);
    }

    const selectedColumn = visibleColumns.find(
      (column) => column.columnKey === sortColumnKey
    );

    if (!selectedColumn) {
      return filteredRows.sort((a, b) => a.position - b.position);
    }

    return filteredRows.sort((a, b) => {
      const comparison = compareValues(
        a.rowData[selectedColumn.columnKey],
        b.rowData[selectedColumn.columnKey],
        selectedColumn.dataType
      );

      if (comparison === 0) {
        return a.position - b.position;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    activeRows,
    hiddenRows,
    showHidden,
    searchText,
    minimumHours,
    maximumHours,
    isVaRoster,
    hoursColumn,
    visibleColumns,
    sortColumnKey,
    sortDirection,
  ]);

  const runAction = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | null> => {
      setBusy(true);
      setError("");
      setNotice("");

      try {
        return await action();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "The operation could not be completed."
        );

        return null;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const updateRow = useCallback((updatedRow: OperationalRow) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === updatedRow.id ? updatedRow : row
      )
    );
  }, []);

  async function handleRefresh() {
    const result = await runAction(() =>
      listCustomTableOperationalRowsAction(
        organizationId,
        tableDefinitionId
      )
    );

    if (result) {
      setRows(result);
      setNotice("Operational list refreshed.");
    }
  }

  async function handleAddRow() {
    const rowData: Record<string, unknown> = {};

    for (const column of columns) {
      rowData[column.columnKey] = "";
    }

    const input: AddRowInput = {
      organizationId,
      tableDefinitionId,
      rowData,
      operationalStatus: "in_progress" as OperationalStatus,
      isHidden: false,
      position: activeRows.length,
    };

    const result = await runAction(() =>
      addCustomTableOperationalRowAction(input)
    );

    if (result) {
      setRows((currentRows) => [...currentRows, result]);
      setShowHidden(false);
      setSearchText("");
      setMinimumHours("");
      setMaximumHours("");
      setSortColumnKey("__position");
      setSortDirection("asc");
      setNotice("Row added. Enter details in the cells.");
    }
  }

  async function handleSaveCell(
    row: OperationalRow,
    column: CustomTableColumn,
    value: string
  ) {
    if (getCellValue(row, column) === value) {
      return;
    }

    const input: EditRowInput = {
      rowData: {
        ...row.rowData,
        [column.columnKey]: value,
      },
    };

    const result = await runAction(() =>
      editCustomTableOperationalRowAction(
        organizationId,
        tableDefinitionId,
        row.id,
        input
      )
    );

    if (result) {
      updateRow(result);
      setNotice("Changes saved.");
    }
  }

  async function handleStatusChange(
    row: OperationalRow,
    status: OperationalStatus
  ) {
    if (row.operationalStatus === status) {
      return;
    }

    const input: EditRowInput = {
      operationalStatus: status,
    };

    const result = await runAction(() =>
      editCustomTableOperationalRowAction(
        organizationId,
        tableDefinitionId,
        row.id,
        input
      )
    );

    if (result) {
      updateRow(result);
      setNotice("Workflow status updated.");
    }
  }

  async function handleHideRestore(row: OperationalRow) {
    const result = await runAction(() =>
      row.isHidden
        ? restoreCustomTableOperationalRowAction(
            organizationId,
            tableDefinitionId,
            row.id
          )
        : hideCustomTableOperationalRowAction(
            organizationId,
            tableDefinitionId,
            row.id
          )
    );

    if (result) {
      updateRow(result);
      setNotice(
        result.isHidden
          ? "Row moved to hidden listings."
          : "Row restored to active listings."
      );
    }
  }

  async function handleMove(
    row: OperationalRow,
    direction: MoveDirection
  ) {
    if (hasActiveViewFilters) {
      setError("Clear sorting and filters before changing row order.");
      return;
    }

    const sectionRows = row.isHidden ? hiddenRows : activeRows;
    const currentIndex = sectionRows.findIndex(
      (item) => item.id === row.id
    );

    if (currentIndex < 0 || sectionRows.length < 2) {
      return;
    }

    const reordered = [...sectionRows];
    const [movingRow] = reordered.splice(currentIndex, 1);

    let targetIndex: number;

    switch (direction) {
      case "top":
        targetIndex = 0;
        break;
      case "bottom":
        targetIndex = reordered.length;
        break;
      case "up":
        targetIndex = Math.max(0, currentIndex - 1);
        break;
      case "down":
        targetIndex = Math.min(reordered.length, currentIndex + 1);
        break;
    }

    reordered.splice(targetIndex, 0, movingRow);

    const result = await runAction(() =>
      reorderCustomTableOperationalRowsAction(
        organizationId,
        tableDefinitionId,
        reordered.map((item) => item.id),
        row.isHidden
      )
    );

    if (result) {
      const updatedRows = new Map(
        result.map((item) => [item.id, item])
      );

      setRows((currentRows) =>
        currentRows.map(
          (item) => updatedRows.get(item.id) ?? item
        )
      );

      setNotice("Row order saved.");
    }
  }

  function clearViewControls() {
    setSearchText("");
    setMinimumHours("");
    setMaximumHours("");
    setSortColumnKey("__position");
    setSortDirection("asc");
  }

  function handleSortColumnChange(value: string) {
    setSortColumnKey(value);
    setError("");
  }

  function handleSortDirectionChange(value: SortDirection) {
    setSortDirection(value);
    setError("");
  }

  // Workflow Status is intentionally hidden only for VA Roster / VA List.
  // Other operational tables retain the existing status column and controls.
  const showWorkflowStatus = !isVaRoster;
  const tableColumnCount =
    visibleColumns.length + 2 + (showWorkflowStatus ? 1 : 0);

  return (
    <section className="space-y-5 text-[#272D2C]">
      {isVaRoster && (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E26D5C]">
              Roster Summary
            </p>

            <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[#082550]">
              VA Roster
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Summary metrics use active roster rows and do not change
              when you search, filter, or sort the table.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Hours / Week"
              value={formatNumber(totalWeeklyHours)}
              description="Active roster rows"
            />

            <MetricCard
              label="Adjusted VA Number"
              value={formatNumber(totalWeeklyHours / 40)}
              description="Total weekly hours divided by 40"
            />

            <MetricCard
              label="Actual VA Number"
              value={formatNumber(actualVaCount)}
              description="Active roster entries with a VA name"
            />

            <MetricCard
              label="Last Updated"
              value={formatDateTime(latestUpdatedAt)}
              description="Latest saved row timestamp"
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="h-1.5 bg-[#082550]" />

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E26D5C]">
              Operational Workspace
            </p>

            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-[#082550] sm:text-2xl">
              {tableName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Manage persistent operational records. Changes remain
              in the current list and are not tied to a performance
              month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRefresh()}
              className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
            >
              Refresh
            </button>

            {canEditRows && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleAddRow()}
                className="inline-flex items-center justify-center rounded-lg border border-[#082550] bg-[#082550] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12396C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Add Row
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-bold text-red-800">
            The operation could not be completed
          </p>

          <p className="mt-1 text-sm text-red-700">{error}</p>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#B4C2D1]/70 bg-white px-3.5 py-2">
            <span className="text-xs font-semibold text-[#082550]">
              Active
            </span>

            <span className="text-sm font-black tabular-nums text-[#082550]">
              {activeRows.length}
            </span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#B4C2D1]/50 bg-[#E9F4F8] px-3.5 py-2">
            <span className="text-xs font-semibold text-[#272D2C]">
              Hidden
            </span>

            <span className="text-sm font-black tabular-nums text-[#272D2C]">
              {hiddenRows.length}
            </span>
          </span>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setShowHidden((current) => !current);
            clearViewControls();
          }}
          className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
        >
          {showHidden ? "View Active Listings" : "Show Hidden Rows"}
          <span className="ml-2 rounded-full bg-[#E9F4F8] px-2 py-0.5">
            {showHidden ? activeRows.length : hiddenRows.length}
          </span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#B4C2D1]/80 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#B4C2D1]/60 bg-[#F7F9FB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
              {showHidden ? "Hidden Listings" : "Active Listings"}
            </h3>

            <p className="mt-1 text-xs text-gray-600">
              {showHidden
                ? "Restore hidden records to return them to the active list."
                : canEditRows
                  ? "Select a cell to edit. Changes are saved when you leave the cell."
                  : "You have read-only access to this operational list."}
            </p>
          </div>

          <span className="text-xs font-medium text-gray-500">
            {displayedRows.length} rows
            {busy ? " · Saving changes" : ""}
          </span>
        </div>

        <div className="space-y-4 border-b border-[#B4C2D1]/60 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label
                htmlFor="operational-row-search"
                className="mb-1.5 block text-xs font-bold text-[#082550]"
              >
                Search rows
              </label>

              <input
                id="operational-row-search"
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search visible column values..."
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label
                htmlFor="operational-row-sort"
                className="mb-1.5 block text-xs font-bold text-[#082550]"
              >
                Sort by
              </label>

              <select
                id="operational-row-sort"
                value={sortColumnKey}
                onChange={(event) =>
                  handleSortColumnChange(event.target.value)
                }
                className={INPUT_CLASS}
              >
                <option value="__position">Default row order</option>

                {visibleColumns.map((column) => (
                  <option key={column.id} value={column.columnKey}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="operational-sort-direction"
                  className="mb-1.5 block text-xs font-bold text-[#082550]"
                >
                  Sort direction
                </label>

                <select
                  id="operational-sort-direction"
                  value={sortDirection}
                  onChange={(event) =>
                    handleSortDirectionChange(
                      event.target.value as SortDirection
                    )
                  }
                  className={INPUT_CLASS}
                >
                  <option value="asc">
                    Ascending, A to Z / Low to High
                  </option>
                  <option value="desc">
                    Descending, Z to A / High to Low
                  </option>
                </select>
              </div>

              {isVaRoster && (
                <>
                  <div>
                    <label
                      htmlFor="operational-min-hours"
                      className="mb-1.5 block text-xs font-bold text-[#082550]"
                    >
                      Minimum weekly hours
                    </label>

                    <input
                      id="operational-min-hours"
                      type="number"
                      min="0"
                      step="any"
                      value={minimumHours}
                      onChange={(event) =>
                        setMinimumHours(event.target.value)
                      }
                      placeholder="No minimum"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="operational-max-hours"
                      className="mb-1.5 block text-xs font-bold text-[#082550]"
                    >
                      Maximum weekly hours
                    </label>

                    <input
                      id="operational-max-hours"
                      type="number"
                      min="0"
                      step="any"
                      value={maximumHours}
                      onChange={(event) =>
                        setMaximumHours(event.target.value)
                      }
                      placeholder="No maximum"
                      className={INPUT_CLASS}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              disabled={busy || !hasActiveViewFilters}
              onClick={clearViewControls}
              className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
            >
              Clear Sort and Filters
            </button>
          </div>

          {isVaRoster && !hoursColumn && (
            <p className="text-xs text-amber-700">
              Weekly-hours filtering and the total-hours metric require a
              configured column named Pre-Defined Hours / Week.
            </p>
          )}

          {isVaRoster && !nameColumn && (
            <p className="text-xs text-amber-700">
              The actual VA count currently uses active row count because
              a recognizable VA Name column was not found.
            </p>
          )}

          {hasActiveViewFilters && (
            <p className="text-xs text-gray-500">
              Row reordering is disabled while sorting or filtering is active.
              Clear the controls to restore the saved order.
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#082550] text-white">
                <th className="w-32 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                  Order
                </th>

                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="border-r border-white/15 px-4 py-4 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {column.label}

                    {column.isRequired && (
                      <span className="ml-1 text-[#E26D5C]">*</span>
                    )}
                  </th>
                ))}

                {showWorkflowStatus && (
                  <th className="min-w-40 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Workflow Status
                  </th>
                )}

                <th className="w-24 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#B4C2D1]/60">
              {displayedRows.length > 0 ? (
                displayedRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={
                      row.isHidden
                        ? "bg-[#F7F9FB]"
                        : index % 2 === 0
                          ? "bg-white hover:bg-[#E9F4F8]/55"
                          : "bg-[#F7F9FB]/70 hover:bg-[#E9F4F8]/70"
                    }
                  >
                    <td className="border-r border-[#B4C2D1]/45 px-3 py-3 align-top">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-[#082550]/70">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>

                        {canEditRows && (
                          <div className="flex flex-wrap justify-center gap-1">
                            <button
                              type="button"
                              title="Move to top"
                              aria-label="Move row to top"
                              disabled={
                                busy ||
                                hasActiveViewFilters ||
                                index === 0
                              }
                              onClick={() => void handleMove(row, "top")}
                              className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-[10px] font-bold text-[#082550] disabled:opacity-30"
                            >
                              Top
                            </button>

                            <button
                              type="button"
                              title="Move up"
                              aria-label="Move row up"
                              disabled={
                                busy ||
                                hasActiveViewFilters ||
                                index === 0
                              }
                              onClick={() => void handleMove(row, "up")}
                              className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-xs font-bold text-[#082550] disabled:opacity-30"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              title="Move down"
                              aria-label="Move row down"
                              disabled={
                                busy ||
                                hasActiveViewFilters ||
                                index === displayedRows.length - 1
                              }
                              onClick={() => void handleMove(row, "down")}
                              className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-xs font-bold text-[#082550] disabled:opacity-30"
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              title="Move to bottom"
                              aria-label="Move row to bottom"
                              disabled={
                                busy ||
                                hasActiveViewFilters ||
                                index === displayedRows.length - 1
                              }
                              onClick={() => void handleMove(row, "bottom")}
                              className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-[10px] font-bold text-[#082550] disabled:opacity-30"
                            >
                              End
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="min-w-44 border-r border-[#B4C2D1]/40 px-3 py-3 align-top"
                      >
                        {canEditRows &&
                        column.isEditable &&
                        !row.isHidden ? (
                          <textarea
                            key={`${row.id}-${column.id}-${getCellValue(row, column)}`}
                            aria-label={`${column.label}, row ${index + 1}`}
                            defaultValue={getCellValue(row, column)}
                            rows={1}
                            disabled={busy}
                            onFocus={(event) => {
                              const textarea = event.currentTarget;
                              textarea.style.height = "auto";
                              textarea.style.height = `${textarea.scrollHeight}px`;
                            }}
                            onInput={(event) => {
                              const textarea = event.currentTarget;
                              textarea.style.height = "auto";
                              textarea.style.height = `${textarea.scrollHeight}px`;
                            }}
                            onBlur={(event) =>
                              void handleSaveCell(
                                row,
                                column,
                                event.currentTarget.value
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                (event.ctrlKey || event.metaKey)
                              ) {
                                event.preventDefault();
                                event.currentTarget.blur();
                              }
                            }}
                            className="block min-h-9 w-full min-w-32 resize-none overflow-hidden whitespace-pre-wrap break-words rounded-md border border-transparent bg-transparent px-2.5 py-2 text-sm leading-5 text-[#272D2C] outline-none transition hover:border-[#B4C2D1] focus:border-[#E26D5C] focus:bg-white disabled:opacity-60"
                          />
                        ) : (
                          <div className="min-h-9 whitespace-pre-wrap break-words px-2.5 py-2 text-sm leading-5 text-[#272D2C]/85">
                            {getCellValue(row, column) || (
                              <span className="text-[#B4C2D1]">
                                Not entered
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    ))}

                    {showWorkflowStatus && (
                      <td className="border-r border-[#B4C2D1]/40 px-3 py-3 align-top">
                        {canEditRows && !row.isHidden ? (
                          <select
                            aria-label={`Workflow status, row ${index + 1}`}
                            value={row.operationalStatus}
                            disabled={busy}
                            onChange={(event) =>
                              void handleStatusChange(
                                row,
                                event.target.value as OperationalStatus
                              )
                            }
                            className={`w-full min-w-32 rounded-lg border px-2.5 py-2 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50 ${getStatusClass(row.operationalStatus)}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(row.operationalStatus)}`}
                          >
                            {getStatusLabel(row.operationalStatus)}
                          </span>
                        )}
                      </td>
                    )}

                    <td className="px-3 py-3 align-top">
                      {canEditRows && (
                        <button
                          type="button"
                          aria-label={
                            row.isHidden ? "Restore row" : "Hide row"
                          }
                          disabled={busy}
                          onClick={() => void handleHideRestore(row)}
                          className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
                        >
                          {row.isHidden ? "Restore" : "Hide"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableColumnCount}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-sm font-bold text-[#082550]">
                      {showHidden
                        ? "No hidden listings"
                        : hasActiveViewFilters
                          ? "No matching records"
                          : "Your operational list is ready"}
                    </p>

                    <p className="mt-2 text-sm leading-5 text-gray-600">
                      {showHidden
                        ? "There are no hidden records to restore."
                        : hasActiveViewFilters
                          ? "Try adjusting your search or filters."
                          : canEditRows
                            ? "Add a row to start recording operational activity."
                            : "No active records are currently available."}
                    </p>
                  </td>
                </tr>
              )}

              {canEditRows && !showHidden && (
                <tr className="bg-[#E9F4F8]/55">
                  <td
                    colSpan={tableColumnCount}
                    className="border-t border-[#B4C2D1]/60 px-4 py-3"
                  >
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAddRow()}
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B4C2D1] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#082550] transition hover:border-[#E26D5C] disabled:opacity-40"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#082550] text-lg font-normal leading-none text-white">
                        +
                      </span>
                      Add Row
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#B4C2D1]/60 bg-[#F7F9FB] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-gray-500">
            CascadEffects Operations Project Management
          </p>

          <p className="text-[11px] font-medium text-[#082550]/70">
            {displayedRows.length} displayed records
          </p>
        </div>
      </div>
    </section>
  );
}