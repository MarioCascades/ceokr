
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
  | "completed";

const STATUS_OPTIONS: {
  value: OperationalStatus;
  label: string;
  classes: string;
}[] = [
  {
    value: "in_progress",
    label: "In Progress",
    classes: "bg-blue-100 text-blue-800",
  },
  {
    value: "on_hold",
    label: "On Hold",
    classes: "bg-amber-100 text-amber-800",
  },
  {
    value: "completed",
    label: "Completed",
    classes: "bg-green-100 text-green-800",
  },
];

function currentMonthValue(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function toPerformanceMonth(month: string): string {
  return `${month}-01`;
}

function toMonthInputValue(performanceMonth: string): string {
  return performanceMonth.slice(0, 7);
}

function getStatusClasses(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)
      ?.classes ?? "bg-gray-100 text-gray-700"
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
  const [newRowData, setNewRowData] = useState<
    Record<string, string>
  >({});
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
        setNewRowData({});
        setNotice("Workspace loaded.");
      }
    },
    [
      organizationId,
      tableDefinitionId,
      runAction,
    ]
  );

  async function handleAddRow() {
    const rowData: Record<string, unknown> = {};

    for (const column of workspace.columns) {
      if (column.isVisible || column.isRequired) {
        rowData[column.columnKey] =
          newRowData[column.columnKey] ?? "";
      }
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

      setNewRowData({});
      setNotice("Record added.");
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">
            Monthly Workspace
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage operational records and review monthly history.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Performance Month
            <input
              type="month"
              value={selectedMonth}
              disabled={busy}
              onChange={(event) => {
                const value = event.target.value;

                if (value) {
                  void refreshWorkspace(value);
                }
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {canEditRows && (
            <button
              type="button"
              disabled={busy || isFinalized}
              onClick={() => void handleCarryForward()}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Carry Forward
            </button>
          )}
        </div>
      </div>

      {isFinalized && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This month is finalized. Operational records cannot be edited.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && !error && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
            Active: {activeRows.length}
          </span>

          <span className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
            Hidden: {hiddenRows.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowHidden((current) => !current)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white"
        >
          {showHidden ? "Show Active Listings" : "Show Hidden Listings"}
        </button>
      </div>

      {canEditRows && !showHidden && !isFinalized && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
          <h3 className="font-semibold text-gray-950">
            Add Record
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleColumns.map((column) => (
              <label
                key={column.id}
                className="flex flex-col gap-1 text-sm font-medium text-gray-700"
              >
                {column.label}
                {column.isRequired && (
                  <span className="text-xs font-normal text-gray-500">
                    Required
                  </span>
                )}

                <input
                  value={newRowData[column.columnKey] ?? ""}
                  required={column.isRequired}
                  disabled={busy}
                  onChange={(event) =>
                    setNewRowData((current) => ({
                      ...current,
                      [column.columnKey]: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAddRow()}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Record
            </button>
          </div>
        </section>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-950">
              {showHidden ? "Hidden Listings" : "Active Listings"}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {workspace.month.performanceMonth}
            </p>
          </div>

          {busy && (
            <span className="text-sm text-gray-500">
              Saving...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>

                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    className="px-4 py-3 font-semibold"
                  >
                    {column.label}
                  </th>
                ))}

                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayedRows.length > 0 ? (
                displayedRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={row.isHidden ? "bg-gray-50" : ""}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          title="Move to top"
                          disabled={
                            !canEditRows || busy || isFinalized || index === 0
                          }
                          onClick={() =>
                            void handleMove(row, "top")
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          Top
                        </button>

                        <button
                          type="button"
                          title="Move up"
                          disabled={
                            !canEditRows || busy || isFinalized || index === 0
                          }
                          onClick={() =>
                            void handleMove(row, "up")
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          title="Move down"
                          disabled={
                            !canEditRows ||
                            busy ||
                            isFinalized ||
                            index === displayedRows.length - 1
                          }
                          onClick={() =>
                            void handleMove(row, "down")
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          title="Move to bottom"
                          disabled={
                            !canEditRows ||
                            busy ||
                            isFinalized ||
                            index === displayedRows.length - 1
                          }
                          onClick={() =>
                            void handleMove(row, "bottom")
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                        >
                          Bottom
                        </button>
                      </div>
                    </td>

                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="px-4 py-3 align-top"
                      >
                        {canEditRows &&
                        column.isEditable &&
                        !isFinalized ? (
                          <input
                            key={`${row.id}-${column.id}-${getCellValue(row, column)}`}
                            defaultValue={getCellValue(row, column)}
                            disabled={busy || row.isHidden}
                            onBlur={(event) =>
                              void handleSaveCell(
                                row,
                                column,
                                event.target.value
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.currentTarget.blur();
                              }
                            }}
                            className="w-full min-w-32 rounded-md border border-transparent bg-transparent px-2 py-1 text-gray-800 outline-none transition hover:border-gray-200 focus:border-blue-500 focus:bg-white"
                          />
                        ) : (
                          <span className="whitespace-pre-wrap text-gray-700">
                            {getCellValue(row, column) || "—"}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="px-4 py-3 align-top">
                      {canEditRows && !isFinalized && !row.isHidden ? (
                        <select
                          value={row.operationalStatus}
                          disabled={busy}
                          onChange={(event) =>
                            void handleStatusChange(
                              row,
                              event.target.value as OperationalStatus
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
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
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(row.operationalStatus)}`}
                        >
                          {getStatusLabel(row.operationalStatus)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        disabled={!canEditRows || busy || isFinalized}
                        onClick={() => void handleHideRestore(row)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {showHidden
                      ? "There are no hidden records for this month."
                      : "There are no records for this month yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
