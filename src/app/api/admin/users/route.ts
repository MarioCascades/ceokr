/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Administration Users API
 * ----------------------------------------------------------
 * Creates and updates Users and Organization Memberships.
 *
 * Supported POST modes:
 *
 * invite
 *      → Creates a Supabase Auth user through invitation.
 *
 * create
 *      → Creates a Supabase Auth user directly with a
 *        password for immediate account access.
 *
 * PATCH
 *      → Updates an existing Application User and its
 *        Organization Membership.
 *
 * Both POST modes share the same provisioning pipeline:
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
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

import {
  requirePermission,
} from "@/lib/auth/authorization";


/* ==========================================================
   Request Types
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


interface UserUpdateRequest {

  organization_id: string;

  user_id: string;

  membership_id: string;

  first_name: string;

  last_name: string;

  display_name?: string | null;

  email: string;

  department_id?: string | null;

  team_id?: string | null;

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

  let authUserId: string;


  if (mode === "create") {

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


/* ==========================================================
   PATCH
   ----------------------------------------------------------
   Updates an existing Application User and its
   Organization Membership.
========================================================== */

export async function PATCH(
  request: Request
) {

  let input: UserUpdateRequest;


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

  const userId =
    input.user_id?.trim();

  const membershipId =
    input.membership_id?.trim();

  const firstName =
    input.first_name?.trim();

  const lastName =
    input.last_name?.trim();

  const displayName =
    input.display_name?.trim() || null;

  const email =
    input.email?.trim().toLowerCase();

  const departmentId =
    input.department_id?.trim() || null;

  const teamId =
    input.team_id?.trim() || null;

  const isActive =
    input.is_active ?? true;


  /* ========================================================
     Validate Organization Context
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
     Validate User Context
  ======================================================== */

  if (!userId) {

    return NextResponse.json(
      {
        error:
          "User is required.",
      },
      {
        status: 400,
      }
    );
  }


  if (!membershipId) {

    return NextResponse.json(
      {
        error:
          "Organization membership is required.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Authorization Boundary
  ======================================================== */

  try {

    await requirePermission(
      organizationId,
      "users.edit"
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
            : "You do not have permission to edit this user.",
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
     Validate Membership Ownership
  ======================================================== */

  const {
    data: membership,
    error: membershipError,
  } =
    await supabaseAdmin
      .from("organization_memberships")
      .select(
        "id, user_id, organization_id"
      )
      .eq(
        "id",
        membershipId
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();


  if (membershipError) {

    console.error(
      "Failed to verify organization membership:",
      membershipError
    );

    return NextResponse.json(
      {
        error:
          "Failed to verify organization membership.",
      },
      {
        status: 500,
      }
    );
  }


  if (!membership) {

    return NextResponse.json(
      {
        error:
          "The user membership does not belong to this organization.",
      },
      {
        status: 400,
      }
    );
  }


  /* ========================================================
     Validate Department
  ======================================================== */

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
     Validate Team
  ======================================================== */

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
     Update Application User
  ======================================================== */

  const {
    data: updatedUser,
    error: updateUserError,
  } =
    await supabaseAdmin
      .from("users")
      .update({
        first_name:
          firstName,

        last_name:
          lastName,

        display_name:
          displayName,

        email,

        is_active:
          isActive,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        userId
      )
      .select("*")
      .single();


  if (updateUserError) {

    console.error(
      "Failed to update user:",
      updateUserError
    );

    return NextResponse.json(
      {
        error:
          `Failed to update user: ${updateUserError.message}`,
      },
      {
        status: 500,
      }
    );
  }


  /* ========================================================
     Update Organization Membership
  ======================================================== */

  const {
    data: updatedMembership,
    error: updateMembershipError,
  } =
    await supabaseAdmin
      .from("organization_memberships")
      .update({
        department_id:
          departmentId,

        team_id:
          teamId,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        membershipId
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .select("*")
      .single();


  if (updateMembershipError) {

    console.error(
      "Failed to update organization membership:",
      updateMembershipError
    );

    return NextResponse.json(
      {
        error:
          `Failed to update organization membership: ${updateMembershipError.message}`,
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
        updatedUser,

      membership:
        updatedMembership,
    },
    {
      status: 200,
    }
  );
}