"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CEInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const CEInput = React.forwardRef<HTMLInputElement, CEInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
          "placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

CEInput.displayName = "CEInput";

export default CEInput;