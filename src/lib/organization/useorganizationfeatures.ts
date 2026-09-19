"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  defaultOrganizationFeatures,
  ORGANIZATION_SETTINGS_STORAGE_KEY,
  readOrganizationFeatures,
  type OrganizationFeatureKey,
  type OrganizationFeatures,
} from "@/lib/organization/features";

/* ==========================================================
   Organization Feature Hook

   Provides a single client-side interface for reading the
   current organization's feature configuration.

   Current persistence:
   - localStorage prototype

   Future persistence:
   - Supabase/PostgreSQL organization feature configuration

   Consumers should depend on this hook rather than reading
   localStorage directly.
========================================================== */

export function useOrganizationFeatures() {
  const [
    features,
    setFeatures,
  ] = useState<OrganizationFeatures>(
    defaultOrganizationFeatures,
  );

  const refreshFeatures = useCallback(() => {
    setFeatures(
      readOrganizationFeatures(),
    );
  }, []);

  useEffect(() => {
    refreshFeatures();

    const handleStorageChange = (
      event: StorageEvent,
    ) => {
      if (
        event.key ===
        ORGANIZATION_SETTINGS_STORAGE_KEY
      ) {
        refreshFeatures();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, [refreshFeatures]);

  const isEnabled = useCallback(
    (
      feature: OrganizationFeatureKey,
    ) => {
      return features[feature];
    },
    [features],
  );

  return {
    features,
    isEnabled,
    refreshFeatures,
  };
}