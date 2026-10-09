/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Runtime Navigation Domain
 * ----------------------------------------------------------
 * Defines the persisted organization-level Runtime tab
 * configuration used to arrange the Runtime workspace.
 *
 * Runtime navigation is separate from:
 *
 * Member OKRs
 * Runtime execution
 * Custom Tables
 * Performance scoring
 *
 * The navigation layer only determines the order, identity,
 * and visibility of Runtime tabs.
 * ==========================================================
 */


/* ==========================================================
   Runtime Navigation Tab Type
========================================================== */

export type RuntimeNavigationTabType =
  | "dashboard"
  | "member"
  | "operational";


/* ==========================================================
   Runtime Navigation Tab
========================================================== */

export interface RuntimeNavigationTab {
  id: string;

  organizationId: string;

  /*
   * Stable navigation identifier.
   *
   * Examples:
   *
   * dashboard
   * member:<user-id>
   * agenda
   * va-list
   * recruitment
   * client-performance
   */
  tabKey: string;

  /*
   * Determines how the Runtime tab is interpreted.
   */
  tabType: RuntimeNavigationTabType;

  /*
   * Display label used by Runtime navigation.
   *
   * Member labels may be resolved from the current
   * organization membership record rather than permanently
   * storing the employee's name here.
   */
  label: string;

  /*
   * Organization-defined Runtime navigation order.
   *
   * Lower values appear before higher values.
   */
  position: number;

  /*
   * Controls whether the Runtime tab is available in the
   * active Runtime navigation.
   *
   * Hidden tabs remain configured for the organization and
   * can be activated again by an administrator.
   */
  isHidden: boolean;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Runtime Navigation Tab Input
========================================================== */

export interface CreateRuntimeNavigationTabInput {
  organizationId: string;

  tabKey: string;

  tabType: RuntimeNavigationTabType;

  label: string;

  position: number;

  isHidden?: boolean;
}


/* ==========================================================
   Runtime Navigation Tab Update
========================================================== */

export interface UpdateRuntimeNavigationTabInput {
  tabKey: string;

  position?: number;

  isHidden?: boolean;
}