export interface PerformanceInstanceObjective {
  id: string;

  performanceInstanceId: string;

  /**
   * Optional link to the Builder Objective that originally
   * generated this Runtime Objective.
   *
   * NULL means the Objective was created directly within
   * the member's Performance Instance.
   */
  sourceObjectiveId?: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;

  createdAt: string;

  updatedAt: string;
}