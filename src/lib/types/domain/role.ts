/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Role Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of an organization-scoped Role.
 * ==========================================================
 */

export interface Role {
  id: string;

  organization_id: string;

  name: string;

  description: string | null;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}

/**
 * ==========================================================
 * Role Create Input
 * ==========================================================
 */

export interface CreateRoleInput {
  organization_id: string;

  name: string;

  description?: string | null;

  is_active?: boolean;
}

/**
 * ==========================================================
 * Role Update Input
 * ==========================================================
 */

export interface UpdateRoleInput {
  name?: string;

  description?: string | null;

  is_active?: boolean;
}