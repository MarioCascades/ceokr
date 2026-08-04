import type {
  BuilderDocument,
  BuilderObjective,
  BuilderKeyResult,
} from "@/lib/types/builderdocument";

/* ==========================================================
   CascadEffects Performance Platform
   Builder Validation Engine
   ----------------------------------------------------------
   Validates performance sheet DEFINITIONS.

   Important architectural distinction:

   The Builder creates reusable performance-sheet
   definitions/templates.

   It does NOT require employee runtime data such as:
   - Employee name
   - Employee role
   - Current KPI value
   - Score

   Runtime/member validation will belong to the future
   performance execution layer.
========================================================== */

export type BuilderValidationSeverity =
  | "error"
  | "warning";

export interface BuilderValidationIssue {
  id: string;

  severity: BuilderValidationSeverity;

  section:
    | "organization"
    | "performanceHeader"
    | "objectives"
    | "keyResults"
    | "initiatives"
    | "comments";

  message: string;

  objectiveId?: string;

  keyResultId?: string;

  initiativeId?: string;
}

export interface BuilderValidationResult {
  valid: boolean;

  errors: BuilderValidationIssue[];

  warnings: BuilderValidationIssue[];

  issues: BuilderValidationIssue[];
}

/* ==========================================================
   Main Validation
========================================================== */

export function validateBuilderDocument(
  document: BuilderDocument
): BuilderValidationResult {
  const issues: BuilderValidationIssue[] = [];

  validateOrganization(
    document,
    issues
  );

  validatePerformanceHeader(
    document,
    issues
  );

  validateObjectives(
    document,
    issues
  );

  const errors = issues.filter(
    (issue) =>
      issue.severity === "error"
  );

  const warnings = issues.filter(
    (issue) =>
      issue.severity === "warning"
  );

  return {
    valid: errors.length === 0,

    errors,

    warnings,

    issues,
  };
}

/* ==========================================================
   Organization
========================================================== */

function validateOrganization(
  document: BuilderDocument,
  issues: BuilderValidationIssue[]
) {
  /*
   * Organization identity is part of the
   * performance-sheet definition.
   *
   * A published definition should identify
   * the organization it belongs to.
   */
  if (
    !document.organization.companyName.trim()
  ) {
    issues.push({
      id: "organization-company-name",

      severity: "error",

      section: "organization",

      message:
        "Organization name is required before publishing.",
    });
  }
}

/* ==========================================================
   Performance Header
========================================================== */

function validatePerformanceHeader(
  document: BuilderDocument,
  issues: BuilderValidationIssue[]
) {
  const header =
    document.performanceHeader;

  /*
   * Employee name and employee role are
   * runtime/member data.
   *
   * They are intentionally NOT required
   * for publication of a Builder template.
   */

  if (
    header.metrics.length === 0
  ) {
    issues.push({
      id: "performance-header-no-metrics",

      severity: "warning",

      section: "performanceHeader",

      message:
        "No performance header metrics have been configured.",
    });
  }
}

/* ==========================================================
   Objectives
========================================================== */

function validateObjectives(
  document: BuilderDocument,
  issues: BuilderValidationIssue[]
) {
  /*
   * An empty Objective collection is valid.
   *
   * This allows an organization to publish
   * a structural performance-sheet template
   * before configuring organizational OKRs.
   */
  if (
    document.objectives.length === 0
  ) {
    issues.push({
      id: "objectives-none",

      severity: "warning",

      section: "objectives",

      message:
        "No Objectives have been configured yet.",
    });

    return;
  }

  /*
   * Once Objectives exist, they represent
   * actual configuration and their weights
   * must form a complete allocation.
   */
  const totalObjectiveWeight =
    document.objectives.reduce(
      (total, objective) =>
        total + objective.weight,
      0
    );

  if (
    totalObjectiveWeight !== 100
  ) {
    issues.push({
      id: "objective-total-weight",

      severity: "error",

      section: "objectives",

      message:
        `Objective weights must total 100%. Current total: ${totalObjectiveWeight}%.`,
    });
  }

  document.objectives.forEach(
    (objective) => {
      validateObjective(
        objective,
        issues
      );
    }
  );
}

