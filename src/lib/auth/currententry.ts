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

import "server-only";

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
    error: membershipError
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


  const membershipOrganizationById =
    new Map(
      memberships.map(
        (membership) => [
          membership.id,
          membership.organization_id,
        ]
      )
    );


  const {
    data: membershipRoles,
    error: membershipRoleError
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


  /*
   * A membership-role assignment must agree with the
   * organization recorded on its parent membership.
   *
   * Discard inconsistent assignments before resolving roles.
   */

  const consistentMembershipRoles =
    membershipRoles.filter(
      (membershipRole) => {

        const membershipOrganizationId =
          membershipOrganizationById.get(
            membershipRole.organization_membership_id
          );

        return (
          Boolean(membershipOrganizationId) &&
          membershipRole.organization_id ===
            membershipOrganizationId
        );

      }
    );


  if (
    consistentMembershipRoles.length === 0
  ) {

    return null;

  }


  const roleIds =
    [
      ...new Set(
        consistentMembershipRoles
          .map(
            (membershipRole) =>
              membershipRole.role_id
          )
          .filter(
            (roleId): roleId is string =>
              Boolean(roleId)
          )
      )
    ];


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
    error: roleError
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
     Validate Role Organization Consistency
  ======================================================== */

  /*
   * A role is usable for entry resolution only when:
   *
   * - The role is active.
   * - The role belongs to the same organization as the
   *   membership-role assignment.
   *
   * This prevents a role ID from being used to establish
   * entry into a different organization.
   */

  const roleById =
    new Map(
      roles.map(
        (role) => [
          role.id,
          role,
        ]
      )
    );


  const validAssignments =
    consistentMembershipRoles.filter(
      (membershipRole) => {

        const role =
          roleById.get(
            membershipRole.role_id
          );

        return (
          role?.is_active === true &&
          role.organization_id ===
            membershipRole.organization_id
        );

      }
    );


  if (
    validAssignments.length === 0
  ) {

    return null;

  }


  /* ========================================================
     Resolve Organization Admin First
  ======================================================== */

  const organizationAdminAssignment =
    validAssignments.find(
      (membershipRole) => {

        const role =
          roleById.get(
            membershipRole.role_id
          );

        return (
          role?.name
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
      error: organizationError
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


    if (!organization) {
      return null;
    }


    return {

      user,

      actor:
        "organization_admin",

      organizationId,

      organizationName:
        organization.company_name,

    };

  }


  /* ========================================================
     Resolve Member
  ======================================================== */

  const memberAssignment =
    validAssignments.find(
      (membershipRole) => {

        const role =
          roleById.get(
            membershipRole.role_id
          );

        return (
          role?.name
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
      error: organizationError
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


    if (!organization) {
      return null;
    }


    return {

      user,

      actor:
        "member",

      organizationId,

      organizationName:
        organization.company_name,

    };

  }


  return null;

}