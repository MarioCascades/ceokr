/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Department Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of a platform Department.
 * ==========================================================
 */

export interface Department {
  id: string;

  organization_id: string;

  name: string;

  description: string | null;

  is_active: boolean;

  created_at: string | null;

  updated_at: string | null;
}

/**
 * ==========================================================
 * Department Create Input
 * ==========================================================
 */

export interface CreateDepartmentInput {
  organization_id: string;

  name: string;

  description?: string | null;

  is_active?: boolean;
}

/**
 * ==========================================================
 * Department Update Input
 * ==========================================================
 */

export interface UpdateDepartmentInput {
  name?: string;

  description?: string | null;

  is_active?: boolean;
}