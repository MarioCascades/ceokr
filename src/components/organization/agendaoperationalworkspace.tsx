
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type ProgressCheck = "In Progress" | "Completed";

type AgendaEvent = {
  id: string;
  name: string;
  location: string;
  attendees: string;
  startDate: string;
  endDate: string;
  progress: ProgressCheck;
};

type AgendaRock = {
  id: string;
  rock: string;
  target: string;
  current: string;
  date: string;
  progress: ProgressCheck;
};

type AgendaHelp = {
  id: string;
  requestor: string;
  assignee: string;
  item: string;
  remarks: string;
  dateRequested: string;
  progress: ProgressCheck;
};

type AgendaCarryOver = {
  id: string;
  requestor: string;
  assignee: string;
  item: string;
  remarks: string;
  dateRequested: string;
  progress: ProgressCheck;
};

type AgendaBoard = {
  wins: AgendaWin[];
  announcements: string;
  events: AgendaEvent[];
  rocks: AgendaRock[];
  help: AgendaHelp[];
  carryOver: AgendaCarryOver[];
};

type AgendaOperationalWorkspaceProps = {
  organizationId: string;
  tableDefinitionId: string;
  tableName: string;
  organizationName: string;
  organizationLogoUrl: string | null;
  initialRows: OperationalRow[];
  canEditRows: boolean;
  includeEvents?: boolean;
};

const BOARD_KEY = "_agendaBoardRecord";
const LEGACY_INDIE_ORTHO_BOARD_KEY = "_indieOrthoAgendaBoardRecord";

const INPUT_CLASS =
  "w-full min-h-9 rounded-md border border-[#B4C2D1]/80 bg-white px-3 py-2 text-sm leading-5 text-[#272D2C] outline-none transition-colors focus:border-[#082550] focus:ring-2 focus:ring-[#082550]/10 disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_CLASS =
  "inline-flex min-h-9 items-center justify-center rounded-md border px-3.5 py-2 text-xs font-semibold leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082550]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

const PRIMARY_ACTION_CLASS =
  `${BUTTON_CLASS} border-[#082550] bg-[#082550] text-white shadow-sm hover:border-[#164477] hover:bg-[#164477] active:bg-[#061C3D]`;

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
    events: [],
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

function asProgress(value: unknown): ProgressCheck {
  return value === "Completed" ? "Completed" : "In Progress";
}

function parseBoard(value: unknown): AgendaBoard | null {
  if (!isObject(value)) {
    return null;
  }

  const wins = Array.isArray(value.wins) ? value.wins : [];
  const events = Array.isArray(value.events) ? value.events : [];
  const rocks = Array.isArray(value.rocks) ? value.rocks : [];
  const help = Array.isArray(value.help) ? value.help : [];
  const carryOver = Array.isArray(value.carryOver)
    ? value.carryOver
    : [];

  // Preserve all Wins rows, including the default blank rows.
  const normalizedWins: AgendaWin[] = wins
    .filter(isObject)
    .map((item, index) => ({
      id: asText(item.id) || `win-loaded-${index + 1}`,
      win: asText(item.win),
      assignedTo: asText(item.assignedTo),
    }));

  // Preserve blank default rows as well as intentionally empty Wins lists.

  return {
    wins: normalizedWins,
    announcements: asText(value.announcements),
    events: events.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `event-loaded-${index + 1}`,
      name: asText(item.name),
      location: asText(item.location),
      attendees: asText(item.attendees),
      startDate: asText(item.startDate),
      endDate: asText(item.endDate),
      progress: asProgress(item.progress),
    })),
    rocks: rocks.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `rock-loaded-${index + 1}`,
      rock: asText(item.rock),
      target: asText(item.target),
      current: asText(item.current),
      date: asText(item.date),
      progress: asProgress(item.progress),
    })),
    help: help.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `help-loaded-${index + 1}`,
      requestor: asText(item.requestor) || asText(item.name),
      assignee: asText(item.assignee),
      item: asText(item.item) || asText(item.help),
      remarks: asText(item.remarks),
      dateRequested: asText(item.dateRequested) || asText(item.date),
      progress: asProgress(item.progress),
    })),
    carryOver: carryOver.filter(isObject).map((item, index) => ({
      id: asText(item.id) || `carry-loaded-${index + 1}`,
      requestor: asText(item.requestor) || asText(item.name),
      assignee: asText(item.assignee),
      item: asText(item.item) || asText(item.help),
      remarks: asText(item.remarks),
      dateRequested: asText(item.dateRequested) || asText(item.date),
      progress: asProgress(item.progress),
    })),
  };
}

