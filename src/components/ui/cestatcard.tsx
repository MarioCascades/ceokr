import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CEStatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export default function CEStatCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: CEStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <div className="mt-3 text-2xl font-bold text-foreground">
            {value}
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

        </div>

        {icon && (
          <div className="text-primary">
            {icon}
          </div>
        )}

      </div>
    </div>
  );
}