"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  Organization,
} from "@/lib/types/organization";

import type {
  OrganizationMembership,
} from "@/lib/types/domain/organizationmembership";

import {
  getCurrentOrganizationMemberships,
} from "@/lib/auth/currentmembership";

import {
  getOrganizationByMembership,
} from "@/lib/auth/currentorganization";

/* ==========================================================
   Active Organization Storage
========================================================== */

const ACTIVE_MEMBERSHIP_STORAGE_KEY =
  "ceokr_active_membership_id";

/* ==========================================================
   Organization Hook
========================================================== */

export function useOrganization() {
  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(null);

  const [
    membership,
    setMembership,
  ] = useState<OrganizationMembership | null>(
    null
  );

  const [
    memberships,
    setMemberships,
  ] = useState<OrganizationMembership[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        /*
         * Resolve every organization membership
         * belonging to the authenticated user.
         */
        const availableMemberships =
          await getCurrentOrganizationMemberships();

        if (cancelled) {
          return;
        }

        setMemberships(
          availableMemberships
        );

        if (
          availableMemberships.length === 0
        ) {
          setMembership(null);
          setOrganization(null);
          return;
        }

        /*
         * Restore the previously selected membership
         * when one exists.
         */
        const storedMembershipId =
          window.localStorage.getItem(
            ACTIVE_MEMBERSHIP_STORAGE_KEY
          );

        let selectedMembership =
          availableMemberships.find(
            (item) =>
              item.id ===
              storedMembershipId
          );

        /*
         * If there is no stored selection, or the stored
         * membership no longer belongs to the user,
         * fall back to the first available membership.
         */
        if (!selectedMembership) {
          selectedMembership =
            availableMemberships[0];

          window.localStorage.setItem(
            ACTIVE_MEMBERSHIP_STORAGE_KEY,
            selectedMembership.id
          );
        }

        /*
         * Store the active membership locally so the
         * application can expose the selected organization
         * consistently across pages.
         */
        setMembership(
          selectedMembership
        );

        /*
         * Resolve the organization through the verified
         * membership-aware organization resolver.
         */
        const selectedOrganization =
          await getOrganizationByMembership(
            selectedMembership
          );

        if (cancelled) {
          return;
        }

        setOrganization(
          selectedOrganization
        );
      } catch (error) {
        console.error(
          "Error loading current organization:",
          error
        );

        if (!cancelled) {
          setMembership(null);
          setOrganization(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    organization,
    membership,
    memberships,
    loading,
  };
}