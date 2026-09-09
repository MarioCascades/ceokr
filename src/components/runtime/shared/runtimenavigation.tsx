import type {
  UserManagementRecord,
} from "@/lib/types/domain/usermanagement";

interface RuntimeNavigationProps {
  organizationId: string;

  members: UserManagementRecord[];

  selectedSubjectId?: string;
}

function getDisplayName(
  record: UserManagementRecord
): string {
  return (
    record.user.display_name?.trim() ||
    `${record.user.first_name} ${record.user.last_name}`.trim() ||
    record.user.email
  );
}

export default function RuntimeNavigation({
  organizationId,

  members,

  selectedSubjectId,
}: RuntimeNavigationProps) {
  const organizationHref =
    `/runtime?organizationId=${encodeURIComponent(
      organizationId
    )}`;

  return (
    <nav
      aria-label="Performance navigation"
      className="overflow-x-auto rounded-2xl border bg-card shadow-sm"
    >
      <div className="flex min-w-max items-center gap-2 p-3">

        {/* Main / Organization Performance */}

        <a
          href={
            organizationHref
          }
          className={
            `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ` +
            (
              !selectedSubjectId
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )
          }
        >
          Main
        </a>


        {/* Dashboard */}

        <a
          href="#dashboard"
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Dashboard
        </a>


        {/* Organization Members */}

        {members.map(
          (member) => {
            const href =
              `/runtime?organizationId=${encodeURIComponent(
                organizationId
              )}&subjectId=${encodeURIComponent(
                member.user.id
              )}`;

            const isSelected =
              selectedSubjectId ===
              member.user.id;

            return (
              <a
                key={
                  member.user.id
                }
                href={
                  href
                }
                className={
                  `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ` +
                  (
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )
                }
              >
                {
                  getDisplayName(
                    member
                  )
                }
              </a>
            );
          }
        )}

      </div>
    </nav>
  );
}