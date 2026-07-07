import { ReactNode } from "react";

interface CEPageHeaderProps {
  title: string;
  description?: string;
  rightContent?: ReactNode;
}

export default function CEPageHeader({
  title,
  description,
  rightContent,
}: CEPageHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

        <div>

          <h1 className="text-3xl font-bold text-foreground">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          )}

        </div>

        {rightContent && (
          <div className="flex items-center gap-3">
            {rightContent}
          </div>
        )}

      </div>
    </header>
  );
}