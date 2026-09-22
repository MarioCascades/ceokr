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
  | "percentage_of_target";


/* ==========================================================
   Calculate Percentage of Target
========================================================== */

/**
 * Calculates:
 *
 *     current / target * 100
 *
 * Example:
 *
 *     Current = 50
 *     Target  = 100
 *
 *     Score = 50
 */
export function calculatePercentageOfTarget(
  currentValue: number | string,
  targetValue: number | string
): number {
  const current =
    parseNumericValue(
      currentValue
    );

  const target =
    parseNumericValue(
      targetValue
    );

  if (
    current === null ||
    target === null ||
    target === 0
  ) {
    return 0;
  }

  const score =
    (current / target) * 100;

  return clampScore(
    score
  );
}


/* ==========================================================
   Calculate Percent Into Period
========================================================== */

/**
 * Calculates Runtime performance against the amount of
 * the month that has elapsed.
 *
 * Example:
 *
 *     Target = 100
 *     Current = 55
 *
 *     30-day month
 *     Day 15
 *
 *     Expected progress = 50%
 *
 *     Actual progress =
 *       55 / 100 * 100
 *       = 55%
 *
 *     Score =
 *       55 / 50 * 100
 *       = 110%
 *
 * Runtime scores are stored on a 0 - 100 scale, so the
 * final stored score is clamped to 100.
 */
export function calculatePercentIntoPeriod(
  currentValue: number | string,
  targetValue: number | string,
  performanceMonth: string
): number {
  const current =
    parseNumericValue(
      currentValue
    );

  const target =
    parseNumericValue(
      targetValue
    );

  if (
    current === null ||
    target === null ||
    target === 0
  ) {
    return 0;
  }

  const elapsedPercent =
    calculateElapsedMonthPercentage(
      performanceMonth
    );

  /*
   * If no meaningful portion of the month has elapsed,
   * there is no expected progress against which to score.
   */
  if (
    elapsedPercent <= 0
  ) {
    return 0;
  }

  const actualPercent =
    (current / target) * 100;

  const score =
    (actualPercent / elapsedPercent) * 100;

  return clampScore(
    score
  );
}


/* ==========================================================
   Calculate Runtime Key Result Score
========================================================== */

/**
 * Routes the Key Result to its configured scoring method.
 *
 * This keeps scoring selection centralized instead of
 * allowing UI components to implement different formulas.
 */
export function calculateRuntimeKeyResultScore(
  currentValue: number | string,
  targetValue: number | string,
  scoringMethod:
    | RuntimeScoringMethod
    | undefined,
  performanceMonth: string
): number {
  if (
    scoringMethod ===
    "percent_into_period"
  ) {
    return calculatePercentIntoPeriod(
      currentValue,
      targetValue,
      performanceMonth
    );
  }

  /*
   * Percentage of Target is the default Runtime scoring
   * method when no explicit method is configured.
   */
  return calculatePercentageOfTarget(
    currentValue,
    targetValue
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
 *     Before month starts → 0%
 *     During month       → current day / days in month
 *     After month ends   → 100%
 *
 * The selected Performance Month is therefore also usable
 * for historical Runtime Performance Instances.
 */
function calculateElapsedMonthPercentage(
  performanceMonth: string
): number {
  const match =
    /^(\d{4})-(\d{2})$/.exec(
      performanceMonth
    );

  if (!match) {
    return 0;
  }

  const year =
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

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
  const monthStart =
    new Date(
      year,
      month - 1,
      1
    );

  const nextMonthStart =
    new Date(
      year,
      month,
      1
    );

  const today =
    new Date();

  const currentDay =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  if (
    currentDay <
    monthStart
  ) {
    return 0;
  }

  if (
    currentDay >=
    nextMonthStart
  ) {
    return 100;
  }

  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();

  const dayOfMonth =
    currentDay.getDate();

  return (
    dayOfMonth /
    daysInMonth
  ) * 100;
}


/* ==========================================================
   Parse Numeric Value
========================================================== */

function parseNumericValue(
  value: number | string
): number | null {
  if (
    typeof value ===
    "number"
  ) {
    if (
      !Number.isFinite(
        value
      )
    ) {
      return null;
    }

    return value;
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(
      normalized
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return null;
  }

  return parsed;
}


/* ==========================================================
   Clamp Score
========================================================== */

function clampScore(
  score: number
): number {
  return Math.min(
    Math.max(
      score,
      0
    ),
    100
  );
}