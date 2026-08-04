/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Organization
 * ----------------------------------------------------------
 * TypeScript representation of public.organization.
 * ==========================================================
 */

export interface Organization {
  id: string;

  company_name: string;

  logo_url: string | null;

  primary_color: string | null;

  secondary_color: string | null;

  timezone: string;

  reporting_frequency: string;

  setup_completed: boolean | null;

  created_at: string | null;

  updated_at: string | null;
}

/**
 * ==========================================================
 * Organization Create Input
 * ==========================================================
 */

export interface CreateOrganizationInput {
  company_name: string;

  logo_url?: string | null;

  primary_color?: string | null;

  secondary_color?: string | null;

  timezone?: string;

  reporting_frequency?: string;

  setup_completed?: boolean;
}

/**
 * ==========================================================
 * Organization Update Input
 * ==========================================================
 */

export interface UpdateOrganizationInput {
  company_name?: string;

  logo_url?: string | null;

  primary_color?: string | null;

  secondary_color?: string | null;

  timezone?: string;

  reporting_frequency?: string;

  setup_completed?: boolean;
}