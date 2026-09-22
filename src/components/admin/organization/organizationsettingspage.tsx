"use client";

import { useEffect, useState } from "react";

import {
  ORGANIZATION_SETTINGS_STORAGE_KEY,
  defaultOrganizationFeatures,
} from "@/lib/organization/features";

const CASCADEFFECTS_DEFAULT_LOGO = "/logos/CECleanlogo.png";

type OrganizationSettingsState = {
  organizationName: string;
  organizationLogo: string;
  primaryColor: string;
  accentColor: string;
  timezone: string;
  dateFormat: string;
  notificationsEnabled: boolean;
  administrativeNotifications: boolean;
  performanceNotifications: boolean;
  systemNotifications: boolean;
  confirmBeforeDeleting: boolean;
  showHelpfulTips: boolean;
  departmentsEnabled: boolean;
  teamsEnabled: boolean;
  teamPerformanceEnabled: boolean;
  departmentPerformanceEnabled: boolean;
  organizationPerformanceEnabled: boolean;
  dashboardsEnabled: boolean;
  historicalReportingEnabled: boolean;
  employeeCommentsEnabled: boolean;
  aiAssistanceEnabled: boolean;
};

const defaultSettings: OrganizationSettingsState = {
  organizationName: "Organization",
  organizationLogo: "",
  primaryColor: "#082550",
  accentColor: "#E26D5C",
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  notificationsEnabled: false,
  administrativeNotifications: true,
  performanceNotifications: true,
  systemNotifications: true,
  confirmBeforeDeleting: true,
  showHelpfulTips: true,

  /* ======================================================
     ORGANIZATIONAL STRUCTURE DEFAULTS
  ====================================================== */

  departmentsEnabled:
    defaultOrganizationFeatures.departments,

  teamsEnabled:
    defaultOrganizationFeatures.teams,

  /* ======================================================
     PERFORMANCE SCOPE DEFAULTS
  ====================================================== */

  teamPerformanceEnabled:
    defaultOrganizationFeatures.teamPerformance,

  departmentPerformanceEnabled:
    defaultOrganizationFeatures.departmentPerformance,

  organizationPerformanceEnabled:
    true,

  /* ======================================================
     EXPERIENCE DEFAULTS
  ====================================================== */

  dashboardsEnabled:
    defaultOrganizationFeatures.dashboards,

  historicalReportingEnabled:
    defaultOrganizationFeatures.historicalReporting,

  employeeCommentsEnabled:
    defaultOrganizationFeatures.employeeComments,

  aiAssistanceEnabled:
    defaultOrganizationFeatures.aiAssistance,
};

const timezoneOptions = [
  {
    value: "America/New_York",
    label: "Eastern Time — US & Canada",
  },
  {
    value: "America/Chicago",
    label: "Central Time — US & Canada",
  },
  {
    value: "America/Denver",
    label: "Mountain Time — US & Canada",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time — US & Canada",
  },
  {
    value: "America/Anchorage",
    label: "Alaska Time — US",
  },
  {
    value: "Pacific/Honolulu",
    label: "Hawaii Time — US",
  },
];

const dateFormatOptions = [
  {
    value: "MM/DD/YYYY",
    label: "MM/DD/YYYY",
    example: "09/12/2026",
  },
  {
    value: "MM-DD-YYYY",
    label: "MM-DD-YYYY",
    example: "09-12-2026",
  },
  {
    value: "YYYY-MM-DD",
    label: "YYYY-MM-DD",
    example: "2026-09-12",
  },
];

