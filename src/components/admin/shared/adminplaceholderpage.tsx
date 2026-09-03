import AdminPageHeader from "@/components/admin/shared/adminpageheader";

export default function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto max-w-7xl">
      <AdminPageHeader
        title={title}
        description={description}
      />

      <section className="rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold">
          Coming next
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          This Administration surface is reserved for the
          platform capability described above. The route is
          intentionally present so navigation remains complete
          while the capability is implemented.
        </p>
      </section>
    </main>
  );
}
