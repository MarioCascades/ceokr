"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import CECard from "@/components/ui/cecard";


type RoleEntryLaunchpadProps = {
  displayName: string;

  organizationId: string;

  organizationName: string;
};


export default function RoleEntryLaunchpad({
  displayName,
  organizationId,
  organizationName,
}: RoleEntryLaunchpadProps) {

  const router =
    useRouter();


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
            Organization Admin
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
            What would you like to do?
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
              Organization Workspace
              PRIMARY ACTION
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
              Organization Workspace
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Manage and work with your
              organization through the
              Organization Workspace.
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
                  openOrganizationWorkspace
                }
              >

                Open Organization Workspace

                <ArrowRight />

              </Button>

            </div>

          </CECard>


          {/* ==================================================
              Organization Performance
              SECONDARY ACTION
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