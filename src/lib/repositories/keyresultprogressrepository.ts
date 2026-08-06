import { supabase } from "@/lib/supabase/client";

import type {
  KeyResultProgress,
} from "@/lib/domain/keyresultprogress";

/* ==========================================================
   Database Record
========================================================== */

interface KeyResultProgressRecord {
  id: string;

  performance_instance_id: string;

  objective_id: string;

  key_result_id: string;

  current_value: unknown;

  score: number;

  confidence: number | null;

  employee_comment: string | null;

  manager_comment: string | null;

  status: KeyResultProgress["status"];

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToKeyResultProgress(
  record: KeyResultProgressRecord
): KeyResultProgress {
  return {
    id: record.id,

    performanceInstanceId:
      record.performance_instance_id,

    objectiveId:
      record.objective_id,

    keyResultId:
      record.key_result_id,

    currentValue:
      record.current_value as number | string,

    score:
      record.score,

    confidence:
      record.confidence ?? undefined,

    employeeComment:
      record.employee_comment ?? undefined,

    managerComment:
      record.manager_comment ?? undefined,

    status:
      record.status,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/* ==========================================================
   Create
========================================================== */

export async function createKeyResultProgress(
  progress: Omit<
    KeyResultProgress,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<KeyResultProgress> {
  const { data, error } = await supabase
    .from("key_result_progress")
    .insert({
      performance_instance_id:
        progress.performanceInstanceId,

      objective_id:
        progress.objectiveId,

      key_result_id:
        progress.keyResultId,

      current_value:
        progress.currentValue,

      score:
        progress.score,

      confidence:
        progress.confidence,

      employee_comment:
        progress.employeeComment,

      manager_comment:
        progress.managerComment,

      status:
        progress.status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create key result progress: ${error.message}`
    );
  }

  return mapRecordToKeyResultProgress(
    data as KeyResultProgressRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export async function updateKeyResultProgress(
  progress: KeyResultProgress
): Promise<KeyResultProgress> {
  const { data, error } = await supabase
    .from("key_result_progress")
    .update({
      current_value:
        progress.currentValue,

      score:
        progress.score,

      confidence:
        progress.confidence,

      employee_comment:
        progress.employeeComment,

      manager_comment:
        progress.managerComment,

      status:
        progress.status,
    })
    .eq(
      "id",
      progress.id
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update key result progress: ${error.message}`
    );
  }

  return mapRecordToKeyResultProgress(
    data as KeyResultProgressRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deleteKeyResultProgress(
  progressId: string
): Promise<void> {
  const { error } = await supabase
    .from("key_result_progress")
    .delete()
    .eq(
      "id",
      progressId
    );

  if (error) {
    throw new Error(
      `Failed to delete key result progress: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Id
========================================================== */

export async function findKeyResultProgressById(
  progressId: string
): Promise<KeyResultProgress | null> {
  const { data, error } = await supabase
    .from("key_result_progress")
    .select("*")
    .eq(
      "id",
      progressId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load key result progress: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToKeyResultProgress(
    data as KeyResultProgressRecord
  );
}

/* ==========================================================
   Find By Performance Instance
========================================================== */

export async function findKeyResultProgressByPerformanceInstance(
  performanceInstanceId: string
): Promise<KeyResultProgress[]> {
  const { data, error } = await supabase
    .from("key_result_progress")
    .select("*")
    .eq(
      "performance_instance_id",
      performanceInstanceId
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load key result progress: ${error.message}`
    );
  }

  return (
    data as KeyResultProgressRecord[]
  ).map(
    mapRecordToKeyResultProgress
  );
}