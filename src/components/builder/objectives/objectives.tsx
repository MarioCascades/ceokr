"use client";

import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

import BuilderSection from "@/components/builder/shared/buildersection";
import { useBuilder } from "@/components/builder/context/buildercontext";

import ObjectiveCard from "./objectivecard";

export default function Objectives() {
  const { builderDocument } = useBuilder();

  return (
    <BuilderSection
      title="Objectives"
      toolbar={
        <div className="flex gap-2">
          <Button variant="outline">
            Configure
          </Button>

          <Button>
            + Add Objective
          </Button>
        </div>
      }
    >
      <CECard>

        <div className="space-y-8">

          {builderDocument.objectives.map((objective) => (

            <ObjectiveCard
              key={objective.id}
              objective={objective}
            />

          ))}

        </div>

      </CECard>
    </BuilderSection>
  );
}