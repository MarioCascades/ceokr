"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface OrganizationDialogProps {
  companyName: string;
  tagline: string;

  open: boolean;
  onClose: () => void;
}

export default function OrganizationDialog({
  companyName,
  tagline,
  open,
  onClose,
}: OrganizationDialogProps) {
  const [name, setName] = useState(companyName);

  const [organizationTagline, setOrganizationTagline] =
    useState(tagline);

  useEffect(() => {
    setName(companyName);
    setOrganizationTagline(tagline);
  }, [companyName, tagline, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">

        <h2 className="text-2xl font-bold">
          Configure Organization
        </h2>

        <div className="mt-8 space-y-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Company Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Tagline
            </label>

            <input
              value={organizationTagline}
              onChange={(e) =>
                setOrganizationTagline(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />

          </div>

        </div>

        <div className="mt-10 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button>
            Save
          </Button>

        </div>

      </div>

    </div>
  );
}