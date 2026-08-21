/**
 * ==========================================================
 * CascadEffects Performance Platform
 * User Domain Model
 * ----------------------------------------------------------
 * Represents the application-level user.
 *
 * Authentication identity is owned by Supabase Auth through
 * auth_user_id.
 * ==========================================================
 */

export interface User {
  id: string;
  auth_user_id: string;

  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  auth_user_id: string;

  first_name: string;
  last_name: string;
  display_name?: string | null;
  email: string;

  is_active?: boolean;
}

export interface UserUpdateInput {
  first_name?: string;
  last_name?: string;
  display_name?: string | null;
  email?: string;
  is_active?: boolean;
}