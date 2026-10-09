"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addCustomTableColumnAction,
  editCustomTableColumnAction,
  removeCustomTableColumnAction,
} from "@/app/organization/customtables/[tableId]/actions";

import type {
  CustomTableColumn,
  CreateCustomTableColumnInput,
} from "@/lib/types/domain/customtable";

type CustomTableColumnManagerProps = {
  organizationId: string;
  tableDefinitionId: string;
  columns: CustomTableColumn[];
  canManage: boolean;
};

type ColumnFormValues = {
  columnKey: string;
  label: string;
  dataType: string;
  position: string;
  isRequired: boolean;
  isVisible: boolean;
  isEditable: boolean;
};

const DATA_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / No" },
  { value: "select", label: "Dropdown" },
  { value: "status", label: "Status" },
] as const;

const EMPTY_FORM: ColumnFormValues = {
  columnKey: "",
  label: "",
  dataType: "text",
  position: "0",
  isRequired: false,
  isVisible: true,
  isEditable: true,
};

function normalizeColumnKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function createFormData(
  organizationId: string,
  tableDefinitionId: string,
  values: ColumnFormValues,
  columnId?: string
): FormData {
  const formData = new FormData();

  formData.set("organizationId", organizationId);
  formData.set("tableDefinitionId", tableDefinitionId);
  formData.set("columnKey", values.columnKey.trim());
  formData.set("label", values.label.trim());
  formData.set("dataType", values.dataType);
  formData.set("position", values.position);
  formData.set("isRequired", String(values.isRequired));
  formData.set("isVisible", String(values.isVisible));
  formData.set("isEditable", String(values.isEditable));

  if (columnId) {
    formData.set("columnId", columnId);
  }

  return formData;
}

