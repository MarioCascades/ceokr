import type { BuilderDocument } from "@/lib/types/builderdocument";

/* ==========================================================
   Performance Sheet
========================================================== */

export type PerformanceSheetStatus =
  | "draft"
  | "published"
  | "archived";

/* ==========================================================
   Performance Sheet
========================================================== */

export interface PerformanceSheet {
  id: string;

  organizationId: string;

  sheetKey: string;

  name: string;

  version: number;

  status: PerformanceSheetStatus;

  document: BuilderDocument;
}