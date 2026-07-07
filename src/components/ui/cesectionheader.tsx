import { ReactNode } from "react";

interface CESectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function CESectionHeader({
  title,
  subtitle,
  icon,
  actions,
}: CESectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-6">

      <div className="flex items-start gap-3">

        {icon && (
          <div className="mt-1 text-primary">
            {icon}
          </div>
        )}

        <div>

          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}

    </div>
  );
}