import { supabase } from "@/lib/supabase/client";

import type {
  KPIUpdate,
} from "@/lib/domain/kpiupdate";

/* ==========================================================
   Database Record
========================================================== */

interface KPIUpdateRecord {
  id: string;

  key_result_progress_id: string;

  previous_value: unknown | null;

  current_value: unknown;

  score: number;

  confidence: number | null;

  comment: string | null;

  updated_by: string;

  created_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToKPIUpdate(
  record: KPIUpdateRecord
): KPIUpdate {
  return {
    id: record.id,

    keyResultProgressId:
      record.key_result_progress_id,

    previousValue:
      record.previous_value === null
        ? undefined
        : record.previous_value as number | string,

    currentValue:
      record.current_value as number | string,

    score:
      record.score,

    confidence:
      record.confidence ?? undefined,

    comment:
      record.comment ?? undefined,

    updatedBy:
      record.updated_by,

    createdAt:
      record.created_at,
  };
}

/* ==========================================================
   Create
========================================================== */

export async function createKPIUpdate(
  update: Omit<
    KPIUpdate,
    "id" | "createdAt"
  >
): Promise<KPIUpdate> {
  const { data, error } = await supabase
    .from("kpi_updates")
    .insert({
      key_result_progress_id:
        update.keyResultProgressId,

      previous_value:
        update.previousValue,

      current_value:
        update.currentValue,

      score:
        update.score,

      confidence:
        update.confidence,

      comment:
        update.comment,

      updated_by:
        update.updatedBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create KPI update: ${error.message}`
    );
  }

  return mapRecordToKPIUpdate(
    data as KPIUpdateRecord
  );
}

/* ==========================================================
   Find By Id
========================================================== */

export async function findKPIUpdateById(
  updateId: string
): Promise<KPIUpdate | null> {
  const { data, error } = await supabase
    .from("kpi_updates")
    .select("*")
    .eq(
      "id",
      updateId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load KPI update: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToKPIUpdate(
    data as KPIUpdateRecord
  );
}

/* ==========================================================
   Find By Key Result Progress
========================================================== */

export async function findKPIUpdatesByKeyResultProgress(
  keyResultProgressId: string
): Promise<KPIUpdate[]> {
  const { data, error } = await supabase
    .from("kpi_updates")
    .select("*")
    .eq(
      "key_result_progress_id",
      keyResultProgressId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load KPI updates: ${error.message}`
    );
  }

  return (
    data as KPIUpdateRecord[]
  ).map(
    mapRecordToKPIUpdate
  );
}