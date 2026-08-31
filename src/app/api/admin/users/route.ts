import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/authorization";

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

export async function POST(request: Request) {
  let input: InviteUserRequest;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      }
    );
  }

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

  if (!organizationId) {
    return NextResponse.json(
      {
        error: "Organization is required.",
      },
      {
        status: 400,
      }
    );
  }

  /* ========================================================
     Authorization
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

  if (!firstName) {
    return NextResponse.json(
      {
        error: "First name is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!lastName) {
    return NextResponse.json(
      {
        error: "Last name is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!email) {
    return NextResponse.json(
      {
        error: "Email is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!departmentId) {
    return NextResponse.json(
      {
        error: "Department is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!teamId) {
    return NextResponse.json(
      {
        error: "Team is required.",
      },
      {
        status: 400,
      }
    );
  }

  const {
    data: department,
    error: departmentError,
  } = await supabaseAdmin
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (departmentError) {
    console.error(
      "Failed to verify department:",
      departmentError
    );

    return NextResponse.json(
      {
        error: "Failed to verify department.",
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

  const {
    data: team,
    error: teamError,
  } = await supabaseAdmin
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .eq("organization_id", organizationId)
    .eq("department_id", departmentId)
    .maybeSingle();

  if (teamError) {
    console.error(
      "Failed to verify team:",
      teamError
    );

    return NextResponse.json(
      {
        error: "Failed to verify team.",
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
        error: authError.message,
      },
      {
        status: 400,
      }
    );
  }

  const authUser = authData.user;

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

  const {
    data: platformUser,
    error: userError,
  } = await supabaseAdmin
    .from("users")
    .insert({
      auth_user_id: authUser.id,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
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

  const {
    data: membership,
    error: membershipError,
  } = await supabaseAdmin
    .from("organization_memberships")
    .insert({
      user_id: platformUser.id,
      organization_id: organizationId,
      department_id: departmentId,
      team_id: teamId,
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
      .eq("id", platformUser.id);

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

  return NextResponse.json(
    {
      user: platformUser,
      membership,
    },
    {
      status: 201,
    }
  );
}