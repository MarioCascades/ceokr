/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Permission Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of a platform Permission.
 * ==========================================================
 */

export interface Permission {
  id: string;

  key: string;

  name: string;

  description: string | null;

  created_at: string;
}

/**
 * ==========================================================
 * Permission Create Input
 * ==========================================================
 */

export interface CreatePermissionInput {
  key: string;

  name: string;

  description?: string | null;
}