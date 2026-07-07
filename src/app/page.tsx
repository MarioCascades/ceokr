import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold">
          Welcome to CascadEffects
        </h1>

        <p className="text-xl text-muted-foreground">
          Build your organization's performance system.
        </p>

        <Button asChild size="lg">
          <Link href="/organization/setup">
            Start Setup
          </Link>
        </Button>
      </div>
    </main>
  );
}