export default function CustomTableColumnManager({
  organizationId,
  tableDefinitionId,
  columns,
  canManage,
}: CustomTableColumnManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isAdding, setIsAdding] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(
    null
  );
  const [formValues, setFormValues] =
    useState<ColumnFormValues>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(
    null
  );

  const sortedColumns = [...columns].sort(
    (a, b) => a.position - b.position
  );

  function updateForm<K extends keyof ColumnFormValues>(
    key: K,
    value: ColumnFormValues[K]
  ) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function beginAdd() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEditingColumnId(null);
    setConfirmDeleteId(null);
    setFormValues({
      ...EMPTY_FORM,
      position: String(columns.length),
    });
    setIsAdding(true);
  }

  function beginEdit(column: CustomTableColumn) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAdding(false);
    setConfirmDeleteId(null);
    setEditingColumnId(column.id);

    setFormValues({
      columnKey: column.columnKey,
      label: column.label,
      dataType: column.dataType,
      position: String(column.position),
      isRequired: column.isRequired,
      isVisible: column.isVisible,
      isEditable: column.isEditable,
    });
  }

  function cancelForm() {
    setIsAdding(false);
    setEditingColumnId(null);
    setFormValues(EMPTY_FORM);
    setErrorMessage(null);
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const columnKey = normalizeColumnKey(formValues.columnKey);

    if (!columnKey) {
      setErrorMessage("Enter a valid column key.");
      return;
    }

    if (!formValues.label.trim()) {
      setErrorMessage("Enter a column label.");
      return;
    }

    const position = Number(formValues.position);

    if (!Number.isInteger(position) || position < 0) {
      setErrorMessage("Position must be a non-negative whole number.");
      return;
    }

    const values = {
      ...formValues,
      columnKey,
      position: String(position),
    };

    startTransition(() => {
      void (async () => {
        try {
          const input: CreateCustomTableColumnInput = {
            organizationId,
            tableDefinitionId,
            columnKey: values.columnKey,
            label: values.label.trim(),
            dataType:
              values.dataType as CreateCustomTableColumnInput["dataType"],
            position,
            isRequired: values.isRequired,
            isVisible: values.isVisible,
            isEditable: values.isEditable,
            settings: {},
          };

          const formData = createFormData(
            organizationId,
            tableDefinitionId,
            values
          );

          formData.set("columnKey", input.columnKey);

          const result = await addCustomTableColumnAction(formData);

          if (!result.success) {
            setErrorMessage(result.error);
            return;
          }

          setSuccessMessage(result.message);
          setIsAdding(false);
          setFormValues(EMPTY_FORM);
          router.refresh();
        } catch (error) {
          setErrorMessage(getErrorMessage(error));
        }
      })();
    });
  }

  async function handleEdit(
    event: React.FormEvent<HTMLFormElement>,
    columnId: string
  ) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formValues.label.trim()) {
      setErrorMessage("Enter a column label.");
      return;
    }

    const position = Number(formValues.position);

    if (!Number.isInteger(position) || position < 0) {
      setErrorMessage("Position must be a non-negative whole number.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const formData = createFormData(
            organizationId,
            tableDefinitionId,
            {
              ...formValues,
              position: String(position),
            },
            columnId
          );

          const result = await editCustomTableColumnAction(formData);

          if (!result.success) {
            setErrorMessage(result.error);
            return;
          }

          setSuccessMessage(result.message);
          setEditingColumnId(null);
          setFormValues(EMPTY_FORM);
          router.refresh();
        } catch (error) {
          setErrorMessage(getErrorMessage(error));
        }
      })();
    });
  }

  function handleDelete(columnId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();

          formData.set("organizationId", organizationId);
          formData.set("tableDefinitionId", tableDefinitionId);
          formData.set("columnId", columnId);

          const result = await removeCustomTableColumnAction(formData);

          if (!result.success) {
            setErrorMessage(result.error);
            return;
          }

          setSuccessMessage(result.message);
          setConfirmDeleteId(null);
          router.refresh();
        } catch (error) {
          setErrorMessage(getErrorMessage(error));
        }
      })();
    });
  }

  const inputClassName =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">
            Column Definitions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the fields used by this operational table.
          </p>
        </div>

        {canManage && !isAdding && !editingColumnId && (
          <button
            type="button"
            onClick={beginAdd}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            Add Column
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {isAdding && canManage && (
        <form
          onSubmit={handleAdd}
          className="mt-6 space-y-5 rounded-xl border border-blue-200 bg-blue-50/50 p-5"
        >
          <h3 className="font-semibold text-gray-950">
            Add a Column
          </h3>

          <ColumnFormFields
            values={formValues}
            updateForm={updateForm}
            inputClassName={inputClassName}
            isPending={isPending}
            keyReadOnly={false}
          />

          <FormButtons
            isPending={isPending}
            onCancel={cancelForm}
            submitLabel="Add Column"
          />
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Position</th>
              <th className="px-4 py-3 font-semibold">Column</th>
              <th className="px-4 py-3 font-semibold">Key</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Required</th>
              <th className="px-4 py-3 font-semibold">Visible</th>
              <th className="px-4 py-3 font-semibold">Editable</th>
              {canManage && (
                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sortedColumns.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 8 : 7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No columns have been configured yet.
                  {canManage && (
                    <span className="mt-1 block">
                      Use Add Column to define the first field.
                    </span>
                  )}
                </td>
              </tr>
            ) : (
              sortedColumns.map((column) => (
                <tr key={column.id} className="align-top">
                  <td className="px-4 py-3 text-gray-600">
                    {editingColumnId === column.id ? (
                      <form
                        id={`edit-column-${column.id}`}
                        onSubmit={(event) =>
                          handleEdit(event, column.id)
                        }
                      >
                        <input
                          aria-label="Column position"
                          type="number"
                          min={0}
                          value={formValues.position}
                          onChange={(event) =>
                            updateForm("position", event.target.value)
                          }
                          className="w-20 rounded border border-gray-300 px-2 py-1"
                        />
                      </form>
                    ) : (
                      column.position
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-950">
                    {editingColumnId === column.id ? (
                      <input
                        form={`edit-column-${column.id}`}
                        aria-label="Column label"
                        value={formValues.label}
                        onChange={(event) =>
                          updateForm("label", event.target.value)
                        }
                        maxLength={120}
                        required
                        className="w-40 rounded border border-gray-300 px-2 py-1"
                      />
                    ) : (
                      column.label
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {column.columnKey}
                    </code>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {editingColumnId === column.id ? (
                      <select
                        form={`edit-column-${column.id}`}
                        aria-label="Column data type"
                        value={formValues.dataType}
                        onChange={(event) =>
                          updateForm("dataType", event.target.value)
                        }
                        className="rounded border border-gray-300 px-2 py-1"
                      >
                        {DATA_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      column.dataType
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {editingColumnId === column.id ? (
                      <input
                        form={`edit-column-${column.id}`}
                        type="checkbox"
                        aria-label="Required"
                        checked={formValues.isRequired}
                        onChange={(event) =>
                          updateForm("isRequired", event.target.checked)
                        }
                      />
                    ) : column.isRequired ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {editingColumnId === column.id ? (
                      <input
                        form={`edit-column-${column.id}`}
                        type="checkbox"
                        aria-label="Visible"
                        checked={formValues.isVisible}
                        onChange={(event) =>
                          updateForm("isVisible", event.target.checked)
                        }
                      />
                    ) : column.isVisible ? (
                      "Visible"
                    ) : (
                      "Hidden"
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {editingColumnId === column.id ? (
                      <input
                        form={`edit-column-${column.id}`}
                        type="checkbox"
                        aria-label="Editable"
                        checked={formValues.isEditable}
                        onChange={(event) =>
                          updateForm("isEditable", event.target.checked)
                        }
                      />
                    ) : column.isEditable ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </td>

                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {editingColumnId === column.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="submit"
                            form={`edit-column-${column.id}`}
                            disabled={isPending}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelForm}
                            disabled={isPending}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : confirmDeleteId === column.id ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-red-700">
                            Remove this column?
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(column.id)}
                              disabled={isPending}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Confirm
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={isPending}
                              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => beginEdit(column)}
                            disabled={isPending}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setErrorMessage(null);
                              setSuccessMessage(null);
                              setConfirmDeleteId(column.id);
                              setIsAdding(false);
                              setEditingColumnId(null);
                            }}
                            disabled={isPending}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Removing a column does not rewrite existing monthly column
        snapshots. Review historical data requirements before removing
        a field that has already been used.
      </p>
    </section>
  );
}

function ColumnFormFields({
  values,
  updateForm,
  inputClassName,
  isPending,
  keyReadOnly,
}: {
  values: ColumnFormValues;
  updateForm: <K extends keyof ColumnFormValues>(
    key: K,
    value: ColumnFormValues[K]
  ) => void;
  inputClassName: string;
  isPending: boolean;
  keyReadOnly: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="new-column-label"
            className="block text-sm font-medium text-gray-700"
          >
            Column Label *
          </label>
          <input
            id="new-column-label"
            value={values.label}
            onChange={(event) => {
              const label = event.target.value;
              updateForm("label", label);

              if (!keyReadOnly) {
                updateForm("columnKey", normalizeColumnKey(label));
              }
            }}
            maxLength={120}
            required
            disabled={isPending}
            placeholder="e.g. Role Details"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="new-column-key"
            className="block text-sm font-medium text-gray-700"
          >
            Column Key *
          </label>
          <input
            id="new-column-key"
            value={values.columnKey}
            onChange={(event) =>
              updateForm("columnKey", event.target.value)
            }
            maxLength={100}
            required
            disabled={isPending || keyReadOnly}
            placeholder="role_details"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="new-column-type"
            className="block text-sm font-medium text-gray-700"
          >
            Data Type *
          </label>
          <select
            id="new-column-type"
            value={values.dataType}
            onChange={(event) =>
              updateForm("dataType", event.target.value)
            }
            disabled={isPending}
            className={inputClassName}
          >
            {DATA_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="new-column-position"
            className="block text-sm font-medium text-gray-700"
          >
            Display Position
          </label>
          <input
            id="new-column-position"
            type="number"
            min={0}
            value={values.position}
            onChange={(event) =>
              updateForm("position", event.target.value)
            }
            disabled={isPending}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.isRequired}
            onChange={(event) =>
              updateForm("isRequired", event.target.checked)
            }
            disabled={isPending}
          />
          Required
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.isVisible}
            onChange={(event) =>
              updateForm("isVisible", event.target.checked)
            }
            disabled={isPending}
          />
          Visible
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.isEditable}
            onChange={(event) =>
              updateForm("isEditable", event.target.checked)
            }
            disabled={isPending}
          />
          Editable
        </label>
      </div>
    </>
  );
}

function FormButtons({
  isPending,
  onCancel,
  submitLabel,
}: {
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}