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

  /*
   * Organization identity is intentionally NOT validated here.
   *
   * The Builder is opened within an existing Organization
   * Admin context, so the organization is already known.
   *
   * The Builder should not create a second source of truth
   * by requiring organization identity to be duplicated
   * inside the performance-sheet definition.
   */

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
   * Objective weight rule:
   *
   *   > 0% = scoring Objective
   *    0%   = Display Only
   *   < 0%  = invalid
   *
   * Only positive-weight Objectives participate
   * in the scoring allocation.
   *
   * If scoring Objectives exist, their weights
   * must total 100%.
   *
   * If every Objective is 0%, the collection is
   * treated as Display Only and is not blocked
   * from publication.
   */
  const scoringObjectives =
    document.objectives.filter(
      (objective) =>
        objective.weight > 0
    );

  const totalScoringObjectiveWeight =
    scoringObjectives.reduce(
      (total, objective) =>
        total + objective.weight,
      0
    );

  if (
    scoringObjectives.length > 0 &&
    totalScoringObjectiveWeight !== 100
  ) {
    issues.push({
      id: "objective-total-weight",

      severity: "error",

      section: "objectives",

      message:
        `Scoring Objective weights must total 100%. Display-only Objectives with 0% weight are excluded. Current scoring total: ${totalScoringObjectiveWeight}%.`,
    });
  }

  if (
    scoringObjectives.length === 0
  ) {
    issues.push({
      id: "objectives-display-only",

      severity: "warning",

      section: "objectives",

      message:
        "All configured Objectives have 0% weight and are Display Only. No Objective contributes to scoring.",
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

  /*
   * Weight 0 is valid.
   *
   * A zero-weight Objective is Display Only.
   *
   * Negative weights remain invalid.
   */
  if (
    objective.weight < 0
  ) {
    issues.push({
      id:
        `objective-weight-${objective.id}`,

      severity: "error",

      section: "objectives",

      objectiveId:
        objective.id,

      message:
        `"${objective.title || "Untitled Objective"}" cannot have a negative weight.`,
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
   * Key Result weight rule:
   *
   *   > 0% = scoring Key Result
   *    0%   = Display Only
   *   < 0%  = invalid
   *
   * Only positive-weight Key Results participate
   * in the scoring allocation.
   *
   * If scoring Key Results exist, their weights
   * must total 100% within the Objective.
   *
   * If every Key Result is 0%, the Objective
   * contains display-only information and is
   * not blocked from publication.
   */
  const scoringKeyResults =
    objective.keyResults.filter(
      (keyResult) =>
        keyResult.weight > 0
    );

  const totalScoringKeyResultWeight =
    scoringKeyResults.reduce(
      (total, keyResult) =>
        total + keyResult.weight,
      0
    );

  if (
    scoringKeyResults.length > 0 &&
    totalScoringKeyResultWeight !== 100
  ) {
    issues.push({
      id:
        `key-result-total-weight-${objective.id}`,

      severity: "error",

      section: "keyResults",

      objectiveId:
        objective.id,

      message:
        `Scoring Key Result weights for "${objective.title || "Untitled Objective"}" must total 100%. Display-only Key Results with 0% weight are excluded. Current scoring total: ${totalScoringKeyResultWeight}%.`,
    });
  }

  if (
    scoringKeyResults.length === 0
  ) {
    issues.push({
      id:
        `key-results-display-only-${objective.id}`,

      severity: "warning",

      section: "keyResults",

      objectiveId:
        objective.id,

      message:
        `"${objective.title || "Untitled Objective"}" contains only 0% Key Results. All Key Results are Display Only and none contributes to scoring.`,
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

  /*
   * Weight 0 is valid.
   *
   * A zero-weight Key Result is Display Only
   * and does not contribute to scoring.
   *
   * Negative weights remain invalid.
   */
  if (
    keyResult.weight < 0
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
        `"${keyResult.title || "Untitled Key Result"}" cannot have a negative weight.`,
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