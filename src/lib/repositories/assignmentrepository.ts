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

  reporting_period_id: string;

  assignment_type: AssignmentType;

  subject_id: string;

  status: AssignmentStatus;

  assigned_by: string;

  assigned_at: string;

  activated_at: string | null;

  completed_at: string | null;
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

    reportingPeriodId:
      row.reporting_period_id,

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
   Load Assignment
========================================================== */

export async function loadAssignment(
  organizationId: string,
  assignmentId: string
): Promise<Assignment | null> {
  const { data, error } = await supabase
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
   Load Active Assignment
   ----------------------------------------------------------
   Used by Runtime when resolving the current
   assignment for a subject.
========================================================== */

export async function loadActiveAssignment(
  organizationId: string,
  subjectId: string
): Promise<Assignment | null> {
  const { data, error } = await supabase
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
    .order("assigned_at", {
      ascending: false,
    })
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