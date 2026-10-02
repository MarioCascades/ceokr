-- ==========================================================
-- CascadEffects Performance Platform
-- Organization OKR Template Library
-- Migration: 20261001
--
-- Purpose:
--   Add organization-owned copies of the global OKR templates.
--
-- Final model:
--
--   GLOBAL TEMPLATE WORKSPACE
--     objective_templates
--     key_result_templates
--     key_result_template_initiatives
--
--              COPY
--                |
--                v
--
--   ORGANIZATION TEMPLATE WORKSPACE
--     organization_objective_templates
--     organization_key_result_templates
--     organization_key_result_template_initiatives
--
-- Organization templates are independent copies.
--
-- Editing or deleting an organization template does NOT affect
-- the global template.
--
-- Editing or deleting a global template does NOT affect an
-- existing organization template copy.
--
-- source_global_template_id is retained only as provenance.
-- It intentionally has NO foreign key relationship.
--
-- This migration does NOT modify:
--   objective_templates
--   key_result_templates
--   key_result_template_initiatives
--   organization_memberships
--   member_objectives
--   member_key_results
--   member_initiatives
--   Builder
--   Runtime
--   Assignment
--
-- No RLS is introduced here. Organization authorization remains
-- enforced through the application/repository layer, consistent
-- with the current template-library architecture.
-- ==========================================================

begin;


-- ----------------------------------------------------------
-- 1. Organization Objective Templates
-- ----------------------------------------------------------

create table if not exists public.organization_objective_templates (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organization(id)
    on delete cascade,

  source_global_template_id uuid,

  title text not null,
  description text,

  weight numeric,

  position integer not null default 0,

  created_by uuid references public.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_objective_templates_title_not_blank
    check (length(trim(title)) > 0),

  constraint organization_objective_templates_weight_valid
    check (
      weight is null
      or (weight >= 0 and weight <= 100)
    ),

  constraint organization_objective_templates_position_valid
    check (position >= 0)
);


create index if not exists
  idx_organization_objective_templates_organization
on public.organization_objective_templates(
  organization_id
);


create index if not exists
  idx_organization_objective_templates_position
on public.organization_objective_templates(
  organization_id,
  position
);


create index if not exists
  idx_organization_objective_templates_created_at
on public.organization_objective_templates(
  organization_id,
  created_at
);


-- ----------------------------------------------------------
-- 2. Organization Key Result Templates
-- ----------------------------------------------------------

create table if not exists public.organization_key_result_templates (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organization(id)
    on delete cascade,

  source_global_template_id uuid,

  title text not null,

  target jsonb,

  weight numeric,

  measurement_type text,

  scoring_method text,

  status text not null default 'active',

  created_by uuid references public.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_key_result_templates_title_not_blank
    check (length(trim(title)) > 0),

  constraint organization_key_result_templates_weight_valid
    check (
      weight is null
      or (weight >= 0 and weight <= 100)
    ),

  constraint organization_key_result_templates_measurement_type_valid
    check (
      measurement_type is null
      or measurement_type in (
        'percentage',
        'numeric',
        'financial'
      )
    ),

  constraint organization_key_result_templates_scoring_method_valid
    check (
      scoring_method is null
      or scoring_method in (
        'percent_into_period',
        'percentage_of_target',
        'display_only'
      )
    ),

  constraint organization_key_result_templates_status_valid
    check (
      status in (
        'active',
        'completed',
        'cancelled'
      )
    )
);


create index if not exists
  idx_organization_key_result_templates_organization
on public.organization_key_result_templates(
  organization_id
);


create index if not exists
  idx_organization_key_result_templates_status
on public.organization_key_result_templates(
  organization_id,
  status
);


create index if not exists
  idx_organization_key_result_templates_created_at
on public.organization_key_result_templates(
  organization_id,
  created_at
);


-- ----------------------------------------------------------
-- 3. Organization Key Result Template Initiatives
-- ----------------------------------------------------------

create table if not exists
  public.organization_key_result_template_initiatives (
    id uuid primary key default gen_random_uuid(),

    organization_key_result_template_id uuid not null
      references public.organization_key_result_templates(id)
      on delete cascade,

    text text not null,

    position integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint organization_key_result_template_initiatives_text_not_blank
      check (length(trim(text)) > 0),

    constraint organization_key_result_template_initiatives_position_valid
      check (position >= 0)
  );


create index if not exists
  idx_organization_key_result_template_initiatives_kr
on public.organization_key_result_template_initiatives(
  organization_key_result_template_id
);


create index if not exists
  idx_organization_key_result_template_initiatives_position
on public.organization_key_result_template_initiatives(
  organization_key_result_template_id,
  position
);


-- ----------------------------------------------------------
-- 4. Commit
-- ----------------------------------------------------------

commit;