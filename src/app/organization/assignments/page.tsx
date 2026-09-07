import { Suspense } from "react";

import AssignmentsPage from "@/components/admin/assignments/assignmentspage";

function AssignmentsPageFallback() {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Loading Assignments…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AssignmentsPageFallback />}>
      <AssignmentsPage />
    </Suspense>
  );
}