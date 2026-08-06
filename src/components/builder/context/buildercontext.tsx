"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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
  addInitiative as addInitiativeAction,
  updateInitiative as updateInitiativeAction,
  deleteInitiative as deleteInitiativeAction,
  updateComments as updateCommentsAction,
} from "@/lib/builder/builderactions";

import {
  loadLatestDraft,
  loadLatestPublishedForOrganization,
  saveBuilderDocument,
  publishPerformanceSheet,
  createDraftRevision,
} from "@/lib/repositories/performancesheetrepository";

import {
  validateBuilderDocument,
} from "@/lib/builder/buildervalidation";

import {
  getOrganization,
} from "@/services/organization.service";

import type {
  PerformanceSheetStatus,
} from "@/lib/repositories/performancesheetrepository";

import type {
  BuilderValidationResult,
} from "@/lib/builder/buildervalidation";

import type {
  BuilderDocument,
  BuilderOrganization,
  BuilderPerformanceHeader,
  BuilderObjective,
  BuilderKeyResult,
  BuilderInitiative,
  BuilderComments,
} from "@/lib/types/builderdocument";

/* ==========================================================
   Builder Context Type
========================================================== */

type BuilderContextType = {
  editMode: boolean;

  setEditMode: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  activeSheet: string;

  setActiveSheet: React.Dispatch<
    React.SetStateAction<string>
  >;

  builderDocument: BuilderDocument;

  setBuilderDocument: React.Dispatch<
    React.SetStateAction<BuilderDocument>
  >;

  organizationId: string | null;

  performanceSheetId: string | null;

  performanceSheetKey: string | null;

  performanceSheetStatus: PerformanceSheetStatus;

  performanceSheetVersion: number;

  isLoadingBuilder: boolean;

  isSavingBuilder: boolean;

  isPublishingBuilder: boolean;

  builderError: string | null;

  saveBuilder: () => Promise<void>;

  publishBuilder: () =>
    Promise<BuilderValidationResult>;

  createRevision: () => Promise<void>;

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

  addInitiative: (
    objectiveId: string,
    keyResultId: string,
    initiative: BuilderInitiative
  ) => void;

  updateInitiative: (
    objectiveId: string,
    keyResultId: string,
    initiative: BuilderInitiative
  ) => void;

  deleteInitiative: (
    objectiveId: string,
    keyResultId: string,
    initiativeId: string
  ) => void;

  updateComments: (
    comments: BuilderComments
  ) => void;
};

/* ==========================================================
   Context
========================================================== */

const BuilderContext = createContext<
  BuilderContextType | undefined
>(undefined);

/* ==========================================================
   Provider
========================================================== */

