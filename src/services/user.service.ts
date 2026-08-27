import { supabase } from "@/lib/supabase/client";

import type {
  User,
  UserCreateInput,
  UserUpdateInput,
} from "@/lib/types/domain/user";

import type {
  OrganizationMembership,
  OrganizationMembershipCreateInput,
  OrganizationMembershipUpdateInput,
} from "@/lib/types/domain/organizationmembership";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

/**
 * ==========================================================
 * CascadEffects Performance Platform
 * User Service
 * ==========================================================
 */


/* ==========================================================
   Users
========================================================== */

export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load users: ${error.message}`
    );
  }

  return (data ?? []) as User[];
}


export async function getUser(
  userId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load user: ${error.message}`
    );
  }

  return data as User | null;
}


export async function createUser(
  input: UserCreateInput
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_user_id:
        input.auth_user_id,

      first_name:
        input.first_name,

      last_name:
        input.last_name,

      display_name:
        input.display_name ?? null,

      email:
        input.email,

      is_active:
        input.is_active ?? true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create user: ${error.message}`
    );
  }

  return data as User;
}


export async function updateUser(
  userId: string,
  input: UserUpdateInput
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...input,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update user: ${error.message}`
    );
  }

  return data as User;
}


export async function deactivateUser(
  userId: string
): Promise<User> {
  return updateUser(
    userId,
    {
      is_active: false,
    }
  );
}


/* ==========================================================
   User Management
========================================================== */

/**
 * Loads users belonging to the supplied organization and
 * resolves their organization membership, department, and
 * team.
 *
 * Organization membership is treated as the authoritative
 * tenant relationship.
 */
export async function listUserManagementRecords(
  organizationId: string
): Promise<UserManagementRecord[]> {

  /* ========================================================
     Load Organization Memberships
  ======================================================== */

  const {
    data: membershipData,
    error: membershipError,
  } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .order("created_at", {
      ascending: true,
    });

  if (membershipError) {
    throw new Error(
      `Failed to load organization memberships: ${membershipError.message}`
    );
  }

  const memberships =
    (membershipData ?? []) as OrganizationMembership[];


  /* ========================================================
     No Organization Members
  ======================================================== */

  if (memberships.length === 0) {
    return [];
  }


  /* ========================================================
     Load Users
  ======================================================== */

  const userIds =
    memberships.map(
      (membership) =>
        membership.user_id
    );

  const {
    data: userData,
    error: userError,
  } = await supabase
    .from("users")
    .select("*")
    .in(
      "id",
      userIds
    )
    .order("created_at", {
      ascending: true,
    });

  if (userError) {
    throw new Error(
      `Failed to load organization users: ${userError.message}`
    );
  }

  const users =
    (userData ?? []) as User[];


  /* ========================================================
     Create User Map
  ======================================================== */

  const userMap =
    new Map<string, User>(
      users.map(
        (user) => [
          user.id,
          user,
        ]
      )
    );


  /* ========================================================
     Load Departments
  ======================================================== */

  const departmentIds =
    Array.from(
      new Set(
        memberships
          .map(
            (membership) =>
              membership.department_id
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          )
      )
    );

  const departmentMap =
    new Map<string, Department>();

  if (
    departmentIds.length > 0
  ) {
    const {
      data: departmentData,
      error: departmentError,
    } = await supabase
      .from("departments")
      .select("*")
      .in(
        "id",
        departmentIds
      )
      .eq(
        "organization_id",
        organizationId
      );

    if (departmentError) {
      throw new Error(
        `Failed to load departments: ${departmentError.message}`
      );
    }

    for (
      const department of
        (departmentData ?? []) as Department[]
    ) {
      departmentMap.set(
        department.id,
        department
      );
    }
  }


  /* ========================================================
     Load Teams
  ======================================================== */

  const teamIds =
    Array.from(
      new Set(
        memberships
          .map(
            (membership) =>
              membership.team_id
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          )
      )
    );

  const teamMap =
    new Map<string, Team>();

  if (
    teamIds.length > 0
  ) {
    const {
      data: teamData,
      error: teamError,
    } = await supabase
      .from("teams")
      .select("*")
      .in(
        "id",
        teamIds
      )
      .eq(
        "organization_id",
        organizationId
      );

    if (teamError) {
      throw new Error(
        `Failed to load teams: ${teamError.message}`
      );
    }

    for (
      const team of
        (teamData ?? []) as Team[]
    ) {
      teamMap.set(
        team.id,
        team
      );
    }
  }


  /* ========================================================
     Build User Management Records
  ======================================================== */

  const records:
    UserManagementRecord[] = [];

  for (
    const membership of memberships
  ) {
    const user =
      userMap.get(
        membership.user_id
      );

    /*
     * A membership without a corresponding application
     * User record is not usable by the management layer.
     */
    if (!user) {
      continue;
    }

    const department =
      membership.department_id
        ? departmentMap.get(
            membership.department_id
          ) ?? null
        : null;

    const team =
      membership.team_id
        ? teamMap.get(
            membership.team_id
          ) ?? null
        : null;

    records.push({
      user,

      membership,

      department,

      team,
    });
  }

  return records;
}


/* ==========================================================
   Organization Memberships
========================================================== */

export async function listOrganizationMemberships(
  organizationId: string
): Promise<OrganizationMembership[]> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load organization memberships: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as OrganizationMembership[];
}


export async function getUserMembership(
  userId: string,
  organizationId: string
): Promise<OrganizationMembership | null> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load organization membership: ${error.message}`
    );
  }

  return data as OrganizationMembership | null;
}


export async function createOrganizationMembership(
  input: OrganizationMembershipCreateInput
): Promise<OrganizationMembership> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .insert({
      user_id:
        input.user_id,

      organization_id:
        input.organization_id,

      department_id:
        input.department_id ?? null,

      team_id:
        input.team_id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create organization membership: ${error.message}`
    );
  }

  return data as OrganizationMembership;
}


export async function updateOrganizationMembership(
  membershipId: string,
  input: OrganizationMembershipUpdateInput
): Promise<OrganizationMembership> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .update({
      ...input,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      membershipId
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to update organization membership: ${error.message}`
    );
  }

  return data as OrganizationMembership;
}