import CompanyStep from "@/components/setup/company-step";

export default function SetupPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Organization Setup
          </h1>

          <p className="mt-2 text-muted-foreground">
            Configure your organization before using the platform.
          </p>
        </div>

        <CompanyStep />

      </div>
    </main>
  );
}