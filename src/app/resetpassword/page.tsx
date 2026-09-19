import Image from "next/image";

import {
  updatePassword,
} from "./actions";

import {
  Button,
} from "@/components/ui/button";

import CECard from "@/components/ui/cecard";

import CEInput from "@/components/ui/ceinput";


type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};


function getErrorMessage(
  error?: string
) {

  switch (error) {

    case "missing_password":
      return "Please enter and confirm your new password.";

    case "password_mismatch":
      return "The passwords do not match.";

    case "password_too_short":
      return "Your password must be at least 8 characters.";

    case "update_failed":
      return "We could not update your password. Please try again.";

    case "invalid_reset_link":
      return "This password reset link is invalid or has expired.";

    default:
      return null;
  }
}


export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {

  const params =
    await searchParams;


  const errorMessage =
    getErrorMessage(
      params.error
    );


  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-background
        px-6
        py-12
      "
    >

      <div
        className="
          w-full
          max-w-md
        "
      >

        {/* ==================================================
            Brand
        ================================================== */}

        <div
          className="
            mb-8
            flex
            justify-center
          "
        >

          <Image
            src="/logos/CECleanlogo.png"
            alt="CascadEffects"
            width={180}
            height={141}
            priority
            className="
              h-auto
              w-[180px]
              object-contain
            "
          />

        </div>


        {/* ==================================================
            Reset Password Card
        ================================================== */}

        <CECard
          className="
            p-7
            shadow-[0_12px_40px_rgba(8,37,80,0.08)]
          "
        >

          <div className="mb-7">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Account Security
            </p>


            <h1
              className="
                mt-2
                text-3xl
                font-black
                tracking-tight
              "
            >
              Create a new password
            </h1>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Enter your new password below.
              You will be returned to the sign-in
              page after your password is updated.
            </p>

          </div>


          {/* ==================================================
              Error Message
          ================================================== */}

          {errorMessage && (
            <div
              className="
                mb-5
                rounded-lg
                border
                border-destructive/30
                bg-destructive/10
                px-4
                py-3
                text-sm
                text-destructive
              "
            >
              {errorMessage}
            </div>
          )}


          {/* ==================================================
              Reset Form
          ================================================== */}

          <form
            action={updatePassword}
            className="space-y-5"
          >

            {/* ==================================================
                New Password
            ================================================== */}

            <div className="space-y-2">

              <label
                htmlFor="password"
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                New Password
              </label>


              <CEInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                required
                minLength={8}
              />

            </div>


            {/* ==================================================
                Confirm Password
            ================================================== */}

            <div className="space-y-2">

              <label
                htmlFor="confirmPassword"
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Confirm New Password
              </label>


              <CEInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                required
                minLength={8}
              />

            </div>


            {/* ==================================================
                Submit
            ================================================== */}

            <Button
              type="submit"
              size="lg"
              className="
                w-full
                bg-[#0B2A5B]
                text-white
                hover:bg-[#0B2A5B]/90
              "
            >
              Update Password
            </Button>

          </form>


          {/* ==================================================
              Return to Login
          ================================================== */}

          <div
            className="
              mt-6
              border-t
              border-border
              pt-5
              text-center
            "
          >

            <a
              href="/login"
              className="
                text-sm
                font-semibold
                text-primary
                underline-offset-4
                hover:underline
              "
            >
              Return to Sign In
            </a>

          </div>

        </CECard>


        {/* ==================================================
            Footer
        ================================================== */}

        <p
          className="
            mt-6
            text-center
            text-xs
            text-muted-foreground
          "
        >
          CascadEffects Performance Platform
        </p>

      </div>

    </main>
  );
}