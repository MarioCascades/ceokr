"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CETextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const CETextArea = React.forwardRef<
  HTMLTextAreaElement,
  CETextAreaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

CETextArea.displayName = "CETextArea";

export default CETextArea;