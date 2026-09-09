import { supabase } from "@/lib/supabase/client";

import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

/* ==========================================================
   Database Record
========================================================== */

interface PerformanceInstanceObjectiveRecord {
  id: string;

  performance_instance_id: string;

  source_objective_id: string | null;

  title: string;

  description: string | null;

  weight: number | null;

  position: number;

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToPerformanceInstanceObjective(
  record:
    PerformanceInstanceObjectiveRecord
): PerformanceInstanceObjective {
  return {
    id:
      record.id,

    performanceInstanceId:
      record.performance_instance_id,

    sourceObjectiveId:
      record.source_objective_id ??
      undefined,

    title:
      record.title,

    description:
      record.description ??
      undefined,

    weight:
      record.weight ??
      undefined,

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

export async function createPerformanceInstanceObjective(
  objective: Omit<
    PerformanceInstanceObjective,
    "id" |
    "createdAt" |
    "updatedAt"
  >
): Promise<PerformanceInstanceObjective> {
  const { data, error } =
    await supabase
      .from(
        "performance_instance_objectives"
      )
      .insert({
        performance_instance_id:
          objective.performanceInstanceId,

        source_objective_id:
          objective.sourceObjectiveId ??
          null,

        title:
          objective.title,

        description:
          objective.description ??
          null,

        weight:
          objective.weight ??
          null,

        position:
          objective.position,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to create performance instance objective: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceObjective(
    data as PerformanceInstanceObjectiveRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export interface UpdatePerformanceInstanceObjectiveInput {
  performanceInstanceId: string;

  objectiveId: string;

  title: string;

  description?: string;
}

export async function updatePerformanceInstanceObjective(
  input:
    UpdatePerformanceInstanceObjectiveInput
): Promise<PerformanceInstanceObjective> {
  const title =
    input.title.trim();

  if (!title) {
    throw new Error(
      "Objective title is required."
    );
  }

  const description =
    input.description?.trim() ||
    null;

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "performance_instance_objectives"
      )
      .update({
        title,

        description,
      })
      .eq(
        "id",
        input.objectiveId
      )
      .eq(
        "performance_instance_id",
        input.performanceInstanceId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update performance instance objective: ${error.message}`
    );
  }

  return mapRecordToPerformanceInstanceObjective(
    data as PerformanceInstanceObjectiveRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deletePerformanceInstanceObjective(
  performanceInstanceId: string,

  objectiveId: string
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "performance_instance_objectives"
      )
      .delete()
      .eq(
        "id",
        objectiveId
      )
      .eq(
        "performance_instance_id",
        performanceInstanceId
      );

  if (error) {
    throw new Error(
      `Failed to delete performance instance objective: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Performance Instance
========================================================== */

export async function findPerformanceInstanceObjectives(
  performanceInstanceId: string
): Promise<PerformanceInstanceObjective[]> {
  const { data, error } =
    await supabase
      .from(
        "performance_instance_objectives"
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
      `Failed to load performance instance objectives: ${error.message}`
    );
  }

  return (
    (data ?? []) as
      PerformanceInstanceObjectiveRecord[]
  ).map(
    mapRecordToPerformanceInstanceObjective
  );
}