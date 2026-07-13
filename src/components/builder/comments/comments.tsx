"use client";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import { useBuilder } from "@/components/builder/context/buildercontext";

export default function Comments() {
  const { builderDocument } = useBuilder();

  return (
    <BuilderSection
      title="Comments"
      toolbar={
        <Button variant="outline">
          Configure
        </Button>
      }
    >
      <CECard>

        <div className="rounded-lg border bg-slate-50 p-6">

          <label className="mb-3 block text-sm font-medium text-slate-700">
            {builderDocument.comments.label}
          </label>

          <textarea
            rows={6}
            disabled
            placeholder={builderDocument.comments.placeholder}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-slate-500 outline-none"
          />

          <p className="mt-3 text-sm text-slate-500">
            {builderDocument.comments.helpText}
          </p>

        </div>

      </CECard>
    </BuilderSection>
  );
}