/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Team Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of a platform Team.
 * ==========================================================
 */

export interface Team {
  id: string;

  organization_id: string;

  department_id: string;

  name: string;

  description: string | null;

  is_active: boolean;

  created_at: string | null;

  updated_at: string | null;
}

/**
 * ==========================================================
 * Team Create Input
 * ==========================================================
 */

export interface CreateTeamInput {
  organization_id: string;

  department_id: string;

  name: string;

  description?: string | null;

  is_active?: boolean;
}

/**
 * ==========================================================
 * Team Update Input
 * ==========================================================
 */

export interface UpdateTeamInput {
  department_id?: string;

  name?: string;

  description?: string | null;

  is_active?: boolean;
}