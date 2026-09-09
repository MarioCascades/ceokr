import type {
  PerformanceInstanceObjective,
} from "@/lib/domain/performanceinstanceobjective";

import type {
  PerformanceInstanceKeyResult,
} from "@/lib/domain/performanceinstancekeyresult";

import type {
  PerformanceInstanceInitiative,
} from "@/lib/domain/performanceinstanceinitiative";

export interface RuntimePerformanceInitiative {
  id: string;

  sourceInitiativeId?: string;

  text: string;

  position: number;
}

export interface RuntimePerformanceKeyResult {
  id: string;

  sourceKeyResultId?: string;

  title: string;

  target: unknown;

  weight?: number;

  measurementType?:
    | "percentage"
    | "numeric"
    | "financial";

  scoringMethod?:
    | "percent_into_period"
    | "percentage_of_target";

  position: number;

  initiatives:
    RuntimePerformanceInitiative[];
}

export interface RuntimePerformanceObjective {
  id: string;

  sourceObjectiveId?: string;

  title: string;

  description?: string;

  weight?: number;

  position: number;

  keyResults:
    RuntimePerformanceKeyResult[];
}

export function buildRuntimePerformanceObjectives(
  objectives:
    PerformanceInstanceObjective[],

  keyResults:
    PerformanceInstanceKeyResult[],

  initiatives:
    PerformanceInstanceInitiative[]
): RuntimePerformanceObjective[] {
  const initiativesByKeyResult =
    new Map<
      string,
      RuntimePerformanceInitiative[]
    >();

  for (const initiative of initiatives) {
    const existing =
      initiativesByKeyResult.get(
        initiative.performanceInstanceKeyResultId
      ) ?? [];

    existing.push({
      id:
        initiative.id,

      sourceInitiativeId:
        initiative.sourceInitiativeId,

      text:
        initiative.text,

      position:
        initiative.position,
    });

    initiativesByKeyResult.set(
      initiative.performanceInstanceKeyResultId,
      existing
    );
  }

  const keyResultsByObjective =
    new Map<
      string,
      RuntimePerformanceKeyResult[]
    >();

  for (const keyResult of keyResults) {
    const runtimeKeyResult:
      RuntimePerformanceKeyResult =
      {
        id:
          keyResult.id,

        sourceKeyResultId:
          keyResult.sourceKeyResultId,

        title:
          keyResult.title,

        target:
          keyResult.target,

        weight:
          keyResult.weight,

        measurementType:
          keyResult.measurementType,

        scoringMethod:
          keyResult.scoringMethod,

        position:
          keyResult.position,

        initiatives:
          initiativesByKeyResult.get(
            keyResult.id
          ) ?? [],
      };

    const existing =
      keyResultsByObjective.get(
        keyResult.performanceInstanceObjectiveId
      ) ?? [];

    existing.push(
      runtimeKeyResult
    );

    keyResultsByObjective.set(
      keyResult.performanceInstanceObjectiveId,
      existing
    );
  }

  return objectives.map(
    (objective) => ({
      id:
        objective.id,

      sourceObjectiveId:
        objective.sourceObjectiveId,

      title:
        objective.title,

      description:
        objective.description,

      weight:
        objective.weight,

      position:
        objective.position,

      keyResults:
        keyResultsByObjective.get(
          objective.id
        ) ?? [],
    })
  );
}