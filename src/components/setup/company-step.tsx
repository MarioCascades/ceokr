"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
} from "@/services/organization.service";

import type {
  Organization,
} from "@/lib/types/organization";

/* ==========================================================
   Validation
========================================================== */

const schema = z.object({
  company_name: z
    .string()
    .min(2, "Company name is required"),

  timezone: z
    .string()
    .min(1, "Timezone is required"),

  reporting_frequency: z
    .string()
    .min(1, "Reporting frequency is required"),
});

type FormValues = z.infer<typeof schema>;

/* ==========================================================
   Company Step
========================================================== */

export default function CompanyStep() {
  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(null);

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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      company_name: "",
      timezone: "UTC",
      reporting_frequency: "monthly",
    },
  });

  /* ========================================================
     Load Existing Organization
  ======================================================== */

  useEffect(() => {
    async function loadOrganization() {
      try {
        const existingOrganization =
          await getOrganization();

        if (existingOrganization) {
          setOrganization(
            existingOrganization
          );

          form.reset({
            company_name:
              existingOrganization.company_name,

            timezone:
              existingOrganization.timezone,

            reporting_frequency:
              existingOrganization.reporting_frequency,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load organization:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganization();
  }, [form]);

  /* ========================================================
     Save Organization
  ======================================================== */

  async function onSubmit(
    values: FormValues
  ) {
    setIsSaving(true);
    setIsSaved(false);

    try {
      let savedOrganization: Organization;

      if (organization) {
        savedOrganization =
          await updateOrganization(
            organization.id,
            {
              company_name:
                values.company_name,

              timezone:
                values.timezone,

              reporting_frequency:
                values.reporting_frequency,

              setup_completed: true,
            }
          );
      } else {
        savedOrganization =
          await createOrganization({
            company_name:
              values.company_name,

            timezone:
              values.timezone,

            reporting_frequency:
              values.reporting_frequency,

            setup_completed: true,
          });
      }

      setOrganization(savedOrganization);

      setIsSaved(true);
    } catch (error) {
      console.error(
        "Failed to save organization:",
        error
      );

      alert(
        "Failed to save organization."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* ========================================================
     Loading
  ======================================================== */

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-muted-foreground">
          Loading organization...
        </p>
      </div>
    );
  }

  /* ========================================================
     Form
  ======================================================== */

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* ================= Company Name ================= */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Company Name
        </label>

        <Input
          {...form.register("company_name")}
          placeholder="Enter company name"
        />

        <p className="mt-1 text-sm text-red-500">
          {
            form.formState.errors
              .company_name?.message
          }
        </p>
      </div>

      {/* ================= Timezone ================= */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Timezone
        </label>

        <Input
          {...form.register("timezone")}
          placeholder="UTC"
        />

        <p className="mt-1 text-sm text-red-500">
          {
            form.formState.errors
              .timezone?.message
          }
        </p>
      </div>

      {/* ================= Reporting Frequency ================= */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Reporting Frequency
        </label>

        <Select
          value={
            form.watch(
              "reporting_frequency"
            )
          }
          onValueChange={(value) =>
            form.setValue(
              "reporting_frequency",
              value,
              {
                shouldValidate: true,
              }
            )
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

        <p className="mt-1 text-sm text-red-500">
          {
            form.formState.errors
              .reporting_frequency?.message
          }
        </p>
      </div>

      {/* ================= Actions ================= */}

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : organization
              ? "Update Organization"
              : "Save Organization"}
        </Button>

        {isSaved && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-700">
              ✓ Organization saved successfully.
            </p>

            <p className="mt-1 text-sm text-green-600">
              Your organization configuration is ready.
            </p>

            <Button
              asChild
              className="mt-4"
            >
              <Link href="/admin">
                Go to Administration
              </Link>
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}