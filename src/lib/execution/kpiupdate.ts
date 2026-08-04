export interface KPIUpdate {
  id: string;

  performanceInstanceId: string;

  keyResultId: string;

  value: number;

  comment?: string;

  updatedAt: Date;

  updatedBy: string;
}