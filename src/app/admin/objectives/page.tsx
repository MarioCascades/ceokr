import ObjectivesPage from "@/components/admin/objectives/objectivespage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <ObjectivesPage
      organizationId={params.organizationId}
    />
  );
}