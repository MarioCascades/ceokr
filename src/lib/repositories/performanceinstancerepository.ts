import { supabase } from "@/lib/supabase/client";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

/* ==========================================================
   Database Record
========================================================== */

interface PerformanceInstanceRecord {
  id: string;

  organization_id: string;

  assignment_id: string;

  performance_sheet_id: string;

  performance_month: string;

  overall_score: number;

  progress: number;

  status: PerformanceInstance["status"];

  employee_comments: string | null;

  manager_comments: string | null;

  created_at: string;

  started_at: string | null;

  submitted_at: string | null;

  approved_at: string | null;

  completed_at: string | null;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToPerformanceInstance(
  record: PerformanceInstanceRecord
): PerformanceInstance {
  return {
    id:
      record.id,

    organizationId:
      record.organization_id,

    assignmentId:
      record.assignment_id,

    performanceSheetId:
      record.performance_sheet_id,

    performanceMonth:
      record.performance_month,

    overallScore:
      record.overall_score,

    progress:
      record.progress,

    status:
      record.status,

    employeeComments:
      record.employee_comments ??
      undefined,

    managerComments:
      record.manager_comments ??
      undefined,

    createdAt:
      record.created_at,

    startedAt:
      record.started_at ??
      undefined,

    submittedAt:
      record.submitted_at ??
      undefined,

    approvedAt:
      record.approved_at ??
      undefined,

    completedAt:
      record.completed_at ??
      undefined,
  };
}

/* ==========================================================
   Create
========================================================== */

export async function createPerformanceInstance(
  performanceInstance: Omit<
    PerformanceInstance,
    "id" | "createdAt"
  >
): Promise<PerformanceInstance> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .insert({
        organization_id:
          performanceInstance.organizationId,

        assignment_id:
          performanceInstance.assignmentId,

        performance_sheet_id:
          performanceInstance.performanceSheetId,

        performance_month:
          performanceInstance.performanceMonth,

        overall_score:
          performanceInstance.overallScore,

        progress:
          performanceInstance.progress,

        status:
          performanceInstance.status,

        employee_comments:
          performanceInstance.employeeComments,

        manager_comments:
          performanceInstance.managerComments,

        started_at:
          performanceInstance.startedAt,

        submitted_at:
          performanceInstance.submittedAt,

        approved_at:
          performanceInstance.approvedAt,

        completed_at:
          performanceInstance.completedAt,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create performance instance: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstance(
    data as PerformanceInstanceRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export async function updatePerformanceInstance(
  performanceInstance: PerformanceInstance
): Promise<PerformanceInstance> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .update({
        performance_month:
          performanceInstance.performanceMonth,

        overall_score:
          performanceInstance.overallScore,

        progress:
          performanceInstance.progress,

        status:
          performanceInstance.status,

        employee_comments:
          performanceInstance.employeeComments,

        manager_comments:
          performanceInstance.managerComments,

        started_at:
          performanceInstance.startedAt,

        submitted_at:
          performanceInstance.submittedAt,

        approved_at:
          performanceInstance.approvedAt,

        completed_at:
          performanceInstance.completedAt,
      })
      .eq(
        "id",
        performanceInstance.id
      )
      .eq(
        "organization_id",
        performanceInstance.organizationId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update performance instance: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstance(
    data as PerformanceInstanceRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deletePerformanceInstance(
  organizationId: string,
  performanceInstanceId: string
): Promise<void> {
  const { error } =
    await supabase
      .from("performance_instances")
      .delete()
      .eq(
        "id",
        performanceInstanceId
      )
      .eq(
        "organization_id",
        organizationId
      );

  if (error) {
    throw new Error(
      `Failed to delete performance instance: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Id
========================================================== */

export async function findPerformanceInstanceById(
  organizationId: string,
  performanceInstanceId: string
): Promise<PerformanceInstance | null> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .select("*")
      .eq(
        "id",
        performanceInstanceId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load performance instance: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToPerformanceInstance(
    data as PerformanceInstanceRecord
  );
}

/* ==========================================================
   Find By Assignment And Month
   ----------------------------------------------------------
   Monthly Runtime identity:
   Assignment + Performance Month
========================================================== */

export async function findPerformanceInstanceByAssignmentAndMonth(
  organizationId: string,
  assignmentId: string,
  performanceMonth: string
): Promise<PerformanceInstance | null> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "assignment_id",
        assignmentId
      )
      .eq(
        "performance_month",
        performanceMonth
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load monthly performance instance: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToPerformanceInstance(
    data as PerformanceInstanceRecord
  );
}

/* ==========================================================
   Find By Assignment
   ----------------------------------------------------------
   Used for monthly Runtime history.
========================================================== */

export async function findPerformanceInstancesByAssignment(
  organizationId: string,
  assignmentId: string
): Promise<PerformanceInstance[]> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "assignment_id",
        assignmentId
      )
      .order(
        "performance_month",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load performance instance history: ${error.message}`
    );
  }

  return (
    data as PerformanceInstanceRecord[]
  ).map(
    mapRecordToPerformanceInstance
  );
}

/* ==========================================================
   Find By Organization
========================================================== */

export async function findPerformanceInstancesByOrganization(
  organizationId: string
): Promise<PerformanceInstance[]> {
  const { data, error } =
    await supabase
      .from("performance_instances")
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .order(
        "performance_month",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load performance instances: ${error.message}`
    );
  }

  return (
    data as PerformanceInstanceRecord[]
  ).map(
    mapRecordToPerformanceInstance
  );
}