"use client";

import { Button } from "@/components/ui/button";

import { BuilderProvider } from "@/components/builder/context/buildercontext";
import NavigationTabsManager from "@/components/builder/navigation/navigationtabsmanager";
import OrganizationSection from "@/components/builder/organization/organizationsection";
import PerformanceHeader from "@/components/builder/performance/performanceheader";
import Objectives from "@/components/builder/objectives/objectives";
import Comments from "@/components/builder/comments/comments";

import CEPageHeader from "@/components/ui/cepageheader";

import { useOrganization } from "@/hooks/useorganization";

export default function BuilderPage() {
  const { organization } = useOrganization();

  return (
    <BuilderProvider>
      <main className="min-h-screen bg-slate-100">

        {/* ================= PAGE HEADER ================= */}

        <CEPageHeader
          title="Performance Sheet Builder"
          description="Design your organization's performance sheet."
          rightContent={
            <>
              <Button variant="outline">
                Administration
              </Button>

              <Button variant="outline">
                Back to Main
              </Button>

              <Button variant="outline">
                Preview
              </Button>

              <Button variant="outline">
                Edit
              </Button>

              <Button>
                Save
              </Button>
            </>
          }
        />

        {/* ================= PAGE ================= */}

        <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">

          {/* ================= Organization ================= */}

          <OrganizationSection
            companyName={organization?.company_name}
          />

          {/* ================= Navigation ================= */}

          <NavigationTabsManager />

          {/* ================= Performance Sheet ================= */}

          <section className="space-y-6">

            <PerformanceHeader />

            <Objectives />

            <Comments />

          </section>

        </div>

      </main>
    </BuilderProvider>
  );
}