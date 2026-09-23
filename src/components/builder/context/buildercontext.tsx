"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useSearchParams } from "next/navigation";

import { initialBuilderDocument } from "@/lib/builder/builderdefaults";

import {
  updateOrganization as updateOrganizationAction,
  updatePerformanceHeader as updatePerformanceHeaderAction,
  addObjective as addObjectiveAction,
  updateObjective as updateObjectiveAction,
  deleteObjective as deleteObjectiveAction,
  addKeyResult as addKeyResultAction,
  updateKeyResult as updateKeyResultAction,
  moveKeyResult as moveKeyResultAction,
  deleteKeyResult as deleteKeyResultAction,
  addInitiative as addInitiativeAction,
  updateInitiative as updateInitiativeAction,
  deleteInitiative as deleteInitiativeAction,
  updateComments as updateCommentsAction,
} from "@/lib/builder/builderactions";

import {
  loadBuilderDocument,
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

import {
  getDepartments,
} from "@/services/department.service";

import {
  getTeams,
} from "@/services/team.service";

import {
  listUserManagementRecords,
} from "@/services/user.service";

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

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

/* ==========================================================
   Builder Organization Context
========================================================== */

/*
 * This is read-only organization data supplied to the Builder.
 *
 * It intentionally lives outside BuilderDocument.
 *
 * BuilderDocument represents the Performance Sheet definition.
 *
 * organizationContext represents the real organization that
 * the administrator is currently building for.
 */

export type BuilderOrganizationContext = {
  organization: Organization;

  departments: Department[];

  teams: Team[];

  members: UserManagementRecord[];
};

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

  /*
   * Real organization data available to the Builder.
   *
   * This is intentionally separate from builderDocument.
   */
  organizationContext:
    | BuilderOrganizationContext
    | null;

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

  moveKeyResult: (
    keyResultId: string,
    sourceObjectiveId: string,
    targetObjectiveId: string
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
  const searchParams =
    useSearchParams();

  const selectedSheetId =
    searchParams.get("sheetId");

  const selectedOrganizationId =
    searchParams.get("organizationId");

  const createNewSheet =
    searchParams.get("new") === "true";

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

  /*
   * Real organization context.
   *
   * This is intentionally separate from BuilderDocument.
   */
  const [
    organizationContext,
    setOrganizationContext,
  ] = useState<
    BuilderOrganizationContext | null
  >(null);

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
     Load Organization + Organization Context + Builder Sheet
  ======================================================== */

  useEffect(() => {
    let cancelled = false;

    async function initializeBuilder() {
      setIsLoadingBuilder(true);
      setBuilderError(null);

      /*
       * Clear stale organization context while switching
       * between organizations.
       */
      setOrganizationContext(null);
      setOrganizationId(null);

      try {
        /*
         * --------------------------------------------------
         * 1. Resolve the active organization.
         * --------------------------------------------------
         */

        const organization =
          await getOrganization(
            selectedOrganizationId ??
              undefined
          );

        if (cancelled) {
          return;
        }

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
         * 2. Load the real organization context.
         *
         * These are read-only inputs to the Builder.
         *
         * Organization membership is the authoritative
         * relationship between users and the organization.
         *
         * Department and Team associations come from the
         * organization membership records rather than being
         * duplicated inside BuilderDocument.
         * --------------------------------------------------
         */

        const [
          departments,
          teams,
          members,
        ] = await Promise.all([
          getDepartments(
            organization.id
          ),

          getTeams(
            organization.id
          ),

          listUserManagementRecords(
            organization.id
          ),
        ]);

        if (cancelled) {
          return;
        }

        setOrganizationContext({
          organization,
          departments,
          teams,
          members,
        });

        /*
         * --------------------------------------------------
         * 3. Explicit New Performance Sheet Mode
         *
         * Administration uses:
         *
         * /builder?organizationId=123&new=true
         *
         * This intentionally bypasses existing drafts and
         * published sheets.
         *
         * The Builder starts with the default document.
         *
         * No database record is created until Save Builder
         * is used.
         * --------------------------------------------------
         */

        if (createNewSheet) {
          setPerformanceSheetId(
            null
          );

          setPerformanceSheetKey(
            null
          );

          setPerformanceSheetStatus(
            "draft"
          );

          setPerformanceSheetVersion(
            1
          );

          setBuilderDocument(
            initialBuilderDocument
          );

          /*
           * A new Performance Sheet is immediately editable.
           */
          setEditMode(true);

          return;
        }

        /*
         * --------------------------------------------------
         * 4. If a sheetId was supplied in the URL,
         *    load that exact Performance Sheet.
         * --------------------------------------------------
         */

        if (selectedSheetId) {
          const selectedSheet =
            await loadBuilderDocument(
              organization.id,
              selectedSheetId
            );

          if (cancelled) {
            return;
          }

          setPerformanceSheetId(
            selectedSheet.id
          );

          setPerformanceSheetKey(
            selectedSheet.sheet_key
          );

          setPerformanceSheetStatus(
            selectedSheet.status
          );

          setPerformanceSheetVersion(
            selectedSheet.version
          );

          setBuilderDocument(
            selectedSheet.document
          );

          /*
           * Drafts and published sheets both open in
           * preview mode. The administrator explicitly
           * chooses Edit.
           */
          setEditMode(false);

          return;
        }

        /*
         * --------------------------------------------------
         * 5. No selected sheet.
         *
         * Preserve existing behavior:
         *
         * latest draft
         *       ↓
         * latest published
         *       ↓
         * empty Builder
         * --------------------------------------------------
         */

        const draft =
          await loadLatestDraft(
            organization.id
          );

        if (cancelled) {
          return;
        }

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
         * 6. No draft exists.
         *
         * Look for the latest published definition.
         * --------------------------------------------------
         */

        const published =
          await loadLatestPublishedForOrganization(
            organization.id
          );

        if (cancelled) {
          return;
        }

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
         * 7. Nothing exists yet.
         *
         * Continue using the empty initial Builder document
         * until the administrator saves the first draft.
         * --------------------------------------------------
         */

        setPerformanceSheetId(
          null
        );

        setPerformanceSheetKey(
          null
        );

        setPerformanceSheetStatus(
          "draft"
        );

        setPerformanceSheetVersion(
          1
        );

        setBuilderDocument(
          initialBuilderDocument
        );

        setEditMode(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

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
        if (!cancelled) {
          setIsLoadingBuilder(false);
        }
      }
    }

    initializeBuilder();

    return () => {
      cancelled = true;
    };
  }, [
    selectedOrganizationId,
    selectedSheetId,
    createNewSheet,
  ]);

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

  const moveKeyResult = (
    keyResultId: string,
    sourceObjectiveId: string,
    targetObjectiveId: string
  ) => {
    setBuilderDocument((current) =>
      moveKeyResultAction(
        current,
        keyResultId,
        sourceObjectiveId,
        targetObjectiveId
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

        organizationContext,

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
        moveKeyResult,
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