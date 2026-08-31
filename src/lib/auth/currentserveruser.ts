/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current Server User
 * ----------------------------------------------------------
 * Resolves the authenticated Supabase Auth identity to the
 * CascadEffects application User.
 *
 * This is SERVER-SIDE infrastructure.
 *
 * Authentication:
 *
 * Supabase Auth
 *      ↓
 * auth.users.id
 *      ↓
 * public.users.auth_user_id
 *      ↓
 * public.users.id
 *
 * This utility resolves identity only.
 *
 * It does NOT:
 *
 * - resolve organization context
 * - resolve roles
 * - resolve permissions
 * - determine platform authority
 * - perform resource authorization
 * ==========================================================
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  User,
} from "@/lib/types/domain/user";


/* ==========================================================
   Get Current Server User
========================================================== */

export async function getCurrentServerUser(): Promise<
  User | null
> {

  const supabaseServer =
    await createSupabaseServerClient();


  /* ========================================================
     Supabase Auth Identity
  ======================================================== */

  const {
    data: {
      user: authUser,
    },
    error: authError,
  } = await supabaseServer.auth.getUser();

  if (authError) {

    console.error(
      "Error loading authenticated user:",
      authError
    );

    throw new Error(
      `Failed to load authenticated user: ${authError.message}`
    );
  }

  if (!authUser) {
    return null;
  }


  /* ========================================================
     Application User
  ======================================================== */

  const {
    data,
    error,
  } = await supabaseServer
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

  if (!data) {
    return null;
  }

  return data as User;
}