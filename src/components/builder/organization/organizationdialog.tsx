"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import CEDialog from "@/components/ui/cedialog";
import CEField from "@/components/ui/cefield";
import CEInput from "@/components/ui/ceinput";

import { BuilderOrganization } from "@/lib/types/builderdocument";

import { useBuilder } from "@/components/builder/context/buildercontext";

interface OrganizationDialogProps {
  organization: BuilderOrganization;

  open: boolean;

  onClose: () => void;
}

export default function OrganizationDialog({
  organization,
  open,
  onClose,
}: OrganizationDialogProps) {
  const { updateOrganization } = useBuilder();

  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    setCompanyName(organization.companyName);
    setTagline(organization.tagline ?? "");
    setLogoUrl(organization.logoUrl ?? "");
  }, [organization, open]);

  function handleSave() {
    updateOrganization({
      companyName,
      tagline,
      logoUrl,
    });

    onClose();
  }

  return (
    <CEDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
      title="Configure Organization"
      description="Configure the organization details shown on the Performance Sheet."
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        <CEField
          label="Company Name"
          required
        >
          <CEInput
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
            placeholder="Enter company name"
          />
        </CEField>

        <CEField
          label="Tagline"
        >
          <CEInput
            value={tagline}
            onChange={(e) =>
              setTagline(e.target.value)
            }
            placeholder="Enter company tagline"
          />
        </CEField>

        <CEField
          label="Logo URL"
        >
          <CEInput
            value={logoUrl}
            onChange={(e) =>
              setLogoUrl(e.target.value)
            }
            placeholder="https://..."
          />
        </CEField>

      </div>
    </CEDialog>
  );
}