"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  CustomTableColumn,
  CustomTableRow,
  CustomTableWorkspace,
} from "@/lib/types/domain/customtable";

import {
  addCustomTableRowAction,
  copyForwardCustomTableMonthAction,
  editCustomTableRowAction,
  hideCustomTableRowAction,
  loadCustomTableWorkspaceAction,
  reorderCustomTableRowsAction,
  restoreCustomTableRowAction,
} from "@/app/organization/customtables/[tableId]/workspaceactions";

type CustomTableMonthlyWorkspaceProps = {
  organizationId: string;
  tableDefinitionId: string;
  initialWorkspace: CustomTableWorkspace;
  canEditRows: boolean;
};

type OperationalStatus =
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

const BRAND = {
  navy: "#082550",
  blueGray: "#B4C2D1",
  lightBlue: "#E9F4F8",
  charcoal: "#272D2C",
  white: "#FFFFFF",
  coral: "#E26D5C",
};

const STATUS_OPTIONS: {
  value: OperationalStatus;
  label: string;
  classes: string;
}[] = [
  {
    value: "in_progress",
    label: "In Progress",
    classes: "border-[#F97316] bg-[#F97316] text-white",
  },
  {
    value: "on_hold",
    label: "On Hold",
    classes: "border-[#FACC15] bg-[#FACC15] text-[#272D2C]",
  },
  {
    value: "completed",
    label: "Completed",
    classes: "border-[#16A34A] bg-[#16A34A] text-white",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    classes: "border-[#DC2626] bg-[#DC2626] text-white",
  },
];

function toPerformanceMonth(month: string): string {
  return `${month}-01`;
}

function toMonthInputValue(performanceMonth: string): string {
  return performanceMonth.slice(0, 7);
}

function getStatusClasses(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)
      ?.classes ??
    "border-[#B4C2D1] bg-[#F7F9FB] text-[#272D2C]"
  );
}

function getStatusLabel(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
  );
}

