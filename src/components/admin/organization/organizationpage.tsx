"use client";

import { useEffect, useState } from "react";

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

import type {
  Organization,
} from "@/lib/types/organization";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

/* ==========================================================
   Organization Administration
========================================================== */

export default function OrganizationPage() {
  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(null);

  const [
    companyName,
    setCompanyName,
  ] = useState("");

  const [
    logoUrl,
    setLogoUrl,
  ] = useState("");

  const [
    primaryColor,
    setPrimaryColor,
  ] = useState("");

  const [
    secondaryColor,
    setSecondaryColor,
  ] = useState("");

  const [
    timezone,
    setTimezone,
  ] = useState("UTC");

  const [
    reportingFrequency,
    setReportingFrequency,
  ] = useState("monthly");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  /* ========================================================
     Load Organization
  ======================================================== */

  useEffect(() => {
    async function loadOrganization() {
      try {
        setErrorMessage(null);

        const existingOrganization =
          await getOrganization();

        if (!existingOrganization) {
          setErrorMessage(
            "No organization has been configured yet."
          );

          return;
        }

        setOrganization(
          existingOrganization
        );

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
          existingOrganization.timezone
        );

        setReportingFrequency(
          existingOrganization.reporting_frequency
        );
      } catch (error) {
        console.error(
          "Failed to load organization:",
          error
        );

        setErrorMessage(
          "Failed to load organization."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganization();
  }, []);

  /* ========================================================
     Save Organization
  ======================================================== */

  async function handleSave() {
    if (!organization) {
      return;
    }

    if (!companyName.trim()) {
      setErrorMessage(
        "Company name is required."
      );

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
            company_name:
              companyName.trim(),

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

            setup_completed: true,
          }
        );

      setOrganization(
        updatedOrganization
      );

      setIsSaved(true);
    } catch (error) {
      console.error(
        "Failed to update organization:",
        error
      );

      setErrorMessage(
        "Failed to save organization."
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
     Page
  ======================================================== */

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ================= Header ================= */}

        <AdminPageHeader
          title="Organization"
          description="Manage organization profile, branding, reporting settings and platform configuration."
        />

        {/* ================= Error ================= */}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ================= Organization ================= */}

        {organization && (
          <>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold">
                    Organization Profile
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Core organization information used
                    throughout the platform.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Name
                  </label>

                  <Input
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
                  <label className="mb-2 block text-sm font-medium">
                    Logo URL
                  </label>

                  <Input
                    value={logoUrl}
                    onChange={(event) =>
                      setLogoUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

              </div>
            </section>

            {/* ================= Branding ================= */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold">
                    Branding
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure organization-level
                    presentation settings.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Primary Color
                    </label>

                    <Input
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
                    <label className="mb-2 block text-sm font-medium">
                      Secondary Color
                    </label>

                    <Input
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

            {/* ================= Reporting ================= */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold">
                    Reporting Configuration
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Organization-wide defaults used by
                    performance and reporting workflows.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Timezone
                    </label>

                    <Input
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
                        <SelectItem value="weekly">
                          Weekly
                        </SelectItem>

                        <SelectItem value="monthly">
                          Monthly
                        </SelectItem>

                        <SelectItem value="quarterly">
                          Quarterly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>

              </div>
            </section>

            {/* ================= Platform Status ================= */}

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-3">

                <h2 className="text-xl font-semibold">
                  Platform Status
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

            {/* ================= Save ================= */}

            <div className="flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm">

              <div>
                {isSaved ? (
                  <p className="text-sm font-medium text-green-700">
                    ✓ Organization saved successfully.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Save changes to update the organization
                    across CascadEffects.
                  </p>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>

            </div>
          </>
        )}

      </div>
    </main>
  );
}