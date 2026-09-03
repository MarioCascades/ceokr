export interface Assignment {
  id: string;

  performanceSheetId: string;

  assignedToUserId: string;

  assignedByUserId: string;

  status:
    | "assigned"
    | "in_progress"
    | "submitted"
    | "approved";
}