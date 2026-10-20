
/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Runtime Key Result Scoring
 * ----------------------------------------------------------
 * Calculates the Runtime score for a Key Result.
 *
 * Supported Runtime scoring methods:
 *
 *     Percentage of Target
 *
 *     current / target * 100
 *
 *     % Into Period
 *
 *     actual progress / expected progress * 100
 *
 * Supported scoring directions:
 *
 *     higher_is_better
 *     lower_is_better
 *
 * Runtime scores are stored as numeric values from 0 - 100.
 * The UI may display the value as a percentage.
 *
 * This is intentionally a small Runtime utility.
 * The full configurable KPI Calculation Engine remains
 * a future platform capability.
 * ==========================================================
 */

/* ==========================================================
   Types
========================================================== */

export type RuntimeScoringMethod =
  | "percent_into_period"
  | "percentage_of_target"
  | "display_only";

export type RuntimeScoringDirection =
  | "higher_is_better"
  | "lower_is_better";

/* ==========================================================
   Calculate Percentage of Target
========================================================== */

/**
 * Calculates the Percentage of Target score.
 *
 * Higher is better:
 *
 *     current / target * 100
 *
 * Lower is better:
 *
 *     Current <= target -> 100
 *     Current > target  -> target / current * 100
 *
 * Scores are clamped to 0 - 100.
 */
export function calculatePercentageOfTarget(
  currentValue: number | string,
  targetValue: number | string,
  scoringDirection: RuntimeScoringDirection = "higher_is_better"
): number {
  const current = parseNumericValue(currentValue);
  const target = parseNumericValue(targetValue);

  if (current === null || target === null) {
    return 0;
  }

  if (scoringDirection === "lower_is_better") {
    if (current <= target) {
      return 100;
    }

    if (target <= 0) {
      return 0;
    }

    return clampScore((target / current) * 100);
  }

  if (target === 0) {
    return 0;
  }

  const score = (current / target) * 100;

  return clampScore(score);
}

/* ==========================================================
   Calculate Percent Into Period
========================================================== */

/**
 * Calculates Runtime performance against the amount of
 * the month that has elapsed.
 *
 * Higher is better:
 *
 *     Score = actual progress / expected progress * 100
 *
 * Lower is better:
 *
 *     A current value at or below the prorated target
 *     receives 100. A value above the prorated target
 *     receives a proportionally lower score.
 *
 * Runtime scores are stored on a 0 - 100 scale, so the
 * final score is clamped to 100.
 */
export function calculatePercentIntoPeriod(
  currentValue: number | string,
  targetValue: number | string,
  performanceMonth: string,
  scoringDirection: RuntimeScoringDirection = "higher_is_better"
): number {
  const current = parseNumericValue(currentValue);
  const target = parseNumericValue(targetValue);

  if (current === null || target === null) {
    return 0;
  }

  const elapsedPercent =
    calculateElapsedMonthPercentage(performanceMonth);

  /*
   * If no meaningful portion of the month has elapsed,
   * there is no expected progress against which to score.
   */
  if (elapsedPercent <= 0) {
    return 0;
  }

  /*
   * The prorated target represents the expected value
   * at this point in the selected performance month.
   */
  const proratedTarget =
    target * (elapsedPercent / 100);

  if (scoringDirection === "lower_is_better") {
    if (current <= proratedTarget) {
      return 100;
    }

    if (proratedTarget <= 0) {
      return 0;
    }

    return clampScore(
      (proratedTarget / current) * 100
    );
  }

  if (target === 0) {
    return 0;
  }

  const actualPercent = (current / target) * 100;
  const score = (actualPercent / elapsedPercent) * 100;

  return clampScore(score);
}

/* ==========================================================
   Calculate Runtime Key Result Score
========================================================== */

/**
 * Routes the Key Result to its configured scoring method
 * and scoring direction.
 *
 * Scoring direction defaults to higher_is_better to preserve
 * existing behavior for Key Results without a saved direction.
 */
export function calculateRuntimeKeyResultScore(
  currentValue: number | string,
  targetValue: number | string,
  scoringMethod: RuntimeScoringMethod | undefined,
  performanceMonth: string,
  scoringDirection: RuntimeScoringDirection = "higher_is_better"
): number {
  /*
   * Display Only Key Results are reference values.
   * They must never receive a calculated score.
   */
  if (scoringMethod === "display_only") {
    return 0;
  }

  if (scoringMethod === "percent_into_period") {
    return calculatePercentIntoPeriod(
      currentValue,
      targetValue,
      performanceMonth,
      scoringDirection
    );
  }

  /*
   * Percentage of Target is the default Runtime scoring
   * method when no explicit method is configured.
   */
  return calculatePercentageOfTarget(
    currentValue,
    targetValue,
    scoringDirection
  );
}

/* ==========================================================
   Calculate Elapsed Month Percentage
========================================================== */

/**
 * Determines how far through the selected performance month
 * the current calendar date is.
 *
 * Rules:
 *
 *     Before month starts -> 0%
 *     During month        -> current day / days in month
 *     After month ends    -> 100%
 *
 * The selected Performance Month is therefore also usable
 * for historical Runtime Performance Instances.
 */
function calculateElapsedMonthPercentage(
  performanceMonth: string
): number {
  const match = /^(\d{4})-(\d{2})$/.exec(performanceMonth);

  if (!match) {
    return 0;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return 0;
  }

  /*
   * Month boundaries use local calendar dates rather than
   * UTC timestamps so the calculation follows the calendar
   * month represented by the Performance Instance.
   */
  const monthStart = new Date(year, month - 1, 1);
  const nextMonthStart = new Date(year, month, 1);

  const today = new Date();

  const currentDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (currentDay < monthStart) {
    return 0;
  }

  if (currentDay >= nextMonthStart) {
    return 100;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const dayOfMonth = currentDay.getDate();

  return (dayOfMonth / daysInMonth) * 100;
}

/* ==========================================================
   Parse Numeric Value
========================================================== */

/**
 * Converts plain numbers and common formatted values into
 * numbers suitable for scoring.
 *
 * Supported examples:
 *
 *     "85"        -> 85
 *     "85%"       -> 85
 *     "$30,581"   -> 30581
 *     "14,250"    -> 14250
 *     "$1,234.50" -> 1234.5
 *
 * Percent signs are removed without dividing by 100,
 * because percentage targets and current values use the
 * same displayed scale in Runtime.
 *
 * Invalid or ambiguous values return null rather than
 * silently producing a score from malformed input.
 */
function parseNumericValue(
  value: number | string
): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }

    return value;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  /*
   * Remove common display formatting:
   * currency symbols, grouping commas, and percentage signs.
   * Preserve digits, decimal points, and a leading minus sign.
   */
  const numericString = normalized.replace(/[$,\s%]/g, "");

  /*
   * Reject malformed strings instead of relying on permissive
   * parsing that could accept only part of an input.
   */
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(numericString)) {
    return null;
  }

  const parsed = Number(numericString);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

/* ==========================================================
   Clamp Score
========================================================== */

function clampScore(score: number): number {
  return Math.min(Math.max(score, 0), 100);
}
