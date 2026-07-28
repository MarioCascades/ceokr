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