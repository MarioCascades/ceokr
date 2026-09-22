import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


/* ==========================================================
   Safe Redirect Path
========================================================== */

function getSafeRedirectPath(
  request: NextRequest
) {

  const next =
    request.nextUrl.searchParams.get(
      "next"
    );


  if (
    !next
  ) {

    return "/";

  }


  /*
   * Only allow root-relative paths.
   *
   * This intentionally rejects:
   *
   *   https://example.com
   *   //example.com
   *
   * because both can result in an external redirect.
   */

  if (
    !next.startsWith("/") ||
    next.startsWith("//")
  ) {

    return "/";

  }


  return next;

}


/* ==========================================================
   Auth Confirmation
========================================================== */

export async function GET(
  request: NextRequest
) {

  const code =
    request.nextUrl.searchParams.get(
      "code"
    );


  if (
    !code
  ) {

    return NextResponse.redirect(
      new URL(
        "/login?error=missing_code",
        request.url
      )
    );

  }


  const supabase =
    await createSupabaseServerClient();


  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code
    );


  if (
    error
  ) {

    console.error(
      "Auth confirmation error:",
      error
    );


    return NextResponse.redirect(
      new URL(
        "/login?error=auth_confirmation_failed",
        request.url
      )
    );

  }


  const redirectPath =
    getSafeRedirectPath(
      request
    );


  return NextResponse.redirect(
    new URL(
      redirectPath,
      request.url
    )
  );

}