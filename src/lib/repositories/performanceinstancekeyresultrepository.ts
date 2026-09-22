import { supabase } from "@/lib/supabase/client";

import type {
  PerformanceInstanceKeyResult,
} from "@/lib/domain/performanceinstancekeyresult";

/* ==========================================================
   Database Record
========================================================== */

interface PerformanceInstanceKeyResultRecord {
  id: string;

  performance_instance_id: string;

  performance_instance_objective_id: string;

  source_key_result_id: string | null;

  title: string;

  target: unknown;

  weight: number | null;

  measurement_type: string | null;

  scoring_method: string | null;

  position: number;

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToPerformanceInstanceKeyResult(
  record: PerformanceInstanceKeyResultRecord
): PerformanceInstanceKeyResult {
  return {
    id:
      record.id,

    performanceInstanceId:
      record.performance_instance_id,

    performanceInstanceObjectiveId:
      record.performance_instance_objective_id,

    sourceKeyResultId:
      record.source_key_result_id ??
      undefined,

    title:
      record.title,

    target:
      record.target,

    weight:
      record.weight ??
      undefined,

    measurementType:
      record.measurement_type as
        | PerformanceInstanceKeyResult[
            "measurementType"
          ]
        | undefined,

    scoringMethod:
      record.scoring_method as
        | PerformanceInstanceKeyResult[
            "scoringMethod"
          ]
        | undefined,

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

export async function createPerformanceInstanceKeyResult(
  keyResult: Omit<
    PerformanceInstanceKeyResult,
    "id" |
    "createdAt" |
    "updatedAt"
  >
): Promise<PerformanceInstanceKeyResult> {
  const { data, error } =
    await supabase
      .from(
        "performance_instance_key_results"
      )
      .insert({
        performance_instance_id:
          keyResult.performanceInstanceId,

        performance_instance_objective_id:
          keyResult.performanceInstanceObjectiveId,

        source_key_result_id:
          keyResult.sourceKeyResultId ??
          null,

        title:
          keyResult.title,

        target:
          keyResult.target,

        weight:
          keyResult.weight ??
          null,

        measurement_type:
          keyResult.measurementType ??
          null,

        scoring_method:
          keyResult.scoringMethod ??
          null,

        position:
          keyResult.position,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create performance instance key result: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceKeyResult(
    data as PerformanceInstanceKeyResultRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export interface UpdatePerformanceInstanceKeyResultInput {
  performanceInstanceId: string;

  keyResultId: string;

  title: string;

  target: unknown;

  measurementType?:
    PerformanceInstanceKeyResult[
      "measurementType"
    ];

  scoringMethod?:
    PerformanceInstanceKeyResult[
      "scoringMethod"
    ];

  weight?: number;
}

export async function updatePerformanceInstanceKeyResult(
  input:
    UpdatePerformanceInstanceKeyResultInput
): Promise<PerformanceInstanceKeyResult> {
  const title =
    input.title.trim();

  if (!title) {
    throw new Error(
      "Key Result title is required."
    );
  }

  const { data, error } =
    await supabase
      .from(
        "performance_instance_key_results"
      )
      .update({
        title,

        target:
          input.target,

        measurement_type:
          input.measurementType ??
          null,

        scoring_method:
          input.scoringMethod ??
          null,

        weight:
          input.weight ??
          null,
      })
      .eq(
        "id",
        input.keyResultId
      )
      .eq(
        "performance_instance_id",
        input.performanceInstanceId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update performance instance key result: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceKeyResult(
    data as PerformanceInstanceKeyResultRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deletePerformanceInstanceKeyResult(
  performanceInstanceId: string,

  keyResultId: string
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "performance_instance_key_results"
      )
      .delete()
      .eq(
        "id",
        keyResultId
      )
      .eq(
        "performance_instance_id",
        performanceInstanceId
      );

  if (error) {
    throw new Error(
      `Failed to delete performance instance key result: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Performance Instance
========================================================== */

export async function findPerformanceInstanceKeyResults(
  performanceInstanceId: string
): Promise<PerformanceInstanceKeyResult[]> {
  const { data, error } =
    await supabase
      .from(
        "performance_instance_key_results"
      )
      .select("*")
      .eq(
        "performance_instance_id",
        performanceInstanceId
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load performance instance key results: ${error.message}`
    );
  }

  return (
    (data ?? []) as
      PerformanceInstanceKeyResultRecord[]
  ).map(
    mapRecordToPerformanceInstanceKeyResult
  );
}