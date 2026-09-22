-- Introduce intrinsic monthly identity for Performance Instances.
-- Reporting Period remains temporarily for migration compatibility.

alter table public.performance_instances
  add column if not exists performance_month date;

-- Backfill the monthly identity from the legacy Reporting Period.
update public.performance_instances pi
set performance_month = date_trunc('month', rp.start_date)::date
from public.reporting_periods rp
where rp.id = pi.reporting_period_id
  and pi.performance_month is null;

-- Every existing Performance Instance must now have a month.
alter table public.performance_instances
  alter column performance_month set not null;

-- Support organization/month Runtime queries.
create index if not exists idx_performance_instances_organization_month
  on public.performance_instances (organization_id, performance_month);