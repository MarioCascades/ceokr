import { supabase } from "@/lib/supabase/client";

import type {
  ReportingPeriod,
} from "@/lib/domain/reportingperiod";

/* ==========================================================
   Database Record
========================================================== */

interface ReportingPeriodRecord {
  id: string;

  organization_id: string;

  name: string;

  description: string | null;

  frequency: ReportingPeriod["frequency"];

  start_date: string;

  end_date: string;

  status: ReportingPeriod["status"];

  created_at: string;

  updated_at: string;
}

/* ==========================================================
   Mapper
========================================================== */

function mapRecordToReportingPeriod(
  record: ReportingPeriodRecord
): ReportingPeriod {
  return {
    id: record.id,

    organizationId: record.organization_id,

    name: record.name,

    description: record.description ?? undefined,

    frequency: record.frequency,

    startDate: record.start_date,

    endDate: record.end_date,

    status: record.status,

    createdAt: record.created_at,

    updatedAt: record.updated_at,
  };
}

/* ==========================================================
   Create
========================================================== */

export async function createReportingPeriod(
  reportingPeriod: Omit<
    ReportingPeriod,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<ReportingPeriod> {
  const { data, error } = await supabase
    .from("reporting_periods")
    .insert({
      organization_id: reportingPeriod.organizationId,

      name: reportingPeriod.name,

      description: reportingPeriod.description,

      frequency: reportingPeriod.frequency,

      start_date: reportingPeriod.startDate,

      end_date: reportingPeriod.endDate,

      status: reportingPeriod.status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create reporting period: ${error.message}`
    );
  }

  return mapRecordToReportingPeriod(
    data as ReportingPeriodRecord
  );
}

/* ==========================================================
   Update
========================================================== */

export async function updateReportingPeriod(
  reportingPeriod: ReportingPeriod
): Promise<ReportingPeriod> {
  const { data, error } = await supabase
    .from("reporting_periods")
    .update({
      name: reportingPeriod.name,

      description: reportingPeriod.description,

      frequency: reportingPeriod.frequency,

      start_date: reportingPeriod.startDate,

      end_date: reportingPeriod.endDate,

      status: reportingPeriod.status,
    })
    .eq("id", reportingPeriod.id)
    .eq(
      "organization_id",
      reportingPeriod.organizationId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update reporting period: ${error.message}`
    );
  }

  return mapRecordToReportingPeriod(
    data as ReportingPeriodRecord
  );
}

/* ==========================================================
   Delete
========================================================== */

export async function deleteReportingPeriod(
  organizationId: string,
  reportingPeriodId: string
): Promise<void> {
  const { error } = await supabase
    .from("reporting_periods")
    .delete()
    .eq("id", reportingPeriodId)
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(
      `Failed to delete reporting period: ${error.message}`
    );
  }
}

/* ==========================================================
   Find By Id
========================================================== */

export async function findReportingPeriodById(
  organizationId: string,
  reportingPeriodId: string
): Promise<ReportingPeriod | null> {
  const { data, error } = await supabase
    .from("reporting_periods")
    .select("*")
    .eq("id", reportingPeriodId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load reporting period: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToReportingPeriod(
    data as ReportingPeriodRecord
  );
}

/* ==========================================================
   Find By Organization
========================================================== */

export async function findReportingPeriodsByOrganization(
  organizationId: string
): Promise<ReportingPeriod[]> {
  const { data, error } = await supabase
    .from("reporting_periods")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load reporting periods: ${error.message}`
    );
  }

  return (data as ReportingPeriodRecord[]).map(
    mapRecordToReportingPeriod
  );
}