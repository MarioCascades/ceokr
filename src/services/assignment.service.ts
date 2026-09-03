import type {
  Assignment,
} from "@/lib/domain/assignment";

import type {
  PerformanceInstance,
} from "@/lib/domain/performanceinstance";

import {
  createAssignment as createAssignmentRepository,
  loadAssignment,
  updateAssignment,
} from "@/lib/repositories/assignmentrepository";

import {
  findPerformanceInstancesByOrganization,
} from "@/lib/repositories/performanceinstancerepository";

import {
  createPerformanceExecution,
} from "@/lib/runtime/createperformanceexecution";

import {
  initializePerformanceInstance,
} from "@/lib/runtime/initializeperformanceinstance";

import {
  loadPublishedById,
} from "@/lib/repositories/performancesheetrepository";

import {
  supabase,
} from "@/lib/supabase/client";


/* ==========================================================
   Assignment Subject Validation
========================================================== */

/**
 * Validates that the assignment subject belongs to the
 * organization represented by the assignment.
 *
 * The assignment model uses a polymorphic subjectId:
 *
 * individual   -> User
 * team         -> Team
 * department   -> Department
 * organization -> Organization
 *
 * The validation remains inside the service layer so the UI
 * cannot bypass the business rule.
 */
async function validateAssignmentSubject(
  assignment: Pick<
    Assignment,
    | "organizationId"
    | "assignmentType"
    | "subjectId"
  >
): Promise<void> {

  /* ========================================================
     Organization
  ======================================================== */

  if (
    assignment.assignmentType ===
    "organization"
  ) {
    if (
      assignment.subjectId !==
      assignment.organizationId
    ) {
      throw new Error(
        "The selected organization does not match the assignment organization."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("organizations")
      .select("id")
      .eq(
        "id",
        assignment.subjectId
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to validate organization subject: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "The selected organization could not be found."
      );
    }

    return;
  }


  /* ========================================================
     Department
  ======================================================== */

  if (
    assignment.assignmentType ===
    "department"
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .select(
        "id, organization_id"
      )
      .eq(
        "id",
        assignment.subjectId
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to validate department subject: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "The selected department could not be found."
      );
    }

    if (
      data.organization_id !==
      assignment.organizationId
    ) {
      throw new Error(
        "The selected department does not belong to this organization."
      );
    }

    return;
  }


  /* ========================================================
     Team
  ======================================================== */

  if (
    assignment.assignmentType ===
    "team"
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("teams")
      .select(
        "id, organization_id, department_id"
      )
      .eq(
        "id",
        assignment.subjectId
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to validate team subject: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "The selected team could not be found."
      );
    }

    if (
      data.organization_id !==
      assignment.organizationId
    ) {
      throw new Error(
        "The selected team does not belong to this organization."
      );
    }

    /* ======================================================
       Verify Team Department
    ====================================================== */

    const {
      data: department,
      error:
        departmentError,
    } = await supabase
      .from("departments")
      .select(
        "id, organization_id"
      )
      .eq(
        "id",
        data.department_id
      )
      .maybeSingle();

    if (departmentError) {
      throw new Error(
        `Failed to validate team department: ${departmentError.message}`
      );
    }

    if (!department) {
      throw new Error(
        "The team's department could not be found."
      );
    }

    if (
      department.organization_id !==
      assignment.organizationId
    ) {
      throw new Error(
        "The team's department does not belong to this organization."
      );
    }

    return;
  }


  /* ========================================================
     Individual
  ======================================================== */

  if (
    assignment.assignmentType ===
    "individual"
  ) {
    /*
     * A User may exist globally but must have an
     * Organization Membership before they can be assigned
     * within that organization.
     */
    const {
      data: membership,
      error,
    } = await supabase
      .from("organization_memberships")
      .select(
        "id, user_id, organization_id"
      )
      .eq(
        "user_id",
        assignment.subjectId
      )
      .eq(
        "organization_id",
        assignment.organizationId
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to validate user membership: ${error.message}`
      );
    }

    if (!membership) {
      throw new Error(
        "The selected user does not belong to this organization."
      );
    }

    return;
  }


  throw new Error(
    "Invalid assignment type."
  );
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

  /* ========================================================
     Validate Performance Sheet
  ======================================================== */

  /*
   * A Performance Sheet used by Runtime must reference an
   * exact published version.
   */
  const performanceSheet =
    await loadPublishedById(
      assignment.organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    throw new Error(
      "The selected Performance Sheet could not be found or is not published."
    );
  }


  /* ========================================================
     Validate Assignment Subject
  ======================================================== */

  await validateAssignmentSubject(
    assignment
  );


  /* ========================================================
     Validate Assigned By User
  ======================================================== */

  const {
    data: assigningUser,
    error:
      assigningUserError,
  } = await supabase
    .from("users")
    .select(
      "id, is_active"
    )
    .eq(
      "id",
      assignment.assignedBy
    )
    .maybeSingle();

  if (assigningUserError) {
    throw new Error(
      `Failed to validate assigning user: ${assigningUserError.message}`
    );
  }

  if (!assigningUser) {
    throw new Error(
      "The assigning user could not be found."
    );
  }

  if (
    !assigningUser.is_active
  ) {
    throw new Error(
      "The assigning user is inactive."
    );
  }


  /* ========================================================
     Validate Assigning User Membership
  ======================================================== */

  const {
    data: assigningMembership,
    error:
      assigningMembershipError,
  } = await supabase
    .from("organization_memberships")
    .select(
      "id"
    )
    .eq(
      "user_id",
      assignment.assignedBy
    )
    .eq(
      "organization_id",
      assignment.organizationId
    )
    .maybeSingle();

  if (assigningMembershipError) {
    throw new Error(
      `Failed to validate assigning user membership: ${assigningMembershipError.message}`
    );
  }

  if (!assigningMembership) {
    throw new Error(
      "The assigning user does not belong to this organization."
    );
  }


  /* ========================================================
     Create Draft Assignment
  ======================================================== */

  /*
   * New assignments intentionally begin as Draft.
   *
   * Activation remains a separate lifecycle operation.
   */
  const assignmentToCreate = {
    ...assignment,

    status:
      "draft" as const,
  };

  return createAssignmentRepository(
    assignmentToCreate
  );
}


/* ==========================================================
   Activate Assignment
========================================================== */

export async function activateAssignment(
  organizationId: string,
  assignmentId: string
): Promise<Assignment> {

  const assignment =
    await loadAssignment(
      organizationId,
      assignmentId
    );

  if (!assignment) {
    throw new Error(
      "Assignment not found."
    );
  }

  if (
    assignment.status ===
    "active"
  ) {
    return assignment;
  }

  if (
    assignment.status !==
    "draft"
  ) {
    throw new Error(
      "Only draft assignments can be activated."
    );
  }


  /* ========================================================
     Verify Published Performance Sheet
  ======================================================== */

  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    throw new Error(
      "The Performance Sheet assigned to this assignment is no longer published."
    );
  }


  /* ========================================================
     Revalidate Subject
  ======================================================== */

  await validateAssignmentSubject(
    assignment
  );


  /* ========================================================
     Activate
  ======================================================== */

  return updateAssignment({
    ...assignment,

    status:
      "active",

    activatedAt:
      new Date().toISOString(),
  });
}


/* ==========================================================
   Cancel Assignment
========================================================== */

export async function cancelAssignment(
  organizationId: string,
  assignmentId: string
): Promise<Assignment> {

  const assignment =
    await loadAssignment(
      organizationId,
      assignmentId
    );

  if (!assignment) {
    throw new Error(
      "Assignment not found."
    );
  }

  if (
    assignment.status ===
    "cancelled"
  ) {
    return assignment;
  }

  if (
    assignment.status ===
    "completed"
  ) {
    throw new Error(
      "Completed assignments cannot be cancelled."
    );
  }


  /*
   * Cancellation is a state change.
   *
   * The Assignment record remains intact so historical
   * relationships are preserved.
   */
  return updateAssignment({
    ...assignment,

    status:
      "cancelled",
  });
}


/* ==========================================================
   Create Performance Execution From Assignment
========================================================== */

export async function createPerformanceExecutionFromAssignment(
  organizationId: string,
  assignmentId: string
): Promise<PerformanceInstance> {

  const assignment =
    await loadAssignment(
      organizationId,
      assignmentId
    );

  if (!assignment) {
    throw new Error(
      "Assignment not found."
    );
  }

  if (
    assignment.status !==
    "active"
  ) {
    throw new Error(
      "Only active assignments can create performance executions."
    );
  }


  /* ========================================================
     Load Exact Published Performance Sheet
  ======================================================== */

  const performanceSheet =
    await loadPublishedById(
      organizationId,
      assignment.performanceSheetId
    );

  if (!performanceSheet) {
    throw new Error(
      "The published Performance Sheet assigned to this assignment could not be found."
    );
  }


  /* ========================================================
     Prevent Duplicate Active Executions
  ======================================================== */

  const existingInstances =
    await findPerformanceInstancesByOrganization(
      organizationId
    );

  const existingExecution =
    existingInstances.find(
      (instance) =>
        instance.assignmentId ===
          assignment.id &&
        (
          instance.status ===
            "not_started" ||
          instance.status ===
            "in_progress" ||
          instance.status ===
            "submitted" ||
          instance.status ===
            "approved"
        )
    );

  if (existingExecution) {

    /*
     * Runtime initialization is intentionally idempotent.
     */
    await initializePerformanceInstance(
      existingExecution,
      performanceSheet.document
    );

    return existingExecution;
  }


  /* ========================================================
     Create Performance Execution
  ======================================================== */

  const performanceInstance =
    await createPerformanceExecution(
      {
        organizationId,

        assignmentId:
          assignment.id,

        performanceSheetId:
          performanceSheet.id,

        overallScore:
          0,

        progress:
          0,

        status:
          "in_progress",

        employeeComments:
          undefined,

        managerComments:
          undefined,

        startedAt:
          new Date().toISOString(),

        submittedAt:
          undefined,

        approvedAt:
          undefined,

        completedAt:
          undefined,
      },

      performanceSheet.document
    );

  return performanceInstance;
}