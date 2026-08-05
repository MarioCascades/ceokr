import type { BuilderDocument } from "@/lib/types/builderdocument";

export const runtimePreviewDocument: BuilderDocument = {
  id: "runtime-preview",

  organization: {
    companyName: "CascadEffects",
    tagline: "Performance Without Limits",
    logoUrl: "",
  },

  navigation: {
    tabs: [],
  },

  performanceHeader: {
    employeeName: "Jimmy",
    employeeRole: "Senior Software Architect",
    roleDescription:
      "Responsible for designing and developing the CascadEffects Performance Platform.",

    metrics: [
      {
        id: "metric-1",
        title: "Overall Score",
        value: "92%",
      },
      {
        id: "metric-2",
        title: "Objectives",
        value: "5",
      },
      {
        id: "metric-3",
        title: "Key Results",
        value: "18",
      },
      {
        id: "metric-4",
        title: "Performance",
        value: "Excellent",
      },
    ],
  },

  objectives: [
    {
      id: "objective-1",

      title: "Build Runtime Rendering Engine",

      description:
        "Create the Runtime capable of rendering published Performance Sheets.",

      weight: 40,

      keyResults: [
        {
          id: "kr-1",

          title: "Render BuilderDocument",

          target: "100%",

          current: "100%",

          score: "100%",

          weight: 50,

          initiatives: [],
        },

        {
          id: "kr-2",

          title: "Render Objectives",

          target: "100%",

          current: "80%",

          score: "80%",

          weight: 50,

          initiatives: [],
        },
      ],
    },

    {
      id: "objective-2",

      title: "Prepare Assignment Engine",

      description:
        "Design the Runtime assignment architecture.",

      weight: 60,

      keyResults: [
        {
          id: "kr-3",

          title: "Assignment Model",

          target: "Completed",

          current: "In Progress",

          score: "70%",

          weight: 100,

          initiatives: [],
        },
      ],
    },
  ],

  comments: {
    label: "Manager / Employee Comments",

    placeholder: "Enter comments...",

    helpText:
      "Comments provide additional context for this review period.",
  },
};