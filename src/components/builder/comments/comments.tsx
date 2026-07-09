"use client";

import { Button } from "@/components/ui/button";

export default function comments() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold">
          Comments
        </h2>

        <Button variant="outline">
          ⚙ Configure
        </Button>

      </div>

      {/* Content */}

      <div className="mt-6 rounded-lg border bg-slate-50 p-6">

        <label className="mb-3 block text-sm font-medium text-slate-700">
          Manager / Employee Comments
        </label>

        <textarea
          rows={6}
          disabled
          placeholder="Comments placeholder..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-slate-500 outline-none"
        />

        <p className="mt-3 text-sm text-slate-500">
          Comments provide additional context, coaching notes, observations,
          accomplishments, challenges, and discussion points related to the
          current performance period.
        </p>

      </div>

    </section>
  );
}