import {
  BuilderDocument,
  BuilderOrganization,
  BuilderPerformanceHeader,
  BuilderObjective,
  BuilderKeyResult,
  BuilderInitiative,
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

/**
 * Move an existing Key Result from one Objective to another.
 *
 * The Key Result ID is preserved so the KR remains the same
 * logical entity after the move.
 */
export function moveKeyResult(
  document: BuilderDocument,
  keyResultId: string,
  sourceObjectiveId: string,
  targetObjectiveId: string
): BuilderDocument {
  if (sourceObjectiveId === targetObjectiveId) {
    return document;
  }

  const sourceObjective = document.objectives.find(
    (objective) => objective.id === sourceObjectiveId
  );

  const targetObjective = document.objectives.find(
    (objective) => objective.id === targetObjectiveId
  );

  if (!sourceObjective || !targetObjective) {
    return document;
  }

  const keyResult = sourceObjective.keyResults.find(
    (kr) => kr.id === keyResultId
  );

  if (!keyResult) {
    return document;
  }

  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id === sourceObjectiveId) {
        return {
          ...objective,
          keyResults: objective.keyResults.filter(
            (kr) => kr.id !== keyResultId
          ),
        };
      }

      if (objective.id === targetObjectiveId) {
        return {
          ...objective,
          keyResults: [
            ...objective.keyResults,
            keyResult,
          ],
        };
      }

      return objective;
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
   Initiatives
========================================================== */

export function addInitiative(
  document: BuilderDocument,
  objectiveId: string,
  keyResultId: string,
  initiative: BuilderInitiative
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: objective.keyResults.map((kr) => {
          if (kr.id !== keyResultId) {
            return kr;
          }

          if (kr.initiatives.length >= 3) {
            return kr;
          }

          return {
            ...kr,
            initiatives: [
              ...kr.initiatives,
              initiative,
            ],
          };
        }),
      };
    }),
  };
}

export function updateInitiative(
  document: BuilderDocument,
  objectiveId: string,
  keyResultId: string,
  initiative: BuilderInitiative
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: objective.keyResults.map((kr) => {
          if (kr.id !== keyResultId) {
            return kr;
          }

          return {
            ...kr,
            initiatives: kr.initiatives.map((i) =>
              i.id === initiative.id
                ? initiative
                : i
            ),
          };
        }),
      };
    }),
  };
}

export function deleteInitiative(
  document: BuilderDocument,
  objectiveId: string,
  keyResultId: string,
  initiativeId: string
): BuilderDocument {
  return {
    ...document,
    objectives: document.objectives.map((objective) => {
      if (objective.id !== objectiveId) {
        return objective;
      }

      return {
        ...objective,
        keyResults: objective.keyResults.map((kr) => {
          if (kr.id !== keyResultId) {
            return kr;
          }

          return {
            ...kr,
            initiatives: kr.initiatives.filter(
              (i) => i.id !== initiativeId
            ),
          };
        }),
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