function findSavedBoard(
  rows: OperationalRow[]
): OperationalRow | undefined {
  return rows.find(
    (row) =>
      row.rowData[BOARD_KEY] === true ||
      row.rowData[LEGACY_INDIE_ORTHO_BOARD_KEY] === true
  );
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


function AgendaTextArea({
  ariaLabel,
  disabled,
  value,
  onChange,
}: {
  ariaLabel: string;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      aria-label={ariaLabel}
      rows={1}
      disabled={disabled}
      value={value}
      onChange={(event) => {
        const textarea = event.currentTarget;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
        onChange(event.target.value);
      }}
      className={`${INPUT_CLASS} min-h-[38px] resize-none overflow-hidden whitespace-pre-wrap break-words py-2 leading-5`}
    />
  );
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
    <div className="flex flex-col gap-3 border-b border-[#B4C2D1]/60 bg-[#F7F9FB] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#082550]">
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

export default function AgendaOperationalWorkspace({
  organizationId,
  tableDefinitionId,
  tableName,
  organizationName,
  organizationLogoUrl,
  initialRows,
  canEditRows,
  includeEvents = true,
}: AgendaOperationalWorkspaceProps) {
  const savedRecord = useMemo(
    () => findSavedBoard(initialRows),
    [initialRows]
  );

  const initialBoard = getBoardFromRow(savedRecord);
  const [board, setBoard] = useState<AgendaBoard>(initialBoard);
  const boardRef = useRef<AgendaBoard>(initialBoard);
  boardRef.current = board;

  const savedRowRef = useRef<OperationalRow | undefined>(savedRecord);
  const persistedBoardRef = useRef<string>(JSON.stringify(initialBoard));
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingSnapshotRef = useRef<{
    board: AgendaBoard;
    json: string;
  } | null>(null);

  const mountedRef = useRef(false);

  const [lastUpdated, setLastUpdated] = useState<string | null>(
    savedRecord?.updatedAt ?? null
  );
  const [reloading, setReloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "pending" | "saving" | "saved" | "error"
  >(savedRecord ? "saved" : "idle");
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

  function updateEvent(
    id: string,
    key: keyof Omit<AgendaEvent, "id">,
    value: string
  ) {
    updateBoard(
      "events",
      board.events.map((row) =>
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

  async function persistBoardSnapshot(
    snapshotBoard: AgendaBoard,
    snapshotJson: string
  ) {
    if (snapshotJson === persistedBoardRef.current) {
      if (
        mountedRef.current &&
        JSON.stringify(boardRef.current) === snapshotJson
      ) {
        setSaveStatus("saved");
      }
      return;
    }

    if (mountedRef.current) {
      setSaveStatus("saving");
      setError("");
    }

    try {
      const rowData: Record<string, unknown> = {
        [BOARD_KEY]: true,
        // Keep the legacy marker during the shared-workspace transition so
        // older Indie Ortho records remain discoverable if an older client
        // version is briefly in use.
        ...(organizationId === "c15618e5-10d4-4909-976b-84d855d847b0"
          ? { [LEGACY_INDIE_ORTHO_BOARD_KEY]: true }
          : {}),
        board: snapshotBoard,
      };

      let result: OperationalRow;
      const currentSavedRow = savedRowRef.current;

      if (currentSavedRow) {
        const input: EditRowInput = { rowData };
        result = await editCustomTableOperationalRowAction(
          organizationId,
          tableDefinitionId,
          currentSavedRow.id,
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

      savedRowRef.current = result;
      persistedBoardRef.current = snapshotJson;

      if (mountedRef.current) {
        setLastUpdated(result.updatedAt);

        const latestBoardJson = JSON.stringify(boardRef.current);

        if (latestBoardJson === snapshotJson) {
          setSaveStatus("saved");
          setNotice("All Agenda changes are saved.");
        } else {
          setSaveStatus("pending");
          setNotice("");
        }
      }
    } catch (caughtError) {
      if (mountedRef.current) {
        setSaveStatus("error");
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Agenda could not be saved. Your latest changes remain on screen."
        );
        setNotice("");
      }
    }
  }

  function queueBoardSave(snapshotBoard: AgendaBoard) {
    const snapshotJson = JSON.stringify(snapshotBoard);

    saveQueueRef.current = saveQueueRef.current.then(async () => {
      await persistBoardSnapshot(snapshotBoard, snapshotJson);
    });
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const pendingSnapshot = pendingSnapshotRef.current;
      pendingSnapshotRef.current = null;

      if (pendingSnapshot && canEditRows) {
        queueBoardSave(pendingSnapshot.board);
      }
    };
  }, [canEditRows]);

  useEffect(() => {
    if (!canEditRows || reloading) {
      pendingSnapshotRef.current = null;
      return;
    }

    const snapshotBoard = board;
    const snapshotJson = JSON.stringify(snapshotBoard);

    if (snapshotJson === persistedBoardRef.current) {
      pendingSnapshotRef.current = null;
      return;
    }

    pendingSnapshotRef.current = {
      board: snapshotBoard,
      json: snapshotJson,
    };

    setSaveStatus("pending");
    setError("");
    setNotice("");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const pendingSnapshot = pendingSnapshotRef.current;
      saveTimerRef.current = null;

      if (pendingSnapshot?.json === snapshotJson) {
        pendingSnapshotRef.current = null;
      }

      queueBoardSave(snapshotBoard);
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [board, canEditRows, reloading]);

  async function handleRefresh() {
    if (
      reloading ||
      saveStatus === "pending" ||
      saveStatus === "saving" ||
      saveStatus === "error"
    ) {
      return;
    }

    setReloading(true);
    setError("");
    setNotice("");

    try {
      const rows = await listCustomTableOperationalRowsAction(
        organizationId,
        tableDefinitionId
      );
      const record = findSavedBoard(rows);
      const nextBoard = getBoardFromRow(record);

      savedRowRef.current = record;
      persistedBoardRef.current = JSON.stringify(nextBoard);
      setBoard(nextBoard);
      setLastUpdated(record?.updatedAt ?? null);
      setSaveStatus(record ? "saved" : "idle");
      setNotice("Agenda reloaded from saved data.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Agenda could not be reloaded."
      );
    } finally {
      setReloading(false);
    }
  }

  function retrySave() {
    if (!canEditRows || saveStatus === "saving" || reloading) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    pendingSnapshotRef.current = null;

    setError("");
    setNotice("");
    setSaveStatus("pending");
    queueBoardSave(boardRef.current);
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

  function removeWin(id: string) {
    updateBoard(
      "wins",
      board.wins.filter((row) => row.id !== id)
    );
  }

  function addEvent() {
    updateBoard("events", [
      ...board.events,
      {
        id: createId("event", board.events.length + 1),
        name: "",
        location: "",
        attendees: "",
        startDate: "",
        endDate: "",
        progress: "In Progress",
      },
    ]);
  }

  function removeEvent(id: string) {
    updateBoard(
      "events",
      board.events.filter((row) => row.id !== id)
    );
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
        progress: "In Progress",
      },
    ]);
  }

  function removeRock(id: string) {
    updateBoard(
      "rocks",
      board.rocks.filter((row) => row.id !== id)
    );
  }

  function addHelp() {
    updateBoard("help", [
      ...board.help,
      {
        id: createId("help", board.help.length + 1),
        requestor: "",
        assignee: "",
        item: "",
        remarks: "",
        dateRequested: "",
        progress: "In Progress",
      },
    ]);
  }

  function removeHelp(id: string) {
    updateBoard(
      "help",
      board.help.filter((row) => row.id !== id)
    );
  }

  function addCarryOver() {
    updateBoard("carryOver", [
      ...board.carryOver,
      {
        id: createId("carry", board.carryOver.length + 1),
        requestor: "",
        assignee: "",
        item: "",
        remarks: "",
        dateRequested: "",
        progress: "In Progress",
      },
    ]);
  }

  function carryHelpItemToNextWeek(id: string) {
    const item = board.help.find((row) => row.id === id);
    if (!item) return;
    updateBoard("help", board.help.filter((row) => row.id !== id));
    updateBoard("carryOver", [...board.carryOver, { ...item }]);
  }

  function removeCarryOver(id: string) {
    updateBoard("carryOver", board.carryOver.filter((row) => row.id !== id));
  }

  const progressSelect = (
    value: ProgressCheck,
    onChange: (value: ProgressCheck) => void,
    label: string
  ) => (
    <select
      aria-label={label}
      disabled={!canEditRows || reloading}
      value={value}
      onChange={(event) => onChange(event.target.value as ProgressCheck)}
      className={`mx-auto h-8 w-[132px] min-w-[132px] max-w-[132px] rounded-md border px-3 py-2 text-center text-xs font-bold outline-none transition focus:ring-2 focus:ring-[#082550]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
        value === "Completed"
          ? "border-[#27AE60] bg-[#27AE60] text-[#272D2C]"
          : "border-[#E26D5C] bg-[#E26D5C] text-[#272D2C]"
      }`}
    >
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  );

  const addButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      disabled={!canEditRows || reloading}
      onClick={onClick}
      className={`${PRIMARY_ACTION_CLASS} min-w-[104px]`}
    >
      + {label}
    </button>
  );

  const removeButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      disabled={!canEditRows || reloading}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex min-h-9 min-w-[76px] items-center justify-center rounded-md border border-[#E26D5C]/70 bg-white px-3 py-2 text-xs font-semibold leading-none text-[#C95748] transition-colors duration-150 hover:border-[#E26D5C] hover:bg-[#FFF4F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E26D5C]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
    >
      Remove
    </button>
  );

  return (
    <section className="space-y-4 text-[#272D2C]">
      <div className="sticky top-[170px] z-30 overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)] md:top-[116px]">
        <div className="relative overflow-hidden bg-[#082550] px-3 py-3 text-white sm:px-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#B4C2D1]">
                {organizationName}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h1 className="text-xl font-black leading-none tracking-tight sm:text-2xl">
                  {tableName || "Agenda"}
                </h1>
                <p className="text-xs font-semibold text-[#E26D5C] sm:text-sm">
                  Organization Performance
                </p>
              </div>
            </div>

            {(
              organizationLogoUrl ||
              (organizationName.trim().toLowerCase() === "cascadeffects"
                ? "/logos/CECleanlogo.png"
                : null)
            ) ? (
              <div className="relative flex h-10 w-[112px] shrink-0 items-center justify-end sm:h-12 sm:w-[132px]">
                <img
                  src={
                    organizationLogoUrl ||
                    (organizationName.trim().toLowerCase() === "cascadeffects"
                      ? "/logos/CECleanlogo.png"
                      : "")
                  }
                  alt={`${organizationName} logo`}
                  className="block max-h-10 max-w-full w-auto object-contain object-right sm:max-h-12"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#B4C2D1]/50 bg-white px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm leading-5 text-gray-600">
                One shared Agenda board. Changes are saved to the current board
                and are not tied to a performance month.
              </p>
              <p className="mt-2 text-xs text-gray-600">
                <span className="font-bold text-[#082550]">Last Updated:</span>{" "}
                {formatDateTime(lastUpdated)}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  saveStatus === "error"
                    ? "text-red-700"
                    : saveStatus === "saved"
                      ? "text-emerald-700"
                      : "text-[#082550]"
                }`}
                role="status"
                aria-live="polite"
              >
                {saveStatus === "pending"
                  ? "Changes pending..."
                  : saveStatus === "saving"
                    ? "Saving changes..."
                    : saveStatus === "saved"
                      ? "All changes saved"
                      : saveStatus === "error"
                        ? "Save failed"
                        : "Changes save automatically"}
              </span>

              {saveStatus === "error" && canEditRows && (
                <button
                  type="button"
                  disabled={reloading}
                  onClick={retrySave}
                  className="inline-flex items-center justify-center rounded-lg border border-[#E26D5C] bg-white px-3 py-1.5 text-xs font-semibold text-[#082550] transition hover:bg-[#E9F4F8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Retry Save
                </button>
              )}

              <button
                type="button"
                disabled={
                  reloading ||
                  saveStatus === "pending" ||
                  saveStatus === "saving" ||
                  saveStatus === "error"
                }
                onClick={() => void handleRefresh()}
                className={`${BUTTON_CLASS} border-[#B4C2D1] bg-white text-[#082550]`}
              >
                {reloading ? "Reloading..." : "Reload Saved Board"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3"
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
          className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] px-3 py-2"
        >
          <p className="text-sm font-medium text-[#082550]">{notice}</p>
        </div>
      )}

      {!canEditRows && (
        <p className="rounded-xl border border-[#B4C2D1]/70 bg-white p-3 text-sm text-gray-600">
          You have read-only access to this Agenda.
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Wins"
          description="Record wins and assign ownership."
          action={addButton("Add Win", addWin)}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="w-12 px-3 py-2 text-xs text-center">#</th>
                <th className="px-3 py-2 text-xs text-center">Wins</th>
                <th className="w-64 px-3 py-2 text-xs text-center">Assigned To</th>
                <th className="w-24 px-3 py-2  text-xs text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.wins.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 ? "bg-[#F7F9FB]" : ""}
                >
                  <td className="px-3 py-1.5 text-xs text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel={`Win ${index + 1}`}
                      disabled={!canEditRows || reloading}
                      value={row.win}
                      onChange={(value) => updateWin(row.id, "win", value)}
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel={`Assigned to for win ${index + 1}`}
                      disabled={!canEditRows || reloading}
                      value={row.assignedTo}
                      onChange={(value) => updateWin(row.id, "assignedTo", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {removeButton(`Remove win ${index + 1}`, () =>
                      removeWin(row.id)
                    )}
                  </td>
                </tr>
              ))}
              {board.wins.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-5 text-center text-sm text-gray-500"
                  >
                    No Wins added yet. Use Add Win to create a row.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Announcements"
          description="Free-type shared announcements and important updates."
        />

        <div className="p-3 sm:p-4">
          <textarea
            aria-label="Announcements"
            rows={4}
            disabled={!canEditRows || reloading}
            value={board.announcements}
            onChange={(event) =>
              updateBoard("announcements", event.target.value)
            }
            placeholder="Enter announcements here..."
            className={`${INPUT_CLASS} min-h-24 resize-y`}
          />
        </div>
      </section>

{includeEvents && (
      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Events"
          description="Track upcoming events, their locations, attendees, and dates."
          action={addButton("Add Event", addEvent)}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="px-3 py-2 text-xs text-center">Name of the Event</th>
                <th className="px-3 py-2 text-xs text-center">Location</th>
                <th className="px-3 py-2 text-xs text-center">Attendees</th>
                <th className="w-40 px-3 py-2 text-xs text-center">Start Date</th>
                <th className="w-40 px-3 py-2 text-xs text-center">End Date</th>
                <th className="w-44 px-3 py-2 text-xs text-center">Progress Check</th>
                <th className="w-24 px-3 py-2  text-xs text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.events.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 ? "bg-[#F7F9FB]" : ""}
                >
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel={`Name of event ${index + 1}`}
                      disabled={!canEditRows || reloading}
                      value={row.name}
                      onChange={(value) => updateEvent(row.id, "name", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel={`Location for event ${index + 1}`}
                      disabled={!canEditRows || reloading}
                      value={row.location}
                      onChange={(value) => updateEvent(row.id, "location", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel={`Attendees for event ${index + 1}`}
                      disabled={!canEditRows || reloading}
                      value={row.attendees}
                      onChange={(value) => updateEvent(row.id, "attendees", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      aria-label={`Start date for event ${index + 1}`}
                      type="date"
                      disabled={!canEditRows || reloading}
                      value={row.startDate}
                      onChange={(event) =>
                        updateEvent(row.id, "startDate", event.target.value)
                      }
                      className={`${INPUT_CLASS} py-1.5`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      aria-label={`End date for event ${index + 1}`}
                      type="date"
                      disabled={!canEditRows || reloading}
                      value={row.endDate}
                      onChange={(event) =>
                        updateEvent(row.id, "endDate", event.target.value)
                      }
                      className={`${INPUT_CLASS} py-1.5`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {progressSelect(row.progress, (value) => updateEvent(row.id, "progress", value), `Event ${index + 1} progress`)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {removeButton(`Remove event ${index + 1}`, () =>
                      removeEvent(row.id)
                    )}
                  </td>
                </tr>
              ))}

              {board.events.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-5 text-center text-sm text-gray-500"
                  >
                    No events added yet. Use Add Event to create a row.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}


      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Rocks"
          description="Track each Rock against its target, current status, and date."
          action={addButton("Add Rock", addRock)}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="px-3 py-2 text-xs text-center">Rocks</th>
                <th className="px-3 py-2 text-xs text-center">Target</th>
                <th className="px-3 py-2 text-xs text-center">Current</th>
                <th className="w-44 px-3 py-2 text-xs text-center">Date</th>
                <th className="w-44 px-3 py-2 text-xs text-center">Progress Check</th>
                <th className="w-24 px-3 py-2  text-xs text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.rocks.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Rock"
                      disabled={!canEditRows || reloading}
                      value={row.rock}
                      onChange={(value) => updateRock(row.id, "rock", value)}
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Rock target"
                      disabled={!canEditRows || reloading}
                      value={row.target}
                      onChange={(value) => updateRock(row.id, "target", value)}
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Rock current status"
                      disabled={!canEditRows || reloading}
                      value={row.current}
                      onChange={(value) => updateRock(row.id, "current", value)}
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <input
                      aria-label="Rock date"
                      type="date"
                      disabled={!canEditRows || reloading}
                      value={row.date}
                      onChange={(event) =>
                        updateRock(row.id, "date", event.target.value)
                      }
                      className={`${INPUT_CLASS} py-1.5`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {progressSelect(row.progress, (value) => updateRock(row.id, "progress", value), `Rock ${row.id} progress`)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {removeButton("Remove Rock", () => removeRock(row.id))}
                  </td>
                </tr>
              ))}

              {board.rocks.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-5 text-center text-sm text-gray-500"
                  >
                    No Rocks added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Where I Need Help"
          description="Capture requests, ownership, and follow-up status."
          action={addButton("Add Help Item", addHelp)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white">
              <tr>
                <th className="px-2 py-2 text-center text-xs">Requestor</th>
                <th className="px-2 py-2 text-center text-xs">Assignee</th>
                <th className="px-2 py-2 text-center text-xs">Item</th>
                <th className="px-2 py-2 text-center text-xs">Remarks</th>
                <th className="w-40 whitespace-nowrap px-3 py-2 text-center text-xs">Date Requested</th>
                <th className="w-44 whitespace-nowrap px-3 py-2 text-center text-xs">Progress Check</th>
                <th className="w-44 whitespace-nowrap px-3 py-2 text-center text-xs">Carry Over</th>
                <th className="w-24 px-3 py-2 text-xs text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.help.map((row, index) => (
                <tr key={row.id} className={index % 2 ? "bg-[#F7F9FB]" : ""}>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Requestor"
                      disabled={!canEditRows || reloading}
                      value={row.requestor}
                      onChange={(value) => updateHelp(row.id, "requestor", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Assignee"
                      disabled={!canEditRows || reloading}
                      value={row.assignee}
                      onChange={(value) => updateHelp(row.id, "assignee", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Help item"
                      disabled={!canEditRows || reloading}
                      value={row.item}
                      onChange={(value) => updateHelp(row.id, "item", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AgendaTextArea
                      ariaLabel="Help remarks"
                      disabled={!canEditRows || reloading}
                      value={row.remarks}
                      onChange={(value) => updateHelp(row.id, "remarks", value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      aria-label="Date requested"
                      type="date"
                      disabled={!canEditRows || reloading}
                      value={row.dateRequested}
                      onChange={(event) => updateHelp(row.id, "dateRequested", event.target.value)}
                      className={`${INPUT_CLASS} py-1.5`}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-center align-middle">
                    <div className="flex w-full items-center justify-center">
                      {progressSelect(row.progress, (value) => updateHelp(row.id, "progress", value), `Help item ${index + 1} progress`)}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-center align-middle">
                    <div className="flex w-full items-center justify-center">
                      <button
                        type="button"
                        disabled={!canEditRows || reloading}
                        onClick={() => carryHelpItemToNextWeek(row.id)}
                        style={{
                          boxSizing: "border-box",
                          display: "inline-flex",
                          width: "132px",
                          minWidth: "132px",
                          maxWidth: "132px",
                          height: "32px",
                          minHeight: "32px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        className={`${PRIMARY_ACTION_CLASS} !h-8 !min-h-8 !w-[132px] !min-w-[132px] !max-w-[132px] whitespace-nowrap !px-1 !py-0 text-[9px]`}
                      >
                        Carry Over Next Week
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {removeButton("Remove help item", () => removeHelp(row.id))}
                  </td>
                </tr>
              ))}
              {board.help.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-5 text-center text-sm text-gray-500">
                    No help items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-[0_2px_10px_rgba(8,37,80,0.045)]">
        <SectionHeader
          title="Items Carried Over from Last Week"
          description="Outstanding items remain here until explicitly removed, including completed items."
          action={addButton("Add Carried-Over Item", addCarryOver)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
            <thead className="bg-[#082550] text-white"><tr>
              <th className="px-3 py-2 text-xs text-center">Requestor</th><th className="px-3 py-2 text-xs text-center">Assignee</th><th className="px-3 py-2 text-xs text-center">Item</th><th className="px-3 py-2 text-xs text-center">Remarks</th><th className="w-40 px-3 py-2 text-xs text-center">Date Requested</th><th className="w-44 px-3 py-2 text-xs text-center">Progress Check</th><th className="w-24 px-3 py-2  text-xs text-center">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-[#B4C2D1]/50">
              {board.carryOver.map((row, index) => <tr key={row.id} className={index % 2 ? "bg-[#F7F9FB]" : ""}>
                <td className="px-2 py-1.5"><AgendaTextArea
                      ariaLabel="Carried-over requestor"
                      disabled={!canEditRows || reloading}
                      value={row.requestor}
                      onChange={(value) => updateCarryOver(row.id, "requestor", value)}
                    /></td>
                <td className="px-2 py-1.5"><AgendaTextArea
                      ariaLabel="Carried-over assignee"
                      disabled={!canEditRows || reloading}
                      value={row.assignee}
                      onChange={(value) => updateCarryOver(row.id, "assignee", value)}
                    /></td>
                <td className="px-2 py-1.5"><AgendaTextArea
                      ariaLabel="Carried-over item"
                      disabled={!canEditRows || reloading}
                      value={row.item}
                      onChange={(value) => updateCarryOver(row.id, "item", value)}
                    /></td>
                <td className="px-2 py-1.5"><AgendaTextArea
                      ariaLabel="Carried-over remarks"
                      disabled={!canEditRows || reloading}
                      value={row.remarks}
                      onChange={(value) => updateCarryOver(row.id, "remarks", value)}
                    /></td>
                <td className="px-2 py-1.5"><input aria-label="Carried-over date requested" type="date" disabled={!canEditRows || reloading} value={row.dateRequested} onChange={(event) => updateCarryOver(row.id, "dateRequested", event.target.value)} className={`${INPUT_CLASS} py-1.5`} /></td>
                <td className="px-2 py-1.5 text-center">{progressSelect(row.progress, (value) => updateCarryOver(row.id, "progress", value), `Carried-over item ${index + 1} progress`)}</td>
                <td className="px-2 py-1.5 text-right">{removeButton("Remove carried-over item", () => removeCarryOver(row.id))}</td>
              </tr>)}
              {board.carryOver.length === 0 && <tr><td colSpan={7} className="px-4 py-5 text-center text-sm text-gray-500">No carried-over items added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col gap-2 border-t border-[#B4C2D1]/60 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-gray-500">
          Operations Project Management
        </p>
        <p className="text-[11px] font-medium text-[#082550]/70">
          Last successful save: {formatDateTime(lastUpdated)}
        </p>
      </div>
    </section>
  );
}
