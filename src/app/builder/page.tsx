"use client";

import { Button } from "@/components/ui/button";
import CEPageHeader from "@/components/ui/cepageheader";

import { BuilderProvider } from "@/components/builder/context/buildercontext";

import OrganizationSection from "@/components/builder/organization/organizationsection";
import NavigationTabsManager from "@/components/builder/navigation/navigationtabsmanager";

import PerformanceSheet from "@/components/builder/performance/performancesheet";
import PerformanceHeader from "@/components/builder/performance/performanceheader";

import Objectives from "@/components/builder/objectives/objectives";
import Comments from "@/components/builder/comments/comments";

export default function BuilderPage() {
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

          <OrganizationSection />

          {/* ================= Navigation ================= */}

          <NavigationTabsManager />

          {/* ================= Performance Sheet ================= */}

          <PerformanceSheet>

            <PerformanceHeader />

            <Objectives />

            <Comments />

          </PerformanceSheet>

        </div>

      </main>
    </BuilderProvider>
  );
}