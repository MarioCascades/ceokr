"use client";

import { useEffect, useMemo, useState } from "react";

import { listUserManagementRecords } from "@/services/user.service";
import {
  createRuntimeNavigationConfiguration,
  loadRuntimeNavigationTabs,
  updateRuntimeNavigationConfiguration,
} from "@/services/runtimenavigation.service";

import type { RuntimeNavigationTab } from "@/lib/types/domain/runtimenavigationtab";

type RuntimeNavigationSettingsProps = {
  organizationId: string;
};

type NavigationItem = {
  tabKey: string;
  tabType:
    | "dashboard"
    | "member"
    | "operational";
  label: string;
  position: number;
  isHidden: boolean;
  existingId?: string;
};

export default function RuntimeNavigationSettings({
  organizationId,
}: RuntimeNavigationSettingsProps) {
  const [items, setItems] = useState<NavigationItem[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [draggedTabKey, setDraggedTabKey] =
    useState<string | null>(null);

  /*
   * ==========================================================
   * Load Navigation
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadNavigation() {
      setLoading(true);
      setError(null);

      try {
        const [
          configuredTabs,
          members,
        ] = await Promise.all([
          loadRuntimeNavigationTabs(
            organizationId
          ),
          listUserManagementRecords(
            organizationId
          ),
        ]);

        if (cancelled) {
          return;
        }

        const activeMembers =
          members.filter(
            (member) =>
              member.user.is_active !== false
          );

        const memberItems: NavigationItem[] =
          activeMembers.map(
            (member) => ({
              tabKey:
                `member:${member.user.id}`,
              tabType:
                "member",
              label:
                member.user.display_name?.trim() ||
                `${member.user.first_name} ${member.user.last_name}`.trim() ||
                member.user.email,
              position: 0,
              isHidden: false,
            })
          );

        const dashboardItem: NavigationItem = {
          tabKey:
            "dashboard",
          tabType:
            "dashboard",
          label:
            "Dashboard",
          position: 0,
          isHidden: false,
        };

        /*
         * Runtime operational tabs are intentionally NOT
         * created here.
         *
         * Agenda, VA List, Recruitment, and Client
         * Performance will be introduced when their actual
         * Runtime operational features are implemented.
         */
        const defaultItems: NavigationItem[] = [
          dashboardItem,
          ...memberItems,
        ];

        /*
         * No saved configuration yet.
         *
         * Create only the Runtime tabs that actually exist
         * today: Dashboard and active organization members.
         */
        if (
          configuredTabs.length === 0
        ) {
          const createdItems: NavigationItem[] =
            [];

          for (
            let index = 0;
            index < defaultItems.length;
            index += 1
          ) {
            const item =
              defaultItems[index];

            const created =
              await createRuntimeNavigationConfiguration(
                {
                  organizationId,
                  tabKey:
                    item.tabKey,
                  tabType:
                    item.tabType,
                  label:
                    item.label,
                  position:
                    index,
                  isHidden:
                    false,
                }
              );

            createdItems.push({
              ...item,
              position:
                index,
              isHidden:
                false,
              existingId:
                created.id,
            });
          }

          if (cancelled) {
            return;
          }

          setItems(
            createdItems
          );

          return;
        }

        /*
         * Existing configuration is authoritative.
         *
         * This is important because hidden tabs must remain
         * in the configuration. They are simply excluded from
         * the active Runtime navigation.
         *
         * Newly available active members are appended.
         */
        const configuredByKey =
          new Map<
            string,
            RuntimeNavigationTab
          >();

        for (
          const tab of configuredTabs
        ) {
          configuredByKey.set(
            tab.tabKey,
            tab
          );
        }

        const orderedItems: NavigationItem[] =
          configuredTabs.map(
            (tab) => ({
              tabKey:
                tab.tabKey,
              tabType:
                tab.tabType,
              label:
                resolveNavigationLabel(
                  tab,
                  defaultItems
                ),
              position:
                tab.position,
              isHidden:
                tab.isHidden,
              existingId:
                tab.id,
            })
          );

        const missingItems =
          defaultItems.filter(
            (item) =>
              !configuredByKey.has(
                item.tabKey
              )
          );

        if (
          missingItems.length > 0
        ) {
          let nextPosition =
            orderedItems.length;

          for (
            const item of missingItems
          ) {
            const created =
              await createRuntimeNavigationConfiguration(
                {
                  organizationId,
                  tabKey:
                    item.tabKey,
                  tabType:
                    item.tabType,
                  label:
                    item.label,
                  position:
                    nextPosition,
                  isHidden:
                    false,
                }
              );

            orderedItems.push({
              ...item,
              position:
                nextPosition,
              isHidden:
                false,
              existingId:
                created.id,
            });

            nextPosition += 1;
          }
        }

        if (cancelled) {
          return;
        }

        setItems(
          sortNavigationItems(
            orderedItems
          )
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error loading Runtime navigation settings:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Runtime navigation settings."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNavigation();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  /*
   * ==========================================================
   * Active / Hidden Lists
   * ==========================================================
   */

  const activeItems =
    useMemo(
      () =>
        sortNavigationItems(
          items.filter(
            (item) =>
              !item.isHidden
          )
        ),
      [items]
    );

  const hiddenItems =
    useMemo(
      () =>
        sortNavigationItems(
          items.filter(
            (item) =>
              item.isHidden
          )
        ),
      [items]
    );

  /*
   * ==========================================================
   * Reorder Active Navigation
   * ==========================================================
   */

  const reorderItems = (
    draggedKey: string,
    targetKey: string
  ) => {
    if (
      draggedKey === targetKey
    ) {
      return;
    }

    setItems(
      (currentItems) => {
        const active =
          sortNavigationItems(
            currentItems.filter(
              (item) =>
                !item.isHidden
            )
          );

        const hidden =
          currentItems.filter(
            (item) =>
              item.isHidden
          );

        const currentIndex =
          active.findIndex(
            (item) =>
              item.tabKey ===
              draggedKey
          );

        const targetIndex =
          active.findIndex(
            (item) =>
              item.tabKey ===
              targetKey
          );

        if (
          currentIndex === -1 ||
          targetIndex === -1
        ) {
          return currentItems;
        }

        const reordered =
          [...active];

        const [
          draggedItem,
        ] =
          reordered.splice(
            currentIndex,
            1
          );

        reordered.splice(
          targetIndex,
          0,
          draggedItem
        );

        const reorderedActive =
          reordered.map(
            (item, index) => ({
              ...item,
              position:
                index,
            })
          );

        /*
         * Hidden tabs retain their hidden state and remain
         * outside the active ordering.
         */
        return [
          ...reorderedActive,
          ...hidden,
        ];
      }
    );

    setSaved(false);
  };

  /*
   * ==========================================================
   * Hide / Activate
   * ==========================================================
   */

  const setTabHidden = (
    tabKey: string,
    hidden: boolean
  ) => {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.tabKey ===
            tabKey
              ? {
                  ...item,
                  isHidden:
                    hidden,
                }
              : item
        )
    );

    setSaved(false);
  };

  /*
   * ==========================================================
   * Save Navigation
   * ==========================================================
   */

  const saveOrder = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      /*
       * Only active tabs participate in the visible
       * navigation order.
       */
      const orderedActiveItems =
        sortNavigationItems(
          items.filter(
            (item) =>
              !item.isHidden
          )
        );

      /*
       * Persist active positions.
       */
      for (
        let index = 0;
        index <
        orderedActiveItems.length;
        index += 1
      ) {
        const item =
          orderedActiveItems[index];

        if (!item.existingId) {
          continue;
        }

        await updateRuntimeNavigationConfiguration(
          organizationId,
          item.existingId,
          {
            tabKey:
              item.tabKey,
            position:
              index,
            isHidden:
              false,
          }
        );
      }

      /*
       * Persist hidden state.
       *
       * Hidden tabs retain their last known position so
       * activating them later does not destroy their
       * configuration.
       */
      const hiddenItemsToSave =
        items.filter(
          (item) =>
            item.isHidden
        );

      for (
        const item of hiddenItemsToSave
      ) {
        if (!item.existingId) {
          continue;
        }

        await updateRuntimeNavigationConfiguration(
          organizationId,
          item.existingId,
          {
            tabKey:
              item.tabKey,
            position:
              item.position,
            isHidden:
              true,
          }
        );
      }

      setItems(
        (currentItems) => {
          const activeKeys =
            new Set(
              orderedActiveItems.map(
                (item) =>
                  item.tabKey
              )
            );

          return currentItems.map(
            (item) => {
              if (
                activeKeys.has(
                  item.tabKey
                )
              ) {
                const activeIndex =
                  orderedActiveItems.findIndex(
                    (activeItem) =>
                      activeItem.tabKey ===
                      item.tabKey
                  );

                return {
                  ...item,
                  position:
                    activeIndex,
                  isHidden:
                    false,
                };
              }

              return {
                ...item,
                isHidden:
                  true,
              };
            }
          );
        }
      );

      setSaved(true);
    } catch (saveError) {
      console.error(
        "Error saving Runtime navigation:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save Runtime navigation."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * Drag Handlers
   * ==========================================================
   */

  const handleDragStart = (
    tabKey: string
  ) => {
    const item =
      items.find(
        (currentItem) =>
          currentItem.tabKey ===
          tabKey
      );

    if (
      !item ||
      item.isHidden
    ) {
      return;
    }

    setDraggedTabKey(
      tabKey
    );
  };

  const handleDragOver = (
    event: React.DragEvent
  ) => {
    event.preventDefault();
  };

  const handleDrop = (
    targetKey: string
  ) => {
    if (!draggedTabKey) {
      return;
    }

    reorderItems(
      draggedTabKey,
      targetKey
    );

    setDraggedTabKey(
      null
    );
  };

  const handleDragEnd = () => {
    setDraggedTabKey(
      null
    );
  };

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */

  if (loading) {
    return (
      <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
            RUNTIME WORKSPACE
          </p>

          <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
            Runtime Navigation
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
            Loading Runtime navigation configuration...
          </p>
        </div>

        <div className="h-24 animate-pulse rounded-lg bg-[#F7F9FB]" />
      </section>
    );
  }

  /*
   * ==========================================================
   * Error
   * ==========================================================
   */

  if (
    error &&
    items.length === 0
  ) {
    return (
      <section className="rounded-xl border border-[#E26D5C]/40 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
            RUNTIME WORKSPACE
          </p>

          <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
            Runtime Navigation
          </h2>
        </div>

        <div className="rounded-lg border border-[#E26D5C]/30 bg-[#FFF7F5] p-4">
          <p className="text-sm font-bold text-[#082550]">
            Unable to load Runtime navigation.
          </p>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/65">
            {error}
          </p>
        </div>
      </section>
    );
  }

  /*
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
            RUNTIME WORKSPACE
          </p>

          <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
            Runtime Navigation
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]/65">
            Arrange every Runtime tab in the order your
            organization wants to use them. Hide tabs that
            should not currently appear in Runtime and
            activate them again whenever they are needed.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void saveOrder()
          }
          disabled={
            saving ||
            items.length === 0
          }
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#082550] px-5 text-sm font-bold text-white transition hover:bg-[#0b356d] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : saved
              ? "Saved"
              : "Save Navigation"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border border-[#E26D5C]/30 bg-[#FFF7F5] p-4">
          <p className="text-xs font-bold leading-5 text-[#E26D5C]">
            {error}
          </p>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="mb-6 rounded-lg border border-[#B4C2D1]/60 bg-[#E9F4F8] p-4">
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#082550] text-xs font-black text-white">
            i
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#082550]">
              Runtime Navigation
            </p>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/65">
              Drag any active Runtime tab to another position.
              Use Hide to remove a tab from Runtime without
              deleting its configuration. Hidden tabs remain
              available below and can be activated again.
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE TABS */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
            Active Runtime Tabs
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            These tabs appear in Runtime in the order shown below.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#B4C2D1]/60">
          {activeItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-[#272D2C]/50">
              No active Runtime tabs are currently configured.
            </div>
          ) : (
            activeItems.map(
              (item, index) => (
                <NavigationRow
                  key={
                    item.tabKey
                  }
                  item={
                    item
                  }
                  index={
                    index
                  }
                  dragged={
                    draggedTabKey ===
                    item.tabKey
                  }
                  onDragStart={
                    handleDragStart
                  }
                  onDragOver={
                    handleDragOver
                  }
                  onDrop={
                    handleDrop
                  }
                  onDragEnd={
                    handleDragEnd
                  }
                  onHide={() =>
                    setTabHidden(
                      item.tabKey,
                      true
                    )
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* HIDDEN TABS */}
      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
              Hidden Runtime Tabs
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Hidden tabs do not appear in Runtime but remain
              configured for this organization.
            </p>
          </div>

          <span className="text-xs font-bold text-[#272D2C]/45">
            {hiddenItems.length} hidden
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#B4C2D1]/60">
          {hiddenItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-[#272D2C]/50">
              No Runtime tabs are currently hidden.
            </div>
          ) : (
            hiddenItems.map(
              (item) => (
                <HiddenNavigationRow
                  key={
                    item.tabKey
                  }
                  item={
                    item
                  }
                  onActivate={() =>
                    setTabHidden(
                      item.tabKey,
                      false
                    )
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-6 border-t border-[#B4C2D1]/50 pt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#272D2C]/60">
          <span>
            {activeItems.length} active Runtime tabs
          </span>

          <span>
            •
          </span>

          <span>
            {hiddenItems.length} hidden Runtime tabs
          </span>
        </div>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * Navigation Row
 * ============================================================
 */

type NavigationRowProps = {
  item: NavigationItem;
  index: number;
  dragged: boolean;
  onDragStart: (
    tabKey: string
  ) => void;
  onDragOver: (
    event: React.DragEvent
  ) => void;
  onDrop: (
    tabKey: string
  ) => void;
  onDragEnd: () => void;
  onHide: () => void;
};

function NavigationRow({
  item,
  index,
  dragged,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onHide,
}: NavigationRowProps) {
  return (
    <div
      draggable
      onDragStart={() =>
        onDragStart(
          item.tabKey
        )
      }
      onDragOver={
        onDragOver
      }
      onDrop={() =>
        onDrop(
          item.tabKey
        )
      }
      onDragEnd={
        onDragEnd
      }
      className={`flex items-center gap-3 border-b border-[#B4C2D1]/40 bg-white px-4 py-4 transition last:border-b-0 ${
        dragged
          ? "opacity-40"
          : "hover:bg-[#F7F9FB]"
      }`}
    >
      {/* POSITION */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9F4F8] text-xs font-black text-[#082550]">
        {index + 1}
      </div>

      {/* DRAG HANDLE */}
      <div
        className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-[#B4C2D1]/70 bg-[#F7F9FB] text-[#082550] active:cursor-grabbing"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <span className="text-sm font-black leading-none">
          ⋮⋮
        </span>
      </div>

      {/* LABEL */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#272D2C]">
          {item.label}
        </p>

        <p className="mt-1 truncate text-[11px] text-[#272D2C]/45">
          {item.tabKey}
        </p>
      </div>

      {/* TYPE */}
      <span
        className={`hidden rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide sm:inline-flex ${
          item.tabType ===
          "dashboard"
            ? "bg-[#E9F4F8] text-[#082550]"
            : item.tabType ===
                "member"
              ? "bg-[#F2F4F7] text-[#272D2C]"
              : "bg-[#FFF1EC] text-[#E26D5C]"
        }`}
      >
        {item.tabType ===
        "dashboard"
          ? "Dashboard"
          : item.tabType ===
              "member"
            ? "Member"
            : "Operational"}
      </span>

      {/* HIDE */}
      <button
        type="button"
        onClick={
          onHide
        }
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-[#B4C2D1]/80 bg-white px-3 text-xs font-bold text-[#082550] transition hover:bg-[#F7F9FB] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-1"
      >
        Hide
      </button>
    </div>
  );
}

/*
 * ============================================================
 * Hidden Navigation Row
 * ============================================================
 */

type HiddenNavigationRowProps = {
  item: NavigationItem;
  onActivate: () => void;
};

function HiddenNavigationRow({
  item,
  onActivate,
}: HiddenNavigationRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[#B4C2D1]/40 bg-[#F7F9FB] px-4 py-4 last:border-b-0">
      {/* HIDDEN INDICATOR */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-black text-[#6B7280]">
        —
      </div>

      {/* LABEL */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#272D2C]/75">
          {item.label}
        </p>

        <p className="mt-1 truncate text-[11px] text-[#272D2C]/40">
          {item.tabKey}
        </p>
      </div>

      {/* TYPE */}
      <span
        className={`hidden rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide sm:inline-flex ${
          item.tabType ===
          "dashboard"
            ? "bg-[#E9F4F8] text-[#082550]"
            : item.tabType ===
                "member"
              ? "bg-[#EDEFF2] text-[#272D2C]"
              : "bg-[#FFF1EC] text-[#E26D5C]"
        }`}
      >
        {item.tabType ===
        "dashboard"
          ? "Dashboard"
          : item.tabType ===
              "member"
            ? "Member"
            : "Operational"}
      </span>

      {/* ACTIVATE */}
      <button
        type="button"
        onClick={
          onActivate
        }
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-[#082550] px-3 text-xs font-bold text-white transition hover:bg-[#0b356d] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-1"
      >
        Activate
      </button>
    </div>
  );
}

/*
 * ============================================================
 * Helpers
 * ============================================================
 */

function resolveNavigationLabel(
  tab: RuntimeNavigationTab,
  defaults: NavigationItem[]
): string {
  const matchingDefault =
    defaults.find(
      (item) =>
        item.tabKey ===
        tab.tabKey
    );

  if (matchingDefault) {
    return matchingDefault.label;
  }

  return tab.label;
}

function sortNavigationItems(
  items: NavigationItem[]
): NavigationItem[] {
  return [...items].sort(
    (first, second) =>
      first.position -
      second.position
  );
}