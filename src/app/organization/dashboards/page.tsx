import { Suspense } from "react";

import DashboardPage from "@/components/admin/dashboards/dashboardpage";

function DashboardPageFallback() {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Loading Dashboards…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPage />
    </Suspense>
  );
}