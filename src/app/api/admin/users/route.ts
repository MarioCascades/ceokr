/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Administration Users API
 * ----------------------------------------------------------
 * Creates a User and Organization Membership.
 *
 * Supported modes:
 *
 * invite
 *      → Creates a Supabase Auth user through invitation.
 *
 * create
 *      → Creates a Supabase Auth user directly with a
 *        password for immediate account access.
 *
 * Both modes share the same provisioning pipeline:
 *
 * Authorization
 *      ↓
 * Organization Validation
 *      ↓
 * Member Role Resolution
 *      ↓
 * Auth User
 *      ↓
 * Application User
 *      ↓
 * Organization Membership
 *      ↓
 * Membership Role
 *
 * IMPORTANT:
 *
 * This route is SERVER-SIDE infrastructure.
 *
 * The Supabase service-role client is only used after the
 * authenticated caller has passed the authorization boundary.
 *
 * Department and Team are OPTIONAL organizational assignments.
 *
 * Feature availability does NOT mean the related resource
 * is required.
 *
 * Example:
 *
 * departments = false
 * teams = true
 *
 * A member may have:
 * - no department
 * - no team
 *
 * The UI determines which assignment fields are available.
 * The API validates any supplied assignments but does not
 * require them.
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

type UserCreationMode =
  | "invite"
  | "create";


interface UserRequest {
  mode?: UserCreationMode;

  organization_id: string;

  first_name: string;

  last_name: string;

  display_name?: string;

  email: string;

  password?: string;

  department_id?: string;

  team_id?: string;

  is_active?: boolean;
}


/* ==========================================================
   POST
========================================================== */

export async function POST(
  request: Request
) {

  let input: UserRequest;


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
     Normalize Mode
  ======================================================== */

  const mode: UserCreationMode =
    input.mode === "create"
      ? "create"
      : "invite";


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

  const password =
    input.password ?? "";

  const departmentId =
    input.department_id?.trim() || null;

  const teamId =
    input.team_id?.trim() || null;


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
   * organization_id is requested tenant context only.
   *
   * It is NOT trusted as proof that the caller belongs
   * to the organization.
   *
   * requirePermission() resolves the authenticated user
   * and verifies the appropriate platform or organization
   * authority before privileged operations occur.
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


  /* ========================================================
     Validate Password For Direct Creation
  ======================================================== */

  if (mode === "create") {

    if (!password) {

      return NextResponse.json(
        {
          error:
            "Password is required when creating a member directly.",
        },
        {
          status: 400,
        }
      );
    }


    if (password.length < 8) {

      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }
  }


  /* ========================================================
     Validate Department Tenant Ownership
  ======================================================== */

  /*
   * Department is optional.
   *
   * If supplied, it must belong to the requested
   * organization.
   */

  if (departmentId) {

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
  }


  /* ========================================================
     Validate Team Tenant Ownership
  ======================================================== */

  /*
   * Team is also optional.
   *
   * Teams are an independent organizational capability.
   *
   * Therefore:
   *
   * - Team does not require a department assignment.
   * - If both Team and Department are supplied, the Team
   *   must belong to that Department.
   * - If only Team is supplied, the Team only needs to
   *   belong to the requested organization.
   */

  if (teamId) {

    const {
      data: team,
      error: teamError,
    } =
      await supabaseAdmin
        .from("teams")
        .select(
          "id, department_id"
        )
        .eq(
          "id",
          teamId
        )
        .eq(
          "organization_id",
          organizationId
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
            "The selected team does not belong to this organization.",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * If both assignments were supplied, enforce their
     * relationship.
     *
     * This prevents assigning a member to Department A
     * while selecting a Team that belongs to Department B.
     */

    if (
      departmentId &&
      team.department_id !== departmentId
    ) {

      return NextResponse.json(
        {
          error:
            "The selected team does not belong to the selected department.",
        },
        {
          status: 400,
        }
      );
    }
  }


  /* ========================================================
     Resolve Member Role
  ======================================================== */

  /*
   * Role IDs must NEVER be hardcoded.
   *
   * The Member role belongs to the requested organization
   * and is resolved dynamically.
   */

  const {
    data: memberRole,
    error: memberRoleError,
  } =
    await supabaseAdmin
      .from("roles")
      .select(
        "id, name, is_active"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "name",
        "Member"
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();


  if (memberRoleError) {

    console.error(
      "Failed to resolve Member role:",
      memberRoleError
    );

    return NextResponse.json(
      {
        error:
          "Failed to resolve the Member role.",
      },
      {
        status: 500,
      }
    );
  }


  if (!memberRole) {

    return NextResponse.json(
      {
        error:
          "The Member role is not configured for this organization.",
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

  let authUserId: string;


  if (mode === "create") {

    /* ======================================================
       Direct Account Creation
    ====================================================== */

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,

          password,

          email_confirm: true,

          user_metadata: {
            first_name:
              firstName,

            last_name:
              lastName,

            display_name:
              displayName,
          },
        }
      );


    if (authError) {

      console.error(
        "Failed to create Auth user:",
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


    if (!authData.user) {

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


    authUserId =
      authData.user.id;

  } else {

    /* ======================================================
       Invitation
    ====================================================== */

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            first_name:
              firstName,

            last_name:
              lastName,

            display_name:
              displayName,
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


    if (!authData.user) {

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


    authUserId =
      authData.user.id;
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
          authUserId,

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


    /* ======================================================
       Compensating Auth Cleanup
    ====================================================== */

    await supabaseAdmin.auth.admin.deleteUser(
      authUserId
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


    /* ======================================================
       Compensating Cleanup
    ====================================================== */

    await supabaseAdmin
      .from("users")
      .delete()
      .eq(
        "id",
        platformUser.id
      );


    await supabaseAdmin.auth.admin.deleteUser(
      authUserId
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
     Assign Member Role
  ======================================================== */

  const {
    data: membershipRole,
    error: membershipRoleError,
  } =
    await supabaseAdmin
      .from("membership_roles")
      .insert({
        organization_membership_id:
          membership.id,

        organization_id:
          organizationId,

        role_id:
          memberRole.id,
      })
      .select("*")
      .single();


  if (membershipRoleError) {

    console.error(
      "Failed to assign Member role:",
      membershipRoleError
    );


    /* ======================================================
       Compensating Cleanup
    ====================================================== */

    await supabaseAdmin
      .from("organization_memberships")
      .delete()
      .eq(
        "id",
        membership.id
      );


    await supabaseAdmin
      .from("users")
      .delete()
      .eq(
        "id",
        platformUser.id
      );


    await supabaseAdmin.auth.admin.deleteUser(
      authUserId
    );


    return NextResponse.json(
      {
        error:
          `Failed to assign Member role: ${membershipRoleError.message}`,
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

      membership_role:
        membershipRole,

      mode,
    },
    {
      status: 201,
    }
  );
}