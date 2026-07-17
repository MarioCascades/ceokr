"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { BuilderDocument } from "@/lib/types/builderdocument";
import { initialBuilderDocument } from "@/lib/builder/builderdefaults";

import {
  updateOrganization as updateOrganizationAction,
  updatePerformanceHeader as updatePerformanceHeaderAction,
  addObjective as addObjectiveAction,
  updateObjective as updateObjectiveAction,
  deleteObjective as deleteObjectiveAction,
  addKeyResult as addKeyResultAction,
  updateKeyResult as updateKeyResultAction,
  deleteKeyResult as deleteKeyResultAction,
  updateComments as updateCommentsAction,
} from "@/lib/builder/builderactions";

import {
  BuilderOrganization,
  BuilderPerformanceHeader,
  BuilderObjective,
  BuilderKeyResult,
  BuilderComments,
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

  updateOrganization: (
    organization: BuilderOrganization
  ) => void;

  updatePerformanceHeader: (
    header: BuilderPerformanceHeader
  ) => void;

  addObjective: (
    objective: BuilderObjective
  ) => void;

  updateObjective: (
    objective: BuilderObjective
  ) => void;

  deleteObjective: (
    objectiveId: string
  ) => void;

  addKeyResult: (
    objectiveId: string,
    keyResult: BuilderKeyResult
  ) => void;

  updateKeyResult: (
    objectiveId: string,
    keyResult: BuilderKeyResult
  ) => void;

  deleteKeyResult: (
    objectiveId: string,
    keyResultId: string
  ) => void;

  updateComments: (
    comments: BuilderComments
  ) => void;
};

const BuilderContext = createContext<
  BuilderContextType | undefined
>(undefined);

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

  const updateOrganization = (
    organization: BuilderOrganization
  ) => {
    setBuilderDocument((current) =>
      updateOrganizationAction(
        current,
        organization
      )
    );
  };

  const updatePerformanceHeader = (
    header: BuilderPerformanceHeader
  ) => {
    setBuilderDocument((current) =>
      updatePerformanceHeaderAction(
        current,
        header
      )
    );
  };

  const addObjective = (
    objective: BuilderObjective
  ) => {
    setBuilderDocument((current) =>
      addObjectiveAction(
        current,
        objective
      )
    );
  };

  const updateObjective = (
    objective: BuilderObjective
  ) => {
    setBuilderDocument((current) =>
      updateObjectiveAction(
        current,
        objective
      )
    );
  };

  const deleteObjective = (
    objectiveId: string
  ) => {
    setBuilderDocument((current) =>
      deleteObjectiveAction(
        current,
        objectiveId
      )
    );
  };

  const addKeyResult = (
    objectiveId: string,
    keyResult: BuilderKeyResult
  ) => {
    setBuilderDocument((current) =>
      addKeyResultAction(
        current,
        objectiveId,
        keyResult
      )
    );
  };

  const updateKeyResult = (
    objectiveId: string,
    keyResult: BuilderKeyResult
  ) => {
    setBuilderDocument((current) =>
      updateKeyResultAction(
        current,
        objectiveId,
        keyResult
      )
    );
  };

  const deleteKeyResult = (
    objectiveId: string,
    keyResultId: string
  ) => {
    setBuilderDocument((current) =>
      deleteKeyResultAction(
        current,
        objectiveId,
        keyResultId
      )
    );
  };

  const updateComments = (
    comments: BuilderComments
  ) => {
    setBuilderDocument((current) =>
      updateCommentsAction(
        current,
        comments
      )
    );
  };

  return (
    <BuilderContext.Provider
      value={{
        editMode,
        setEditMode,

        activeSheet,
        setActiveSheet,

        builderDocument,
        setBuilderDocument,

        updateOrganization,
        updatePerformanceHeader,

        addObjective,
        updateObjective,
        deleteObjective,

        addKeyResult,
        updateKeyResult,
        deleteKeyResult,

        updateComments,
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