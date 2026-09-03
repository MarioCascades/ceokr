"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AdminBackLink() {
  const searchParams = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  const href = organizationId
    ? `/admin?organizationId=${encodeURIComponent(
        organizationId
      )}`
    : "/admin";

  return (
    <Link
      href={href}
      className="rounded-md border bg-white px-4 py-2 text-sm font-medium"
    >
      Back to Administration
    </Link>
  );
}