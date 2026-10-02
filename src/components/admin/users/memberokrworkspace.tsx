"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  loadMemberOKRWorkspace,
  createMemberObjectiveAction,
  updateMemberObjectiveAction,
  deleteMemberObjectiveAction,
  createMemberKeyResultAction,
  updateMemberKeyResultAction,
  deleteMemberKeyResultAction,
  createMemberInitiativeAction,
  updateMemberInitiativeAction,
  deleteMemberInitiativeAction,
} from "@/app/organization/users/actions";

import KeyResultEditor from "@/components/admin/users/memberkeyresulteditor";
import InitiativeEditor from "@/components/runtime/initiatives/initiativeeditor";

import type {
  MemberObjective,
  MemberKeyResult,
  MemberInitiative,
} from "@/lib/domain/memberokr";

interface MemberOKRWorkspaceProps {
  organizationId: string;

  subjectId: string;
}


/* ==========================================================
   Objective Form
   ----------------------------------------------------------
   The existing ObjectiveEditor is Runtime-specific.

   This temporary local form keeps the Member OKR workspace
   independent from Runtime while we later extract a reusable
   Objective editor.
========================================================== */

interface ObjectiveFormProps {
  objective?: MemberObjective;

  onSave: (
    values: {
      title: string;
      description: string;
    }
  ) => Promise<void>;

  onCancel: () => void;
}

function ObjectiveForm({
  objective,
  onSave,
  onCancel,
}: ObjectiveFormProps) {
  const [
    title,
    setTitle,
  ] = useState(
    objective?.title ?? ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    objective?.description ?? ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function handleSave() {
    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      setError(
        "Objective title is required."
      );

      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title:
          trimmedTitle,

        description:
          description.trim(),
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save Objective."
      );

      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border bg-muted/20 p-5">
      <h3 className="text-lg font-semibold">
        {objective
          ? "Edit Objective"
          : "Add Objective"}
      </h3>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="member-okr-objective-title"
            className="mb-1 block text-sm font-medium"
          >
            Objective
          </label>

          <input
            id="member-okr-objective-title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            disabled={saving}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="Enter objective"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="member-okr-objective-description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="member-okr-objective-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            disabled={saving}
            rows={3}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="Describe what you want to accomplish"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              void handleSave()
            }
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : objective
                ? "Save Objective"
                : "Add Objective"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}


/* ==========================================================
   Main Workspace
========================================================== */

