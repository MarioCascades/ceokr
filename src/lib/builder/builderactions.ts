import {
  BuilderDocument,
  BuilderOrganization,
  BuilderPerformanceHeader,
  BuilderObjective,
  BuilderKeyResult,
  BuilderComments,
} from "@/lib/types/builderdocument";

/* ==========================================================
   Organization
========================================================== */

export function updateOrganization(
  document: BuilderDocument,
  organization: BuilderOrganization
): BuilderDocument {
  return {
    ...document,
    organization,
  };
}

/* ==========================================================
   Performance Header
========================================================== */

export function updatePerformanceHeader(
  document: BuilderDocument,
  performanceHeader: BuilderPerformanceHeader
): BuilderDocument {
  return {
    ...document,
    performanceHeader,
  };
}

/* ==========================================================
   Objectives
========================================================== */

export function addObjective(
  document: BuilderDocument,
  objective: BuilderObjective
): BuilderDocument {
  return {
    ...document,
    objectives: [
      ...document.objectives,
      objective,
    ],
  };
}

export function updateObjective(
  document: BuilderDocument,
  objective: BuilderObjective
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((o) =>
      o.id === objective.id ? objective : o
    ),
  };
}

export function deleteObjective(
  document: BuilderDocument,
  objectiveId: string
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.filter(
      (o) => o.id !== objectiveId
    ),
  };
}

/* ==========================================================
   Key Results
========================================================== */

export function addKeyResult(
  document: BuilderDocument,
  objectiveId: string,
  keyResult: BuilderKeyResult
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: [
          ...objective.keyResults,
          keyResult,
        ],
      };
    }),
  };
}

export function updateKeyResult(
  document: BuilderDocument,
  objectiveId: string,
  keyResult: BuilderKeyResult
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: objective.keyResults.map((kr) =>
          kr.id === keyResult.id ? keyResult : kr
        ),
      };
    }),
  };
}

export function deleteKeyResult(
  document: BuilderDocument,
  objectiveId: string,
  keyResultId: string
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: objective.keyResults.filter(
          (kr) => kr.id !== keyResultId
        ),
      };
    }),
  };
}

/* ==========================================================
   Comments
========================================================== */

export function updateComments(
  document: BuilderDocument,
  comments: BuilderComments
): BuilderDocument {
  return {
    ...document,
    comments,
  };
}