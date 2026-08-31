import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Back to Administration
          </Link>

          {actions}
        </div>
      </div>
    </div>
  );
}