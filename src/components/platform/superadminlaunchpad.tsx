"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Image from "next/image";

import {
  Building2,
  Settings,
  UserRound,
  ArrowRight,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import CECard from "@/components/ui/cecard";


type Organization = {
  id: string;
  company_name: string;
};


interface SuperAdminLaunchpadProps {
  displayName: string;

  organizations: Organization[];

  memberOrganizationIds: string[];

  userId: string;
}


export default function SuperAdminLaunchpad({
  displayName,
  organizations,
  memberOrganizationIds,
  userId,
}: SuperAdminLaunchpadProps) {

  const router =
    useRouter();


  const [
    selectedOrganizationId,
    setSelectedOrganizationId,
  ] = useState(
    organizations[0]?.id ?? ""
  );


  const isMemberOfSelectedOrganization =
    selectedOrganizationId
      ? memberOrganizationIds.includes(
          selectedOrganizationId
        )
      : false;


  function openPerformance() {

    if (
      !selectedOrganizationId
    ) {
      return;
    }


    router.push(
      `/runtime?organizationId=${encodeURIComponent(
        selectedOrganizationId
      )}`
    );

  }


  function openMyPerformance() {

    if (
      !selectedOrganizationId ||
      !isMemberOfSelectedOrganization
    ) {
      return;
    }


    router.push(
      `/member?organizationId=${encodeURIComponent(
        selectedOrganizationId
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
            Platform Super Admin
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

        </header>


        {/* ==================================================
            Launch Choices
        ================================================== */}

        <div
          className="
            grid
            gap-5
            lg:grid-cols-2
          "
        >

          {/* ==================================================
              Administration
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

              <Settings
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
              Administration
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-muted-foreground
            "
            >
              Manage organizations, users,
              teams, assignments, Performance
              Sheets, dashboards, and platform
              configuration.
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
                onClick={() =>
                  router.push("/admin")
                }
              >

                Open Administration

                <ArrowRight />

              </Button>

            </div>

          </CECard>


          {/* ==================================================
              Organization Performance
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
              Select an organization to open
              its live performance experience.
            </p>


            {/* ==================================================
                Organization Selector
              ================================================== */}

            <div
              className="
                mt-5
                space-y-2
              "
            >

              <label
                htmlFor="organization"
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Organization
              </label>


              <select
                id="organization"
                value={
                  selectedOrganizationId
                }
                onChange={(event) =>
                  setSelectedOrganizationId(
                    event.target.value
                  )
                }
                disabled={
                  organizations.length === 0
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-input
                  bg-white
                  px-3
                  text-sm
                  font-semibold
                  text-primary
                  outline-none
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/10
                "
              >

                {organizations.length ===
                0 ? (
                  <option value="">
                    No organizations available
                  </option>
                ) : (
                  organizations.map(
                    (organization) => (
                      <option
                        key={
                          organization.id
                        }
                        value={
                          organization.id
                        }
                      >
                        {
                          organization.company_name
                        }
                      </option>
                    )
                  )
                )}

              </select>

            </div>


            <div
              className="
                mt-auto
                space-y-3
                pt-5
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
                disabled={
                  !selectedOrganizationId
                }
                onClick={
                  openPerformance
                }
              >

                Open Performance

                <ArrowRight />

              </Button>


              {/* ==================================================
                  My Performance
                  Only available when the Super Admin is also a
                  member of the selected organization.
                ================================================== */}

              {isMemberOfSelectedOrganization && (
                <Button
                  size="lg"
                  variant="outline"
                  className="
                    w-full
                  "
                  onClick={
                    openMyPerformance
                  }
                >

                  <UserRound />

                  My Performance

                  <ArrowRight />

                </Button>
              )}

            </div>

          </CECard>

        </div>


        {/* ==================================================
            Footer Context
        ================================================== */}

        <div
          className="
            mt-7
            text-center
            text-xs
            text-muted-foreground
          "
        >
          Platform access is determined by
          your CascadEffects account authority.
        </div>

      </div>

    </main>
  );
}