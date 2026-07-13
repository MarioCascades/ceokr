import { ReactNode } from "react";

interface BuilderSectionProps {
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
}

export default function BuilderSection({
  title,
  children,
  toolbar,
}: BuilderSectionProps) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b px-6 py-4">

        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        {toolbar && (
          <div>
            {toolbar}
          </div>
        )}

      </div>

      <div className="p-6">

        {children}

      </div>

    </section>
  );
}