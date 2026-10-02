/* ==========================================================
   CascadEffects Performance Platform
   OKR Template Domain
------------------------------------------------------------
   Template model:

   GLOBAL TEMPLATE WORKSPACE
   |
   +-- Objective Templates
   |
   +-- Key Result Templates
           |
           +-- Initiatives

   ORGANIZATION TEMPLATE WORKSPACE
   |
   +-- Organization Objective Templates
   |
   +-- Organization Key Result Templates
           |
           +-- Initiatives

   Objective Templates and Key Result Templates are
   independently reusable records.

   There is no persistent Objective / Key Result association
   in the template library.

   Global templates can be copied into an organization's
   template workspace.

   Organization template copies are independent records.

   Applying a template remains a COPY operation into
   Member OKRs.
========================================================== */


/* ==========================================================
   Template Scope / Status
========================================================== */

export type OKRTemplateScope =
  | "global"
  | "organization";

export type OKRTemplateStatus =
  | "active"
  | "archived";


/* ==========================================================
   Measurement / Scoring
========================================================== */

export type OKRTemplateMeasurementType =
  | "percentage"
  | "numeric"
  | "financial";

export type OKRTemplateScoringMethod =
  | "percent_into_period"
  | "percentage_of_target"
  | "display_only";

export type OKRTemplateKeyResultStatus =
  | "active"
  | "completed"
  | "cancelled";


/* ==========================================================
   Global Template Library Compatibility Model
========================================================== */

export interface OKRTemplate {
  id: string;

  name: string;

  description?: string;

  scope: OKRTemplateScope;

  organizationId?: string;

  createdBy?: string;

  status: OKRTemplateStatus;

  createdAt: string;

  updatedAt: string;

  objectives: OKRTemplateObjective[];

  /*
   * Independent Key Result Templates.
   *
   * This is intentionally separate from Objective ownership.
   */
  keyResults: OKRTemplateKeyResult[];
}


/* ==========================================================
   Global Objective Template
========================================================== */

export interface OKRTemplateObjective {
  id: string;

  /*
   * Compatibility field retained for the current Admin
   * Template Workspace implementation.
   *
   * The actual objective_templates table does not have
   * a parent template relationship.
   */
  okrTemplateId: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Global Key Result Template
========================================================== */

export interface OKRTemplateKeyResult {
  id: string;

  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status: OKRTemplateKeyResultStatus;

  createdAt: string;

  updatedAt: string;

  /*
   * Initiatives belong to the independent Key Result Template.
   */
  initiatives: OKRTemplateInitiative[];
}


/* ==========================================================
   Global Key Result Template Initiative
========================================================== */

export interface OKRTemplateInitiative {
  id: string;

  okrTemplateKeyResultId: string;

  text: string;

  position: number;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Organization Objective Template
========================================================== */

export interface OrganizationOKRTemplateObjective {
  id: string;

  organizationId: string;

  /*
   * Provenance only.
   *
   * This identifies the global template from which the
   * organization copy originated.
   *
   * It is intentionally not treated as a live relationship.
   */
  sourceGlobalTemplateId?: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;

  createdBy?: string;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Organization Key Result Template
========================================================== */

export interface OrganizationOKRTemplateKeyResult {
  id: string;

  organizationId: string;

  /*
   * Provenance only.
   *
   * The organization record remains independent from the
   * global template after it is copied.
   */
  sourceGlobalTemplateId?: string;

  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status: OKRTemplateKeyResultStatus;

  createdBy?: string;

  createdAt: string;

  updatedAt: string;

  initiatives: OrganizationOKRTemplateInitiative[];
}


/* ==========================================================
   Organization Key Result Template Initiative
========================================================== */

export interface OrganizationOKRTemplateInitiative {
  id: string;

  organizationKeyResultTemplateId: string;

  text: string;

  position: number;

  createdAt: string;

  updatedAt: string;
}


/* ==========================================================
   Create Template Compatibility Input
========================================================== */

export interface CreateOKRTemplateInput {
  name: string;

  description?: string;

  scope: OKRTemplateScope;

  organizationId?: string;

  createdBy?: string;

  status?: OKRTemplateStatus;
}


/* ==========================================================
   Update Template Compatibility Input
========================================================== */

export interface UpdateOKRTemplateInput {
  templateId: string;

  name: string;

  description?: string;

  status?: OKRTemplateStatus;
}


/* ==========================================================
   Create Global Objective Template
========================================================== */

export interface CreateOKRTemplateObjectiveInput {
  okrTemplateId: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;
}


/* ==========================================================
   Update Global Objective Template
========================================================== */

export interface UpdateOKRTemplateObjectiveInput {
  objectiveId: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;
}


/* ==========================================================
   Create Global Key Result Template
========================================================== */

export interface CreateOKRTemplateKeyResultInput {
  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status?: OKRTemplateKeyResultStatus;
}


/* ==========================================================
   Update Global Key Result Template
========================================================== */

export interface UpdateOKRTemplateKeyResultInput {
  keyResultId: string;

  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status?: OKRTemplateKeyResultStatus;
}


/* ==========================================================
   Create Global Initiative
========================================================== */

export interface CreateOKRTemplateInitiativeInput {
  okrTemplateKeyResultId: string;

  text: string;

  position?: number;
}


/* ==========================================================
   Update Global Initiative
========================================================== */

export interface UpdateOKRTemplateInitiativeInput {
  initiativeId: string;

  text: string;

  position?: number;
}


/* ==========================================================
   Create Organization Objective Template
========================================================== */

export interface CreateOrganizationOKRTemplateObjectiveInput {
  organizationId: string;

  sourceGlobalTemplateId?: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;

  createdBy?: string;
}


/* ==========================================================
   Update Organization Objective Template
========================================================== */

export interface UpdateOrganizationOKRTemplateObjectiveInput {
  objectiveId: string;

  title: string;

  description?: string;

  weight?: number;

  position?: number;
}


/* ==========================================================
   Create Organization Key Result Template
========================================================== */

export interface CreateOrganizationOKRTemplateKeyResultInput {
  organizationId: string;

  sourceGlobalTemplateId?: string;

  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status?: OKRTemplateKeyResultStatus;

  createdBy?: string;
}


/* ==========================================================
   Update Organization Key Result Template
========================================================== */

export interface UpdateOrganizationOKRTemplateKeyResultInput {
  keyResultId: string;

  title: string;

  target?: unknown;

  weight?: number;

  measurementType?: OKRTemplateMeasurementType;

  scoringMethod?: OKRTemplateScoringMethod;

  status?: OKRTemplateKeyResultStatus;
}


/* ==========================================================
   Create Organization Initiative
========================================================== */

export interface CreateOrganizationOKRTemplateInitiativeInput {
  organizationKeyResultTemplateId: string;

  text: string;

  position?: number;
}


/* ==========================================================
   Update Organization Initiative
========================================================== */

export interface UpdateOrganizationOKRTemplateInitiativeInput {
  initiativeId: string;

  text: string;

  position?: number;
}