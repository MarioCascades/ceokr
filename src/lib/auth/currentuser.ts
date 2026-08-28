/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current User Context
 * ----------------------------------------------------------
 * Resolves the currently authenticated Supabase Auth user
 * to the corresponding CascadEffects application User.
 *
 * Authentication:
 *
 * Supabase Auth
 *      ↓
 * auth.users.id
 *
 * Application:
 *
 * public.users.auth_user_id
 *      ↓
 * public.users.id
 *
 * This utility provides the bridge between the authenticated
 * Supabase identity and the application User domain model.
 *
 * It intentionally does NOT resolve organization membership.
 * Organization context is a separate concern.
 * ==========================================================
 */

import { supabase } from "@/lib/supabase/client";

import type {
  User,
} from "@/lib/types/domain/user";

/* ==========================================================
   Get Current Authenticated Application User
========================================================== */

export async function getCurrentUser(): Promise<
  User | null
> {
  /*
   * Resolve the currently authenticated Supabase Auth user.
   */
  const {
    data: {
      user: authUser,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "Error loading authenticated user:",
      authError
    );

    throw new Error(
      `Failed to load authenticated user: ${authError.message}`
    );
  }

  /*
   * No authenticated Supabase user means there is no
   * current application user.
   */
  if (!authUser) {
    return null;
  }

  /*
   * Resolve the Supabase Auth user to the corresponding
   * CascadEffects application user.
   */
  const {
    data,
    error,
  } = await supabase
    .from("users")
    .select("*")
    .eq(
      "auth_user_id",
      authUser.id
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading application user:",
      error
    );

    throw new Error(
      `Failed to load application user: ${error.message}`
    );
  }

  /*
   * The Auth user exists, but an application user record
   * may not have been created yet.
   */
  if (!data) {
    return null;
  }

  return data as User;
}