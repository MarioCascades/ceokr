import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CECardProps {
  children: ReactNode;
  className?: string;
}

export default function CECard({
  children,
  className,
}: CECardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </section>
  );
}