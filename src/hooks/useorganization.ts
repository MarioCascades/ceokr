"use client";

import { useEffect, useState } from "react";

import { Organization } from "@/lib/types/organization";
import { getOrganization } from "@/services/organization.service";

export function useOrganization() {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      const organization =
        await getOrganization();

      setOrganization(organization);

      setLoading(false);
    }

    load();
  }, []);

  return {
    organization,
    loading,
  };
}