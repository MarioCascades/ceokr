import { supabase } from "@/lib/supabase/client";

import type {
  Assignment,
  AssignmentStatus,
  AssignmentType,
} from "@/lib/domain/assignment";

/* ==========================================================
   Assignment Repository
========================================================== */

/* ==========================================================
   Database Row
========================================================== */

interface AssignmentRow {
  id: string;

  organization_id: string;

  performance_sheet_id: string;

  assignment_type: AssignmentType;

  subject_id: string;

  status: AssignmentStatus;

  assigned_by: string;

  assigned_at: string;

  activated_at: string | null;

  completed_at: string | null;

  created_at?: string;

  updated_at?: string;
}

/* ==========================================================
   Row → Domain
========================================================== */

function toAssignment(
  row: AssignmentRow
): Assignment {
  return {
    id: row.id,

    organizationId:
      row.organization_id,

    performanceSheetId:
      row.performance_sheet_id,

    assignmentType:
      row.assignment_type,

    subjectId:
      row.subject_id,

    status:
      row.status,

    assignedBy:
      row.assigned_by,

    assignedAt:
      row.assigned_at,

    activatedAt:
      row.activated_at ??
      undefined,

    completedAt:
      row.completed_at ??
      undefined,
  };
}

/* ==========================================================
   Create Assignment
========================================================== */

export async function createAssignment(
  assignment: Omit<
    Assignment,
    | "id"
    | "assignedAt"
    | "activatedAt"
    | "completedAt"
  >
): Promise<Assignment> {
  const { data, error } =
    await supabase
      .from("assignments")
      .insert({
        organization_id:
          assignment.organizationId,

        performance_sheet_id:
          assignment.performanceSheetId,

        assignment_type:
          assignment.assignmentType,

        subject_id:
          assignment.subjectId,

        status:
          assignment.status,

        assigned_by:
          assignment.assignedBy,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create assignment: ${error.message}`
    );
  }

  return toAssignment(
    data as AssignmentRow
  );
}

/* ==========================================================
   Update Assignment
========================================================== */

export async function updateAssignment(
  assignment: Assignment
): Promise<Assignment> {
  const { data, error } =
    await supabase
      .from("assignments")
      .update({
        performance_sheet_id:
          assignment.performanceSheetId,

        assignment_type:
          assignment.assignmentType,

        subject_id:
          assignment.subjectId,

        status:
          assignment.status,

        assigned_by:
          assignment.assignedBy,

        activated_at:
          assignment.activatedAt ??
          null,

        completed_at:
          assignment.completedAt ??
          null,
      })
      .eq(
        "id",
        assignment.id
      )
      .eq(
        "organization_id",
        assignment.organizationId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update assignment: ${error.message}`
    );
  }

  return toAssignment(
    data as AssignmentRow
  );
}

/* ==========================================================
   Load Assignment
========================================================== */

export async function loadAssignment(
  organizationId: string,
  assignmentId: string
): Promise<Assignment | null> {
  const { data, error } =
    await supabase
      .from("assignments")
      .select("*")
      .eq(
        "id",
        assignmentId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load assignment: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return toAssignment(
    data as AssignmentRow
  );
}

/* ==========================================================
   Find Assignments By Organization
========================================================== */

export async function findAssignmentsByOrganization(
  organizationId: string
): Promise<Assignment[]> {
  const { data, error } =
    await supabase
      .from("assignments")
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .order(
        "assigned_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load assignments: ${error.message}`
    );
  }

  return (
    data as AssignmentRow[]
  ).map(
    toAssignment
  );
}

/* ==========================================================
   Load Active Assignment
   ----------------------------------------------------------
   Used by Runtime when resolving the current
   assignment for a subject.
========================================================== */

export async function loadActiveAssignment(
  organizationId: string,
  subjectId: string
): Promise<Assignment | null> {
  const { data, error } =
    await supabase
      .from("assignments")
      .select("*")
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "subject_id",
        subjectId
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "assigned_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load active assignment: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return toAssignment(
    data as AssignmentRow
  );
}