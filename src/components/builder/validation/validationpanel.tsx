"use client";

import { Button } from "@/components/ui/button";

import type {
  BuilderValidationResult,
} from "@/lib/builder/buildervalidation";

interface ValidationPanelProps {
  result: BuilderValidationResult;

  onClose: () => void;
}

export default function ValidationPanel({
  result,
  onClose,
}: ValidationPanelProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      {/* ================= Header ================= */}

      <div className="flex items-start justify-between gap-6">

        <div>
          <h2 className="text-xl font-semibold">
            Builder Validation
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the performance sheet before publishing.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>

      </div>

      {/* ================= Summary ================= */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-1 font-semibold">
            {result.valid
              ? "Ready to Publish"
              : "Needs Attention"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Errors
          </p>

          <p className="mt-1 text-2xl font-bold">
            {result.errors.length}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Warnings
          </p>

          <p className="mt-1 text-2xl font-bold">
            {result.warnings.length}
          </p>
        </div>

      </div>

      {/* ================= Success ================= */}

      {result.issues.length === 0 && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-700">
            ✓ Performance sheet passed validation.
          </p>

          <p className="mt-1 text-sm text-green-600">
            No validation issues were found.
          </p>
        </div>
      )}

      {/* ================= Errors ================= */}

      {result.errors.length > 0 && (
        <div className="mt-6 space-y-3">

          <div>
            <h3 className="font-semibold text-red-700">
              Errors
            </h3>

            <p className="text-sm text-muted-foreground">
              These issues must be resolved before publishing.
            </p>
          </div>

          {result.errors.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <p className="font-medium text-red-700">
                {issue.message}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wide text-red-500">
                {formatSection(issue.section)}
              </p>
            </div>
          ))}

        </div>
      )}

      {/* ================= Warnings ================= */}

      {result.warnings.length > 0 && (
        <div className="mt-6 space-y-3">

          <div>
            <h3 className="font-semibold text-amber-700">
              Warnings
            </h3>

            <p className="text-sm text-muted-foreground">
              These items should be reviewed before publishing.
            </p>
          </div>

          {result.warnings.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <p className="font-medium text-amber-700">
                {issue.message}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wide text-amber-600">
                {formatSection(issue.section)}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

/* ==========================================================
   Helpers
========================================================== */

function formatSection(
  section: BuilderValidationResult["issues"][number]["section"]
) {
  switch (section) {
    case "performanceHeader":
      return "Performance Header";

    case "keyResults":
      return "Key Results";

    case "organization":
      return "Organization";

    case "objectives":
      return "Objectives";

    case "initiatives":
      return "Initiatives";

    case "comments":
      return "Comments";

    default:
      return section;
  }
}