import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CEBadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  className?: string;
}

export default function CEBadge({
  children,
  variant = "default",
  className,
}: CEBadgeProps) {
  const variants = {
    default:
      "bg-muted text-muted-foreground",

    primary:
      "bg-primary text-primary-foreground",

    secondary:
      "bg-secondary text-secondary-foreground",

    success:
      "bg-green-100 text-green-700",

    warning:
      "bg-amber-100 text-amber-700",

    danger:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}