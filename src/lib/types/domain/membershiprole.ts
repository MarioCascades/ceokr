/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Membership Role Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of the relationship between
 * an Organization Membership and an organization-scoped Role.
 * ==========================================================
 */

export interface MembershipRole {
  id: string;

  organization_membership_id: string;

  role_id: string;

  organization_id: string;

  created_at: string;
}

/**
 * ==========================================================
 * Membership Role Create Input
 * ==========================================================
 */

export interface CreateMembershipRoleInput {
  organization_membership_id: string;

  role_id: string;

  organization_id: string;
}