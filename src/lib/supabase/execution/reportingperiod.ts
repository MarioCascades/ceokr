export interface ReportingPeriod {
  id: string;

  organizationId: string;

  name: string;

  periodType: "monthly" | "quarterly" | "annual";

  startDate: Date;

  endDate: Date;

  status: "open" | "closed";

  isCurrent: boolean;
}