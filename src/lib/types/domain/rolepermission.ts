/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Role Permission Domain Model
 * ----------------------------------------------------------
 * TypeScript representation of the relationship between
 * a Role and a Permission.
 * ==========================================================
 */

export interface RolePermission {
  id: string;

  role_id: string;

  permission_id: string;

  created_at: string;
}

/**
 * ==========================================================
 * Role Permission Create Input
 * ==========================================================
 */

export interface CreateRolePermissionInput {
  role_id: string;

  permission_id: string;
}