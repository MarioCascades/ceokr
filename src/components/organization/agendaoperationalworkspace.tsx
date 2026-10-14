
"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  addCustomTableOperationalRowAction,
  editCustomTableOperationalRowAction,
  listCustomTableOperationalRowsAction,
} from "@/app/organization/customtables/[tableId]/workspaceactions";

type OperationalRow = Awaited<
  ReturnType<typeof listCustomTableOperationalRowsAction>
>[number];

type AddRowInput = Parameters<
  typeof addCustomTableOperationalRowAction
>[0];

type EditRowInput = Parameters<
  typeof editCustomTableOperationalRowAction
>[3];

type AgendaWin = {
  id: string;
  win: string;
  assignedTo: string;
};

type AgendaRock = {
  id: string;
  rock: string;
  target: string;
  current: string;
  date: string;
};

type AgendaHelp = {
  id: string;
  name: string;
  help: string;
  remarks: string;
};

type AgendaCarryOver = {
  id: string;
  item: string;
  remarks: string;
};

type AgendaBoard = {
  wins: AgendaWin[];
  announcements: string;
  rocks: AgendaRock[];
  help: AgendaHelp[];
  carryOver: AgendaCarryOver[];
};

type AgendaOperationalWorkspaceProps = {
  organizationId: string;
  tableDefinitionId: string;
  tableName: string;
  initialRows: OperationalRow[];
  canEditRows: boolean;
};

const BOARD_KEY = "_agendaBoardRecord";

const INPUT_CLASS =
  "w-full rounded-lg border border-[#B4C2D1]/80 bg-white px-3 py-2 text-sm text-[#272D2C] outline-none transition focus:border-[#E26D5C] focus:ring-1 focus:ring-[#E26D5C]/20 disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition hover:border-[#082550] hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-40";

