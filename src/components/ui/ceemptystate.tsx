import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CEEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export default function CEEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: CEEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-8 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-primary">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-muted-foreground">
          {description}
        </p>
      )}

      {actionLabel && (
        <Button
          className="mt-6"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}