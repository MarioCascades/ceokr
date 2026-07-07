"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import NavigationTabsManager from "@/components/builder/navigationtabsmanager";
import { BuilderProvider } from "@/components/builder/context/buildercontext";
import PerformanceHeader from "@/components/builder/performanceheader";
import Objectives from "@/components/builder/objectives";
import Comments from "@/components/builder/comments";

import CECard from "@/components/ui/cecard";
import CEPageHeader from "@/components/ui/cepageheader";

export default function BuilderPage() {
  const [organization, setOrganization] = useState<{
    company_name: string;
  } | null>(null);

  const loadOrganization = async () => {
    const { data, error } = await supabase
      .from("organization")
      .select("company_name")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setOrganization(data);
  };

  useEffect(() => {
    loadOrganization();
  }, []);

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

          <CECard>

            <div className="flex justify-end">

              <Button variant="outline">
                Configure
              </Button>

            </div>

            <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 px-10 py-12 text-center">

              {/* Logo */}

              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white">

                <span className="text-sm italic text-slate-400">
                  Logo Placeholder
                </span>

              </div>

              {/* Organization */}

              <h2 className="mt-8 text-4xl font-bold italic text-slate-400">

                {organization?.company_name ??
                  "Organization Name Placeholder"}

              </h2>

              <p className="mt-3 text-lg font-medium text-slate-600">
                Performance Management Platform
              </p>

              <p className="mt-2 italic text-slate-400">
                Organization Tagline Placeholder
              </p>

            </div>

          </CECard>

          {/* ================= Navigation ================= */}

          <NavigationTabsManager />

          {/* ================= Performance Sheet ================= */}

          <div className="space-y-6">

            <PerformanceHeader />

            <Objectives />

            <Comments />

          </div>

        </div>

      </main>
    </BuilderProvider>
  );
}