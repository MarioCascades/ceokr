import { Button } from "@/components/ui/button";
import CECard from "@/components/ui/cecard";

interface OrganizationSectionProps {
  companyName?: string;
}

export default function OrganizationSection({
  companyName,
}: OrganizationSectionProps) {
  return (
    <CECard>

      <div className="flex justify-end">

        <Button variant="outline">
          Configure
        </Button>

      </div>

      <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 px-10 py-12 text-center">

        {/* Logo */}

        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white">

          <span className="text-sm italic text-slate-400">
            Logo Placeholder
          </span>

        </div>

        {/* Organization */}

        <h2 className="mt-8 text-4xl font-bold italic text-slate-400">

          {companyName ?? "Organization Name Placeholder"}

        </h2>

        <p className="mt-3 text-lg font-medium text-slate-600">
          Performance Management Platform
        </p>

        <p className="mt-2 italic text-slate-400">
          Organization Tagline Placeholder
        </p>

      </div>

    </CECard>
  );
}