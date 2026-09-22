"use server";

import {
  redirect,
} from "next/navigation";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


export async function requestPasswordReset(
  formData: FormData
) {

  const email =
    String(
      formData.get("email") ?? ""
    ).trim();


  if (!email) {

    redirect(
      "/forgotpassword?error=missing_email"
    );

  }


  const supabase =
    await createSupabaseServerClient();


  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;


  if (!siteUrl) {

    console.error(
      "NEXT_PUBLIC_SITE_URL is not configured."
    );

    redirect(
      "/forgotpassword?error=reset_failed"
    );

  }


  const {
    error,
  } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
        `${siteUrl}/auth/confirm?next=/resetpassword`,
      }
    );


  if (error) {

    console.error(
      "Password reset request failed:",
      error
    );

    redirect(
      "/forgotpassword?error=reset_failed"
    );

  }


  redirect(
    "/forgotpassword?success=reset_sent"
  );
}