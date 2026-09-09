import { supabase } from "@/lib/supabase/client";

import type {
  PerformanceInstanceInitiative,
} from "@/lib/domain/performanceinstanceinitiative";

/* ==========================================================
   Database Record
========================================================== */

interface PerformanceInstanceInitiativeRecord {
  id: string;

  performance_instance_key_result_id: string;

  source_initiative_id: string | null;

  text: string;

  position: number;

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToPerformanceInstanceInitiative(
  record: PerformanceInstanceInitiativeRecord
): PerformanceInstanceInitiative {
  return {
    id:
      record.id,

    performanceInstanceKeyResultId:
      record.performance_instance_key_result_id,

    sourceInitiativeId:
      record.source_initiative_id ??
      undefined,

    text:
      record.text,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/* ==========================================================
   Create
========================================================== */

export async function createPerformanceInstanceInitiative(
  initiative: Omit<
    PerformanceInstanceInitiative,
    "id" |
    "createdAt" |
    "updatedAt"
  >
): Promise<PerformanceInstanceInitiative> {
  const text =
    initiative.text.trim();

  if (!text) {
    throw new Error(
      "Initiative text is required."
    );
  }

  const { data, error } =
    await supabase
      .from(
        "performance_instance_initiatives"
      )
      .insert({
        performance_instance_key_result_id:
          initiative.performanceInstanceKeyResultId,

        source_initiative_id:
          initiative.sourceInitiativeId ??
          null,

        text,

        position:
          initiative.position,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create performance instance initiative: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceInitiative(
    data as PerformanceInstanceInitiativeRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export interface UpdatePerformanceInstanceInitiativeInput {
  performanceInstanceKeyResultId: string;

  initiativeId: string;

  text: string;
}

export async function updatePerformanceInstanceInitiative(
  input:
    UpdatePerformanceInstanceInitiativeInput
): Promise<PerformanceInstanceInitiative> {
  const text =
    input.text.trim();

  if (!text) {
    throw new Error(
      "Initiative text is required."
    );
  }

  const { data, error } =
    await supabase
      .from(
        "performance_instance_initiatives"
      )
      .update({
        text,
      })
      .eq(
        "id",
        input.initiativeId
      )
      .eq(
        "performance_instance_key_result_id",
        input.performanceInstanceKeyResultId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update performance instance initiative: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceInitiative(
    data as PerformanceInstanceInitiativeRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deletePerformanceInstanceInitiative(
  performanceInstanceKeyResultId: string,

  initiativeId: string
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "performance_instance_initiatives"
      )
      .delete()
      .eq(
        "id",
        initiativeId
      )
      .eq(
        "performance_instance_key_result_id",
        performanceInstanceKeyResultId
      );

  if (error) {
    throw new Error(
      `Failed to delete performance instance initiative: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Key Result
========================================================== */

export async function findPerformanceInstanceInitiativesByKeyResult(
  performanceInstanceKeyResultId: string
): Promise<PerformanceInstanceInitiative[]> {
  const { data, error } =
    await supabase
      .from(
        "performance_instance_initiatives"
      )
      .select("*")
      .eq(
        "performance_instance_key_result_id",
        performanceInstanceKeyResultId
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load performance instance initiatives: ${error.message}`
    );
  }

  return (
    (data ?? []) as
      PerformanceInstanceInitiativeRecord[]
  ).map(
    mapRecordToPerformanceInstanceInitiative
  );
}