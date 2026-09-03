import InitiativesPage from "@/components/admin/initiatives/initiativespage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <InitiativesPage
      organizationId={params.organizationId}
    />
  );
}