"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import {
  BuilderDocument,
} from "@/lib/types/builderdocument";

type BuilderContextType = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;

  activeSheet: string;
  setActiveSheet: React.Dispatch<React.SetStateAction<string>>;

  builderDocument: BuilderDocument;
  setBuilderDocument: React.Dispatch<
    React.SetStateAction<BuilderDocument>
  >;
};

const initialBuilderDocument: BuilderDocument = {
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

const BuilderContext = createContext<BuilderContextType | undefined>(
  undefined
);

export function BuilderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);

  const [activeSheet, setActiveSheet] =
    useState("dashboard");

  const [builderDocument, setBuilderDocument] =
    useState(initialBuilderDocument);

  return (
    <BuilderContext.Provider
      value={{
        editMode,
        setEditMode,

        activeSheet,
        setActiveSheet,

        builderDocument,
        setBuilderDocument,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error(
      "useBuilder must be used inside BuilderProvider."
    );
  }

  return context;
}