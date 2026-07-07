"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import NavigationTabs from "@/components/builder/navigationtabs";

type Tab = {
  id: string;
  name: string;
  system?: boolean;
};

export default function NavigationTabsManager() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "dashboard",
      name: "Main",
      system: true,
    },
    {
      id: "mari",
      name: "Mari",
    },
    {
      id: "emily",
      name: "Emily",
    },
    {
      id: "jordyn",
      name: "Jordyn",
    },
    {
      id: "team",
      name: "TC Team",
    },
  ]);

  const [activeTab, setActiveTab] = useState("dashboard");

  // Temporary until Builder Context is introduced
  const [editMode] = useState(true);

  const addTab = () => {
    const name = prompt("Enter a name for the new tab");

    if (!name || name.trim() === "") return;

    const newTab: Tab = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };

    setTabs((current) => [...current, newTab]);
  };

  const renameTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);

    if (!tab) return;

    const newName = prompt("Rename Tab", tab.name);

    if (!newName || newName.trim() === "") return;

    setTabs((current) =>
      current.map((tab) =>
        tab.id === id
          ? { ...tab, name: newName.trim() }
          : tab
      )
    );
  };

  const deleteTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);

    if (!tab || tab.system) return;

    const confirmed = confirm(
      `Delete "${tab.name}"?`
    );

    if (!confirmed) return;

    setTabs((current) =>
      current.filter((tab) => tab.id !== id)
    );

    if (activeTab === id) {
      setActiveTab("dashboard");
    }
  };

  return (
    <section className="rounded-xl border bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto">
        {tabs.map((tab) => (
          <NavigationTabs
            key={tab.id}
            id={tab.id}
            name={tab.name}
            active={activeTab === tab.id}
            editMode={editMode}
            system={tab.system}
            onClick={() => setActiveTab(tab.id)}
            onRename={() => renameTab(tab.id)}
            onDelete={() => deleteTab(tab.id)}
          />
        ))}

        <div className="ml-auto">
          <Button
            variant="outline"
            onClick={addTab}
          >
            + Add
          </Button>
        </div>
      </div>
    </section>
  );
}