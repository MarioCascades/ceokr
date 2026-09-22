"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


export async function login(
  formData: FormData
) {

  const email =
    String(
      formData.get("email") ?? ""
    ).trim();

  const password =
    String(
      formData.get("password") ?? ""
    );


  if (!email || !password) {
    redirect(
      "/login?error=missing_credentials"
    );
  }


  const supabase =
    await createSupabaseServerClient();


  const {
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });


  if (error) {

    console.error(
      "Login failed:",
      error
    );

    redirect(
      "/login?error=invalid_credentials"
    );
  }


  revalidatePath(
    "/",
    "layout"
  );


  redirect(
    "/entry"
  );
}