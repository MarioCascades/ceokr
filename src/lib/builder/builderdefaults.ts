import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

/* ==========================================================
   Initial Builder Document
   ----------------------------------------------------------
   This represents a new, unconfigured performance sheet.

   IMPORTANT:
   Placeholder/example Objectives and Key Results should NOT
   exist here because Builder validation treats objects in
   these arrays as real configuration data.

   Visual empty states belong in the UI components instead.
========================================================== */

export const initialBuilderDocument: BuilderDocument = {
  id: "builder-document",

  /* ========================================================
     Organization
  ======================================================== */

  organization: {
    companyName: "",
    tagline: "",
    logoUrl: "",
  },

  /* ========================================================
     Navigation
  ======================================================== */

  navigation: {
    tabs: [],
  },

  /* ========================================================
     Performance Header
  ======================================================== */

  performanceHeader: {
    employeeName: "",

    employeeRole: "",

    roleDescription: "",

    metrics: [],
  },

  /* ========================================================
     Objectives
  ======================================================== */

  objectives: [],

  /* ========================================================
     Comments
  ======================================================== */

  comments: {
    label: "Manager / Employee Comments",

    placeholder:
      "Enter comments...",

    helpText:
      "Comments provide additional context, coaching notes, observations, accomplishments, challenges, and discussion points related to the current performance period.",
  },
};