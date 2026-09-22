"use client";

import {
  useState,
} from "react";

interface InitiativeEditorProps {
  initialText?: string;

  onCancel: () => void;

  onSave: (
    text: string
  ) => Promise<void>;

  saving?: boolean;
}

export default function InitiativeEditor({
  initialText = "",
  onCancel,
  onSave,
  saving = false,
}: InitiativeEditorProps) {
  const [
    text,
    setText,
  ] = useState(
    initialText
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const trimmed =
      text.trim();

    if (!trimmed) {
      setError(
        "Initiative text is required."
      );

      return;
    }

    setError(null);

    try {
      await onSave(
        trimmed
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save Initiative."
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-md border bg-white p-4"
    >
      <div>
        <label
          htmlFor="initiative-text"
          className="text-xs font-medium uppercase tracking-wide text-gray-500"
        >
          Initiative
        </label>

        <textarea
          id="initiative-text"
          value={text}
          onChange={(
            event
          ) =>
            setText(
              event.target.value
            )
          }
          rows={3}
          autoFocus
          placeholder="Describe the initiative..."
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
          disabled={
            saving
          }
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={
            saving
          }
          className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Initiative"}
        </button>

        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            saving
          }
          className="rounded-md border bg-white px-3 py-2 text-xs font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}