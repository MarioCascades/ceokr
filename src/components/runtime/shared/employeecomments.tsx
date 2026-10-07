"use client";

import {
  useEffect,
  useState,
} from "react";

interface EmployeeCommentsProps {
  initialComments?: string;

  label: string;

  placeholder: string;

  helpText: string;

  editing?: boolean;

  onChange?: (
    comments: string
  ) => void;
}

export default function EmployeeComments({
  initialComments,
  label,
  placeholder,
  helpText,
  editing = false,
  onChange,
}: EmployeeCommentsProps) {

  const [
    comments,
    setComments,
  ] = useState(
    initialComments ?? ""
  );


  useEffect(() => {

    setComments(
      initialComments ?? ""
    );

  }, [
    initialComments,
  ]);


  function handleChange(
    value: string
  ) {

    setComments(
      value
    );

    onChange?.(
      value
    );

  }


  return (

    <section
      className="
        rounded-lg
        border
        bg-white
        p-6
        shadow-sm
      "
    >

      <h2
        className="
          text-xl
          font-semibold
        "
      >
        {label}
      </h2>


      <textarea
        value={
          comments
        }

        onChange={(
          event
        ) =>
          handleChange(
            event.target.value
          )
        }

        disabled={
          !editing
        }

        placeholder={
          placeholder
        }

        className={`
          mt-4
          min-h-[140px]
          w-full
          rounded-md
          border
          p-4
          ${
            editing
              ? "bg-white"
              : "bg-gray-100 text-gray-700"
          }
        `}
      />


      <p
        className="
          mt-2
          text-sm
          text-muted-foreground
        "
      >
        {helpText}
      </p>

    </section>

  );

}