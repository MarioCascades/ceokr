import { BuilderDocument } from "@/lib/types/builderdocument";

export const initialBuilderDocument: BuilderDocument = {
  id: "builder-document",

  organization: {
    companyName: "Test 1",
    tagline: "Organization Tagline Placeholder",
    logoUrl: "",
  },

  navigation: {
    tabs: [],
  },

  performanceHeader: {
    employeeName: "Employee Name Placeholder",

    employeeRole: "Role Placeholder",

    roleDescription:
      "Role description placeholder. This area will contain a brief description of the employee's responsibilities and expectations within the organization.",

    metrics: [
      {
        id: "timeframe",
        title: "OKR Timeframe",
        value: "July 2026",
      },
      {
        id: "10-state",
        title: "10-State",
        value: "8 / 10",
      },
      {
        id: "updated",
        title: "Date Updated",
        value: "July 7, 2026",
      },
      {
        id: "period",
        title: "% Into Period",
        value: "20%",
      },
    ],
  },

  objectives: [
    {
      id: "objective-1",

      title: "Objective Placeholder",

      description:
        "Objective description placeholder. This area will contain a description of the objective and explain the intended outcome.",

      weight: 30,

      keyResults: [
        {
          id: "kr-1",

          title: "Key Result Placeholder",

          target: "—",

          current: "—",

          score: "—",
        },
        {
          id: "kr-2",

          title: "Key Result Placeholder",

          target: "—",

          current: "—",

          score: "—",
        },
        {
          id: "kr-3",

          title: "Key Result Placeholder",

          target: "—",

          current: "—",

          score: "—",
        },
      ],
    },
  ],

  comments: {
    label: "Manager / Employee Comments",

    placeholder: "Comments placeholder...",

    helpText:
      "Comments provide additional context, coaching notes, observations, accomplishments, challenges, and discussion points related to the current performance period.",
  },
};