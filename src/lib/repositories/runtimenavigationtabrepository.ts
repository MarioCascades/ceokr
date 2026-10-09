import { supabase } from "@/lib/supabase/client";

import type {
  RuntimeNavigationTab,
  CreateRuntimeNavigationTabInput,
  UpdateRuntimeNavigationTabInput,
} from "@/lib/types/domain/runtimenavigationtab";


/* ==========================================================
   Database Record
========================================================== */

interface RuntimeNavigationTabRecord {
  id: string;

  organization_id: string;

  tab_key: string;

  tab_type:
    | "dashboard"
    | "member"
    | "operational";

  label: string;

  position: number;

  is_hidden: boolean;

  created_at: string;

  updated_at: string;
}


/* ==========================================================
   Mapper
========================================================== */

function mapRecordToRuntimeNavigationTab(
  record: RuntimeNavigationTabRecord
): RuntimeNavigationTab {
  return {
    id: record.id,

    organizationId:
      record.organization_id,

    tabKey:
      record.tab_key,

    tabType:
      record.tab_type,

    label:
      record.label,

    position:
      record.position,

    isHidden:
      record.is_hidden,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}


/* ==========================================================
   Create
========================================================== */

export async function createRuntimeNavigationTab(
  input: CreateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  const {
    data,
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .insert({
      organization_id:
        input.organizationId,

      tab_key:
        input.tabKey,

      tab_type:
        input.tabType,

      label:
        input.label,

      position:
        input.position,

      is_hidden:
        input.isHidden ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create Runtime navigation tab: ${error.message}`
    );
  }

  return mapRecordToRuntimeNavigationTab(
    data as RuntimeNavigationTabRecord
  );
}


/* ==========================================================
   Update
========================================================== */

export async function updateRuntimeNavigationTab(
  organizationId: string,
  tabId: string,
  input: UpdateRuntimeNavigationTabInput
): Promise<RuntimeNavigationTab> {
  const updates: {
    position?: number;
    is_hidden?: boolean;
  } = {};

  if (
    typeof input.position ===
    "number"
  ) {
    updates.position =
      input.position;
  }

  if (
    typeof input.isHidden ===
    "boolean"
  ) {
    updates.is_hidden =
      input.isHidden;
  }

  const {
    data,
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .update(updates)
    .eq(
      "id",
      tabId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update Runtime navigation tab: ${error.message}`
    );
  }

  return mapRecordToRuntimeNavigationTab(
    data as RuntimeNavigationTabRecord
  );
}


/* ==========================================================
   Delete
========================================================== */

export async function deleteRuntimeNavigationTab(
  organizationId: string,
  tabId: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .delete()
    .eq(
      "id",
      tabId
    )
    .eq(
      "organization_id",
      organizationId
    );

  if (error) {
    throw new Error(
      `Failed to delete Runtime navigation tab: ${error.message}`
    );
  }
}


/* ==========================================================
   Find By Id
========================================================== */

export async function findRuntimeNavigationTabById(
  organizationId: string,
  tabId: string
): Promise<RuntimeNavigationTab | null> {
  const {
    data,
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .select("*")
    .eq(
      "id",
      tabId
    )
    .eq(
      "organization_id",
      organizationId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Runtime navigation tab: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToRuntimeNavigationTab(
    data as RuntimeNavigationTabRecord
  );
}


/* ==========================================================
   Find By Tab Key
========================================================== */

export async function findRuntimeNavigationTabByKey(
  organizationId: string,
  tabKey: string
): Promise<RuntimeNavigationTab | null> {
  const {
    data,
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .eq(
      "tab_key",
      tabKey
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load Runtime navigation tab: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapRecordToRuntimeNavigationTab(
    data as RuntimeNavigationTabRecord
  );
}


/* ==========================================================
   Find By Organization
   ----------------------------------------------------------
   Runtime navigation order is organization-specific.
   Lower position values appear first.
========================================================== */

export async function findRuntimeNavigationTabsByOrganization(
  organizationId: string
): Promise<RuntimeNavigationTab[]> {
  const {
    data,
    error,
  } = await supabase
    .from("runtime_navigation_tabs")
    .select("*")
    .eq(
      "organization_id",
      organizationId
    )
    .order(
      "position",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load Runtime navigation tabs: ${error.message}`
    );
  }

  return (
    data as RuntimeNavigationTabRecord[]
  ).map(
    mapRecordToRuntimeNavigationTab
  );
}