function createId(prefix: string, index: number): string {
  return `${prefix}-${index}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createEmptyBoard(): AgendaBoard {
  return {
    wins: Array.from({ length: 12 }, (_, index) => ({
      id: `win-default-${index + 1}`,
      win: "",
      assignedTo: "",
    })),
    announcements: "",
    rocks: [],
    help: [],
    carryOver: [],
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseBoard(value: unknown): AgendaBoard | null {
  if (!isObject(value)) {
    return null;
  }

  const wins = Array.isArray(value.wins) ? value.wins : [];
  const rocks = Array.isArray(value.rocks) ? value.rocks : [];
  const help = Array.isArray(value.help) ? value.help : [];
  const carryOver = Array.isArray(value.carryOver) ? value.carryOver : [];

  const normalizedWins: AgendaWin[] = wins
    .filter(isObject)
    .map((item, index) => ({
      id: asText(item.id) || `win-loaded-${index + 1}`,
      win: asText(item.win),
      assignedTo: asText(item.assignedTo),
    }));

  while (normalizedWins.length < 12) {
    const index = normalizedWins.length + 1;
    let id = `win-padding-${index}`;

    while (normalizedWins.some((win) => win.id === id)) {
      id = `win-padding-${index}-${normalizedWins.length + 1}`;
    }

    normalizedWins.push({
      id,
      win: "",
      assignedTo: "",
    });
  }

  return {
    wins: normalizedWins,
    announcements: asText(value.announcements),
    rocks: rocks.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `rock-loaded-${index + 1}`,
      rock: asText(item.rock),
      target: asText(item.target),
      current: asText(item.current),
      date: asText(item.date),
    })),
    help: help.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `help-loaded-${index + 1}`,
      name: asText(item.name),
      help: asText(item.help),
      remarks: asText(item.remarks),
    })),
    carryOver: carryOver.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `carry-loaded-${index + 1}`,
      item: asText(item.item),
      remarks: asText(item.remarks),
    })),
  };
}

function findSavedBoard(
  rows: OperationalRow[]
): OperationalRow | undefined {
  return rows.find((row) => row.rowData[BOARD_KEY] === true);
}

function getBoardFromRow(row: OperationalRow | undefined): AgendaBoard {
  if (!row) {
    return createEmptyBoard();
  }

  return parseBoard(row.rowData.board) ?? createEmptyBoard();
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Not saved yet";
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

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#B4C2D1]/60 bg-[#F7F9FB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-gray-600">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#082550]/75">
      {children}
    </label>
  );
}

export default function AgendaOperationalWorkspace({
  organizationId,
  tableDefinitionId,
  tableName,
  initialRows,
  canEditRows,
}: AgendaOperationalWorkspaceProps) {
  const savedRecord = useMemo(
    () => findSavedBoard(initialRows),
    [initialRows]
  );

  const [board, setBoard] = useState<AgendaBoard>(() =>
    getBoardFromRow(savedRecord)
  );
  const [savedRow, setSavedRow] = useState<OperationalRow | undefined>(
    savedRecord
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    savedRecord?.updatedAt ?? null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateBoard<K extends keyof AgendaBoard>(
    key: K,
    value: AgendaBoard[K]
  ) {
    setBoard((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateWin(
    id: string,
    key: keyof Omit<AgendaWin, "id">,
    value: string
  ) {
    updateBoard(
      "wins",
      board.wins.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
    );
  }

  function updateRock(
    id: string,
    key: keyof Omit<AgendaRock, "id">,
    value: string
  ) {
    updateBoard(
      "rocks",
      board.rocks.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
    );
  }

  function updateHelp(
    id: string,
    key: keyof Omit<AgendaHelp, "id">,
    value: string
  ) {
    updateBoard(
      "help",
      board.help.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
    );
  }

  function updateCarryOver(
    id: string,
    key: keyof Omit<AgendaCarryOver, "id">,
    value: string
  ) {
    updateBoard(
      "carryOver",
      board.carryOver.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
    );
  }

  async function handleSave() {
    if (!canEditRows || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const rowData: Record<string, unknown> = {
        [BOARD_KEY]: true,
        board,
      };

      let result: OperationalRow;

      if (savedRow) {
        const input: EditRowInput = { rowData };

        result = await editCustomTableOperationalRowAction(
          organizationId,
          tableDefinitionId,
          savedRow.id,
          input
        );
      } else {
        const input: AddRowInput = {
          organizationId,
          tableDefinitionId,
          rowData,
          operationalStatus: "in_progress",
          isHidden: false,
          position: initialRows.length,
        };

        result = await addCustomTableOperationalRowAction(input);
      }

      setSavedRow(result);
      setLastUpdated(result.updatedAt);
      setNotice("Agenda saved successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Agenda could not be saved."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRefresh() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const rows = await listCustomTableOperationalRowsAction(
        organizationId,
        tableDefinitionId
      );
      const record = findSavedBoard(rows);

      setSavedRow(record);
      setBoard(getBoardFromRow(record));
      setLastUpdated(record?.updatedAt ?? null);
      setNotice("Agenda reloaded from saved data.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Agenda could not be reloaded."
      );
    } finally {
      setBusy(false);
    }
  }

  function addWin() {
    updateBoard("wins", [
      ...board.wins,
      {
        id: createId("win", board.wins.length + 1),
        win: "",
        assignedTo: "",
      },
    ]);
  }

  function addRock() {
    updateBoard("rocks", [
      ...board.rocks,
      {
        id: createId("rock", board.rocks.length + 1),
        rock: "",
        target: "",
        current: "",
        date: "",
      },
    ]);
  }

  function addHelp() {
    updateBoard("help", [
      ...board.help,
      {
        id: createId("help", board.help.length + 1),
        name: "",
        help: "",
        remarks: "",
      },
    ]);
  }

  function addCarryOver() {
    updateBoard("carryOver", [
      ...board.carryOver,
      {
        id: createId("carry", board.carryOver.length + 1),
        item: "",
        remarks: "",
      },
    ]);
  }

  const addButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      disabled={!canEditRows || busy}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg border border-[#082550] bg-white px-3 py-2 text-xs font-semibold text-[#082550] transition hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-40"
    >
      + {label}
    </button>
  );

  return (
    <section className="space-y-5 text-[#272D2C]">
      <div className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <div className="h-1.5 bg-[#082550]" />

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E26D5C]">
              Persistent Operational Workspace
            </p>
            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-[#082550] sm:text-2xl">
              {tableName || "Agenda"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              One shared Agenda board. Changes are saved to the current board
              and are not tied to a performance month.
            </p>
            <p className="mt-3 text-xs text-gray-600">
              <span className="font-bold text-[#082550]">Last Updated:</span>{" "}
              {formatDateTime(lastUpdated)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRefresh()}
              className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
            >
              Reload Saved Board
            </button>
            {canEditRows && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSave()}
                className="inline-flex items-center justify-center rounded-lg border border-[#082550] bg-[#082550] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12396C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Saving..." : "Save Agenda"}
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
          <p className="text-sm font-medium text-[#082550]">{notice}</p>
        </div>
      )}

      {!canEditRows && (
        <p className="rounded-xl border border-[#B4C2D1]/70 bg-white p-4 text-sm text-gray-600">
          You have read-only access to this Agenda.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <SectionHeader
          title="Wins"
          description="Record wins and assign ownership."
          action={addButton("Add Win", addWin)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="w-14 px-4 py-3 text-xs">#</th>
                <th className="px-4 py-3 text-xs">Wins</th>
                <th className="w-64 px-4 py-3 text-xs">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.wins.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 ? "bg-[#F7F9FB]" : ""}
                >
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label={`Win ${index + 1}`}
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.win}
                      onChange={(event) =>
                        updateWin(row.id, "win", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Assigned to for win ${index + 1}`}
                      disabled={!canEditRows || busy}
                      value={row.assignedTo}
                      onChange={(event) =>
                        updateWin(row.id, "assignedTo", event.target.value)
                      }
                      className={INPUT_CLASS}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <SectionHeader
          title="Announcements"
          description="Free-type shared announcements and important updates."
        />
        <div className="p-5">
          <textarea
            aria-label="Announcements"
            rows={5}
            disabled={!canEditRows || busy}
            value={board.announcements}
            onChange={(event) =>
              updateBoard("announcements", event.target.value)
            }
            placeholder="Enter announcements here..."
            className={`${INPUT_CLASS} min-h-32 resize-y`}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <SectionHeader
          title="Rocks"
          description="Track each Rock against its target, current status, and date."
          action={addButton("Add Rock", addRock)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="px-4 py-3 text-xs">Rocks</th>
                <th className="px-4 py-3 text-xs">Target</th>
                <th className="px-4 py-3 text-xs">Current</th>
                <th className="w-44 px-4 py-3 text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.rocks.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Rock"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.rock}
                      onChange={(event) =>
                        updateRock(row.id, "rock", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Rock target"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.target}
                      onChange={(event) =>
                        updateRock(row.id, "target", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Rock current status"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.current}
                      onChange={(event) =>
                        updateRock(row.id, "current", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label="Rock date"
                      type="date"
                      disabled={!canEditRows || busy}
                      value={row.date}
                      onChange={(event) =>
                        updateRock(row.id, "date", event.target.value)
                      }
                      className={INPUT_CLASS}
                    />
                  </td>
                </tr>
              ))}
              {board.rocks.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No Rocks added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <SectionHeader
          title="Where I Need Help"
          description="Capture requests for help and supporting remarks."
          action={addButton("Add Help Item", addHelp)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="w-56 px-4 py-3 text-xs">Name</th>
                <th className="px-4 py-3 text-xs">Where I Need Help</th>
                <th className="px-4 py-3 text-xs">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.help.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2">
                    <input
                      aria-label="Name"
                      disabled={!canEditRows || busy}
                      value={row.name}
                      onChange={(event) =>
                        updateHelp(row.id, "name", event.target.value)
                      }
                      className={INPUT_CLASS}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Where I Need Help"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.help}
                      onChange={(event) =>
                        updateHelp(row.id, "help", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Help remarks"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.remarks}
                      onChange={(event) =>
                        updateHelp(row.id, "remarks", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                </tr>
              ))}
              {board.help.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No help items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#B4C2D1]/70 bg-white shadow-sm">
        <SectionHeader
          title="Items Carried Over from Last Week"
          description="Keep outstanding items visible until they are addressed."
          action={addButton("Add Carried-Over Item", addCarryOver)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="px-4 py-3 text-xs">Item</th>
                <th className="px-4 py-3 text-xs">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.carryOver.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Carried-over item"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.item}
                      onChange={(event) =>
                        updateCarryOver(row.id, "item", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      aria-label="Carried-over remarks"
                      rows={1}
                      disabled={!canEditRows || busy}
                      value={row.remarks}
                      onChange={(event) =>
                        updateCarryOver(row.id, "remarks", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-10 resize-y`}
                    />
                  </td>
                </tr>
              ))}
              {board.carryOver.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No carried-over items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col gap-2 border-t border-[#B4C2D1]/60 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-gray-500">
          CascadEffects Operations Project Management
        </p>
        <p className="text-[11px] font-medium text-[#082550]/70">
          Last successful save: {formatDateTime(lastUpdated)}
        </p>
      </div>
    </section>
  );
}
