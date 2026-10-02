"use client";

import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";

import NavigationTabs from "@/components/builder/navigation/navigationtabs";

import { useBuilder } from "@/components/builder/context/buildercontext";

export default function NavigationTabsManager() {
  const {
    builderDocument,
    setBuilderDocument,
    activeSheet,
    setActiveSheet,
    editMode,
  } = useBuilder();

  const tabs = builderDocument.navigation.tabs;

  /*
   * ========================================================
   * Normalize Builder Navigation
   * ========================================================
   *
   * The Builder must always contain exactly one system
   * Main tab.
   *
   * Main is identified by the stable id:
   *
   *     dashboard
   *
   * This normalization protects the Builder from persisted
   * documents that may contain duplicate dashboard entries.
   *
   * We intentionally fix the BuilderDocument state itself
   * rather than hiding duplicate React keys at render time.
   */

  useEffect(() => {
    const dashboardTabs = tabs.filter(
      (tab) => tab.id === "dashboard"
    );

    const nonDashboardTabs = tabs.filter(
      (tab) => tab.id !== "dashboard"
    );

    /*
     * Keep the first existing dashboard tab.
     *
     * If no dashboard exists, create the system Main tab.
     */
    const dashboardTab =
      dashboardTabs[0] ?? {
        id: "dashboard",
        label: "Main",
        visible: true,
        order: 0,
      };

    /*
     * Rebuild the navigation collection so that:
     *
     * 1. There is exactly one dashboard tab.
     * 2. Dashboard is always first.
     * 3. Remaining tabs retain their identity.
     * 4. Orders are normalized.
     */
    const normalizedTabs = [
      {
        ...dashboardTab,
        id: "dashboard",
        label: "Main",
        visible: true,
        order: 0,
      },

      ...nonDashboardTabs.map(
        (tab, index) => ({
          ...tab,
          order: index + 1,
        })
      ),
    ];

    /*
     * Determine whether the current state actually needs
     * normalization before writing anything back.
     */
    const needsNormalization =
      dashboardTabs.length !== 1 ||
      tabs.length !== normalizedTabs.length ||
      tabs.some(
        (tab, index) =>
          tab.id !==
            normalizedTabs[index]?.id ||
          tab.order !==
            normalizedTabs[index]?.order
      );

    if (!needsNormalization) {
      return;
    }

    setBuilderDocument(
      (current) => ({
        ...current,

        navigation: {
          ...current.navigation,

          tabs: normalizedTabs,
        },
      })
    );

    /*
     * If the active tab was one of the duplicate dashboard
     * entries, Main remains the active Builder context.
     */
    if (
      activeSheet === "dashboard" ||
      dashboardTabs.some(
        (tab) =>
          tab.id === activeSheet
      )
    ) {
      setActiveSheet("dashboard");
    }
  }, [
    tabs,
    activeSheet,
    setBuilderDocument,
    setActiveSheet,
  ]);

  /*
   * ========================================================
   * Ordered Tabs
   * ========================================================
   */

  const orderedTabs = useMemo(() => {
    return [...tabs].sort(
      (a, b) =>
        a.order - b.order
    );
  }, [tabs]);

  /*
   * ========================================================
   * Add Tab
   * ========================================================
   */

  const addTab = () => {
    if (!editMode) {
      return;
    }

    const name = window.prompt(
      "Enter a name for the new tab"
    );

    if (
      !name ||
      name.trim() === ""
    ) {
      return;
    }

    const trimmedName = name.trim();

    const newTab = {
      id: crypto.randomUUID(),
      label: trimmedName,
      visible: true,
      order: tabs.length,
    };

    setBuilderDocument(
      (current) => ({
        ...current,

        navigation: {
          ...current.navigation,

          tabs: [
            ...current.navigation.tabs,
            newTab,
          ],
        },
      })
    );

    /*
     * Automatically make the newly created tab active.
     */
    setActiveSheet(newTab.id);
  };

  /*
   * ========================================================
   * Rename Tab
   * ========================================================
   */

  const renameTab = (
    id: string
  ) => {
    if (!editMode) {
      return;
    }

    const tab =
      tabs.find(
        (currentTab) =>
          currentTab.id === id
      );

    if (!tab) {
      return;
    }

    /*
     * Main is a system tab.
     *
     * It may remain named Main so the structural meaning of
     * the Builder entry point stays consistent.
     */
    if (tab.id === "dashboard") {
      return;
    }

    const newName =
      window.prompt(
        "Rename Tab",
        tab.label
      );

    if (
      !newName ||
      newName.trim() === ""
    ) {
      return;
    }

    const trimmedName =
      newName.trim();

    setBuilderDocument(
      (current) => ({
        ...current,

        navigation: {
          ...current.navigation,

          tabs:
            current.navigation.tabs.map(
              (currentTab) =>
                currentTab.id === id
                  ? {
                      ...currentTab,
                      label:
                        trimmedName,
                    }
                  : currentTab
            ),
        },
      })
    );
  };

  /*
   * ========================================================
   * Delete Tab
   * ========================================================
   */

  const deleteTab = (
    id: string
  ) => {
    if (!editMode) {
      return;
    }

    /*
     * The Main/system tab cannot be deleted.
     */
    if (id === "dashboard") {
      return;
    }

    const tab =
      tabs.find(
        (currentTab) =>
          currentTab.id === id
      );

    if (!tab) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${tab.label}"?`
      );

    if (!confirmed) {
      return;
    }

    setBuilderDocument(
      (current) => ({
        ...current,

        navigation: {
          ...current.navigation,

          tabs:
            current.navigation.tabs
              .filter(
                (currentTab) =>
                  currentTab.id !== id
              )
              .map(
                (
                  currentTab,
                  index
                ) => ({
                  ...currentTab,
                  order: index,
                })
              ),
        },
      })
    );

    /*
     * If the deleted tab was active,
     * return to Main.
     */
    if (activeSheet === id) {
      setActiveSheet(
        "dashboard"
      );
    }
  };

  /*
   * ========================================================
   * Render
   * ========================================================
   */

  return (
    <section className="rounded-xl border bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto">

        {orderedTabs.map(
          (tab) => (
            <NavigationTabs
              key={tab.id}
              id={tab.id}
              name={tab.label}
              active={
                activeSheet ===
                tab.id
              }
              editMode={editMode}
              system={
                tab.id ===
                "dashboard"
              }
              onClick={() =>
                setActiveSheet(
                  tab.id
                )
              }
              onRename={() =>
                renameTab(tab.id)
              }
              onDelete={() =>
                deleteTab(tab.id)
              }
            />
          )
        )}

        {editMode && (
          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={addTab}
            >
              + Add
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}