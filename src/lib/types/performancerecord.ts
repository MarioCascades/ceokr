/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Performance Record
 * ----------------------------------------------------------
 * Represents an employee's working copy of an assigned
 * Performance Sheet.
 * ==========================================================
 */

export type PerformanceRecordStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "approved"
  | "closed";

export interface PerformanceRecord {
  id: string;

  assignmentId: string;

  employeeId: string;

  status: PerformanceRecordStatus;

  startedAt?: string;

  submittedAt?: string;

  approvedAt?: string;

  overallScore?: number;

  objectives: PerformanceObjectiveRecord[];

  comments: PerformanceComment[];
}

/* ==========================================================
   Objective Record
========================================================== */

export interface PerformanceObjectiveRecord {
  objectiveId: string;

  keyResults: PerformanceKeyResultRecord[];
}

/* ==========================================================
   Key Result Record
========================================================== */

export interface PerformanceKeyResultRecord {
  keyResultId: string;

  currentValue: string;

  score: number;

  lastUpdated?: string;
}

/* ==========================================================
   Comments
========================================================== */

export interface PerformanceComment {
  id: string;

  authorId: string;

  authorName: string;

  createdAt: string;

  comment: string;
}