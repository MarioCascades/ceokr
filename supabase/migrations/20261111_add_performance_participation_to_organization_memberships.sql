-- CascadEffects Performance Platform
-- Add organization-level performance participation to memberships.
--
-- Account access and organization membership remain independent from
-- participation in the individual Runtime performance experience.
-- Existing memberships default to participating to preserve current behavior.

ALTER TABLE public.organization_memberships
ADD COLUMN IF NOT EXISTS is_performance_participant boolean
NOT NULL DEFAULT true;
