/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Organization Membership Role Profile
 * ----------------------------------------------------------
 * Adds organization-specific job title and role description
 * to organization memberships.
 *
 * Permission roles remain managed separately through
 * membership_roles.
 * ==========================================================
 */

ALTER TABLE public.organization_memberships
  ADD COLUMN IF NOT EXISTS role_title text NULL,
  ADD COLUMN IF NOT EXISTS role_description text NULL;