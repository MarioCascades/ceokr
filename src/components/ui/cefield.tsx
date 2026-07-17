"use client";

import { ReactNode } from "react";

interface CEFieldProps {
  label: string;

  description?: string;

  required?: boolean;

  children: ReactNode;
}

export default function CEField({
  label,
  description,
  required = false,
  children,
}: CEFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}