export function BuilderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    activeSheet,
    setActiveSheet,
  ] = useState("dashboard");

  const [
    builderDocument,
    setBuilderDocument,
  ] = useState<BuilderDocument>(
    initialBuilderDocument
  );

  const [
    organizationId,
    setOrganizationId,
  ] = useState<string | null>(null);

  const [
    performanceSheetId,
    setPerformanceSheetId,
  ] = useState<string | null>(null);

  const [
    performanceSheetKey,
    setPerformanceSheetKey,
  ] = useState<string | null>(null);

  const [
    performanceSheetStatus,
    setPerformanceSheetStatus,
  ] =
    useState<PerformanceSheetStatus>(
      "draft"
    );

  const [
    performanceSheetVersion,
    setPerformanceSheetVersion,
  ] = useState(1);

  const [
    isLoadingBuilder,
    setIsLoadingBuilder,
  ] = useState(true);

  const [
    isSavingBuilder,
    setIsSavingBuilder,
  ] = useState(false);

  const [
    isPublishingBuilder,
    setIsPublishingBuilder,
  ] = useState(false);

  const [
    builderError,
    setBuilderError,
  ] = useState<string | null>(null);

  /* ========================================================
     Load Organization + Builder Sheet
  ======================================================== */

  useEffect(() => {
    async function initializeBuilder() {
      setIsLoadingBuilder(true);
      setBuilderError(null);

      try {
        const organization =
          await getOrganization();

        if (!organization) {
          setBuilderError(
            "No organization has been configured."
          );

          return;
        }

        setOrganizationId(
          organization.id
        );

        /*
         * --------------------------------------------------
         * 1. Prefer an existing draft.
         * --------------------------------------------------
         */

        const draft =
          await loadLatestDraft(
            organization.id
          );

        if (draft) {
          setPerformanceSheetId(
            draft.id
          );

          setPerformanceSheetKey(
            draft.sheet_key
          );

          setPerformanceSheetStatus(
            draft.status
          );

          setPerformanceSheetVersion(
            draft.version
          );

          setBuilderDocument(
            draft.document
          );

          setEditMode(false);

          return;
        }

        /*
         * --------------------------------------------------
         * 2. No draft exists.
         *
         * Look for the latest published definition.
         * Published definitions load in locked/preview mode.
         * --------------------------------------------------
         */

        const published =
          await loadLatestPublishedForOrganization(
            organization.id
          );

        if (published) {
          setPerformanceSheetId(
            published.id
          );

          setPerformanceSheetKey(
            published.sheet_key
          );

          setPerformanceSheetStatus(
            published.status
          );

          setPerformanceSheetVersion(
            published.version
          );

          setBuilderDocument(
            published.document
          );

          setEditMode(false);

          return;
        }

        /*
         * --------------------------------------------------
         * 3. Nothing exists yet.
         *
         * Continue using initialBuilderDocument until the
         * administrator saves the first draft.
         * --------------------------------------------------
         */

        setPerformanceSheetId(null);

        setPerformanceSheetKey(null);

        setPerformanceSheetStatus(
          "draft"
        );

        setPerformanceSheetVersion(1);

        setEditMode(false);
      } catch (error) {
        console.error(
          "Failed to initialize Builder:",
          error
        );

        setBuilderError(
          error instanceof Error
            ? error.message
            : "Failed to initialize Builder."
        );
      } finally {
        setIsLoadingBuilder(false);
      }
    }

    initializeBuilder();
  }, []);

  /* ========================================================
     Save Builder
  ======================================================== */

  async function saveBuilder() {
    if (!organizationId) {
      const message =
        "Cannot save Builder because no organization is available.";

      setBuilderError(message);

      throw new Error(message);
    }

    /*
     * Published definitions are immutable.
     */
    if (
      performanceSheetStatus !==
      "draft"
    ) {
      const message =
        "Published performance sheets cannot be edited. Create a new revision first.";

      setBuilderError(message);

      throw new Error(message);
    }

    setIsSavingBuilder(true);
    setBuilderError(null);

    try {
      const savedSheet =
        await saveBuilderDocument(
          organizationId,
          builderDocument,
          performanceSheetId ??
            undefined
        );

      setPerformanceSheetId(
        savedSheet.id
      );

      setPerformanceSheetKey(
        savedSheet.sheet_key
      );

      setPerformanceSheetStatus(
        savedSheet.status
      );

      setPerformanceSheetVersion(
        savedSheet.version
      );

      setBuilderDocument(
        savedSheet.document
      );
    } catch (error) {
      console.error(
        "Failed to save Builder:",
        error
      );

      setBuilderError(
        error instanceof Error
          ? error.message
          : "Failed to save Builder."
      );

      throw error;
    } finally {
      setIsSavingBuilder(false);
    }
  }

  /* ========================================================
     Publish Builder
  ======================================================== */

  async function publishBuilder():
    Promise<BuilderValidationResult> {
    /*
     * Always validate the current in-memory
     * BuilderDocument before publishing.
     */
    const validation =
      validateBuilderDocument(
        builderDocument
      );

    /*
     * Drafts may be incomplete and saved,
     * but invalid drafts cannot be published.
     */
    if (!validation.valid) {
      return validation;
    }

    if (!organizationId) {
      const message =
        "Cannot publish because no organization is available.";

      setBuilderError(message);

      throw new Error(message);
    }

    if (
      performanceSheetStatus !==
      "draft"
    ) {
      const message =
        "Only draft performance sheets can be published.";

      setBuilderError(message);

      throw new Error(message);
    }

    setIsPublishingBuilder(true);
    setBuilderError(null);

    try {
      /*
       * Save first so the exact document that
       * passed validation is persisted.
       */
      const savedSheet =
        await saveBuilderDocument(
          organizationId,
          builderDocument,
          performanceSheetId ??
            undefined
        );

      /*
       * Publish the exact saved database row.
       */
      const publishedSheet =
        await publishPerformanceSheet(
          organizationId,
          savedSheet.id
        );

      setPerformanceSheetId(
        publishedSheet.id
      );

      setPerformanceSheetKey(
        publishedSheet.sheet_key
      );

      setPerformanceSheetStatus(
        publishedSheet.status
      );

      setPerformanceSheetVersion(
        publishedSheet.version
      );

      setBuilderDocument(
        publishedSheet.document
      );

      /*
       * Published definitions are locked.
       */
      setEditMode(false);

      return validation;
    } catch (error) {
      console.error(
        "Failed to publish Builder:",
        error
      );

      setBuilderError(
        error instanceof Error
          ? error.message
          : "Failed to publish Builder."
      );

      throw error;
    } finally {
      setIsPublishingBuilder(false);
    }
  }

  /* ========================================================
     Create Revision
  ======================================================== */

  async function createRevision() {
    if (
      !organizationId ||
      !performanceSheetId
    ) {
      const message =
        "Cannot create a revision because no published performance sheet is available.";

      setBuilderError(message);

      throw new Error(message);
    }

    if (
      performanceSheetStatus !==
      "published"
    ) {
      const message =
        "A new revision can only be created from a published performance sheet.";

      setBuilderError(message);

      throw new Error(message);
    }

    setIsLoadingBuilder(true);
    setBuilderError(null);

    try {
      const revision =
        await createDraftRevision(
          organizationId,
          performanceSheetId
        );

      setPerformanceSheetId(
        revision.id
      );

      setPerformanceSheetKey(
        revision.sheet_key
      );

      setPerformanceSheetStatus(
        revision.status
      );

      setPerformanceSheetVersion(
        revision.version
      );

      setBuilderDocument(
        revision.document
      );

      /*
       * New revision immediately becomes
       * the editable working draft.
       */
      setEditMode(true);
    } catch (error) {
      console.error(
        "Failed to create revision:",
        error
      );

      setBuilderError(
        error instanceof Error
          ? error.message
          : "Failed to create revision."
      );

      throw error;
    } finally {
      setIsLoadingBuilder(false);
    }
  }

  /* ========================================================
     Organization
  ======================================================== */

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

  /* ========================================================
     Performance Header
  ======================================================== */

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

  /* ========================================================
     Objectives
  ======================================================== */

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

  /* ========================================================
     Key Results
  ======================================================== */

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

  /* ========================================================
     Initiatives
  ======================================================== */

  const addInitiative = (
    objectiveId: string,
    keyResultId: string,
    initiative: BuilderInitiative
  ) => {
    setBuilderDocument((current) =>
      addInitiativeAction(
        current,
        objectiveId,
        keyResultId,
        initiative
      )
    );
  };

  const updateInitiative = (
    objectiveId: string,
    keyResultId: string,
    initiative: BuilderInitiative
  ) => {
    setBuilderDocument((current) =>
      updateInitiativeAction(
        current,
        objectiveId,
        keyResultId,
        initiative
      )
    );
  };

  const deleteInitiative = (
    objectiveId: string,
    keyResultId: string,
    initiativeId: string
  ) => {
    setBuilderDocument((current) =>
      deleteInitiativeAction(
        current,
        objectiveId,
        keyResultId,
        initiativeId
      )
    );
  };

  /* ========================================================
     Comments
  ======================================================== */

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

  /* ========================================================
     Provider
  ======================================================== */

  return (
    <BuilderContext.Provider
      value={{
        editMode,
        setEditMode,

        activeSheet,
        setActiveSheet,

        builderDocument,
        setBuilderDocument,

        organizationId,

        performanceSheetId,
        performanceSheetKey,
        performanceSheetStatus,
        performanceSheetVersion,

        isLoadingBuilder,
        isSavingBuilder,
        isPublishingBuilder,

        builderError,

        saveBuilder,
        publishBuilder,
        createRevision,

        updateOrganization,
        updatePerformanceHeader,

        addObjective,
        updateObjective,
        deleteObjective,

        addKeyResult,
        updateKeyResult,
        deleteKeyResult,

        addInitiative,
        updateInitiative,
        deleteInitiative,

        updateComments,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

/* ==========================================================
   Hook
========================================================== */

export function useBuilder() {
  const context =
    useContext(BuilderContext);

  if (!context) {
    throw new Error(
      "useBuilder must be used inside BuilderProvider."
    );
  }

  return context;
}