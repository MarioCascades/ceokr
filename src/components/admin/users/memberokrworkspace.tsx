"use client";

import { useEffect, useState } from "react";

import {
  loadOrCreateMemberOKRWorkspace,
} from "@/app/organization/users/actions";

import {
  createRuntimePerformanceInstanceKeyResultAction,
  deleteRuntimePerformanceInstanceKeyResultAction,
  updateRuntimePerformanceInstanceKeyResultAction,
  createRuntimePerformanceInstanceInitiativeAction,
  deleteRuntimePerformanceInstanceInitiativeAction,
  updateRuntimePerformanceInstanceInitiativeAction,
  deleteRuntimePerformanceInstanceObjectiveAction,
} from "@/app/runtime/actions";

import ObjectiveEditor from "@/components/runtime/performancesheet/objectiveeditor";
import KeyResultEditor from "@/components/runtime/keyresults/keyresulteditor";
import InitiativeEditor from "@/components/runtime/initiatives/initiativeeditor";

import type { MemberPerformanceExecution } from "@/lib/runtime/loadmemberperformance";
import type {
  RuntimePerformanceObjective,
  RuntimePerformanceKeyResult,
  RuntimePerformanceInitiative,
} from "@/lib/runtime/runtimeperformance";

interface MemberOKRWorkspaceProps {
  organizationId: string;
  subjectId: string;
}

function currentMonth() {
  const date = new Date();

  return [
    date.getFullYear().toString().padStart(4, "0"),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    "01",
  ].join("-");
}

