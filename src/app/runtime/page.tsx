import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";

import { runtimePreviewDocument } from "@/lib/builder/runtimepreviewdocument";

export default function RuntimePage() {
  return (
    <PerformanceSheet
      document={runtimePreviewDocument}
    />
  );
}