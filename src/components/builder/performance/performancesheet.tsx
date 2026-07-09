import { ReactNode } from "react";

interface PerformanceSheetProps {
  children: ReactNode;
}

export default function PerformanceSheet({
  children,
}: PerformanceSheetProps) {
  return (
    <section className="space-y-6">
      {children}
    </section>
  );
}