import MemberOKRPerformance from "@/components/member/memberokrperformance";

import {
  loadMemberOKRPerformance,
} from "@/lib/member/loadmemberokrperformance";

import {
  getOrganization,
} from "@/services/organization.service";

import {
  listUserManagementRecords,
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


  /* ========================================================
     Member Context
  ======================================================== */

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


  /* ========================================================
     Organization
  ======================================================== */

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


  /* ========================================================
     Member Performance + Organization Members
     --------------------------------------------------------
     The selected member provides the displayed
     Performance Sheet.

     The organization membership list provides
     the automatic Performance Sheet tabs.
  ======================================================== */

  const [
    performance,
    memberRecords,
  ] = await Promise.all([

    loadMemberOKRPerformance(
      organization.id,
      params.subjectId,
      params.performanceMonth
    ),

    listUserManagementRecords(
      organization.id
    ),

  ]);


  if (!performance) {

    return (
      <main className="mx-auto max-w-5xl p-8">

        <h1 className="text-2xl font-semibold">
          Member not available
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The requested member is not an active
          member of this organization.
        </p>

      </main>
    );
  }


  /* ========================================================
     Automatic Performance Sheet Tabs
     --------------------------------------------------------
     Every active organization member becomes
     a Performance Sheet tab automatically.

     No manual tab creation is required.
  ======================================================== */

  const memberTabs =
    memberRecords
      .filter(
        (record) =>
          record.user.is_active
      )
      .map(
        (record) => ({
          id:
            record.user.id,

          label:
            record.user.display_name?.trim() ||
            `${record.user.first_name} ${record.user.last_name}`.trim() ||
            record.user.email,
        })
      );


  /* ========================================================
     Member Performance Experience
  ======================================================== */

  return (
    <MemberOKRPerformance
      performance={
        performance
      }

      memberTabs={
        memberTabs
      }
    />
  );
}