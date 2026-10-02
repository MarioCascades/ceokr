"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import OKRTemplateEditor from "@/components/admin/okrtemplatelibrary/okrtemplateeditor";

import {
  createOKRTemplateObjective,
  createOKRTemplateKeyResult,
  createOKRTemplateInitiative,
} from "@/lib/repositories/okrtemplaterepository";

import type {
  OKRTemplateObjective,
  OKRTemplateKeyResult,
  OKRTemplateInitiative,
  CreateOKRTemplateInput,
  UpdateOKRTemplateInput,
} from "@/lib/domain/okrtemplate";

/* ==========================================================
   New OKR Template Page
========================================================== */

export default function NewOKRTemplatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ========================================================
     Template Type
  ======================================================== */

  const requestedType = searchParams.get("type");

  const templateType =
    requestedType === "keyResult" ||
    pathname.includes("/keyresults/")
      ? "keyResult"
      : "objective";

  /* ========================================================
     Save State
  ======================================================== */

  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* ========================================================
     Save Template
  ======================================================== */

  async function handleSave({
    template,
    objectives,
    keyResults,
    initiatives,
  }: {
    template:
      | CreateOKRTemplateInput
      | UpdateOKRTemplateInput;

    objectives: OKRTemplateObjective[];

    keyResults: OKRTemplateKeyResult[];

    initiatives: OKRTemplateInitiative[];
  }) {
    try {
      setSaving(true);
      setError(null);

      /* ======================================================
         Objective Template
      ====================================================== */

      if (templateType === "objective") {
        const objective = objectives[0];

        if (!objective) {
          throw new Error(
            "An Objective Template is required."
          );
        }

        await createOKRTemplateObjective({
          okrTemplateId:
            objective.okrTemplateId,

          title:
            objective.title,

          description:
            objective.description,

          weight:
            objective.weight,

          position:
            objective.position,
        });
      }

      /* ======================================================
         Key Result Template
      ====================================================== */

      if (templateType === "keyResult") {
        const keyResult = keyResults[0];

        if (!keyResult) {
          throw new Error(
            "A Key Result Template is required."
          );
        }

        const createdKeyResult =
          await createOKRTemplateKeyResult({
            title:
              keyResult.title,

            target:
              keyResult.target,

            weight:
              keyResult.weight,

            measurementType:
              keyResult.measurementType,

            scoringMethod:
              keyResult.scoringMethod,

            status:
              keyResult.status,
          });

        /* ====================================================
           Create Initiatives

           Initiatives belong directly to the
           Key Result Template.
        ==================================================== */

        const keyResultInitiatives =
          initiatives.filter(
            (initiative) =>
              initiative.okrTemplateKeyResultId ===
              keyResult.id
          );

        for (
          const initiative of
            keyResultInitiatives
        ) {
          await createOKRTemplateInitiative({
            okrTemplateKeyResultId:
              createdKeyResult.id,

            text:
              initiative.text,

            position:
              initiative.position,
          });
        }
      }

      /* ======================================================
         Return to Template Library
      ====================================================== */

      router.push(
        "/admin/okrtemplates"
      );
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to create the template.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  /* ========================================================
     Cancel
  ======================================================== */

  function handleCancel() {
    router.back();
  }

  /* ========================================================
     Render
  ======================================================== */

  return (
    <>
      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      <OKRTemplateEditor
        isPlatformAdmin={false}
        saving={saving}
        error={error}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}