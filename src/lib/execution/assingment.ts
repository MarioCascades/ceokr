export interface Assignment {
  id: string;

  performanceSheetId: string;

  reportingPeriodId: string;

  assignedToUserId: string;

  assignedByUserId: string;

  status: "assigned" | "in_progress" | "submitted" | "approved";
}