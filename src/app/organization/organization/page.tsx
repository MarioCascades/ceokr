"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getOrganization,
  updateOrganization,
} from "@/services/organization.service";

import type { Organization } from "@/lib/types/organization";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

/* ==========================================================
   Organization Admin — Organization Settings
========================================================== */

export default function OrganizationAdminOrganizationPage() {
  const searchParams = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [reportingFrequency, setReportingFrequency] =
    useState("monthly");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* ========================================================
     Load Current Organization
  ======================================================== */

  useEffect(() => {
    let active = true;

    async function loadOrganization() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setIsSaved(false);

        if (!organizationId) {
          if (active) {
            setOrganization(null);
            setErrorMessage(
              "No organization context is currently selected."
            );
          }

          return;
        }

        const existingOrganization =
          await getOrganization(organizationId);

        if (!active) {
          return;
        }

        if (!existingOrganization) {
          setOrganization(null);
          setErrorMessage(
            "The selected organization could not be found."
          );

          return;
        }

        setOrganization(existingOrganization);

        setCompanyName(
          existingOrganization.company_name
        );

        setLogoUrl(
          existingOrganization.logo_url ?? ""
        );

        setPrimaryColor(
          existingOrganization.primary_color ?? ""
        );

        setSecondaryColor(
          existingOrganization.secondary_color ?? ""
        );

        setTimezone(
          existingOrganization.timezone || "UTC"
        );

        setReportingFrequency(
          existingOrganization.reporting_frequency ||
            "monthly"
        );
      } catch (error) {
        console.error(
          "Failed to load organization:",
          error
        );

        if (active) {
          setOrganization(null);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load organization."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOrganization();

    return () => {
      active = false;
    };
  }, [organizationId]);

  /* ========================================================
     Save Organization
  ======================================================== */

  async function handleSave() {
    if (!organization) {
      return;
    }

    if (!companyName.trim()) {
      setErrorMessage("Company name is required.");
      setIsSaved(false);

      return;
    }

    setIsSaving(true);
    setIsSaved(false);
    setErrorMessage(null);

    try {
      const updatedOrganization =
        await updateOrganization(
          organization.id,
          {
            company_name: companyName.trim(),

            logo_url:
              logoUrl.trim() || null,

            primary_color:
              primaryColor.trim() || null,

            secondary_color:
              secondaryColor.trim() || null,

            timezone:
              timezone.trim() || "UTC",

            reporting_frequency:
              reportingFrequency,
          }
        );

      setOrganization(updatedOrganization);

      setCompanyName(
        updatedOrganization.company_name
      );

      setLogoUrl(
        updatedOrganization.logo_url ?? ""
      );

      setPrimaryColor(
        updatedOrganization.primary_color ?? ""
      );

      setSecondaryColor(
        updatedOrganization.secondary_color ?? ""
      );

      setTimezone(
        updatedOrganization.timezone || "UTC"
      );

      setReportingFrequency(
        updatedOrganization.reporting_frequency ||
          "monthly"
      );

      setIsSaved(true);
    } catch (error) {
      console.error(
        "Failed to update organization:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save organization."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Loading State
  ======================================================== */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Loading organization...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     Missing Organization Context
  ======================================================== */

  if (!organization) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="mx-auto max-w-4xl space-y-8">

          <AdminPageHeader
            title="Organization"
            description="Manage your organization's profile, branding and reporting configuration."
            showOrganizationSelector={false}
          />

          {errorMessage && (
            <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </section>
          )}

        </div>
      </main>
    );
  }

  /* ========================================================
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ==================================================
            Header
        ================================================== */}

        <AdminPageHeader
          title="Organization"
          description="Manage your organization's profile, branding and reporting configuration."
          showOrganizationSelector={false}
        />

        {/* ==================================================
            Organization Context
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl">
                  🏢
                </span>

                <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                  {organization.company_name}
                </h2>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                You are managing this organization's configuration.
              </p>
            </div>

            <div className="rounded-md border bg-gray-50 px-4 py-2 text-xs text-muted-foreground">
              Organization context active
            </div>

          </div>
        </section>

        {/* ==================================================
            Error
        ================================================== */}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ==================================================
            Organization Profile
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-6">

            <div>
              <h2 className="text-xl font-semibold">
                Organization Profile
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Core organization information used throughout the platform.
              </p>
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="mb-2 block text-sm font-medium"
              >
                Company Name
              </label>

              <Input
                id="company-name"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(
                    event.target.value
                  )
                }
                placeholder="Organization name"
              />
            </div>

            <div>
              <label
                htmlFor="logo-url"
                className="mb-2 block text-sm font-medium"
              >
                Logo URL
              </label>

              <Input
                id="logo-url"
                value={logoUrl}
                onChange={(event) =>
                  setLogoUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Optional. This can be used for organization-level branding.
              </p>
            </div>

          </div>
        </section>

        {/* ==================================================
            Branding
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-6">

            <div>
              <h2 className="text-xl font-semibold">
                Branding
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Configure organization-level presentation settings.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label
                  htmlFor="primary-color"
                  className="mb-2 block text-sm font-medium"
                >
                  Primary Color
                </label>

                <Input
                  id="primary-color"
                  value={primaryColor}
                  onChange={(event) =>
                    setPrimaryColor(
                      event.target.value
                    )
                  }
                  placeholder="#000000"
                />
              </div>

              <div>
                <label
                  htmlFor="secondary-color"
                  className="mb-2 block text-sm font-medium"
                >
                  Secondary Color
                </label>

                <Input
                  id="secondary-color"
                  value={secondaryColor}
                  onChange={(event) =>
                    setSecondaryColor(
                      event.target.value
                    )
                  }
                  placeholder="#FFFFFF"
                />
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            Reporting Configuration
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-6">

            <div>
              <h2 className="text-xl font-semibold">
                Reporting Configuration
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Organization-wide defaults used by performance and reporting workflows.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label
                  htmlFor="timezone"
                  className="mb-2 block text-sm font-medium"
                >
                  Timezone
                </label>

                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(event) =>
                    setTimezone(
                      event.target.value
                    )
                  }
                  placeholder="UTC"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Reporting Frequency
                </label>

                <Select
                  value={reportingFrequency}
                  onValueChange={
                    setReportingFrequency
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="monthly">
                      Monthly
                    </SelectItem>

                    <SelectItem value="weekly">
                      Weekly
                    </SelectItem>

                    <SelectItem value="quarterly">
                      Quarterly
                    </SelectItem>
                  </SelectContent>
                </Select>

                <p className="mt-2 text-xs text-muted-foreground">
                  Monthly remains the platform's current standard cadence.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            Organization Status
        ================================================== */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-3">

            <h2 className="text-xl font-semibold">
              Organization Status
            </h2>

            <div className="text-sm">
              <span className="text-muted-foreground">
                Organization ID:
              </span>{" "}
              <span className="font-mono">
                {organization.id}
              </span>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">
                Setup:
              </span>{" "}
              <span className="font-medium">
                {organization.setup_completed
                  ? "Complete"
                  : "Incomplete"}
              </span>
            </div>

          </div>
        </section>

        {/* ==================================================
            Save
        ================================================== */}

        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div>
            {isSaved ? (
              <p className="text-sm font-medium text-green-700">
                ✓ Organization saved successfully.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save changes to update the organization configuration.
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </Button>

        </div>

      </div>
    </main>
  );
}