/* ==========================================================
   Objective
========================================================== */

function validateObjective(
  objective: BuilderObjective,
  issues: BuilderValidationIssue[]
) {
  if (
    !objective.title.trim()
  ) {
    issues.push({
      id:
        `objective-title-${objective.id}`,

      severity: "error",

      section: "objectives",

      objectiveId:
        objective.id,

      message:
        "Every configured Objective must have a title.",
    });
  }

  if (
    objective.weight <= 0
  ) {
    issues.push({
      id:
        `objective-weight-${objective.id}`,

      severity: "error",

      section: "objectives",

      objectiveId:
        objective.id,

      message:
        `"${objective.title || "Untitled Objective"}" must have a weight greater than 0%.`,
    });
  }

  /*
   * An Objective may exist before Key Results
   * have been configured.
   *
   * This is a warning rather than a publication
   * blocker because the Builder supports
   * incremental configuration.
   */
  if (
    objective.keyResults.length === 0
  ) {
    issues.push({
      id:
        `objective-key-results-${objective.id}`,

      severity: "warning",

      section: "keyResults",

      objectiveId:
        objective.id,

      message:
        `"${objective.title || "Untitled Objective"}" does not contain any Key Results yet.`,
    });

    return;
  }

  /*
   * Once Key Results exist, they represent
   * actual configuration and their weights
   * must total 100% within the Objective.
   */
  const totalKeyResultWeight =
    objective.keyResults.reduce(
      (total, keyResult) =>
        total + keyResult.weight,
      0
    );

  if (
    totalKeyResultWeight !== 100
  ) {
    issues.push({
      id:
        `key-result-total-weight-${objective.id}`,

      severity: "error",

      section: "keyResults",

      objectiveId:
        objective.id,

      message:
        `Key Result weights for "${objective.title || "Untitled Objective"}" must total 100%. Current total: ${totalKeyResultWeight}%.`,
    });
  }

  objective.keyResults.forEach(
    (keyResult) => {
      validateKeyResult(
        objective,
        keyResult,
        issues
      );
    }
  );
}

/* ==========================================================
   Key Result
========================================================== */

function validateKeyResult(
  objective: BuilderObjective,
  keyResult: BuilderKeyResult,
  issues: BuilderValidationIssue[]
) {
  if (
    !keyResult.title.trim()
  ) {
    issues.push({
      id:
        `key-result-title-${keyResult.id}`,

      severity: "error",

      section: "keyResults",

      objectiveId:
        objective.id,

      keyResultId:
        keyResult.id,

      message:
        "Every configured Key Result must have a title.",
    });
  }

  if (
    keyResult.weight <= 0
  ) {
    issues.push({
      id:
        `key-result-weight-${keyResult.id}`,

      severity: "error",

      section: "keyResults",

      objectiveId:
        objective.id,

      keyResultId:
        keyResult.id,

      message:
        `"${keyResult.title || "Untitled Key Result"}" must have a weight greater than 0%.`,
    });
  }

  /*
   * Target configuration is useful, but we
   * intentionally keep it as a warning for now.
   *
   * Future KPI definitions may support different
   * measurement models, formulas, directions,
   * ranges, milestones, boolean completion, etc.
   */
  if (
    !keyResult.target.trim()
  ) {
    issues.push({
      id:
        `key-result-target-${keyResult.id}`,

      severity: "warning",

      section: "keyResults",

      objectiveId:
        objective.id,

      keyResultId:
        keyResult.id,

      message:
        `"${keyResult.title || "Untitled Key Result"}" does not have a target configured.`,
    });
  }

  /*
   * Current value and score are intentionally
   * NOT validated here.
   *
   * They are runtime performance data and will
   * belong to the future member-facing execution
   * layer.
   *
   * Initiatives are also intentionally optional.
   */
}