import AdminPlaceholderPage from "@/components/admin/shared/adminplaceholderpage";
import CustomReportNotice from "@/components/admin/shared/customreportnotice";

export default function Page() {
  return (
    <>
      <AdminPlaceholderPage
        title="Reports"
        description="Organization-aware performance reporting."
      />

      <CustomReportNotice />
    </>
  );
}