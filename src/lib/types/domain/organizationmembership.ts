/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Organization Membership Domain Model
 * ----------------------------------------------------------
 * Represents a user's membership within an organization.
 *
 * Department, Team, Role Title, and Role Description are
 * organization-specific membership attributes.
 *
 * Performance participation is also organization-specific.
 * It does not control account access or login eligibility.
 *
 * Permission roles are managed separately through the
 * membership_roles relationship.
 * ==========================================================
 */

export interface OrganizationMembership {
  id: string;

  user_id: string;
  organization_id: string;

  department_id: string | null;
  team_id: string | null;

  role_title: string | null;
  role_description: string | null;

  /**
   * Determines whether this member appears in individual
   * Runtime performance navigation for this organization.
   *
   * This does not affect account activity, login, or
   * organization access.
   */
  is_performance_participant: boolean;

  created_at: string;
  updated_at: string;
}

export interface OrganizationMembershipCreateInput {
  user_id: string;
  organization_id: string;

  department_id?: string | null;
  team_id?: string | null;

  role_title?: string | null;
  role_description?: string | null;

  /**
   * Defaults to true for newly created memberships.
   */
  is_performance_participant?: boolean;
}

export interface OrganizationMembershipUpdateInput {
  department_id?: string | null;
  team_id?: string | null;

  role_title?: string | null;
  role_description?: string | null;

  is_performance_participant?: boolean;
}