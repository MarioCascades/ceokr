export const ORGANIZATION_SETTINGS_STORAGE_KEY =
  "ce-current-organization-settings";

export type OrganizationFeatureKey =
  | "departments"
  | "teams"
  | "teamPerformance"
  | "departmentPerformance"
  | "dashboards"
  | "historicalReporting"
  | "employeeComments"
  | "aiAssistance";

export interface OrganizationFeatures {
  departments: boolean;
  teams: boolean;
  teamPerformance: boolean;
  departmentPerformance: boolean;
  dashboards: boolean;
  historicalReporting: boolean;
  employeeComments: boolean;
  aiAssistance: boolean;
}

export const defaultOrganizationFeatures: OrganizationFeatures = {
  departments: false,
  teams: true,
  teamPerformance: false,
  departmentPerformance: false,
  dashboards: true,
  historicalReporting: true,
  employeeComments: true,
  aiAssistance: false,
};

type StoredOrganizationFeatureSettings = Partial<
  Record<
    | "departmentsEnabled"
    | "teamsEnabled"
    | "teamPerformanceEnabled"
    | "departmentPerformanceEnabled"
    | "dashboardsEnabled"
    | "historicalReportingEnabled"
    | "employeeCommentsEnabled"
    | "aiAssistanceEnabled",
    boolean
  >
>;

export function resolveOrganizationFeatures(
  storedSettings?: StoredOrganizationFeatureSettings | null
): OrganizationFeatures {
  return {
    departments:
      storedSettings?.departmentsEnabled ??
      defaultOrganizationFeatures.departments,

    teams:
      storedSettings?.teamsEnabled ??
      defaultOrganizationFeatures.teams,

    teamPerformance:
      storedSettings?.teamPerformanceEnabled ??
      defaultOrganizationFeatures.teamPerformance,

    departmentPerformance:
      storedSettings?.departmentPerformanceEnabled ??
      defaultOrganizationFeatures.departmentPerformance,

    dashboards:
      storedSettings?.dashboardsEnabled ??
      defaultOrganizationFeatures.dashboards,

    historicalReporting:
      storedSettings?.historicalReportingEnabled ??
      defaultOrganizationFeatures.historicalReporting,

    employeeComments:
      storedSettings?.employeeCommentsEnabled ??
      defaultOrganizationFeatures.employeeComments,

    aiAssistance:
      storedSettings?.aiAssistanceEnabled ??
      defaultOrganizationFeatures.aiAssistance,
  };
}

export function readOrganizationFeatures(): OrganizationFeatures {
  if (typeof window === "undefined") {
    return defaultOrganizationFeatures;
  }

  try {
    const rawSettings = window.localStorage.getItem(
      ORGANIZATION_SETTINGS_STORAGE_KEY
    );

    if (!rawSettings) {
      return defaultOrganizationFeatures;
    }

    const parsedSettings = JSON.parse(
      rawSettings
    ) as StoredOrganizationFeatureSettings;

    return resolveOrganizationFeatures(
      parsedSettings
    );
  } catch (error) {
    console.error(
      "Failed to read organization feature settings:",
      error
    );

    return defaultOrganizationFeatures;
  }
}

export function isOrganizationFeatureEnabled(
  feature: OrganizationFeatureKey,
  features?: OrganizationFeatures
): boolean {
  const resolvedFeatures =
    features ??
    defaultOrganizationFeatures;

  return resolvedFeatures[feature];
}