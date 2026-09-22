import Image from "next/image";

import {
  login,
} from "./actions";

import {
  Button,
} from "@/components/ui/button";

import CECard from "@/components/ui/cecard";

import CEInput from "@/components/ui/ceinput";


type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};


function getErrorMessage(
  error?: string
) {

  switch (error) {

    case "missing_credentials":
      return "Please enter your email and password.";

    case "invalid_credentials":
      return "The email or password is incorrect.";

    default:
      return null;
  }
}


function getMessage(
  message?: string
) {

  switch (message) {

    case "password_reset":
      return "Your password has been updated. You can now sign in.";

    case "logged_out":
      return "You have been signed out.";

    default:
      return null;
  }
}


export default async function LoginPage({
  searchParams,
}: LoginPageProps) {

  const params =
    await searchParams;


  const errorMessage =
    getErrorMessage(
      params.error
    );


  const successMessage =
    getMessage(
      params.message
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
            Login Card
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
              Performance Platform
            </p>


            <h1
              className="
                mt-2
                text-3xl
                font-black
                tracking-tight
              "
            >
              Welcome back
            </h1>


            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              Sign in to continue to
              CascadEffects.
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


          {/* ==================================================
              Login Form
          ================================================== */}

          <form
            action={login}
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
                Password
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
                Password
              </label>


              <CEInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />

            </div>


            {/* ==================================================
                Forgot Password
            ================================================== */}

            <div
              className="
                flex
                justify-end
              "
            >

              <a
                href="/forgotpassword"
                className="
                  text-sm
                  font-semibold
                  text-primary
                  underline-offset-4
                  hover:underline
                "
              >
                Forgot your password?
              </a>

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
              Sign In
            </Button>

          </form>


          {/* ==================================================
              Password Help
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

            <p
              className="
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              Having trouble signing in?
              Use the password reset option
              above to regain access to your account.
            </p>

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