import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-10">

        <div>
          <h1 className="text-4xl font-bold">
            Administration
          </h1>

          <p className="mt-2 text-muted-foreground">
            Configure and manage every aspect of your CascadEffects Performance Platform.
          </p>
        </div>

        {/* Organization */}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Organization
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <AdminCard
              title="🏢 Organization"
              description="Manage organization profile, branding and configuration."
              href="/admin/organization"
            />

            <AdminCard
              title="🏛 Departments"
              description="Create, edit and manage departments."
              href="/admin/departments"
            />

            <AdminCard
              title="👥 Teams"
              description="Create and organize teams."
              href="/admin/teams"
            />

            <AdminCard
              title="👤 Users"
              description="Invite and manage users."
              href="/admin/users"
            />

            <AdminCard
              title="🔐 Roles & Permissions"
              description="Control security and user access."
              href="/admin/roles"
            />

          </div>
        </section>

        {/* Performance */}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Performance
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <AdminCard
              title="🎯 Objectives"
              description="Manage organizational objectives."
              href="/admin/objectives"
            />

            <AdminCard
              title="📈 Key Results"
              description="Manage measurable outcomes."
              href="/admin/key-results"
            />

            <AdminCard
              title="🚀 Initiatives"
              description="Manage strategic initiatives."
              href="/admin/initiatives"
            />

          </div>
        </section>

        {/* Analytics */}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Analytics
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <AdminCard
              title="📊 Dashboards"
              description="Configure dashboards and widgets."
              href="/admin/dashboards"
            />

            <AdminCard
              title="📑 Reports"
              description="Generate and manage reports."
              href="/admin/reports"
            />

          </div>
        </section>

        {/* Platform */}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Platform
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <AdminCard
              title="⚙️ Settings"
              description="Platform-wide configuration."
              href="/admin/settings"
            />

            <AdminCard
              title="🤖 AI Configuration"
              description="Configure AI assistants and automation."
              href="/admin/ai"
            />

          </div>
        </section>

      </div>
    </main>
  );
}

function AdminCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>

      <Button asChild className="mt-6">
        <Link href={href}>
          Open
        </Link>
      </Button>
    </div>
  );
}