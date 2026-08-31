/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Administration Users API
 * ----------------------------------------------------------
 * Creates an invited User and Organization Membership.
 *
 * Authorization boundary:
 *
 * Request
 *      ↓
 * Authenticated Application User
 *      ↓
 * Authorization Context
 *      ↓
 * Organization Permission
 *      ↓
 * Organization Resource Validation
 *      ↓
 * Privileged Server Operation
 *
 * IMPORTANT:
 *
 * This route is SERVER-SIDE infrastructure.
 *
 * The Supabase service-role client is only used after the
 * authenticated caller has passed the authorization boundary.
 *
 * The organization_id supplied by the caller identifies the
 * requested tenant context, but does not itself establish
 * authorization.
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  requirePermission,
} from "@/lib/auth/authorization";


/* ==========================================================
   Request Type
========================================================== */

interface InviteUserRequest {
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  department_id: string;
  team_id: string;
  is_active?: boolean;
}


/* ==========================================================
   POST
========================================================== */

export async function POST(
  request: Request
) {

  let input: InviteUserRequest;


  /* ========================================================
     Parse Request
  ======================================================== */

  try {

    input =
      await request.json();

  } catch {

    return NextResponse.json(
      {
        error:
          "Invalid request body.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Normalize Input
  ======================================================== */

  const organizationId =
    input.organization_id?.trim();

  const firstName =
    input.first_name?.trim();

  const lastName =
    input.last_name?.trim();

  const displayName =
    input.display_name?.trim() || null;

  const email =
    input.email?.trim().toLowerCase();

  const departmentId =
    input.department_id?.trim();

  const teamId =
    input.team_id?.trim();


  /* ========================================================
     Organization Context
  ======================================================== */

  if (!organizationId) {

    return NextResponse.json(
      {
        error:
          "Organization is required.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Authorization Boundary
  ======================================================== */

  /*
   * The organization_id is only requested context.
   *
   * It is NOT trusted as proof that the caller belongs to
   * the organization.
   *
   * requirePermission() resolves the authenticated
   * application User and verifies:
   *
   * Platform Super Admin
   * OR
   * Organization Membership
   *      ↓
   * Membership Roles
   *      ↓
   * Roles
   *      ↓
   * Role Permissions
   *      ↓
   * Requested Permission
   *
   * No privileged database mutation occurs before this
   * authorization boundary succeeds.
   */

  try {

    await requirePermission(
      organizationId,
      "users.create"
    );

  } catch (error) {

    console.error(
      "Authorization failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "You do not have permission to perform this action.",
      },
      {
        status: 403,
      }
    );
  }


  /* ========================================================
     Validate User Fields
  ======================================================== */

  if (!firstName) {

    return NextResponse.json(
      {
        error:
          "First name is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!lastName) {

    return NextResponse.json(
      {
        error:
          "Last name is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!email) {

    return NextResponse.json(
      {
        error:
          "Email is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!departmentId) {

    return NextResponse.json(
      {
        error:
          "Department is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!teamId) {

    return NextResponse.json(
      {
        error:
          "Team is required.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Validate Department Tenant Ownership
  ======================================================== */

  /*
   * The department must belong to the requested
   * organization.
   *
   * This is resource validation.
   *
   * Authorization answers:
   *
   * "Can this caller create users in this organization?"
   *
   * Resource validation answers:
   *
   * "Does this department actually belong to this
   * organization?"
   */

  const {
    data: department,
    error: departmentError,
  } =
    await supabaseAdmin
      .from("departments")
      .select("id")
      .eq(
        "id",
        departmentId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

  if (departmentError) {

    console.error(
      "Failed to verify department:",
      departmentError
    );

    return NextResponse.json(
      {
        error:
          "Failed to verify department.",
      },
      {
        status: 500,
      }
    );
  }

  if (!department) {

    return NextResponse.json(
      {
        error:
          "The selected department does not belong to this organization.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Validate Team Tenant Ownership
  ======================================================== */

  /*
   * The team must belong to:
   *
   * requested organization
   * AND
   * requested department
   */

  const {
    data: team,
    error: teamError,
  } =
    await supabaseAdmin
      .from("teams")
      .select("id")
      .eq(
        "id",
        teamId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "department_id",
        departmentId
      )
      .maybeSingle();

  if (teamError) {

    console.error(
      "Failed to verify team:",
      teamError
    );

    return NextResponse.json(
      {
        error:
          "Failed to verify team.",
      },
      {
        status: 500,
      }
    );
  }

  if (!team) {

    return NextResponse.json(
      {
        error:
          "The selected team does not belong to the selected department and organization.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Create Supabase Auth User
  ======================================================== */

  /*
   * From this point forward we are inside the trusted
   * server-side privileged operation boundary.
   */

  const {
    data: authData,
    error: authError,
  } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
        },
      }
    );

  if (authError) {

    console.error(
      "Failed to invite Auth user:",
      authError
    );

    return NextResponse.json(
      {
        error:
          authError.message,
      },
      {
        status: 400,
      }
    );
  }

  const authUser =
    authData.user;

  if (!authUser) {

    return NextResponse.json(
      {
        error:
          "Supabase Auth did not return a user.",
      },
      {
        status: 500,
      }
    );
  }


  /* ========================================================
     Create Application User
  ======================================================== */

  const {
    data: platformUser,
    error: userError,
  } =
    await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id:
          authUser.id,

        first_name:
          firstName,

        last_name:
          lastName,

        display_name:
          displayName,

        email,

        is_active:
          input.is_active ?? true,
      })
      .select("*")
      .single();

  if (userError) {

    console.error(
      "Failed to create platform user:",
      userError
    );

    /*
     * Compensating cleanup:
     *
     * If the application User cannot be created,
     * remove the newly-created Auth identity so the
     * operation does not leave an orphaned Auth user.
     */

    await supabaseAdmin.auth.admin.deleteUser(
      authUser.id
    );

    return NextResponse.json(
      {
        error:
          `Failed to create platform user: ${userError.message}`,
      },
      {
        status: 500,
      }
    );
  }


  /* ========================================================
     Create Organization Membership
  ======================================================== */

  const {
    data: membership,
    error: membershipError,
  } =
    await supabaseAdmin
      .from("organization_memberships")
      .insert({
        user_id:
          platformUser.id,

        organization_id:
          organizationId,

        department_id:
          departmentId,

        team_id:
          teamId,
      })
      .select("*")
      .single();

  if (membershipError) {

    console.error(
      "Failed to create organization membership:",
      membershipError
    );

    /*
     * Compensating cleanup:
     *
     * The Auth identity and application User were both
     * created successfully, but the Organization Membership
     * failed.
     *
     * Remove both records to avoid an incomplete user
     * provisioning operation.
     */

    await supabaseAdmin
      .from("users")
      .delete()
      .eq(
        "id",
        platformUser.id
      );

    await supabaseAdmin.auth.admin.deleteUser(
      authUser.id
    );

    return NextResponse.json(
      {
        error:
          `Failed to create organization membership: ${membershipError.message}`,
      },
      {
        status: 500,
      }
    );
  }


  /* ========================================================
     Success
  ======================================================== */

  return NextResponse.json(
    {
      user:
        platformUser,

      membership,
    },
    {
      status: 201,
    }
  );
}