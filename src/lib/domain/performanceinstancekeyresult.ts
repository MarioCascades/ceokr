export type PerformanceInstanceKeyResultMeasurementType =
  | "percentage"
  | "numeric"
  | "financial";

export type PerformanceInstanceKeyResultScoringMethod =
  | "percent_into_period"
  | "percentage_of_target";

export interface PerformanceInstanceKeyResult {
  id: string;

  performanceInstanceId: string;

  performanceInstanceObjectiveId: string;

  /**
   * Optional link to the Builder Key Result that
   * originally generated this Runtime Key Result.
   *
   * Undefined means the member created the KR
   * directly within their Performance Instance.
   */
  sourceKeyResultId?: string;

  title: string;

  target: unknown;

  weight?: number;

  measurementType?:
    | PerformanceInstanceKeyResultMeasurementType;

  scoringMethod?:
    | PerformanceInstanceKeyResultScoringMethod;

  position: number;

  createdAt: string;

  updatedAt: string;
}