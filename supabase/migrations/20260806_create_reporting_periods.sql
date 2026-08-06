-- =====================================================
-- Reporting Periods
-- =====================================================

create table if not exists public.reporting_periods (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references public.organization(id)
        on delete cascade,

    name text not null,

    frequency text not null
        check (
            frequency in (
                'weekly',
                'monthly',
                'quarterly',
                'annual'
            )
        ),

    start_date date not null,

    end_date date not null,

    status text not null default 'draft'
        check (
            status in (
                'draft',
                'active',
                'closed'
            )
        ),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- =====================================================
-- Indexes
-- =====================================================

create index if not exists idx_reporting_periods_organization
    on public.reporting_periods (organization_id);

create index if not exists idx_reporting_periods_status
    on public.reporting_periods (status);

create index if not exists idx_reporting_periods_dates
    on public.reporting_periods (
        start_date,
        end_date
    );