function formatMonth(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function MemberOKRWorkspace({
  organizationId,
  subjectId,
}: MemberOKRWorkspaceProps) {
  const [execution, setExecution] =
    useState<MemberPerformanceExecution | null>(null);

  const [objectives, setObjectives] =
    useState<RuntimePerformanceObjective[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addingObjective, setAddingObjective] = useState(false);
  const [editingObjectiveId, setEditingObjectiveId] =
    useState<string | null>(null);

  const [addingKeyResultObjectiveId, setAddingKeyResultObjectiveId] =
    useState<string | null>(null);
  const [editingKeyResultId, setEditingKeyResultId] =
    useState<string | null>(null);

  const [addingInitiativeKeyResultId, setAddingInitiativeKeyResultId] =
    useState<string | null>(null);
  const [editingInitiativeId, setEditingInitiativeId] =
    useState<string | null>(null);

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const result =
        await loadOrCreateMemberOKRWorkspace({
          organizationId,
          subjectId,
          performanceMonth: currentMonth(),
        });

      setExecution(result);
      setObjectives(result.objectives);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load member OKRs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [organizationId, subjectId]);

  function saveObjective(objective: RuntimePerformanceObjective) {
    setObjectives((items) => {
      const exists = items.some((item) => item.id === objective.id);

      return exists
        ? items.map((item) =>
            item.id === objective.id
              ? { ...item, ...objective }
              : item
          )
        : [...items, objective];
    });

    setAddingObjective(false);
    setEditingObjectiveId(null);
  }

  async function deleteObjective(objectiveId: string) {
    if (
      !execution ||
      !window.confirm("Delete this Objective and its Key Results?")
    ) {
      return;
    }

    try {
      setError(null);

      await deleteRuntimePerformanceInstanceObjectiveAction(
        organizationId,
        execution.performanceInstance.id,
        objectiveId
      );

      setObjectives((items) =>
        items.filter((item) => item.id !== objectiveId)
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Objective."
      );
    }
  }

  async function saveKeyResult(
    objectiveId: string,
    values: {
      title: string;
      target: unknown;
      measurementType:
        | "percentage"
        | "numeric"
        | "financial";
      scoringMethod:
        | "percent_into_period"
        | "percentage_of_target";
      weight?: number;
    }
  ) {
    if (!execution) {
      throw new Error("Performance instance is not loaded.");
    }

    const existing =
      objectives
        .flatMap((objective) => objective.keyResults)
        .find((keyResult) => keyResult.id === editingKeyResultId);

    if (existing) {
      const updated =
        await updateRuntimePerformanceInstanceKeyResultAction({
          organizationId,
          performanceInstanceId: execution.performanceInstance.id,
          keyResultId: existing.id,
          title: values.title,
          target: values.target,
          measurementType: values.measurementType,
          scoringMethod: values.scoringMethod,
          weight: values.weight,
        });

      setObjectives((items) =>
        items.map((objective) => ({
          ...objective,
          keyResults: objective.keyResults.map((keyResult) =>
            keyResult.id === updated.id
              ? {
                  ...keyResult,
                  title: updated.title,
                  target: updated.target,
                  measurementType: updated.measurementType,
                  scoringMethod: updated.scoringMethod,
                  weight: updated.weight,
                }
              : keyResult
          ),
        }))
      );
    } else {
      const created =
        await createRuntimePerformanceInstanceKeyResultAction({
          organizationId,
          performanceInstanceId: execution.performanceInstance.id,
          performanceInstanceObjectiveId: objectiveId,
          title: values.title,
          target: values.target,
          measurementType: values.measurementType,
          scoringMethod: values.scoringMethod,
          weight: values.weight,
        });

      const keyResult: RuntimePerformanceKeyResult = {
        id: created.keyResult.id,
        sourceKeyResultId: created.keyResult.sourceKeyResultId,
        title: created.keyResult.title,
        target: created.keyResult.target,
        weight: created.keyResult.weight,
        measurementType: created.keyResult.measurementType,
        scoringMethod: created.keyResult.scoringMethod,
        position: created.keyResult.position,
        initiatives: [],
      };

      setObjectives((items) =>
        items.map((objective) =>
          objective.id === objectiveId
            ? {
                ...objective,
                keyResults: [...objective.keyResults, keyResult],
              }
            : objective
        )
      );
    }

    setAddingKeyResultObjectiveId(null);
    setEditingKeyResultId(null);
  }

  async function deleteKeyResult(keyResultId: string) {
    if (
      !execution ||
      !window.confirm("Delete this Key Result?")
    ) {
      return;
    }

    try {
      setError(null);

      await deleteRuntimePerformanceInstanceKeyResultAction(
        organizationId,
        execution.performanceInstance.id,
        keyResultId
      );

      setObjectives((items) =>
        items.map((objective) => ({
          ...objective,
          keyResults: objective.keyResults.filter(
            (keyResult) => keyResult.id !== keyResultId
          ),
        }))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Key Result."
      );
    }
  }

  async function saveInitiative(
    keyResultId: string,
    text: string
  ) {
    if (!execution) {
      throw new Error("Performance instance is not loaded.");
    }

    const existing =
      objectives
        .flatMap((objective) => objective.keyResults)
        .flatMap((keyResult) => keyResult.initiatives)
        .find((initiative) => initiative.id === editingInitiativeId);

    if (existing) {
      const updated =
        await updateRuntimePerformanceInstanceInitiativeAction({
          organizationId,
          performanceInstanceId: execution.performanceInstance.id,
          performanceInstanceKeyResultId: keyResultId,
          initiativeId: existing.id,
          text,
        });

      setObjectives((items) =>
        items.map((objective) => ({
          ...objective,
          keyResults: objective.keyResults.map((keyResult) => ({
            ...keyResult,
            initiatives: keyResult.initiatives.map((initiative) =>
              initiative.id === updated.id
                ? { ...initiative, text: updated.text }
                : initiative
            ),
          })),
        }))
      );
    } else {
      const created =
        await createRuntimePerformanceInstanceInitiativeAction({
          organizationId,
          performanceInstanceId: execution.performanceInstance.id,
          performanceInstanceKeyResultId: keyResultId,
          text,
        });

      const initiative: RuntimePerformanceInitiative = {
        id: created.id,
        sourceInitiativeId: created.sourceInitiativeId,
        text: created.text,
        position: created.position,
      };

      setObjectives((items) =>
        items.map((objective) => ({
          ...objective,
          keyResults: objective.keyResults.map((keyResult) =>
            keyResult.id === keyResultId
              ? {
                  ...keyResult,
                  initiatives: [
                    ...keyResult.initiatives,
                    initiative,
                  ],
                }
              : keyResult
          ),
        }))
      );
    }

    setAddingInitiativeKeyResultId(null);
    setEditingInitiativeId(null);
  }

  async function deleteInitiative(
    keyResultId: string,
    initiativeId: string
  ) {
    if (
      !execution ||
      !window.confirm("Delete this Initiative?")
    ) {
      return;
    }

    try {
      setError(null);

      await deleteRuntimePerformanceInstanceInitiativeAction(
        organizationId,
        execution.performanceInstance.id,
        keyResultId,
        initiativeId
      );

      setObjectives((items) =>
        items.map((objective) => ({
          ...objective,
          keyResults: objective.keyResults.map((keyResult) =>
            keyResult.id === keyResultId
              ? {
                  ...keyResult,
                  initiatives: keyResult.initiatives.filter(
                    (initiative) => initiative.id !== initiativeId
                  ),
                }
              : keyResult
          ),
        }))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Initiative."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Loading member OKRs...
          </p>
        </div>
      </main>
    );
  }

  if (!execution) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-md border bg-white px-3 py-2 text-sm"
          >
            Back to Users
          </button>

          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold">
              Unable to open OKRs
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error ?? "Member OKRs could not be loaded."}
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              The member must have an active individual Performance
              Sheet assignment before OKRs can be created or modified.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const month =
    formatMonth(execution.performanceInstance.performanceMonth);

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-6">

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-4 rounded-md border px-3 py-1.5 text-sm"
          >
            Back to Users
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Member OKRs
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                {execution.subject.displayName}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {execution.subject.email}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Performance Month
              </p>

              <p className="mt-1 font-medium">{month}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {execution.performanceSheet.name}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <section className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">Objectives</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage this member's Objectives, Key Results,
              and Initiatives.
            </p>
          </div>

          <button
            type="button"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setAddingObjective(true);
              setEditingObjectiveId(null);
            }}
          >
            + Add Objective
          </button>
        </section>

        {addingObjective && (
          <ObjectiveEditor
            organizationId={organizationId}
            performanceInstanceId={execution.performanceInstance.id}
            onSaved={saveObjective}
            onCancel={() => setAddingObjective(false)}
          />
        )}

        {objectives.length === 0 && !addingObjective && (
          <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold">No Objectives yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add an Objective to start building this member's OKRs.
            </p>
          </section>
        )}

        <section className="space-y-5">
          {objectives.map((objective) => (
            <section
              key={objective.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              {editingObjectiveId === objective.id ? (
                <ObjectiveEditor
                  organizationId={organizationId}
                  performanceInstanceId={
                    execution.performanceInstance.id
                  }
                  objective={objective}
                  onSaved={saveObjective}
                  onCancel={() => setEditingObjectiveId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Objective {objective.position}
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        {objective.title}
                      </h2>

                      {objective.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {objective.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border px-3 py-1.5 text-sm"
                        onClick={() =>
                          setEditingObjectiveId(objective.id)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="rounded-md border px-3 py-1.5 text-sm text-red-600"
                        onClick={() => void deleteObjective(objective.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Key Results</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {objective.keyResults.length} Key Result
                        {objective.keyResults.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-md border px-3 py-1.5 text-sm"
                      onClick={() => {
                        setAddingKeyResultObjectiveId(objective.id);
                        setEditingKeyResultId(null);
                      }}
                    >
                      + Add Key Result
                    </button>
                  </div>

                  {addingKeyResultObjectiveId === objective.id && (
                    <div className="mt-4">
                      <KeyResultEditor
                        onCancel={() =>
                          setAddingKeyResultObjectiveId(null)
                        }
                        onSave={(values) =>
                          saveKeyResult(objective.id, values)
                        }
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    {objective.keyResults.map((keyResult) => (
                      <div
                        key={keyResult.id}
                        className="rounded-lg border bg-gray-50 p-4"
                      >
                        {editingKeyResultId === keyResult.id ? (
                          <KeyResultEditor
                            keyResult={keyResult}
                            onCancel={() =>
                              setEditingKeyResultId(null)
                            }
                            onSave={(values) =>
                              saveKeyResult(objective.id, values)
                            }
                          />
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Key Result {keyResult.position}
                                </p>

                                <h4 className="mt-1 font-medium">
                                  {keyResult.title}
                                </h4>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  Target: {String(keyResult.target)}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="rounded-md border px-3 py-1.5 text-xs"
                                  onClick={() =>
                                    setEditingKeyResultId(keyResult.id)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="rounded-md border px-3 py-1.5 text-xs text-red-600"
                                  onClick={() =>
                                    void deleteKeyResult(keyResult.id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-medium">
                                    Initiatives
                                  </h5>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {keyResult.initiatives.length} of 3
                                  </p>
                                </div>

                                {keyResult.initiatives.length < 3 && (
                                  <button
                                    type="button"
                                    className="rounded-md border px-3 py-1.5 text-xs"
                                    onClick={() => {
                                      setAddingInitiativeKeyResultId(
                                        keyResult.id
                                      );
                                      setEditingInitiativeId(null);
                                    }}
                                  >
                                    + Add Initiative
                                  </button>
                                )}
                              </div>

                              {addingInitiativeKeyResultId ===
                                keyResult.id && (
                                <div className="mt-3">
                                  <InitiativeEditor
                                    onCancel={() =>
                                      setAddingInitiativeKeyResultId(null)
                                    }
                                    onSave={(text) =>
                                      saveInitiative(
                                        keyResult.id,
                                        text
                                      )
                                    }
                                  />
                                </div>
                              )}

                              <div className="mt-3 space-y-2">
                                {keyResult.initiatives.map((initiative) => (
                                  <div
                                    key={initiative.id}
                                    className="rounded-md border bg-white p-3"
                                  >
                                    {editingInitiativeId ===
                                    initiative.id ? (
                                      <InitiativeEditor
                                        initialText={initiative.text}
                                        onCancel={() =>
                                          setEditingInitiativeId(null)
                                        }
                                        onSave={(text) =>
                                          saveInitiative(
                                            keyResult.id,
                                            text
                                          )
                                        }
                                      />
                                    ) : (
                                      <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm">
                                          {initiative.text}
                                        </p>

                                        <div className="flex shrink-0 gap-2">
                                          <button
                                            type="button"
                                            className="rounded-md border px-2.5 py-1 text-xs"
                                            onClick={() =>
                                              setEditingInitiativeId(
                                                initiative.id
                                              )
                                            }
                                          >
                                            Edit
                                          </button>

                                          <button
                                            type="button"
                                            className="rounded-md border px-2.5 py-1 text-xs text-red-600"
                                            onClick={() =>
                                              void deleteInitiative(
                                                keyResult.id,
                                                initiative.id
                                              )
                                            }
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
