import MemberOKRWorkspace from "@/components/admin/users/memberokrworkspace";

interface MemberOKRPageProps {
  searchParams: Promise<{
    organizationId?: string;
    subjectId?: string;
  }>;
}

export default async function MemberOKRPage({
  searchParams,
}: MemberOKRPageProps) {
  const params =
    await searchParams;

  if (
    !params.organizationId ||
    !params.subjectId
  ) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <h1 className="text-2xl font-semibold">
          Member context required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a member from the Users page.
        </p>
      </main>
    );
  }

  return (
    <MemberOKRWorkspace
      organizationId={
        params.organizationId
      }
      subjectId={
        params.subjectId
      }
    />
  );
}