export default function OrganizationSettingsPage() {
  const [settings, setSettings] =
    useState<OrganizationSettingsState>(
      defaultSettings,
    );

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const stored =
      window.localStorage.getItem(
        ORGANIZATION_SETTINGS_STORAGE_KEY,
      );

    if (!stored) {
      return;
    }

    try {
      const parsed =
        JSON.parse(
          stored,
        ) as Partial<OrganizationSettingsState>;

      setSettings({
        ...defaultSettings,
        ...parsed,
      });
    } catch {
      window.localStorage.removeItem(
        ORGANIZATION_SETTINGS_STORAGE_KEY,
      );
    }
  }, []);

  const updateSetting = <
    K extends keyof OrganizationSettingsState
  >(
    key: K,
    value: OrganizationSettingsState[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    window.localStorage.setItem(
      ORGANIZATION_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );

    setSaved(true);
  };

  const handleOrganizationLogoChange = (
    logoUrl: string,
  ) => {
    updateSetting(
      "organizationLogo",
      logoUrl,
    );
  };

  const handleUseCascadEffectsDefault = () => {
    updateSetting(
      "organizationLogo",
      "",
    );
  };

  const displayedLogo =
    settings.organizationLogo ||
    CASCADEFFECTS_DEFAULT_LOGO;

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        {/* HEADER */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#E26D5C]">
            ORGANIZATION WORKSPACE
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#082550]">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/70">
                Manage the identity, branding, notifications, and workspace
                preferences for your organization.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#082550] px-5 text-sm font-bold text-white transition hover:bg-[#0b356d] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2"
            >
              {saved
                ? "Saved"
                : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* ORGANIZATION PROFILE */}
          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                ORGANIZATION IDENTITY
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                Organization Profile
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
                Manage the identity and regional settings for your current
                organization workspace.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="organization-name"
                  className="block text-sm font-bold text-[#272D2C]"
                >
                  Organization Name
                </label>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  The name displayed throughout your organization workspace.
                </p>

                <input
                  id="organization-name"
                  type="text"
                  value={settings.organizationName}
                  onChange={(event) =>
                    updateSetting(
                      "organizationName",
                      event.target.value,
                    )
                  }
                  className="mt-3 h-10 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-sm text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
                />
              </div>

              <div>
                <label
                  htmlFor="organization-timezone"
                  className="block text-sm font-bold text-[#272D2C]"
                >
                  Organization Timezone
                </label>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  The default timezone used by this organization.
                </p>

                <select
                  id="organization-timezone"
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting(
                      "timezone",
                      event.target.value,
                    )
                  }
                  className="mt-3 h-10 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-sm text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
                >
                  {timezoneOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="organization-date-format"
                  className="block text-sm font-bold text-[#272D2C]"
                >
                  Date Format
                </label>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  Controls how dates are displayed in this organization
                  workspace.
                </p>

                <select
                  id="organization-date-format"
                  value={settings.dateFormat}
                  onChange={(event) =>
                    updateSetting(
                      "dateFormat",
                      event.target.value,
                    )
                  }
                  className="mt-3 h-10 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-sm text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
                >
                  {dateFormatOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label} —{" "}
                        {option.example}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <p className="text-sm font-bold text-[#272D2C]">
                  Workspace Language
                </p>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  The organization workspace currently uses English.
                </p>

                <div className="mt-3 inline-flex h-10 items-center rounded-md border border-[#B4C2D1] bg-[#F7F9FB] px-4 text-sm font-bold text-[#082550]">
                  English
                </div>
              </div>
            </div>
          </section>

          {/* ORGANIZATION BRANDING */}
          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                ORGANIZATION BRANDING
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                Workspace Branding
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
                Customize how your organization appears throughout its
                workspace. CascadEffects branding is used automatically when
                your organization has not configured its own branding.
              </p>
            </div>

            {/* LOGO */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                  Organization Logo
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  Upload a logo specifically for your organization.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
                <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#F7F9FB] p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#272D2C]/55">
                    {settings.organizationLogo
                      ? "Organization Logo"
                      : "CascadEffects Default"}
                  </p>

                  <div className="flex min-h-[150px] items-center justify-center rounded-md border border-[#B4C2D1]/50 bg-white p-6">
                    <img
                      src={displayedLogo}
                      alt={
                        settings.organizationLogo
                          ? `${settings.organizationName} logo`
                          : "CascadEffects default logo"
                      }
                      className="max-h-28 max-w-full object-contain"
                    />
                  </div>

                  {!settings.organizationLogo && (
                    <p className="mt-3 text-xs leading-5 text-[#272D2C]/55">
                      No organization-specific logo has been configured.
                      CascadEffects branding is currently being used as the
                      workspace fallback.
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-end gap-3">
                  <label
                    htmlFor="organization-logo-upload"
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-[#082550] px-4 text-sm font-bold text-white transition hover:bg-[#0b356d] focus-within:ring-2 focus-within:ring-[#E26D5C] focus-within:ring-offset-2"
                  >
                    Upload Organization Logo
                  </label>

                  <input
                    id="organization-logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0];

                      if (
                        !file ||
                        !file.type.startsWith(
                          "image/",
                        )
                      ) {
                        return;
                      }

                      const reader =
                        new FileReader();

                      reader.onload = () => {
                        if (
                          typeof reader.result ===
                          "string"
                        ) {
                          handleOrganizationLogoChange(
                            reader.result,
                          );
                        }
                      };

                      reader.readAsDataURL(
                        file,
                      );
                    }}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={
                      handleUseCascadEffectsDefault
                    }
                    className="inline-flex h-10 items-center justify-center rounded-md border border-[#B4C2D1] bg-white px-4 text-sm font-bold text-[#082550] transition hover:bg-[#F7F9FB] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2"
                  >
                    Use CascadEffects Default
                  </button>

                  <p className="text-center text-[11px] leading-4 text-[#272D2C]/50">
                    PNG, JPG, WEBP, or SVG
                  </p>
                </div>
              </div>
            </div>

            {/* COLORS */}
            <div className="mt-8 border-t border-[#B4C2D1]/50 pt-8">
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                  Organization Colors
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  Customize the colors used by your organization workspace.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ColorSetting
                  label="Primary Color"
                  description="Main organization color used for navigation, headings, and primary actions."
                  value={settings.primaryColor}
                  onChange={(value) =>
                    updateSetting(
                      "primaryColor",
                      value,
                    )
                  }
                />

                <ColorSetting
                  label="Accent Color"
                  description="Supporting organization accent used for highlights and emphasis."
                  value={settings.accentColor}
                  onChange={(value) =>
                    updateSetting(
                      "accentColor",
                      value,
                    )
                  }
                />
              </div>
            </div>

            {/* PREVIEW */}
            <div className="mt-8 border-t border-[#B4C2D1]/50 pt-8">
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                  Workspace Preview
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                  Preview how your organization identity may appear in the
                  workspace.
                </p>
              </div>

              <div
                className="overflow-hidden rounded-lg border border-[#B4C2D1]/70"
                style={{
                  borderTopColor:
                    settings.primaryColor,
                }}
              >
                <div
                  className="flex items-center justify-between gap-4 px-5 py-4"
                  style={{
                    backgroundColor:
                      settings.primaryColor,
                  }}
                >
                  <img
                    src={displayedLogo}
                    alt={`${settings.organizationName} branding preview`}
                    className="max-h-10 max-w-[180px] object-contain"
                  />

                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
                    style={{
                      backgroundColor:
                        settings.accentColor,
                      color: "#FFFFFF",
                    }}
                  >
                    Workspace
                  </span>
                </div>

                <div className="bg-white px-5 py-5">
                  <p className="text-sm font-bold text-[#082550]">
                    {settings.organizationName}
                  </p>

                  <p className="mt-1 text-xs text-[#272D2C]/60">
                    Organization-specific workspace branding preview.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES & MODULES */}
          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                ORGANIZATION FEATURES
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                Features &amp; Modules
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
                Choose which optional capabilities are available in this
                organization workspace. Turning a feature off controls its
                availability and does not delete existing organization data.
              </p>
            </div>

            <div className="space-y-8">
              {/* ORGANIZATIONAL STRUCTURE */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                    Organizational Structure
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                    Configure the organizational structures this workspace
                    uses.
                  </p>
                </div>

                <div className="divide-y divide-[#B4C2D1]/50 rounded-lg border border-[#B4C2D1]/60">
                  <PreferenceRow
                    title="Departments"
                    description="Allow this organization to organize members by department."
                    enabled={
                      settings.departmentsEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "departmentsEnabled",
                        value,
                      )
                    }
                  />

                  <PreferenceRow
                    title="Teams"
                    description="Allow this organization to organize members by team."
                    enabled={
                      settings.teamsEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "teamsEnabled",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              {/* PERFORMANCE */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                    Performance
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                    Organization-level performance capabilities are available
                    as part of the CascadEffects performance framework.
                  </p>
                </div>

                <div className="divide-y divide-[#B4C2D1]/50 rounded-lg border border-[#B4C2D1]/60">
                  <CoreFeatureCard
                    title="Individual Performance"
                  />

                  <FeatureDependencyRow
                    title="Team Performance"
                    description="Allow performance management at the team level."
                    enabled={
                      settings.teamPerformanceEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "teamPerformanceEnabled",
                        value,
                      )
                    }
                    dependencyEnabled={
                      settings.teamsEnabled
                    }
                    dependencyLabel="Requires Teams turned on"
                  />

                  <FeatureDependencyRow
                    title="Department Performance"
                    description="Allow performance management at the department level."
                    enabled={
                      settings.departmentPerformanceEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "departmentPerformanceEnabled",
                        value,
                      )
                    }
                    dependencyEnabled={
                      settings.departmentsEnabled
                    }
                    dependencyLabel="Requires Departments turned on"
                  />

                  <CoreFeatureCard
                    title="Organization Performance"
                  />
                </div>
              </div>

              {/* CORE PERFORMANCE FRAMEWORK */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                    Core Performance Framework
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                    These capabilities are core to the CascadEffects
                    performance framework and are always available.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <CoreFeatureCard title="Objectives" />
                  <CoreFeatureCard title="Key Results" />
                  <CoreFeatureCard title="Initiatives" />
                </div>
              </div>

              {/* EXPERIENCE */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                    Experience
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                    Control optional organization workspace experiences.
                  </p>
                </div>

                <div className="divide-y divide-[#B4C2D1]/50 rounded-lg border border-[#B4C2D1]/60">
                  <PreferenceRow
                    title="Dashboards"
                    description="Allow dashboards to be available within the organization workspace."
                    enabled={
                      settings.dashboardsEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "dashboardsEnabled",
                        value,
                      )
                    }
                  />

                  <PreferenceRow
                    title="Historical Reporting"
                    description="Allow access to historical performance reporting experiences."
                    enabled={
                      settings.historicalReportingEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "historicalReportingEnabled",
                        value,
                      )
                    }
                  />

                  <PreferenceRow
                    title="Employee Comments"
                    description="Allow employees to use comments within performance workflows."
                    enabled={
                      settings.employeeCommentsEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "employeeCommentsEnabled",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              {/* AI */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
                    AI
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
                    Control whether AI assistance is presented as an available
                    organization capability. Live AI remains subject to the
                    platform&apos;s AI rollout and authorization model.
                  </p>
                </div>

                <div className="rounded-lg border border-[#B4C2D1]/60">
                  <PreferenceRow
                    title="AI Assistance"
                    description="Allow AI assistance features to be presented within the organization workspace."
                    enabled={
                      settings.aiAssistanceEnabled
                    }
                    onChange={(value) =>
                      updateSetting(
                        "aiAssistanceEnabled",
                        value,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                ORGANIZATION NOTIFICATIONS
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                Notification Settings
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
                Control notifications generated for activity within this
                organization workspace.
              </p>
            </div>

            <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#F7F9FB] p-5">
              <PreferenceRow
                title="Enable Organization Notifications"
                description="Turn this on to allow organization-level notifications."
                enabled={
                  settings.notificationsEnabled
                }
                onChange={(value) =>
                  updateSetting(
                    "notificationsEnabled",
                    value,
                  )
                }
              />
            </div>

            <div
              className={`mt-6 divide-y divide-[#B4C2D1]/50 rounded-lg border border-[#B4C2D1]/60 ${
                settings.notificationsEnabled
                  ? "bg-white"
                  : "bg-[#F7F9FB]"
              }`}
            >
              <NotificationRow
                title="Administrative Notifications"
                description="Organization administration and configuration notifications."
                enabled={
                  settings.administrativeNotifications
                }
                masterEnabled={
                  settings.notificationsEnabled
                }
                onChange={(value) =>
                  updateSetting(
                    "administrativeNotifications",
                    value,
                  )
                }
              />

              <NotificationRow
                title="Performance Notifications"
                description="Notifications related to goals, performance activity, and workspace progress."
                enabled={
                  settings.performanceNotifications
                }
                masterEnabled={
                  settings.notificationsEnabled
                }
                onChange={(value) =>
                  updateSetting(
                    "performanceNotifications",
                    value,
                  )
                }
              />

              <NotificationRow
                title="System Notifications"
                description="Important organization workspace and system notifications."
                enabled={
                  settings.systemNotifications
                }
                masterEnabled={
                  settings.notificationsEnabled
                }
                onChange={(value) =>
                  updateSetting(
                    "systemNotifications",
                    value,
                  )
                }
              />
            </div>
          </section>

          {/* WORKSPACE PREFERENCES */}
          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                WORKSPACE PREFERENCES
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                Organization Workspace
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
                Configure a small set of useful behaviors for this
                organization workspace.
              </p>
            </div>

            <div className="divide-y divide-[#B4C2D1]/50">
              <PreferenceRow
                title="Confirm Before Deleting"
                description="Require confirmation before destructive organization actions are completed."
                enabled={
                  settings.confirmBeforeDeleting
                }
                onChange={(value) =>
                  updateSetting(
                    "confirmBeforeDeleting",
                    value,
                  )
                }
              />

              <PreferenceRow
                title="Show Helpful Tips"
                description="Display helpful guidance throughout the organization workspace."
                enabled={
                  settings.showHelpfulTips
                }
                onChange={(value) =>
                  updateSetting(
                    "showHelpfulTips",
                    value,
                  )
                }
              />
            </div>
          </section>
        </div>

        {/* CONTEXT MESSAGE */}
        <div className="mt-8 rounded-xl border border-[#B4C2D1]/70 bg-[#E9F4F8] p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082550] text-sm font-black text-white">
              i
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#082550]">
                CURRENT ORGANIZATION
              </p>

              <p className="mt-1 text-sm leading-6 text-[#272D2C]/70">
                These settings apply only to the organization associated with
                your current Organization Admin workspace. Organization
                context is determined by your authorized workspace access.
              </p>
            </div>
          </div>
        </div>

        {/* ASSISTANCE MESSAGE */}
        <div className="fixed bottom-5 right-5 z-40 w-[min(360px,calc(100vw-2.5rem))] rounded-xl border border-white/10 bg-[#082550] p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E26D5C] text-sm font-black text-white">
              ?
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#B4C2D1]">
                ORGANIZATION SETTINGS
              </p>

              <h3 className="mt-1 text-sm font-black uppercase text-white">
                NEED HELP CONFIGURING YOUR WORKSPACE?
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/75">
                Need help understanding an organization setting or deciding
                how your workspace should be configured? Contact your
                organization administrator for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ColorSettingProps = {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorSetting({
  label,
  description,
  value,
  onChange,
}: ColorSettingProps) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <div className="flex items-start gap-4">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          aria-label={label}
          className="h-12 w-12 shrink-0 cursor-pointer rounded-md border border-[#B4C2D1] bg-white p-1"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#272D2C]">
            {label}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            {description}
          </p>

          <input
            type="text"
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value,
              )
            }
            className="mt-3 h-9 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-xs font-mono uppercase text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
            aria-label={`${label} hex value`}
          />
        </div>
      </div>
    </div>
  );
}

type FeatureDependencyRowProps =
  PreferenceRowProps & {
    dependencyEnabled: boolean;
    dependencyLabel: string;
  };

function FeatureDependencyRow({
  title,
  description,
  enabled,
  onChange,
  dependencyEnabled,
  dependencyLabel,
}: FeatureDependencyRowProps) {
  return (
    <div
      className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${
        !dependencyEnabled
          ? "bg-[#F7F9FB]"
          : ""
      }`}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-[#272D2C]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          {description}
        </p>

        {!dependencyEnabled && (
          <p className="mt-2 text-[11px] font-bold text-[#E26D5C]">
            {dependencyLabel}
          </p>
        )}
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        disabled={!dependencyEnabled}
        label={title}
      />
    </div>
  );
}

function CoreFeatureCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="flex flex-col justify-center gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-[#272D2C]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          Core CascadEffects performance capability.
        </p>
      </div>

      <span className="w-fit rounded-full bg-[#E9F4F8] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#082550]">
        Always On
      </span>
    </div>
  );
}

type PreferenceRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function PreferenceRow({
  title,
  description,
  enabled,
  onChange,
}: PreferenceRowProps) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-[#272D2C]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

type NotificationRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  masterEnabled: boolean;
  onChange: (value: boolean) => void;
};

function NotificationRow({
  title,
  description,
  enabled,
  masterEnabled,
  onChange,
}: NotificationRowProps) {
  return (
    <div
      className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${
        !masterEnabled
          ? "opacity-55"
          : ""
      }`}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-[#272D2C]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        disabled={!masterEnabled}
        label={title}
      />
    </div>
  );
}

type ToggleProps = {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
};

function Toggle({
  enabled,
  onChange,
  disabled = false,
  label,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() =>
        onChange(!enabled)
      }
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2 ${
        enabled
          ? "bg-[#082550]"
          : "bg-[#B4C2D1]"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:opacity-90"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition ${
          enabled
            ? "translate-x-5"
            : "translate-x-0.5"
        }`}
      />
    </button>
  );
}