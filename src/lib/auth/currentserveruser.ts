/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Current Server User
 * ----------------------------------------------------------
 * Resolves the authenticated Supabase Auth identity to an
 * active CascadEffects application User.
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

import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  User,
} from "@/lib/types/domain/user";


/* ==========================================================
   Request-Scoped Supabase Authentication
========================================================== */

/**
 * Resolves the authenticated Supabase identity and its
 * cookie-aware server client once per React server request.
 *
 * Sharing this result allows independent authorization paths
 * to reuse the same verified Auth lookup without changing
 * their application-user filtering rules.
 *
 * React cache is request-scoped. It does not persist identity
 * data between requests or users.
 */
async function resolveCurrentServerAuth() {

  const supabaseServer =
    await createSupabaseServerClient();

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

  return {
    supabaseServer,
    authUser,
  };
}


/**
 * Shared request-scoped authentication result.
 *
 * The Supabase client and authenticated identity are reused
 * only within the current React server request.
 */
export const getCurrentServerAuth = cache(
  resolveCurrentServerAuth
);


/* ==========================================================
   Get Current Server User
========================================================== */

async function resolveCurrentServerUser(): Promise<
  User | null
> {

  const {
    supabaseServer,
    authUser,
  } = await getCurrentServerAuth();

  if (!authUser) {
    return null;
  }


  /* ========================================================
     Active Application User
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
    .eq(
      "is_active",
      true
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


/**
 * Reuses the active application-user lookup during the same
 * React server request. The is_active=true condition and the
 * complete User selection remain unchanged.
 */
export const getCurrentServerUser = cache(
  resolveCurrentServerUser
);
