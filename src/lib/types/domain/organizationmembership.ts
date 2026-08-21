/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Organization Membership Domain Model
 * ----------------------------------------------------------
 * Represents a user's membership within an organization.
 *
 * Department and Team assignments are optional because a user
 * may belong to an organization before being assigned to a
 * specific organizational unit.
 * ==========================================================
 */

export interface OrganizationMembership {
  id: string;

  user_id: string;
  organization_id: string;

  department_id: string | null;
  team_id: string | null;

  created_at: string;
  updated_at: string;
}

export interface OrganizationMembershipCreateInput {
  user_id: string;
  organization_id: string;

  department_id?: string | null;
  team_id?: string | null;
}

export interface OrganizationMembershipUpdateInput {
  department_id?: string | null;
  team_id?: string | null;
}