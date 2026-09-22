"use server";

import {
  redirect,
} from "next/navigation";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


export async function updatePassword(
  formData: FormData
) {

  const password =
    String(
      formData.get("password") ?? ""
    ).trim();


  const confirmPassword =
    String(
      formData.get("confirmPassword") ?? ""
    ).trim();


  if (!password || !confirmPassword) {

    redirect(
      "/resetpassword?error=missing_password"
    );

  }


  if (password !== confirmPassword) {

    redirect(
      "/resetpassword?error=password_mismatch"
    );

  }


  if (password.length < 8) {

    redirect(
      "/resetpassword?error=password_too_short"
    );

  }


  const supabase =
    await createSupabaseServerClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    redirect(
      "/login?error=invalid_reset_link"
    );

  }


  const {
    error,
  } =
    await supabase.auth.updateUser({
      password,
    });


  if (error) {

    console.error(
      "Password update failed:",
      error
    );


    redirect(
      "/resetpassword?error=update_failed"
    );

  }


  await supabase.auth.signOut();


  redirect(
    "/login?message=password_reset"
  );
}