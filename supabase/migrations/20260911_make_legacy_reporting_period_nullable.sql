/*
==========================================================
CascadEffects Performance Platform
Legacy Reporting Period Compatibility Cleanup
----------------------------------------------------------
Runtime now uses performance_month as the execution
timeframe.

reporting_period_id is retained temporarily for legacy
data compatibility but must no longer be required for
new Runtime Performance Instances.
==========================================================
*/

ALTER TABLE public.performance_instances
ALTER COLUMN reporting_period_id DROP NOT NULL;