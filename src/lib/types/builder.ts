export interface BuilderState {
  organization_id: string;

  navigation_tabs: NavigationTab[];

  active_tab: string;

  is_dirty: boolean;

  last_saved_at?: string;
}

export interface NavigationTab {
  id: string;

  label: string;

  order: number;

  visible: boolean;
}