export default function MemberOKRWorkspace({
  organizationId,
  subjectId,
}: MemberOKRWorkspaceProps) {
  const [
    membershipId,
    setMembershipId,
  ] = useState<string | null>(
    null
  );

  const [
    subject,
    setSubject,
  ] = useState<{
    id: string;
    displayName: string;
    email: string;
  } | null>(null);

  const [
    objectives,
    setObjectives,
  ] = useState<MemberObjective[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    addingObjective,
    setAddingObjective,
  ] = useState(false);

  const [
    editingObjectiveId,
    setEditingObjectiveId,
  ] = useState<string | null>(
    null
  );

  const [
    addingKeyResultObjectiveId,
    setAddingKeyResultObjectiveId,
  ] = useState<string | null>(
    null
  );

  const [
    editingKeyResultId,
    setEditingKeyResultId,
  ] = useState<string | null>(
    null
  );

  const [
    addingInitiativeKeyResultId,
    setAddingInitiativeKeyResultId,
  ] = useState<string | null>(
    null
  );

  const [
    editingInitiativeId,
    setEditingInitiativeId,
  ] = useState<string | null>(
    null
  );


  /* ========================================================
     Load Workspace
  ======================================================== */

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const result =
        await loadMemberOKRWorkspace({
          organizationId,
          subjectId,
        });

      setMembershipId(
        result.membershipId
      );

      setSubject({
        id:
          result.subject.id,

        displayName:
          result.subject.displayName,

        email:
          result.subject.email,
      });

      setObjectives(
        result.objectives
      );
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
  }, [
    organizationId,
    subjectId,
  ]);


  /* ========================================================
     Objective Save
  ======================================================== */

  async function saveObjective(
    values: {
      title: string;
      description: string;
    }
  ) {
    if (!membershipId) {
      throw new Error(
        "Organization membership is not loaded."
      );
    }

    if (editingObjectiveId) {
      const updated =
        await updateMemberObjectiveAction(
          organizationId,
          membershipId,
          {
            objectiveId:
              editingObjectiveId,

            title:
              values.title,

            description:
              values.description,

            position:
              objectives.find(
                (objective) =>
                  objective.id ===
                  editingObjectiveId
              )?.position ?? 0,
          }
        );

      setObjectives(
        (items) =>
          items.map(
            (objective) =>
              objective.id ===
              updated.id
                ? {
                    ...objective,
                    ...updated,
                    keyResults:
                      objective.keyResults,
                  }
                : objective
          )
      );
    } else {
      const created =
        await createMemberObjectiveAction(
          organizationId,
          {
            organizationMembershipId:
              membershipId,

            title:
              values.title,

            description:
              values.description,
          }
        );

      setObjectives(
        (items) => [
          ...items,
          created,
        ]
      );
    }

    setAddingObjective(false);
    setEditingObjectiveId(null);
  }


  /* ========================================================
     Objective Delete
  ======================================================== */

  async function deleteObjective(
    objectiveId: string
  ) {
    if (!membershipId) {
      return;
    }

    if (
      !window.confirm(
        "Delete this Objective and its Key Results?"
      )
    ) {
      return;
    }

    try {
      setError(null);

      await deleteMemberObjectiveAction(
        organizationId,
        membershipId,
        objectiveId
      );

      setObjectives(
        (items) =>
          items.filter(
            (objective) =>
              objective.id !==
              objectiveId
          )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Objective."
      );
    }
  }


  /* ========================================================
     Key Result Save
  ======================================================== */

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
        | "percentage_of_target"
        | "display_only";
      weight?: number;
    }
  ) {
    if (!membershipId) {
      throw new Error(
        "Organization membership is not loaded."
      );
    }

    const existing =
      objectives
        .flatMap(
          (objective) =>
            objective.keyResults
        )
        .find(
          (keyResult) =>
            keyResult.id ===
            editingKeyResultId
        );

    if (existing) {
      const updated =
        await updateMemberKeyResultAction(
          organizationId,
          membershipId,
          {
            keyResultId:
              existing.id,

            title:
              values.title,

            target:
              values.target,

            measurementType:
              values.measurementType,

            scoringMethod:
              values.scoringMethod,

            weight:
              values.weight,
          }
        );

      setObjectives(
        (items) =>
          items.map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.map(
                  (keyResult) =>
                    keyResult.id ===
                    updated.id
                      ? {
                          ...keyResult,
                          ...updated,
                          initiatives:
                            keyResult.initiatives,
                        }
                      : keyResult
                ),
            })
          )
      );
    } else {
      const created =
        await createMemberKeyResultAction(
          organizationId,
          membershipId,
          {
            memberObjectiveId:
              objectiveId,

            title:
              values.title,

            target:
              values.target,

            measurementType:
              values.measurementType,

            scoringMethod:
              values.scoringMethod,

            weight:
              values.weight,
          }
        );

      setObjectives(
        (items) =>
          items.map(
            (objective) =>
              objective.id ===
              objectiveId
                ? {
                    ...objective,

                    keyResults: [
                      ...objective.keyResults,
                      created,
                    ],
                  }
                : objective
          )
      );
    }

    setAddingKeyResultObjectiveId(
      null
    );

    setEditingKeyResultId(
      null
    );
  }


  /* ========================================================
     Key Result Delete
  ======================================================== */

  async function deleteKeyResult(
    keyResultId: string
  ) {
    if (!membershipId) {
      return;
    }

    if (
      !window.confirm(
        "Delete this Key Result?"
      )
    ) {
      return;
    }

    try {
      setError(null);

      await deleteMemberKeyResultAction(
        organizationId,
        membershipId,
        keyResultId
      );

      setObjectives(
        (items) =>
          items.map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.filter(
                  (keyResult) =>
                    keyResult.id !==
                    keyResultId
                ),
            })
          )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Key Result."
      );
    }
  }


  /* ========================================================
     Initiative Save
  ======================================================== */

  async function saveInitiative(
    keyResultId: string,
    text: string
  ) {
    if (!membershipId) {
      throw new Error(
        "Organization membership is not loaded."
      );
    }

    const existing =
      objectives
        .flatMap(
          (objective) =>
            objective.keyResults
        )
        .flatMap(
          (keyResult) =>
            keyResult.initiatives
        )
        .find(
          (initiative) =>
            initiative.id ===
            editingInitiativeId
        );

    if (existing) {
      const updated =
        await updateMemberInitiativeAction(
          organizationId,
          membershipId,
          {
            initiativeId:
              existing.id,

            text,
          }
        );

      setObjectives(
        (items) =>
          items.map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.map(
                  (keyResult) => ({
                    ...keyResult,

                    initiatives:
                      keyResult.initiatives.map(
                        (initiative) =>
                          initiative.id ===
                          updated.id
                            ? updated
                            : initiative
                      ),
                  })
                ),
            })
          )
      );
    } else {
      const created =
        await createMemberInitiativeAction(
          organizationId,
          membershipId,
          {
            memberKeyResultId:
              keyResultId,

            text,
          }
        );

      setObjectives(
        (items) =>
          items.map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.map(
                  (keyResult) =>
                    keyResult.id ===
                    keyResultId
                      ? {
                          ...keyResult,

                          initiatives: [
                            ...keyResult.initiatives,
                            created,
                          ],
                        }
                      : keyResult
                ),
            })
          )
      );
    }

    setAddingInitiativeKeyResultId(
      null
    );

    setEditingInitiativeId(
      null
    );
  }


  /* ========================================================
     Initiative Delete
  ======================================================== */

  async function deleteInitiative(
    keyResultId: string,
    initiativeId: string
  ) {
    if (!membershipId) {
      return;
    }

    if (
      !window.confirm(
        "Delete this Initiative?"
      )
    ) {
      return;
    }

    try {
      setError(null);

      await deleteMemberInitiativeAction(
        organizationId,
        membershipId,
        initiativeId
      );

      setObjectives(
        (items) =>
          items.map(
            (objective) => ({
              ...objective,

              keyResults:
                objective.keyResults.map(
                  (keyResult) =>
                    keyResult.id ===
                    keyResultId
                      ? {
                          ...keyResult,

                          initiatives:
                            keyResult.initiatives.filter(
                              (initiative) =>
                                initiative.id !==
                                initiativeId
                            ),
                        }
                      : keyResult
                ),
            })
          )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete Initiative."
      );
    }
  }


  /* ========================================================
     Loading State
  ======================================================== */

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


  /* ========================================================
     Failed Workspace State
  ======================================================== */

  if (!subject) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="rounded-md border bg-white px-3 py-2 text-sm"
          >
            Back to Users
          </button>

          <section className="rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold">
              Unable to open OKRs
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error ??
                "Member OKRs could not be loaded."}
            </p>
          </section>
        </div>
      </main>
    );
  }


  /* ========================================================
     Workspace
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ==================================================
            Member Header
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
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
                {subject.displayName}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {subject.email}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Persistent OKR Profile
              </p>

              <p className="mt-1 font-medium">
                Objectives
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {objectives.length} Objective
                {objectives.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>
        </section>


        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}


        {/* ==================================================
            Objectives Toolbar
        ================================================== */}

        <section className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Objectives
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage this member's persistent Objectives,
              Key Results, and Initiatives.
            </p>
          </div>

          <button
            type="button"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setAddingObjective(
                true
              );

              setEditingObjectiveId(
                null
              );
            }}
          >
            + Add Objective
          </button>
        </section>


        {/* ==================================================
            Add Objective
        ================================================== */}

        {addingObjective && (
          <ObjectiveForm
            onSave={saveObjective}
            onCancel={() =>
              setAddingObjective(
                false
              )
            }
          />
        )}


        {/* ==================================================
            Empty State
        ================================================== */}

        {objectives.length === 0 &&
          !addingObjective && (
            <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <h2 className="font-semibold">
                No Objectives yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Add an Objective to start building this
                member's OKRs.
              </p>
            </section>
          )}


        {/* ==================================================
            Objective List
        ================================================== */}

        <section className="space-y-5">
          {objectives.map(
            (objective) => (
              <section
                key={
                  objective.id
                }
                className="rounded-xl border bg-white p-6 shadow-sm"
              >

                {/* ==========================================
                    Objective Editor
                ========================================== */}

                {editingObjectiveId ===
                objective.id ? (
                  <ObjectiveForm
                    objective={
                      objective
                    }
                    onSave={
                      saveObjective
                    }
                    onCancel={() =>
                      setEditingObjectiveId(
                        null
                      )
                    }
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Objective{" "}
                          {objective.position +
                            1}
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          {
                            objective.title
                          }
                        </h2>

                        {objective.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {
                              objective.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1.5 text-sm"
                          onClick={() =>
                            setEditingObjectiveId(
                              objective.id
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="rounded-md border px-3 py-1.5 text-sm text-red-600"
                          onClick={() =>
                            void deleteObjective(
                              objective.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>


                    {/* ======================================
                        Key Results Header
                    ====================================== */}

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          Key Results
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            objective
                              .keyResults
                              .length
                          }{" "}
                          Key Result
                          {objective
                            .keyResults
                            .length === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-md border px-3 py-1.5 text-sm"
                        onClick={() => {
                          setAddingKeyResultObjectiveId(
                            objective.id
                          );

                          setEditingKeyResultId(
                            null
                          );
                        }}
                      >
                        + Add Key Result
                      </button>
                    </div>


                    {/* ======================================
                        Add Key Result
                    ====================================== */}

                    {addingKeyResultObjectiveId ===
                      objective.id && (
                      <div className="mt-4">
                        <KeyResultEditor
                          onCancel={() =>
                            setAddingKeyResultObjectiveId(
                              null
                            )
                          }
                          onSave={(
                            values
                          ) =>
                            saveKeyResult(
                              objective.id,
                              values
                            )
                          }
                        />
                      </div>
                    )}


                    {/* ======================================
                        Key Result List
                    ====================================== */}

                    <div className="mt-4 space-y-4">
                      {objective.keyResults.map(
                        (keyResult) => (
                          <div
                            key={
                              keyResult.id
                            }
                            className="rounded-lg border bg-gray-50 p-4"
                          >

                            {editingKeyResultId ===
                            keyResult.id ? (
                              <KeyResultEditor
                                keyResult={
                                  keyResult
                                }
                                onCancel={() =>
                                  setEditingKeyResultId(
                                    null
                                  )
                                }
                                onSave={(
                                  values
                                ) =>
                                  saveKeyResult(
                                    objective.id,
                                    values
                                  )
                                }
                              />
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      Key Result{" "}
                                      {keyResult.position +
                                        1}
                                    </p>

                                    <h4 className="mt-1 font-medium">
                                      {
                                        keyResult.title
                                      }
                                    </h4>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                      Target:{" "}
                                      {String(
                                        keyResult.target
                                      )}
                                    </p>

                                    {keyResult.weight !==
                                      undefined && (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        Weight:{" "}
                                        {
                                          keyResult.weight
                                        }
                                        %
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      className="rounded-md border px-3 py-1.5 text-xs"
                                      onClick={() =>
                                        setEditingKeyResultId(
                                          keyResult.id
                                        )
                                      }
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      className="rounded-md border px-3 py-1.5 text-xs text-red-600"
                                      onClick={() =>
                                        void deleteKeyResult(
                                          keyResult.id
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>


                                {/* ==========================
                                    Initiatives
                                ========================== */}

                                <div className="mt-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-sm font-medium">
                                        Initiatives
                                      </h5>

                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {
                                          keyResult
                                            .initiatives
                                            .length
                                        }{" "}
                                        Initiative
                                        {keyResult
                                          .initiatives
                                          .length ===
                                        1
                                          ? ""
                                          : "s"}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      className="rounded-md border px-3 py-1.5 text-xs"
                                      onClick={() => {
                                        setAddingInitiativeKeyResultId(
                                          keyResult.id
                                        );

                                        setEditingInitiativeId(
                                          null
                                        );
                                      }}
                                    >
                                      + Add Initiative
                                    </button>
                                  </div>


                                  {/* ========================
                                      Add Initiative
                                  ======================== */}

                                  {addingInitiativeKeyResultId ===
                                    keyResult.id && (
                                    <div className="mt-3">
                                      <InitiativeEditor
                                        onCancel={() =>
                                          setAddingInitiativeKeyResultId(
                                            null
                                          )
                                        }
                                        onSave={(
                                          text
                                        ) =>
                                          saveInitiative(
                                            keyResult.id,
                                            text
                                          )
                                        }
                                      />
                                    </div>
                                  )}


                                  {/* ========================
                                      Initiative List
                                  ======================== */}

                                  <div className="mt-3 space-y-2">
                                    {keyResult.initiatives.map(
                                      (
                                        initiative
                                      ) => (
                                        <div
                                          key={
                                            initiative.id
                                          }
                                          className="rounded-md border bg-white p-3"
                                        >
                                          {editingInitiativeId ===
                                          initiative.id ? (
                                            <InitiativeEditor
                                              initialText={
                                                initiative.text
                                              }
                                              onCancel={() =>
                                                setEditingInitiativeId(
                                                  null
                                                )
                                              }
                                              onSave={(
                                                text
                                              ) =>
                                                saveInitiative(
                                                  keyResult.id,
                                                  text
                                                )
                                              }
                                            />
                                          ) : (
                                            <div className="flex items-start justify-between gap-4">
                                              <p className="text-sm">
                                                {
                                                  initiative.text
                                                }
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
                                      )
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </section>
            )
          )}
        </section>
      </div>
    </main>
  );
}