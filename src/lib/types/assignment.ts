/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Assignment Model
 * ----------------------------------------------------------
 * Represents the assignment of a published Performance Sheet
 * to one or more employees for a specific review period.
 * ==========================================================
 */

/* ==========================================================
   Assignment Status
========================================================== */

export type AssignmentStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "approved"
  | "closed";

/* ==========================================================
   Assignment
========================================================== */

export interface Assignment {
  id: string;

  organizationId: string;

  performanceSheetId: string;

  reviewPeriodId: string;

  status: AssignmentStatus;

  assignedDate: string;

  dueDate: string;

  assignees: AssignmentAssignee[];
}

/* ==========================================================
   Assignment Assignee
========================================================== */

export interface AssignmentAssignee {
  id: string;

  employeeId: string;

  employeeName: string;

  employeeRole: string;

  departmentId?: string;

  teamId?: string;

  status: AssignmentStatus;
}