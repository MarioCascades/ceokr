/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current Entry Context
 * ----------------------------------------------------------
 * Resolves the authenticated actor's role-based entry context.
 *
 * Authentication:
 *
 *      Supabase Auth
 *           ↓
 *     Application User
 *           ↓
 *     Platform Membership
 *           OR
 *     Organization Membership
 *           ↓
 *      Membership Role
 *           ↓
 *       Entry Actor
 *
 * This module is SERVER-SIDE infrastructure.
 *
 * It establishes the product entry context.
 *
 * Production authorization / RLS remains a separate
 * security milestone.
 * ==========================================================
 */

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
  getCurrentServerUser,
} from "@/lib/auth/currentserveruser";

import type {
  User,
} from "@/lib/types/domain/user";


/* ==========================================================
   Entry Actor
========================================================== */

export type EntryActor =
  | "super_admin"
  | "organization_admin"
  | "member";


/* ==========================================================
   Entry Context
========================================================== */

export type CurrentEntryContext = {

  user: User;

  actor: EntryActor;

  organizationId: string | null;

  organizationName: string | null;

};


/* ==========================================================
   Get Current Entry Context
========================================================== */

export async function getCurrentEntryContext(): Promise<
  CurrentEntryContext | null
> {

  /* ========================================================
     Application User
  ======================================================== */

  const user =
    await getCurrentServerUser();

  if (
    !user ||
    !user.is_active
  ) {
    return null;
  }


  const supabase =
    await createSupabaseServerClient();


  /* ========================================================
     Platform Super Admin
  ======================================================== */

  const {
    data: platformMembership,
    error: platformMembershipError,
  } =
    await supabase
      .from("platform_memberships")
      .select("id")
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "platform_role",
        "super_admin"
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();


  if (
    platformMembershipError
  ) {

    console.error(
      "Error loading platform membership:",
      platformMembershipError
    );

    throw new Error(
      `Failed to load platform membership: ${platformMembershipError.message}`
    );

  }


  if (
    platformMembership
  ) {

    return {

      user,

      actor:
        "super_admin",

      organizationId:
        null,

      organizationName:
        null,

    };

  }


  /* ========================================================
     Organization Memberships
  ======================================================== */

  const {
    data: memberships,
    error: membershipError,
  } =
    await supabase
      .from("organization_memberships")
      .select(
        "id, organization_id, created_at"
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (
    membershipError
  ) {

    console.error(
      "Error loading organization memberships:",
      membershipError
    );

    throw new Error(
      `Failed to load organization memberships: ${membershipError.message}`
    );

  }


  if (
    !memberships ||
    memberships.length === 0
  ) {

    return null;

  }


  /* ========================================================
     Resolve Membership Roles
  ======================================================== */

  const membershipIds =
    memberships.map(
      (membership) =>
        membership.id
    );


  const {
    data: membershipRoles,
    error: membershipRoleError,
  } =
    await supabase
      .from("membership_roles")
      .select(
        "organization_membership_id, role_id, organization_id"
      )
      .in(
        "organization_membership_id",
        membershipIds
      );


  if (
    membershipRoleError
  ) {

    console.error(
      "Error loading membership roles:",
      membershipRoleError
    );

    throw new Error(
      `Failed to load membership roles: ${membershipRoleError.message}`
    );

  }


  if (
    !membershipRoles ||
    membershipRoles.length === 0
  ) {

    return null;

  }


  const roleIds =
    membershipRoles
      .map(
        (membershipRole) =>
          membershipRole.role_id
      )
      .filter(
        (roleId): roleId is string =>
          Boolean(roleId)
      );


  if (
    roleIds.length === 0
  ) {

    return null;

  }


  /* ========================================================
     Organization Roles
  ======================================================== */

  const {
    data: roles,
    error: roleError,
  } =
    await supabase
      .from("roles")
      .select(
        "id, name, organization_id, is_active"
      )
      .in(
        "id",
        roleIds
      );


  if (
    roleError
  ) {

    console.error(
      "Error loading organization roles:",
      roleError
    );

    throw new Error(
      `Failed to load organization roles: ${roleError.message}`
    );

  }


  if (
    !roles ||
    roles.length === 0
  ) {

    return null;

  }


  /* ========================================================
     Resolve Organization Admin First
  ======================================================== */

  const organizationAdminAssignment =
    membershipRoles.find(
      (membershipRole) => {

        const role =
          roles.find(
            (candidate) =>
              candidate.id ===
              membershipRole.role_id
          );

        return (
          role?.is_active === true &&
          role.name
            .trim()
            .toLowerCase() ===
            "organization admin"
        );

      }
    );


  if (
    organizationAdminAssignment
  ) {

    const organizationId =
      organizationAdminAssignment.organization_id;


    const {
      data: organization,
      error: organizationError,
    } =
      await supabase
        .from("organization")
        .select(
          "id, company_name"
        )
        .eq(
          "id",
          organizationId
        )
        .maybeSingle();


    if (
      organizationError
    ) {

      console.error(
        "Error loading organization:",
        organizationError
      );

      throw new Error(
        `Failed to load organization: ${organizationError.message}`
      );

    }


    return {

      user,

      actor:
        "organization_admin",

      organizationId,

      organizationName:
        organization?.company_name ??
        null,

    };

  }


  /* ========================================================
     Resolve Member
  ======================================================== */

  const memberAssignment =
    membershipRoles.find(
      (membershipRole) => {

        const role =
          roles.find(
            (candidate) =>
              candidate.id ===
              membershipRole.role_id
          );

        return (
          role?.is_active === true &&
          role.name
            .trim()
            .toLowerCase() ===
            "member"
        );

      }
    );


  if (
    memberAssignment
  ) {

    const organizationId =
      memberAssignment.organization_id;


    const {
      data: organization,
      error: organizationError,
    } =
      await supabase
        .from("organization")
        .select(
          "id, company_name"
        )
        .eq(
          "id",
          organizationId
        )
        .maybeSingle();


    if (
      organizationError
    ) {

      console.error(
        "Error loading organization:",
        organizationError
      );

      throw new Error(
        `Failed to load organization: ${organizationError.message}`
      );

    }


    return {

      user,

      actor:
        "member",

      organizationId,

      organizationName:
        organization?.company_name ??
        null,

    };

  }


  return null;

}