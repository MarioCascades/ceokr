import MemberWorkspace from "@/components/member/memberworkspace";

import {
  loadMemberPerformance,
} from "@/lib/runtime/loadmemberperformance";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  getUser,
} from "@/services/user.service";

interface MemberPageProps {
  searchParams: Promise<{
    organizationId?: string;
    subjectId?: string;
    performanceMonth?: string;
  }>;
}

export default async function MemberPage({
  searchParams,
}: MemberPageProps) {
  const params =
    await searchParams;

  if (
    !params.organizationId ||
    !params.subjectId
  ) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Member context required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Select an organization and member
          from the Development Workspace.
        </p>
      </main>
    );
  }

  const organization =
    await getOrganization(
      params.organizationId
    );

  if (!organization) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Organization not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested organization could not
          be found.
        </p>
      </main>
    );
  }

  const user =
    await getUser(
      params.subjectId
    );

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          Member not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested member could not
          be found.
        </p>
      </main>
    );
  }

  const execution =
    await loadMemberPerformance(
      user,
      organization.id,
      params.performanceMonth
    );

  if (!execution) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">
          No performance instance found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          No monthly performance instance is
          available for this member.
        </p>
      </main>
    );
  }

  return (
    <MemberWorkspace
      execution={execution}
    />
  );
}