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
   ----------------------------------------------------------
   Runtime Objective editing.

   These fields belong to the monthly Runtime snapshot:

   - title
   - description
   - weight
   - position

   This does NOT modify the Builder definition.
========================================================== */

export interface UpdatePerformanceInstanceObjectiveInput {
  performanceInstanceId: string;

  objectiveId: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;
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

  if (
    !Number.isInteger(
      input.position
    ) ||
    input.position < 1
  ) {
    throw new Error(
      "Objective position must be a positive whole number."
    );
  }

  let weight:
    number | null =
    null;

  if (
    input.weight !== undefined &&
    input.weight !== null
  ) {
    if (
      !Number.isFinite(
        input.weight
      )
    ) {
      throw new Error(
        "Objective weight must be a valid number."
      );
    }

    if (
      input.weight < 0
    ) {
      throw new Error(
        "Objective weight cannot be negative."
      );
    }

    weight =
      input.weight;
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

        weight,

        position:
          input.position,
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