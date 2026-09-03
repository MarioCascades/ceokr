"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  createOrganization,
  getOrganization,
  updateOrganization,
  listOrganizations,
  deleteOrganization,
} from "@/services/organization.service";

import type {
  Organization,
  CreateOrganizationInput,
} from "@/lib/types/organization";

import AdminPageHeader from "@/components/admin/shared/adminpageheader";

/* ==========================================================
   Organization Administration
========================================================== */

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedOrganizationId =
    searchParams.get("organizationId");

  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [companyName, setCompanyName] =
    useState("");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [primaryColor, setPrimaryColor] =
    useState("");

  const [secondaryColor, setSecondaryColor] =
    useState("");

  const [timezone, setTimezone] =
    useState("UTC");

  const [reportingFrequency, setReportingFrequency] =
    useState("monthly");

  /* ========================================================
     Create Organization State
  ======================================================== */

  const [
    isCreatingOrganization,
    setIsCreatingOrganization,
  ] = useState(false);

  const [createCompanyName, setCreateCompanyName] =
    useState("");

  const [createLogoUrl, setCreateLogoUrl] =
    useState("");

  const [createPrimaryColor, setCreatePrimaryColor] =
    useState("");

  const [createSecondaryColor, setCreateSecondaryColor] =
    useState("");

  const [createTimezone, setCreateTimezone] =
    useState("UTC");

  const [
    createReportingFrequency,
    setCreateReportingFrequency,
  ] = useState("monthly");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* ========================================================
     Delete Organization State
  ======================================================== */

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* ========================================================
     Load Organization
  ======================================================== */

  useEffect(() => {
    async function loadOrganization() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const availableOrganizations =
          await listOrganizations();

        setOrganizations(
          availableOrganizations
        );

        const existingOrganization =
          await getOrganization(
            selectedOrganizationId ?? undefined
          );

        if (!existingOrganization) {
          setOrganization(null);
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

        setDeleteConfirmation("");
      } catch (error) {
        console.error(
          "Failed to load organization:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load organization."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganization();
  }, [selectedOrganizationId]);

  /* ========================================================
     Change Organization Context
  ======================================================== */

  function handleOrganizationChange(
    organizationId: string
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "organizationId",
      organizationId
    );

    router.push(
      `${window.location.pathname}?${params.toString()}`
    );
  }

  /* ========================================================
     Create Organization
  ======================================================== */

  function resetCreateOrganizationForm() {
    setCreateCompanyName("");
    setCreateLogoUrl("");
    setCreatePrimaryColor("");
    setCreateSecondaryColor("");
    setCreateTimezone("UTC");
    setCreateReportingFrequency("monthly");
  }

  async function handleCreateOrganization() {
    if (!createCompanyName.trim()) {
      setErrorMessage(
        "Company name is required."
      );

      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      const input: CreateOrganizationInput = {
        company_name:
          createCompanyName.trim(),

        logo_url:
          createLogoUrl.trim() || null,

        primary_color:
          createPrimaryColor.trim() || null,

        secondary_color:
          createSecondaryColor.trim() || null,

        timezone:
          createTimezone.trim() || "UTC",

        reporting_frequency:
          createReportingFrequency,

        setup_completed: false,
      };

      const createdOrganization =
        await createOrganization(
          input
        );

      const availableOrganizations =
        await listOrganizations();

      setOrganizations(
        availableOrganizations
      );

      setOrganization(
        createdOrganization
      );

      setCompanyName(
        createdOrganization.company_name
      );

      setLogoUrl(
        createdOrganization.logo_url ?? ""
      );

      setPrimaryColor(
        createdOrganization.primary_color ?? ""
      );

      setSecondaryColor(
        createdOrganization.secondary_color ?? ""
      );

      setTimezone(
        createdOrganization.timezone
      );

      setReportingFrequency(
        createdOrganization.reporting_frequency
      );

      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.set(
        "organizationId",
        createdOrganization.id
      );

      router.push(
        `${window.location.pathname}?${params.toString()}`
      );

      resetCreateOrganizationForm();
      setIsCreatingOrganization(false);
    } catch (error) {
      console.error(
        "Failed to create organization:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create organization."
      );
    } finally {
      setIsCreating(false);
    }
  }

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

      const updatedOrganizations =
        await listOrganizations();

      setOrganizations(
        updatedOrganizations
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
     Delete Organization
  ======================================================== */

  async function handleDeleteOrganization() {
    if (!organization) {
      return;
    }

    if (
      deleteConfirmation.trim() !==
      organization.company_name.trim()
    ) {
      setErrorMessage(
        "Enter the exact organization name to confirm deletion."
      );

      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      await deleteOrganization(
        organization.id
      );

      const remainingOrganizations =
        await listOrganizations();

      setOrganizations(
        remainingOrganizations
      );

      setDeleteConfirmation("");

      if (remainingOrganizations.length > 0) {
        const nextOrganization =
          remainingOrganizations[0];

        setOrganization(
          nextOrganization
        );

        setCompanyName(
          nextOrganization.company_name
        );

        setLogoUrl(
          nextOrganization.logo_url ?? ""
        );

        setPrimaryColor(
          nextOrganization.primary_color ?? ""
        );

        setSecondaryColor(
          nextOrganization.secondary_color ?? ""
        );

        setTimezone(
          nextOrganization.timezone
        );

        setReportingFrequency(
          nextOrganization.reporting_frequency
        );

        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        params.set(
          "organizationId",
          nextOrganization.id
        );

        router.push(
          `${window.location.pathname}?${params.toString()}`
        );
      } else {
        setOrganization(null);

        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        params.delete(
          "organizationId"
        );

        const query =
          params.toString();

        router.push(
          query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete organization:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete organization."
      );
    } finally {
      setIsDeleting(false);
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
          showOrganizationSelector={false}
        />

        {/* ================= Organization Context ================= */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex items-end justify-between gap-4">

            <div className="min-w-0 flex-1">

              <label
                htmlFor="organization-context"
                className="mb-2 block text-sm font-medium"
              >
                Organization Context
              </label>

              <select
                id="organization-context"
                value={organization?.id ?? ""}
                onChange={(event) =>
                  handleOrganizationChange(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
              >
                {organizations.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.company_name}
                  </option>
                ))}
              </select>

            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setErrorMessage(null);
                setIsCreatingOrganization(
                  (current) => !current
                );
              }}
            >
              {isCreatingOrganization
                ? "Cancel"
                : "+ Create Organization"}
            </Button>

          </div>

        </section>

        {/* ================= Create Organization ================= */}

        {isCreatingOrganization && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Create Organization
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new organization tenant for
                  CascadEffects.
                </p>
              </div>

              {/* ================= Company Name ================= */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company Name
                </label>

                <Input
                  value={createCompanyName}
                  onChange={(event) =>
                    setCreateCompanyName(
                      event.target.value
                    )
                  }
                  placeholder="Organization name"
                />
              </div>

              {/* ================= Logo ================= */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Logo URL
                </label>

                <Input
                  value={createLogoUrl}
                  onChange={(event) =>
                    setCreateLogoUrl(
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                />
              </div>

              {/* ================= Branding ================= */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Primary Color
                  </label>

                  <Input
                    value={createPrimaryColor}
                    onChange={(event) =>
                      setCreatePrimaryColor(
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
                    value={createSecondaryColor}
                    onChange={(event) =>
                      setCreateSecondaryColor(
                        event.target.value
                      )
                    }
                    placeholder="#FFFFFF"
                  />
                </div>

              </div>

              {/* ================= Reporting ================= */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Timezone
                  </label>

                  <Input
                    value={createTimezone}
                    onChange={(event) =>
                      setCreateTimezone(
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
                    value={
                      createReportingFrequency
                    }
                    onValueChange={
                      setCreateReportingFrequency
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

              {/* ================= Actions ================= */}

              <div className="flex justify-end gap-2 border-t pt-6">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetCreateOrganizationForm();
                    setIsCreatingOrganization(
                      false
                    );
                    setErrorMessage(null);
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={
                    handleCreateOrganization
                  }
                  disabled={isCreating}
                >
                  {isCreating
                    ? "Creating..."
                    : "Create Organization"}
                </Button>

              </div>

            </div>

          </section>
        )}

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
            {/* ================= Organization Profile ================= */}

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

            {/* ================= Danger Zone ================= */}

            <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold text-red-700">
                    Danger Zone
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently delete this organization
                    and its organization-owned data.
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    This action cannot be undone.
                    Organization-owned records such as
                    assignments, performance instances,
                    performance sheets, reporting periods,
                    departments, and roles may be removed
                    through the database cascade.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="delete-organization-confirmation"
                    className="block text-sm font-medium"
                  >
                    Type{" "}
                    <span className="font-semibold">
                      {organization.company_name}
                    </span>{" "}
                    to confirm
                  </label>

                  <Input
                    id="delete-organization-confirmation"
                    value={deleteConfirmation}
                    onChange={(event) =>
                      setDeleteConfirmation(
                        event.target.value
                      )
                    }
                    placeholder={organization.company_name}
                    disabled={isDeleting}
                  />
                </div>

                <div className="flex justify-end border-t pt-6">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={
                      handleDeleteOrganization
                    }
                    disabled={
                      isDeleting ||
                      deleteConfirmation.trim() !==
                        organization.company_name.trim()
                    }
                  >
                    {isDeleting
                      ? "Deleting Organization..."
                      : "Delete Organization"}
                  </Button>
                </div>

              </div>
            </section>
          </>
        )}

      </div>
    </main>
  );
}