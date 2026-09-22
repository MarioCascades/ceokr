import { Suspense, type ReactNode } from "react";

import OrganizationShell from "./organizationshell";

type OrganizationLayoutProps = {
  children: ReactNode;
};

export default function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100">
          <div className="p-6 text-sm text-muted-foreground">
            Loading Organization Workspace…
          </div>
        </div>
      }
    >
      <OrganizationShell>
        {children}
      </OrganizationShell>
    </Suspense>
  );
}