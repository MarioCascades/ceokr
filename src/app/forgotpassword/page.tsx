import Image from "next/image";

import {
  requestPasswordReset,
} from "./actions";

import {
  Button,
} from "@/components/ui/button";

import CECard from "@/components/ui/cecard";

import CEInput from "@/components/ui/ceinput";


type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};


function getErrorMessage(
  error?: string
) {

  switch (error) {

    case "missing_email":
      return "Please enter your email address.";

    case "reset_failed":
      return "We could not process your password reset request. Please try again.";

    default:
      return null;
  }
}


function getSuccessMessage(
  success?: string
) {

  switch (success) {

    case "reset_sent":
      return "If an account exists for that email address, a password reset link has been sent.";

    default:
      return null;
  }
}


export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {

  const params =
    await searchParams;


  const errorMessage =
    getErrorMessage(
      params.error
    );


  const successMessage =
    getSuccessMessage(
      params.success
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
            Forgot Password Card
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
              Reset your password
            </h1>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Enter the email address associated
              with your CascadEffects account and
              we will send you a password reset link.
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
              Success Message
          ================================================== */}

          {successMessage && (
            <div
              className="
                mb-5
                rounded-lg
                border
                border-primary/20
                bg-primary/5
                px-4
                py-3
                text-sm
                text-primary
              "
            >
              {successMessage}
            </div>
          )}


          {!successMessage && (
            <form
              action={requestPasswordReset}
              className="space-y-5"
            >

              {/* ==================================================
                  Email
              ================================================== */}

              <div className="space-y-2">

                <label
                  htmlFor="email"
                  className="
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  Email
                </label>


                <CEInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
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
                Send Password Reset Link
              </Button>

            </form>
          )}


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