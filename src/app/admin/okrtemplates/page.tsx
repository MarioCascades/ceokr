"use client";

import OKRTemplateLibrary from "@/components/admin/okrtemplatelibrary/okrtemplatelibrary";


/* ==========================================================
   OKR Template Library
   ----------------------------------------------------------
   Dedicated Administration route for reusable OKR Templates.

   This page intentionally remains separate from:

   - Performance Builder
   - Performance Sheets
   - Assignments
   - Runtime
   - Member OKRs

   The Template Library is its own domain.
========================================================== */

export default function OKRTemplatesPage() {

  return (
    <OKRTemplateLibrary
      isPlatformAdmin={
        true
      }
    />
  );

}