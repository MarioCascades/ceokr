import { supabase } from "@/lib/supabase/client";

import type {
  BuilderDocument,
} from "@/lib/types/builderdocument";

/* ==========================================================
   Types
========================================================== */

export type PerformanceSheetStatus =
  | "draft"
  | "published"
  | "archived";

export interface PerformanceSheetRecord {
  id: string;

  organization_id: string;

  sheet_key: string;

  name: string;

  status: PerformanceSheetStatus;

  /*
   * Kept temporarily for database compatibility.
   *
   * The application no longer treats this as Builder
   * versioning. Each organization has one current
   * Performance Workspace.
   */
  version: number;

  document: BuilderDocument;

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Find Current Performance Workspace
   ----------------------------------------------------------
   One organization has one current Performance Workspace.
   
   If legacy rows exist, the most recently updated row is
   treated as the current workspace until the database is
   formally migrated.
========================================================== */

export async function findCurrentPerformanceSheet(
  organizationId: string
): Promise<PerformanceSheetRecord | null> {
  const { data, error } = await supabase
    .from("performance_sheets")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Performance Workspace: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as PerformanceSheetRecord;
}

/* ==========================================================
   Save Builder Document
   ----------------------------------------------------------
   The Builder edits the organization's one Performance
   Workspace.

   If a workspace already exists, update it regardless of
   its current status.

   If no workspace exists, create the first and only one.
========================================================== */

export async function saveBuilderDocument(
  organizationId: string,
  document: BuilderDocument,
  sheetId?: string
): Promise<PerformanceSheetRecord> {
  /*
   * If the Builder already knows the workspace ID,
   * update that exact workspace.
   */
  if (sheetId) {
    const { data, error } = await supabase
      .from("performance_sheets")
      .update({
        document,
      })
      .eq(
        "id",
        sheetId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to save Performance Workspace: ${error.message}`
      );
    }

    return data as PerformanceSheetRecord;
  }

  /*
   * No explicit workspace ID was supplied.
   *
   * First look for the organization's existing
   * Performance Workspace so we do not accidentally
   * create another one.
   */
  const existing =
    await findCurrentPerformanceSheet(
      organizationId
    );

  if (existing) {
    const { data, error } = await supabase
      .from("performance_sheets")
      .update({
        document,
      })
      .eq(
        "id",
        existing.id
      )
      .eq(
        "organization_id",
        organizationId
      )
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to save Performance Workspace: ${error.message}`
      );
    }

    return data as PerformanceSheetRecord;
  }

  /*
   * First Performance Workspace for the organization.
   *
   * version remains 1 only for database compatibility.
   * It is not used by the application as Builder
   * versioning.
   */
  const { data, error } = await supabase
    .from("performance_sheets")
    .insert({
      organization_id:
        organizationId,

      name:
        "Performance Workspace",

      status:
        "draft",

      version:
        1,

      document,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create Performance Workspace: ${error.message}`
    );
  }

  return data as PerformanceSheetRecord;
}

/* ==========================================================
   Load Builder Document
   ----------------------------------------------------------
   Optional sheetId is retained temporarily for compatibility
   with existing callers.

   Without sheetId, load the organization's current workspace.
========================================================== */

export async function loadBuilderDocument(
  organizationId: string,
  sheetId?: string
): Promise<PerformanceSheetRecord | null> {
  if (sheetId) {
    const { data, error } = await supabase
      .from("performance_sheets")
      .select("*")
      .eq(
        "id",
        sheetId
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load Performance Workspace: ${error.message}`
      );
    }

    if (!data) {
      return null;
    }

    return data as PerformanceSheetRecord;
  }

  return findCurrentPerformanceSheet(
    organizationId
  );
}

/* ==========================================================
   Load Latest Draft
   ----------------------------------------------------------
   Compatibility wrapper.
   
   The application now has one current workspace rather
   than multiple drafts.
========================================================== */

export async function loadLatestDraft(
  organizationId: string
): Promise<PerformanceSheetRecord | null> {
  return findCurrentPerformanceSheet(
    organizationId
  );
}

