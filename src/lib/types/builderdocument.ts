/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Builder Document
 * ----------------------------------------------------------
 * Master document edited by the Builder.
 * ==========================================================
 */

export interface BuilderDocument {
  id: string;

  organization: BuilderOrganization;

  navigation: BuilderNavigation;

  performanceHeader: BuilderPerformanceHeader;

  objectives: BuilderObjective[];

  comments: BuilderComments;
}

/* ==========================================================
   Organization
========================================================== */

export interface BuilderOrganization {
  logoUrl?: string;

  companyName: string;

  tagline?: string;
}

/* ==========================================================
   Navigation
========================================================== */

export interface BuilderNavigation {
  tabs: BuilderNavigationTab[];
}

export interface BuilderNavigationTab {
  id: string;

  label: string;

  visible: boolean;

  order: number;
}

/* ==========================================================
   Performance Header
========================================================== */

/**
 * The Performance Header defines the reusable presentation
 * of the top section of a Performance Sheet.
 *
 * It intentionally does NOT store a specific employee.
 *
 * Runtime identity such as:
 *
 * - Member name
 * - Role
 * - Department
 * - Team
 * - Manager
 *
 * belongs to the assigned Performance Sheet runtime context.
 */
export interface BuilderPerformanceHeader {
  title: string;

  subtitle: string;

  description: string;

  metrics: BuilderMetric[];
}

export interface BuilderMetric {
  id: string;

  title: string;

  value: string;
}

/* ==========================================================
   Objectives
========================================================== */

export interface BuilderObjective {
  id: string;

  title: string;

  description: string;

  weight: number;

  keyResults: BuilderKeyResult[];
}

/* ==========================================================
   Key Results
========================================================== */

export interface BuilderKeyResult {
  id: string;

  title: string;

  target: string;

  current: string;

  score: string;

  weight: number;

  measurementType?:
    | "percentage"
    | "numeric"
    | "financial";

  scoringMethod?:
    | "percent_into_period"
    | "percentage_of_target";

  initiatives: BuilderInitiative[];
}

/* ==========================================================
   Initiatives
========================================================== */

export interface BuilderInitiative {
  id: string;

  text: string;
}

/* ==========================================================
   Comments
========================================================== */

export interface BuilderComments {
  label: string;

  placeholder: string;

  helpText: string;
}