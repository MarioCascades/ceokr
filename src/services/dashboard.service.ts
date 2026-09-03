import {
  findAssignmentsByOrganization,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  findPublishedPerformanceSheetsByOrganization,
  type PerformanceSheetRecord,
} from "@/lib/repositories/performancesheetrepository";

import type {
  Assignment,
} from "@/lib/domain/assignment";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

/* ==========================================================
   Dashboard Types
========================================================== */

export interface DashboardStatusCount {
  status: string;
  count: number;
}

export interface DashboardScoreBucket {
  label: string;
  count: number;
}

export interface DashboardPerformanceRow {
  id: string;
  performanceSheetName: string;
  performanceSheetVersion: number;
  assignmentType: Assignment["assignmentType"] | "unknown";
  score: number;
  progress: number;
  status: PerformanceInstance["status"];
  createdAt: string;
}

export interface DashboardData {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;

  totalPerformanceInstances: number;
  activePerformanceInstances: number;
  completedPerformanceInstances: number;

  averageScore: number;
  averageProgress: number;

  statusCounts: DashboardStatusCount[];
  scoreBuckets: DashboardScoreBucket[];

  performanceRows: DashboardPerformanceRow[];
}

/* ==========================================================
   Helpers
========================================================== */

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function getScoreBucket(
  score: number
): string {
  if (score < 25) {
    return "0–24%";
  }

  if (score < 50) {
    return "25–49%";
  }

  if (score < 75) {
    return "50–74%";
  }

  if (score < 100) {
    return "75–99%";
  }

  return "100%";
}

/* ==========================================================
   Load Dashboard
========================================================== */

export async function loadDashboard(
  organizationId: string
): Promise<DashboardData> {
  const [
    assignments,
    performanceInstances,
    performanceSheets,
  ] = await Promise.all([
    findAssignmentsByOrganization(
      organizationId
    ),

    findPerformanceInstancesByOrganization(
      organizationId
    ),

    findPublishedPerformanceSheetsByOrganization(
      organizationId
    ),
  ]);

  /* ========================================================
     Assignment Metrics
  ======================================================== */

  const totalAssignments =
    assignments.length;

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "active"
    ).length;

  const completedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "completed"
    ).length;

  /* ========================================================
     Performance Instance Metrics
  ======================================================== */

  const totalPerformanceInstances =
    performanceInstances.length;

  const activePerformanceInstances =
    performanceInstances.filter(
      (instance) =>
        instance.status === "in_progress"
    ).length;

  const completedPerformanceInstances =
    performanceInstances.filter(
      (instance) =>
        instance.status === "completed"
    ).length;

  const averageScore =
    totalPerformanceInstances === 0
      ? 0
      : round(
          performanceInstances.reduce(
            (total, instance) =>
              total + instance.overallScore,
            0
          ) /
            totalPerformanceInstances
        );

  const averageProgress =
    totalPerformanceInstances === 0
      ? 0
      : round(
          performanceInstances.reduce(
            (total, instance) =>
              total + instance.progress,
            0
          ) /
            totalPerformanceInstances
        );

  /* ========================================================
     Status Distribution
  ======================================================== */

  const statusOrder:
    PerformanceInstance["status"][] = [
    "not_started",
    "in_progress",
    "submitted",
    "approved",
    "completed",
  ];

  const statusCounts =
    statusOrder.map(
      (status) => ({
        status,
        count:
          performanceInstances.filter(
            (instance) =>
              instance.status === status
          ).length,
      })
    );

  /* ========================================================
     Score Distribution
  ======================================================== */

  const scoreBucketOrder = [
    "0–24%",
    "25–49%",
    "50–74%",
    "75–99%",
    "100%",
  ];

  const scoreBuckets =
    scoreBucketOrder.map(
      (label) => ({
        label,
        count:
          performanceInstances.filter(
            (instance) =>
              getScoreBucket(
                instance.overallScore
              ) === label
          ).length,
      })
    );

  /* ========================================================
     Lookup Maps
  ======================================================== */

  const assignmentMap =
    new Map(
      assignments.map(
        (assignment) => [
          assignment.id,
          assignment,
        ]
      )
    );

  const performanceSheetMap =
    new Map(
      performanceSheets.map(
        (sheet) => [
          sheet.id,
          sheet,
        ]
      )
    );

  /* ========================================================
     Performance Rows
  ======================================================== */

  const performanceRows =
    performanceInstances.map(
      (instance) => {
        const assignment =
          assignmentMap.get(
            instance.assignmentId
          );

        const performanceSheet =
          performanceSheetMap.get(
            instance.performanceSheetId
          );

        return {
          id: instance.id,

          performanceSheetName:
            performanceSheet?.name ??
            "Unknown Performance Sheet",

          performanceSheetVersion:
            performanceSheet?.version ??
            0,

          assignmentType:
            assignment?.assignmentType ??
            ("unknown" as const),

          score:
            instance.overallScore,

          progress:
            instance.progress,

          status:
            instance.status,

          createdAt:
            instance.createdAt,
        };
      }
    );

  performanceRows.sort(
    (a, b) =>
      new Date(
        b.createdAt
      ).getTime() -
      new Date(
        a.createdAt
      ).getTime()
  );

  return {
    totalAssignments,

    activeAssignments,

    completedAssignments,

    totalPerformanceInstances,

    activePerformanceInstances,

    completedPerformanceInstances,

    averageScore,

    averageProgress,

    statusCounts,

    scoreBuckets,

    performanceRows,
  };
}