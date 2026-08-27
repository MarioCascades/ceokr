/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Runtime Key Result Scoring
 * ----------------------------------------------------------
 * Calculates the Runtime score for a Key Result.
 *
 * Current Runtime scoring method:
 *
 *     Percentage of Target
 *
 *     current / target * 100
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
   Calculate Percentage of Target
========================================================== */

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

  /*
   * A valid numeric target and current value
   * are required for percentage-of-target
   * scoring.
   */
  if (
    current === null ||
    target === null ||
    target === 0
  ) {
    return 0;
  }

  const score =
    (current / target) * 100;

  return clampScore(score);
}

/* ==========================================================
   Parse Numeric Value
========================================================== */

function parseNumericValue(
  value: number | string
): number | null {
  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value)
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
    Number(normalized);

  if (
    !Number.isFinite(parsed)
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
    Math.max(score, 0),
    100
  );
}