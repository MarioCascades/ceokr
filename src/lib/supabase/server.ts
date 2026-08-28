/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Supabase Server Client
 * ----------------------------------------------------------
 * Authenticated server-side Supabase client for Next.js.
 *
 * This client preserves the authenticated Supabase session
 * through Next.js request cookies.
 *
 * It is intentionally separate from:
 *
 * src/lib/supabase/client.ts
 * src/lib/supabase/admin.ts
 *
 * The browser client uses the public anonymous key.
 *
 * The server client uses the public anonymous key together
 * with the authenticated user's request cookies.
 *
 * The admin client remains reserved for privileged operations
 * and uses the Supabase service-role key.
 *
 * IMPORTANT:
 *
 * This client must remain server-side infrastructure.
 * It must not be imported by client components.
 * ==========================================================
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


/* ==========================================================
   Create Authenticated Server Client
========================================================== */

export async function createSupabaseServerClient() {

  const cookieStore =
    await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {

        getAll() {
          return cookieStore.getAll();
        },

        setAll(
          cookiesToSet
        ) {

          try {

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {

                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );

          } catch {

            /*
             * Server Components may not be able to
             * write cookies.
             *
             * Session refresh is handled at the
             * request boundary.
             */

          }

        },

      },

    }
  );

}