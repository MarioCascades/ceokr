// src/services/builderservice.ts

import { BuilderState } from "@/lib/types/builder";

export async function loadBuilder(): Promise<BuilderState> {
  return {
    organization_id: "",

    navigation_tabs: [],

    active_tab: "organization",

    is_dirty: false,
  };
}

export async function saveBuilder(
  builder: BuilderState
): Promise<void> {
  console.log("Saving Builder...", builder);
}

export async function publishBuilder(): Promise<void> {
  console.log("Publishing Performance Tracker...");
}