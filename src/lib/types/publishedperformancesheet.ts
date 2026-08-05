import type { BuilderDocument } from "@/lib/types/builderdocument";

/**
 * ==========================================================
 * Published Performance Sheet
 * ----------------------------------------------------------
 * Immutable snapshot created when a BuilderDocument is
 * published.
 * ==========================================================
 */

export interface PublishedPerformanceSheet {
  id: string;

  organizationId: string;

  version: number;

  name: string;

  description?: string;

  publishedAt: string;

  publishedBy: string;

  document: BuilderDocument;
}