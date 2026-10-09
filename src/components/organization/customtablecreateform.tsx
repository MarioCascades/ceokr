"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomTableAction } from "@/app/organization/customtables/actions";
import type { CreateCustomTableDefinitionInput } from "@/lib/types/domain/customtable";

type CustomTableCreateFormProps = {
  organizationId: string;
  onCancel?: () => void;
};

type FormValues = {
  name: string;
  tableKey: string;
  description: string;
  runtimeTabKey: string;
  isEnabled: boolean;
};

const INITIAL_VALUES: FormValues = {
  name: "",
  tableKey: "",
  description: "",
  runtimeTabKey: "",
  isEnabled: true,
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function isValidKey(value: string): boolean {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value);
}

export default function CustomTableCreateForm({
  organizationId,
  onCancel,
}: CustomTableCreateFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tableKeyManuallyEdited, setTableKeyManuallyEdited] =
    useState(false);
  const [runtimeTabKeyManuallyEdited, setRuntimeTabKeyManuallyEdited] =
    useState(false);

  function updateName(name: string) {
    setValues((current) => {
      const nextTableKey = tableKeyManuallyEdited
        ? current.tableKey
        : normalizeKey(name);

      const nextRuntimeTabKey = runtimeTabKeyManuallyEdited
        ? current.runtimeTabKey
        : normalizeKey(nextTableKey);

      return {
        ...current,
        name,
        tableKey: nextTableKey,
        runtimeTabKey: nextRuntimeTabKey,
      };
    });
  }

  function updateTableKey(tableKey: string) {
    setTableKeyManuallyEdited(true);

    setValues((current) => ({
      ...current,
      tableKey,
      runtimeTabKey: runtimeTabKeyManuallyEdited
        ? current.runtimeTabKey
        : normalizeKey(tableKey),
    }));
  }

  function updateRuntimeTabKey(runtimeTabKey: string) {
    setRuntimeTabKeyManuallyEdited(true);

    setValues((current) => ({
      ...current,
      runtimeTabKey,
    }));
  }

  function resetForm() {
    setValues(INITIAL_VALUES);
    setTableKeyManuallyEdited(false);
    setRuntimeTabKeyManuallyEdited(false);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!organizationId.trim()) {
      setErrorMessage("The organization context is missing.");
      return;
    }

    if (!values.name.trim()) {
      setErrorMessage("Enter a table name.");
      return;
    }

    if (values.name.trim().length > 120) {
      setErrorMessage("Table name cannot exceed 120 characters.");
      return;
    }

    const tableKey = normalizeKey(values.tableKey);
    const runtimeTabKey =
      normalizeKey(values.runtimeTabKey) || tableKey;

    if (!tableKey || !isValidKey(tableKey)) {
      setErrorMessage(
        "Enter a valid table key using lowercase letters, numbers, hyphens, or underscores."
      );
      return;
    }

    if (tableKey.length > 100) {
      setErrorMessage("Table key cannot exceed 100 characters.");
      return;
    }

    if (!isValidKey(runtimeTabKey)) {
      setErrorMessage(
        "Enter a valid Runtime tab key using lowercase letters, numbers, hyphens, or underscores."
      );
      return;
    }

    if (runtimeTabKey.length > 100) {
      setErrorMessage(
        "Runtime tab key cannot exceed 100 characters."
      );
      return;
    }

    if (values.description.trim().length > 1000) {
      setErrorMessage(
        "Description cannot exceed 1,000 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateCustomTableDefinitionInput = {
        organizationId: organizationId.trim(),
        name: values.name.trim(),
        tableKey,
        description: values.description.trim(),
        runtimeTabKey,
        isEnabled: values.isEnabled,
      };

      const formData = new FormData();

      formData.set("organizationId", input.organizationId);
      formData.set("name", input.name);
      formData.set("tableKey", input.tableKey);
      formData.set("description", input.description ?? "");
      formData.set("runtimeTabKey", input.runtimeTabKey ?? "");
      formData.set("isEnabled", String(input.isEnabled));

      const result = await createCustomTableAction(formData);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setSuccessMessage("Custom Table created successfully.");
      resetForm();

      router.refresh();
      router.push(
        `/organization/customtables/${result.table.id}?organizationId=${encodeURIComponent(
          organizationId
        )}`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the Custom Table. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const labelClassName =
    "block text-sm font-medium text-slate-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Create Custom Table
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure a reusable operational table for your organization.
          You can manage its columns and availability after creating it.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="custom-table-name" className={labelClassName}>
            Table Name <span className="text-red-600">*</span>
          </label>
          <input
            id="custom-table-name"
            name="name"
            type="text"
            value={values.name}
            onChange={(event) => updateName(event.target.value)}
            placeholder="e.g. Recruitment"
            maxLength={120}
            required
            disabled={isSubmitting}
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-slate-500">
            The name displayed to administrators and Runtime users.
          </p>
        </div>

        <div>
          <label htmlFor="custom-table-key" className={labelClassName}>
            Table Key <span className="text-red-600">*</span>
          </label>
          <input
            id="custom-table-key"
            name="tableKey"
            type="text"
            value={values.tableKey}
            onChange={(event) => updateTableKey(event.target.value)}
            placeholder="recruitment"
            maxLength={100}
            required
            disabled={isSubmitting}
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-slate-500">
            A stable identifier used internally. Use lowercase letters,
            numbers, hyphens, or underscores.
          </p>
        </div>

        <div>
          <label
            htmlFor="custom-table-runtime-tab-key"
            className={labelClassName}
          >
            Runtime Tab Key
          </label>
          <input
            id="custom-table-runtime-tab-key"
            name="runtimeTabKey"
            type="text"
            value={values.runtimeTabKey}
            onChange={(event) =>
              updateRuntimeTabKey(event.target.value)
            }
            placeholder="recruitment"
            maxLength={100}
            disabled={isSubmitting}
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-slate-500">
            Defaults to the table key. This identifies the Runtime
            navigation tab associated with the table.
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="custom-table-description"
            className={labelClassName}
          >
            Description
          </label>
          <textarea
            id="custom-table-description"
            name="description"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Describe the purpose of this operational table."
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label
              htmlFor="custom-table-enabled"
              className="text-sm font-medium text-slate-900"
            >
              Enable Custom Table
            </label>
            <p className="mt-1 text-sm text-slate-500">
              Enabled tables are eligible to appear in Runtime when
              the corresponding navigation configuration is available.
            </p>
          </div>

          <button
            id="custom-table-enabled"
            type="button"
            role="switch"
            aria-checked={values.isEnabled}
            aria-label="Enable Custom Table"
            disabled={isSubmitting}
            onClick={() =>
              setValues((current) => ({
                ...current,
                isEnabled: !current.isEnabled,
              }))
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              values.isEnabled ? "bg-blue-600" : "bg-slate-300"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                values.isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <p className="mt-2 text-xs font-medium text-slate-600">
          {values.isEnabled ? "Enabled" : "Disabled"}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Custom Table"}
        </button>
      </div>
    </form>
  );
}