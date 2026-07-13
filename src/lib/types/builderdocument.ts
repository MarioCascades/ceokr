/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Builder Document
 * ----------------------------------------------------------
 * This is the master document edited by the Builder.
 * The same document will eventually be used by:
 *
 * • Builder
 * • Runtime
 * • AI Services
 * • Reports
 * • PDF Export
 * • Database Storage
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

export interface BuilderPerformanceHeader {
  employeeName: string;

  employeeRole: string;

  roleDescription: string;

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

export interface BuilderKeyResult {
  id: string;

  title: string;

  target: string;

  current: string;

  score: string;
}

/* ==========================================================
   Comments
========================================================== */

export interface BuilderComments {
  label: string;

  placeholder: string;

  helpText: string;
}