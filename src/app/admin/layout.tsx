export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 border-r bg-white p-6">
          <h2 className="text-xl font-bold">
            Administration
          </h2>

          <nav className="mt-8 space-y-3">
            <div>Organization</div>
            <div>Departments</div>
            <div>Teams</div>
            <div>Users</div>
            <div>Roles</div>
            <div>Objectives</div>
            <div>Key Results</div>
            <div>Initiatives</div>
            <div>Dashboards</div>
            <div>Settings</div>
          </nav>
        </aside>

        <section className="flex-1 p-10">
          {children}
        </section>
      </div>
    </main>
  );
}