/* ==========================================================
   Publish Performance Sheet
   ----------------------------------------------------------
   Compatibility function retained for existing callers.

   Publishing no longer creates a separate immutable
   Builder definition. The same workspace remains the
   organization's current Performance Workspace.
========================================================== */

export async function publishPerformanceSheet(
  organizationId: string,
  sheetId: string
): Promise<PerformanceSheetRecord> {
  const { data, error } = await supabase
    .from("performance_sheets")
    .update({
      status:
        "published",
    })
    .eq(
      "id",
      sheetId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to publish Performance Workspace: ${error.message}`
    );
  }

  return data as PerformanceSheetRecord;
}

/* ==========================================================
   Create Draft Revision
   ----------------------------------------------------------
   Compatibility wrapper.
   
   Revisions are no longer created.
   
   The current workspace is simply returned so existing
   callers do not immediately break while BuilderContext
   is being cleaned up.
========================================================== */

export async function createDraftRevision(
  organizationId: string,
  publishedSheetId: string
): Promise<PerformanceSheetRecord> {
  const current =
    await loadBuilderDocument(
      organizationId,
      publishedSheetId
    );

  if (!current) {
    throw new Error(
      "Performance Workspace was not found."
    );
  }

  return current;
}

/* ==========================================================
   Load Latest Published
   ----------------------------------------------------------
   Compatibility wrapper.
   
   sheetKey is retained because existing callers may still
   provide it. The organization remains the source of truth.
========================================================== */

export async function loadLatestPublished(
  organizationId: string,
  _sheetKey: string
): Promise<PerformanceSheetRecord | null> {
  return findCurrentPerformanceSheet(
    organizationId
  );
}

/* ==========================================================
   Load Current Workspace For Organization
========================================================== */

export async function loadLatestPublishedForOrganization(
  organizationId: string
): Promise<PerformanceSheetRecord | null> {
  return findCurrentPerformanceSheet(
    organizationId
  );
}

/* ==========================================================
   List Performance Sheet Definitions
   ----------------------------------------------------------
   Compatibility wrapper.
   
   There is one Performance Workspace per organization,
   so this returns zero or one record.
========================================================== */

export async function listPerformanceSheetDefinitions(
  organizationId: string
): Promise<PerformanceSheetRecord[]> {
  const current =
    await findCurrentPerformanceSheet(
      organizationId
    );

  if (!current) {
    return [];
  }

  return [current];
}

/* ==========================================================
   Find Performance Sheet Versions
   ----------------------------------------------------------
   Compatibility wrapper.
   
   Builder versioning is no longer used. Returning the
   current workspace keeps existing callers functional
   while the remaining version references are removed.
========================================================== */

export async function findPerformanceSheetVersions(
  organizationId: string,
  _sheetKey: string
): Promise<PerformanceSheetRecord[]> {
  const current =
    await findCurrentPerformanceSheet(
      organizationId
    );

  if (!current) {
    return [];
  }

  return [current];
}

/* ==========================================================
   Find Published Performance Sheets By Organization
   ----------------------------------------------------------
   Compatibility wrapper.
   
   One organization = one Performance Workspace.
========================================================== */

export async function findPublishedPerformanceSheetsByOrganization(
  organizationId: string
): Promise<PerformanceSheetRecord[]> {
  const current =
    await findCurrentPerformanceSheet(
      organizationId
    );

  if (
    !current ||
    current.status !== "published"
  ) {
    return [];
  }

  return [current];
}

/* ==========================================================
   Load Published Performance Sheet By Id
   ----------------------------------------------------------
   IMPORTANT:
   This remains an exact-ID lookup because Runtime may
   still depend on an exact persisted Performance Sheet
   record for historical execution.
   
   This is intentionally NOT removed yet.
========================================================== */

export async function loadPublishedById(
  organizationId: string,
  performanceSheetId: string
): Promise<PerformanceSheetRecord | null> {
  const { data, error } = await supabase
    .from("performance_sheets")
    .select("*")
    .eq(
      "id",
      performanceSheetId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load published Performance Workspace: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return data as PerformanceSheetRecord;
}