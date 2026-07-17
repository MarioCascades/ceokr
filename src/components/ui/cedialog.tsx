"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  children: React.ReactNode;

  footer?: React.ReactNode;

  size?: "sm" | "md" | "lg" | "xl";
}

export default function CEDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
}: CEDialogProps) {
  const widths = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={widths[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}