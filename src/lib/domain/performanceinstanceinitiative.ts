export interface PerformanceInstanceInitiative {
  id: string;

  performanceInstanceKeyResultId: string;

  /*
   * Optional because a Runtime/member-created Initiative
   * does not originate from a Builder Initiative.
   */
  sourceInitiativeId?: string;

  text: string;

  position: number;

  createdAt: string;

  updatedAt: string;
}