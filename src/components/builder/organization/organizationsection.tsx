"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import OrganizationDialog from "./organizationdialog";

import { useBuilder } from "@/components/builder/context/buildercontext";

export default function OrganizationSection() {
  const { builderDocument } = useBuilder();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <BuilderSection
        title="Organization"
        toolbar={
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            Configure
          </Button>
        }
      >
        <CECard>
          <div className="flex flex-col items-center rounded-xl bg-slate-50 px-10 py-12 text-center">

            {/* Logo */}

            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white overflow-hidden">

              {builderDocument.organization.logoUrl ? (
                <img
                  src={builderDocument.organization.logoUrl}
                  alt={builderDocument.organization.companyName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm italic text-slate-400">
                  Logo Placeholder
                </span>
              )}

            </div>

            {/* Organization */}

            <h2 className="mt-8 text-4xl font-bold text-slate-800">

              {builderDocument.organization.companyName}

            </h2>

            <p className="mt-3 text-lg font-medium text-slate-600">
              Performance Management Platform
            </p>

            <p className="mt-2 italic text-slate-500">

              {builderDocument.organization.tagline}

            </p>

          </div>
        </CECard>
      </BuilderSection>

      <OrganizationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        organization={builderDocument.organization}
      />
    </>
  );
}