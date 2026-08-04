import PerformanceSheet from "@/components/runtime/performancesheet/performancesheet";
import { initialBuilderDocument } from "@/lib/builder/builderdefaults";

export default function RuntimePage() {
  return (
    <PerformanceSheet
      document={initialBuilderDocument}
    />
  );
}