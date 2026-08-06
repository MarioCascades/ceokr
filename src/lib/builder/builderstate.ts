/* ==========================================================
   Builder State
   ----------------------------------------------------------
   Represents the transient UI state of the Builder.

   This state is NOT persisted as part of the
   BuilderDocument.
========================================================== */

export interface BuilderState {
  organizationId: string;

  navigationTabs: NavigationTab[];

  activeTab: string;

  isDirty: boolean;

  lastSavedAt?: string;
}

export interface NavigationTab {
  id: string;

  label: string;

  order: number;

  visible: boolean;
}