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
}

export interface OrganizationMembershipUpdateInput {
  department_id?: string | null;
  team_id?: string | null;

  role_title?: string | null;
  role_description?: string | null;
}