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
 */
export async function listUserManagementRecords(
  organizationId: string
): Promise<UserManagementRecord[]> {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      organization_memberships!organization_memberships_user_fkey (
        id,
        user_id,
        organization_id,
        department_id,
        team_id,
        created_at,
        updated_at
      )
    `)
    .eq(
      "organization_memberships.organization_id",
      organizationId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load user management records: ${error.message}`
    );
  }

  const records: UserManagementRecord[] = [];

  for (const row of data ?? []) {
    const rawMemberships =
      (
        row as User & {
          organization_memberships?:
            | OrganizationMembership[]
            | null;
        }
      ).organization_memberships;

    const membership =
      rawMemberships?.[0] ?? null;

    let department:
      | Department
      | null = null;

    let team:
      | Team
      | null = null;

    if (membership?.department_id) {
      const {
        data: departmentData,
        error: departmentError,
      } = await supabase
        .from("departments")
        .select("*")
        .eq(
          "id",
          membership.department_id
        )
        .maybeSingle();

      if (departmentError) {
        throw new Error(
          `Failed to load department: ${departmentError.message}`
        );
      }

      department =
        departmentData as Department | null;
    }

    if (membership?.team_id) {
      const {
        data: teamData,
        error: teamError,
      } = await supabase
        .from("teams")
        .select("*")
        .eq(
          "id",
          membership.team_id
        )
        .maybeSingle();

      if (teamError) {
        throw new Error(
          `Failed to load team: ${teamError.message}`
        );
      }

      team =
        teamData as Team | null;
    }

    const {
      organization_memberships,
      ...user
    } = row as User & {
      organization_memberships?:
        | OrganizationMembership[]
        | null;
    };

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