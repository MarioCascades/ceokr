"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Building2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import CECard from "@/components/ui/cecard";


type RoleEntryLaunchpadProps = {
  actor:
    | "organization_admin"
    | "member";

  displayName: string;

  organizationId: string;

  organizationName: string;

  userId: string;
};


export default function RoleEntryLaunchpad({
  actor,
  displayName,
  organizationId,
  organizationName,
  userId,
}: RoleEntryLaunchpadProps) {

  const router =
    useRouter();


  const isOrganizationAdmin =
    actor === "organization_admin";


  function openOrganizationWorkspace() {

    router.push(
      `/organization?organizationId=${encodeURIComponent(
        organizationId
      )}`
    );

  }


  function openOrganizationPerformance() {

    router.push(
      `/runtime?organizationId=${encodeURIComponent(
        organizationId
      )}`
    );

  }


  function openMyPerformance() {

    router.push(
      `/member?organizationId=${encodeURIComponent(
        organizationId
      )}&subjectId=${encodeURIComponent(
        userId
      )}`
    );

  }


  return (
    <main
      className="
        min-h-screen
        bg-background
        px-6
        py-10
        lg:px-8
        lg:py-14
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
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
            width={170}
            height={133}
            priority
            className="
              h-auto
              w-[170px]
              object-contain
            "
          />

        </div>


        {/* ==================================================
            Welcome
        ================================================== */}

        <header
          className="
            mb-8
            text-center
          "
        >

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-primary
            "
          >
            {isOrganizationAdmin
              ? "Organization Admin"
              : "Member"}
          </p>


          <h1
            className="
              mt-2
              text-4xl
              font-black
              tracking-tight
              sm:text-5xl
            "
          >
            Welcome back, {displayName}
          </h1>


          <p
            className="
              mx-auto
              mt-3
              max-w-2xl
              text-base
              text-muted-foreground
            "
          >
            {isOrganizationAdmin
              ? "What would you like to do?"
              : "Choose where you would like to go."}
          </p>


          <p
            className="
              mt-2
              text-sm
              font-semibold
              text-primary
            "
          >
            {organizationName}
          </p>

        </header>


        {/* ==================================================
            Entry Choices
        ================================================== */}

        <div
          className="
            grid
            gap-5
            lg:grid-cols-2
          "
        >

          {/* ==================================================
              Organization Workspace / My Performance
              PRIMARY ACTION — DEEP NAVY
          ================================================== */}

          <CECard
            className="
              flex
              min-h-[270px]
              flex-col
              p-7
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-accent
                text-primary
              "
            >

              {isOrganizationAdmin ? (
                <Building2
                  className="h-6 w-6"
                />
              ) : (
                <UserRound
                  className="h-6 w-6"
                />
              )}

            </div>


            <h2
              className="
                mt-6
                text-2xl
                font-black
              "
            >
              {isOrganizationAdmin
                ? "Organization Workspace"
                : "My Performance"}
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              {isOrganizationAdmin
                ? "Manage and work with your organization through the Organization Workspace."
                : "Open your personal performance experience."}
            </p>


            <div
              className="
                mt-auto
                pt-7
              "
            >

              <Button
                size="lg"
                className="
                  w-full
                  bg-[#0B2A5B]
                  text-white
                  hover:bg-[#0B2A5B]/90
                "
                onClick={
                  isOrganizationAdmin
                    ? openOrganizationWorkspace
                    : openMyPerformance
                }
              >

                {isOrganizationAdmin
                  ? "Open Organization Workspace"
                  : "Open My Performance"}

                <ArrowRight />

              </Button>

            </div>

          </CECard>


          {/* ==================================================
              Organization Performance
              SECONDARY ACTION — CASCADE CORAL
          ================================================== */}

          <CECard
            className="
              flex
              min-h-[270px]
              flex-col
              p-7
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-accent
                text-primary
              "
            >

              <Building2
                className="h-6 w-6"
              />

            </div>


            <h2
              className="
                mt-6
                text-2xl
                font-black
              "
            >
              Organization Performance
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Open the performance experience
              for {organizationName}.
            </p>


            <div
              className="
                mt-auto
                pt-7
              "
            >

              <Button
                size="lg"
                className="
                  w-full
                  bg-[#E26D5C]
                  text-white
                  hover:bg-[#E26D5C]/90
                "
                onClick={
                  openOrganizationPerformance
                }
              >

                Open Organization Performance

                <ArrowRight />

              </Button>

            </div>

          </CECard>

        </div>


        {/* ==================================================
            Footer
        ================================================== */}

        <div
          className="
            mt-7
            text-center
            text-xs
            text-muted-foreground
          "
        >
          Your organization access is determined
          by your CascadEffects account.
        </div>

      </div>

    </main>
  );
}