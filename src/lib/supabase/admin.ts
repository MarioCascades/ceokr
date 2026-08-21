/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Supabase Admin Client
 * ----------------------------------------------------------
 * Server-side Supabase client for privileged operations.
 *
 * IMPORTANT:
 * This client must NEVER be imported by client components.
 *
 * The service-role key has full database/Auth privileges and
 * must remain server-side.
 * ==========================================================
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
  );
}

export const supabaseAdmin =
  createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );