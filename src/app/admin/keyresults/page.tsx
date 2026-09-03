import KeyResultsPage from "@/components/admin/keyresults/keyresultspage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <KeyResultsPage
      organizationId={params.organizationId}
    />
  );
}