function getCellValue(
  row: CustomTableRow,
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

export default function CustomTableMonthlyWorkspace({
  organizationId,
  tableDefinitionId,
  initialWorkspace,
  canEditRows,
}: CustomTableMonthlyWorkspaceProps) {
  const [workspace, setWorkspace] =
    useState<CustomTableWorkspace>(initialWorkspace);

  const [selectedMonth, setSelectedMonth] = useState(
    toMonthInputValue(initialWorkspace.month.performanceMonth)
  );

  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const visibleColumns = useMemo(
    () =>
      [...workspace.columns]
        .filter((column) => column.isVisible)
        .sort((a, b) => a.position - b.position),
    [workspace.columns]
  );

  const activeRows = useMemo(
    () =>
      [...workspace.rows]
        .filter((row) => !row.isHidden)
        .sort((a, b) => a.position - b.position),
    [workspace.rows]
  );

  const hiddenRows = useMemo(
    () =>
      [...workspace.rows]
        .filter((row) => row.isHidden)
        .sort((a, b) => a.position - b.position),
    [workspace.rows]
  );

  const displayedRows = showHidden ? hiddenRows : activeRows;

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

  const refreshWorkspace = useCallback(
    async (monthValue: string) => {
      const performanceMonth = toPerformanceMonth(monthValue);

      const result = await runAction(() =>
        loadCustomTableWorkspaceAction(
          organizationId,
          tableDefinitionId,
          performanceMonth
        )
      );

      if (result) {
        setWorkspace(result);
        setSelectedMonth(monthValue);
        setNotice("Workspace loaded.");
      }
    },
    [organizationId, tableDefinitionId, runAction]
  );

  async function handleAddRow() {
    const rowData: Record<string, unknown> = {};

    for (const column of workspace.columns) {
      rowData[column.columnKey] = "";
    }

    const result = await runAction(() =>
      addCustomTableRowAction({
        organizationId,
        tableDefinitionId,
        tableMonthId: workspace.month.id,
        rowData,
        operationalStatus: "in_progress",
        isHidden: false,
        position: activeRows.length,
      })
    );

    if (result) {
      setWorkspace((current) => ({
        ...current,
        rows: [...current.rows, result],
      }));

      setNotice("Blank row added. Click a cell to enter details.");
    }
  }

  async function handleSaveCell(
    row: CustomTableRow,
    column: CustomTableColumn,
    value: string
  ) {
    if (getCellValue(row, column) === value) {
      return;
    }

    const result = await runAction(() =>
      editCustomTableRowAction(
        organizationId,
        tableDefinitionId,
        workspace.month.id,
        row.id,
        {
          rowData: {
            ...row.rowData,
            [column.columnKey]: value,
          },
        }
      )
    );

    if (result) {
      setWorkspace((current) => ({
        ...current,
        rows: current.rows.map((currentRow) =>
          currentRow.id === result.id ? result : currentRow
        ),
      }));

      setNotice("Changes saved.");
    }
  }

  async function handleStatusChange(
    row: CustomTableRow,
    status: OperationalStatus
  ) {
    if (row.operationalStatus === status) {
      return;
    }

    const result = await runAction(() =>
      editCustomTableRowAction(
        organizationId,
        tableDefinitionId,
        workspace.month.id,
        row.id,
        { operationalStatus: status }
      )
    );

    if (result) {
      setWorkspace((current) => ({
        ...current,
        rows: current.rows.map((currentRow) =>
          currentRow.id === result.id ? result : currentRow
        ),
      }));

      setNotice("Status updated.");
    }
  }

  async function handleHideRestore(row: CustomTableRow) {
    const result = await runAction(() =>
      row.isHidden
        ? restoreCustomTableRowAction(
            organizationId,
            tableDefinitionId,
            workspace.month.id,
            row.id
          )
        : hideCustomTableRowAction(
            organizationId,
            tableDefinitionId,
            workspace.month.id,
            row.id
          )
    );

    if (result) {
      setWorkspace((current) => ({
        ...current,
        rows: current.rows.map((currentRow) =>
          currentRow.id === result.id ? result : currentRow
        ),
      }));

      setNotice(
        result.isHidden
          ? "Record moved to hidden listings."
          : "Record restored."
      );
    }
  }

  async function handleMove(
    row: CustomTableRow,
    direction: "up" | "down" | "top" | "bottom"
  ) {
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
      reorderCustomTableRowsAction(
        organizationId,
        tableDefinitionId,
        workspace.month.id,
        reordered.map((item) => item.id),
        row.isHidden
      )
    );

    if (result) {
      const updatedRows = new Map(
        result.map((item) => [item.id, item])
      );

      setWorkspace((current) => ({
        ...current,
        rows: current.rows.map(
          (item) => updatedRows.get(item.id) ?? item
        ),
      }));

      setNotice("Record order saved.");
    }
  }

  async function handleCarryForward() {
    const [yearText, monthText] = selectedMonth.split("-");
    const year = Number(yearText);
    const month = Number(monthText);

    const nextDate = new Date(year, month, 1);

    const targetMonth = `${nextDate.getFullYear()}-${String(
      nextDate.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const result = await runAction(() =>
      copyForwardCustomTableMonthAction({
        organizationId,
        tableDefinitionId,
        sourcePerformanceMonth: workspace.month.performanceMonth,
        targetPerformanceMonth: targetMonth,
      })
    );

    if (result) {
      setNotice(
        `Carry-forward completed for ${targetMonth.slice(0, 7)}.`
      );
    }
  }

  const isFinalized = workspace.month.isFinalized;

  const buttonBase =
    "inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <section className="space-y-5 text-[#272D2C]">
      {/* WORKSPACE HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-[0_3px_12px_rgba(8,37,80,0.06)]">
        <div className="h-1.5 bg-[#082550]" />

        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E26D5C]">
              Operational Workspace
            </p>

            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-[#082550] sm:text-2xl">
              Monthly Workspace
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#272D2C]/70">
              Manage operational records, update recruitment progress, and review
              historical performance by month.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#272D2C]">
              <span className="uppercase tracking-wider text-[#082550]">
                Performance Month
              </span>

              <input
                type="month"
                value={selectedMonth}
                disabled={busy}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value) {
                    setShowHidden(false);
                    void refreshWorkspace(value);
                  }
                }}
                className="min-h-11 rounded-lg border border-[#B4C2D1] bg-white px-3 py-2 text-sm font-medium text-[#082550] outline-none transition hover:border-[#082550] focus:border-[#E26D5C] focus:ring-2 focus:ring-[#E26D5C]/20 disabled:bg-[#F5F7F9]"
              />
            </label>

            {canEditRows && (
              <button
                type="button"
                disabled={busy || isFinalized}
                onClick={() => void handleCarryForward()}
                className={`${buttonBase} border-[#082550] bg-[#082550] text-white hover:bg-[#12396C]`}
              >
                Carry Forward
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FINALIZED MONTH */}
      {isFinalized && (
        <div className="flex gap-3 rounded-xl border border-[#E6C99B] bg-[#FFF8ED] p-4">
          <span className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-[#E26D5C]" />
          <div>
            <p className="text-sm font-bold text-[#80551C]">
              This month is finalized
            </p>
            <p className="mt-1 text-sm leading-5 text-[#80551C]/85">
              Operational records are read-only for this month.
            </p>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#E26D5C]/50 bg-[#FFF4F1] p-4"
        >
          <p className="text-sm font-bold text-[#9D352A]">
            The operation could not be completed
          </p>
          <p className="mt-1 text-sm leading-5 text-[#9D352A]">
            {error}
          </p>
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

      {/* LISTING SUMMARY AND CONTROLS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B4C2D1]/70 bg-white px-3.5 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#082550]" />
            <span className="text-xs font-semibold text-[#082550]">
              Active
            </span>
            <span className="text-sm font-black tabular-nums text-[#082550]">
              {activeRows.length}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#B4C2D1]/50 bg-[#E9F4F8] px-3.5 py-2">
            <span className="h-2 w-2 rounded-full bg-[#B4C2D1]" />
            <span className="text-xs font-semibold text-[#272D2C]">
              Hidden
            </span>
            <span className="text-sm font-black tabular-nums text-[#272D2C]">
              {hiddenRows.length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHidden((current) => !current)}
          className={`${buttonBase} border-[#B4C2D1] bg-white text-[#082550] hover:border-[#082550] hover:bg-[#E9F4F8]`}
        >
          {showHidden ? "View Active Listings" : "Show Hidden Listings"}
          <span className="ml-2 rounded-full bg-[#E9F4F8] px-2 py-0.5 text-xs text-[#082550]">
            {showHidden ? activeRows.length : hiddenRows.length}
          </span>
        </button>
      </div>

      {/* SPREADSHEET */}
      <div className="overflow-hidden rounded-2xl border border-[#B4C2D1]/80 bg-white shadow-[0_4px_18px_rgba(8,37,80,0.07)]">
        <div className="flex flex-col gap-3 border-b border-[#B4C2D1]/60 bg-[#F7F9FB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                {showHidden ? "Hidden Listings" : "Active Listings"}
              </h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#082550] ring-1 ring-[#B4C2D1]/70">
                {selectedMonth}
              </span>
            </div>

            <p className="mt-1.5 text-xs text-[#272D2C]/65">
              {showHidden
                ? "Restore a hidden row whenever it needs to return to the worksheet."
                : "Select a cell to edit. Changes are saved when you leave the cell."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {busy && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E9F4F8] px-3 py-1.5 text-xs font-semibold text-[#082550]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E26D5C]" />
                Saving changes
              </span>
            )}
            <span className="text-xs font-medium text-[#272D2C]/55">
              {displayedRows.length} rows
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#082550] text-white">
                <th className="w-24 border-r border-white/15 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                  Order
                </th>

                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    className="border-r border-white/15 px-4 py-4 text-[10px] font-bold uppercase tracking-wider last:border-r-0"
                  >
                    {column.label}
                    {column.isRequired && (
                      <span className="ml-1 text-[#E26D5C]">*</span>
                    )}
                  </th>
                ))}

                <th className="min-w-40 border-r border-white/15 px-4 py-4 text-[10px] font-bold uppercase tracking-wider">
                  Workflow Status
                </th>

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
                    className={`group transition-colors ${
                      row.isHidden
                        ? "bg-[#F7F9FB]"
                        : index % 2 === 0
                          ? "bg-white hover:bg-[#E9F4F8]/55"
                          : "bg-[#F7F9FB]/70 hover:bg-[#E9F4F8]/70"
                    }`}
                  >
                    <td className="border-r border-[#B4C2D1]/45 px-3 py-3 align-top">
                      <div className="flex min-w-20 flex-col items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-[#082550]/70">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Move to top"
                            aria-label="Move row to top"
                            disabled={
                              !canEditRows || busy || isFinalized || index === 0
                            }
                            onClick={() => void handleMove(row, "top")}
                            className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-[10px] font-bold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Top
                          </button>

                          <button
                            type="button"
                            title="Move up"
                            aria-label="Move row up"
                            disabled={
                              !canEditRows || busy || isFinalized || index === 0
                            }
                            onClick={() => void handleMove(row, "up")}
                            className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-xs font-bold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            title="Move down"
                            aria-label="Move row down"
                            disabled={
                              !canEditRows ||
                              busy ||
                              isFinalized ||
                              index === displayedRows.length - 1
                            }
                            onClick={() => void handleMove(row, "down")}
                            className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-xs font-bold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            title="Move to bottom"
                            aria-label="Move row to bottom"
                            disabled={
                              !canEditRows ||
                              busy ||
                              isFinalized ||
                              index === displayedRows.length - 1
                            }
                            onClick={() => void handleMove(row, "bottom")}
                            className="rounded border border-[#B4C2D1]/80 bg-white px-1.5 py-1 text-[10px] font-bold text-[#082550] transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            End
                          </button>
                        </div>
                      </div>
                    </td>

                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="min-w-44 border-r border-[#B4C2D1]/40 px-3 py-3 align-top last:border-r-0"
                      >
                        {canEditRows &&
                        column.isEditable &&
                        !isFinalized ? (
                          <textarea
                            key={`${row.id}-${column.id}-${getCellValue(row, column)}`}
                            aria-label={`${column.label}, row ${index + 1}`}
                            defaultValue={getCellValue(row, column)}
                            rows={1}
                            disabled={busy || row.isHidden}
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
                            className="block min-h-9 w-full min-w-32 resize-none overflow-hidden whitespace-pre-wrap break-words rounded-md border border-transparent bg-transparent px-2.5 py-2 text-sm leading-5 text-[#272D2C] outline-none transition placeholder:text-[#B4C2D1] hover:border-[#B4C2D1] focus:border-[#E26D5C] focus:bg-white focus:ring-2 focus:ring-[#E26D5C]/15 disabled:cursor-not-allowed disabled:opacity-65"
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

                    <td className="border-r border-[#B4C2D1]/40 px-3 py-3 align-top">
                      {canEditRows && !isFinalized && !row.isHidden ? (
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
                          className={`w-full min-w-32 rounded-lg border px-2.5 py-2 text-xs font-semibold outline-none transition focus:border-[#E26D5C] focus:ring-2 focus:ring-[#E26D5C]/15 disabled:cursor-not-allowed disabled:opacity-50 ${getStatusClasses(row.operationalStatus)}`}
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
                          className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(row.operationalStatus)}`}
                        >
                          {getStatusLabel(row.operationalStatus)}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        aria-label={row.isHidden ? "Restore row" : "Hide row"}
                        disabled={!canEditRows || busy || isFinalized}
                        onClick={() => void handleHideRestore(row)}
                        className="inline-flex items-center justify-center rounded-lg border border-[#B4C2D1] bg-white px-3 py-2 text-xs font-semibold text-[#082550] transition hover:border-[#E26D5C] hover:bg-[#FFF4F1] hover:text-[#9D352A] focus:outline-none focus:ring-2 focus:ring-[#E26D5C]/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {row.isHidden ? "Restore" : "Hide"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 3}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B4C2D1]/70 bg-[#E9F4F8] text-xl text-[#082550]">
                        {showHidden ? "–" : "+"}
                      </div>

                      <p className="mt-4 text-sm font-bold text-[#082550]">
                        {showHidden
                          ? "No hidden listings"
                          : "Your worksheet is ready"}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#272D2C]/65">
                        {showHidden
                          ? "There are no hidden records for this month."
                          : "Add your first row below to start recording this month's operational activity."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ADD ROW */}
              {canEditRows && !showHidden && !isFinalized && (
                <tr className="bg-[#E9F4F8]/55">
                  <td
                    colSpan={visibleColumns.length + 3}
                    className="border-t border-[#B4C2D1]/60 px-4 py-3"
                  >
                    <button
                      type="button"
                      aria-label="Add recruitment row"
                      title="Add row"
                      disabled={busy}
                      onClick={() => void handleAddRow()}
                      className="group inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B4C2D1] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#082550] transition hover:border-[#E26D5C] hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#082550] text-lg font-normal leading-none text-white transition group-hover:bg-[#E26D5C]">
                        +
                      </span>
                      <span>Add row</span>
                    </button>
                    <span className="ml-3 hidden text-xs text-[#272D2C]/50 sm:inline">
                      Add a new record directly to this month's worksheet
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* WORKSHEET FOOTER */}
        <div className="flex flex-col gap-2 border-t border-[#B4C2D1]/60 bg-[#F7F9FB] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[#272D2C]/60">
            CascadEffects Operations Project Management
          </p>
          <p className="text-[11px] font-medium text-[#082550]/70">
            {selectedMonth} · {displayedRows.length} displayed records
          </p>
        </div>
      </div>
    </section>
  );
}