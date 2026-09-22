"use client";

import { useEffect, useState } from "react";
import GeneralSettings from "@/components/admin/settings/generalsettings";
import NotificationSettings from "@/components/admin/settings/notificationsettings";
import BrandingSettings from "@/components/admin/settings/brandingsettings";

const STORAGE_KEY = "ce-super-admin-settings";

const DEFAULT_LOGO = "/logos/CECleanlogo.png";

type SettingsState = {
  timezone: string;
  dateFormat: string;
  notificationsEnabled: boolean;
  administrativeNotifications: boolean;
  systemNotifications: boolean;
  performanceNotifications: boolean;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  confirmBeforeDeleting: boolean;
  showHelpfulTips: boolean;
  compactDataTables: boolean;
};

const defaultSettings: SettingsState = {
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  notificationsEnabled: false,
  administrativeNotifications: true,
  systemNotifications: true,
  performanceNotifications: true,
  logoUrl: DEFAULT_LOGO,
  primaryColor: "#082550",
  accentColor: "#E26D5C",
  confirmBeforeDeleting: true,
  showHelpfulTips: true,
  compactDataTables: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<SettingsState>;

      setSettings({
        ...defaultSettings,
        ...parsed,
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateSettings = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const handleLogoChange = (logoUrl: string) => {
    updateSettings("logoUrl", logoUrl);
  };

  const handleRestoreDefaultLogo = () => {
    updateSettings("logoUrl", DEFAULT_LOGO);
  };

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#E26D5C]">
            PLATFORM CONFIGURATION
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#082550]">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/70">
                Manage CascadEffects platform defaults, notifications, branding,
                and system preferences.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#082550] px-5 text-sm font-bold text-white transition hover:bg-[#0b356d] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2"
            >
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <GeneralSettings
            timezone={settings.timezone}
            dateFormat={settings.dateFormat}
            onTimezoneChange={(value) => updateSettings("timezone", value)}
            onDateFormatChange={(value) =>
              updateSettings("dateFormat", value)
            }
          />

          <NotificationSettings
            enabled={settings.notificationsEnabled}
            administrativeNotifications={
              settings.administrativeNotifications
            }
            systemNotifications={settings.systemNotifications}
            performanceNotifications={settings.performanceNotifications}
            onEnabledChange={(value) =>
              updateSettings("notificationsEnabled", value)
            }
            onAdministrativeChange={(value) =>
              updateSettings("administrativeNotifications", value)
            }
            onSystemChange={(value) =>
              updateSettings("systemNotifications", value)
            }
            onPerformanceChange={(value) =>
              updateSettings("performanceNotifications", value)
            }
          />

          <BrandingSettings
            logoUrl={settings.logoUrl}
            primaryColor={settings.primaryColor}
            accentColor={settings.accentColor}
            onLogoChange={handleLogoChange}
            onRestoreDefaultLogo={handleRestoreDefaultLogo}
            onPrimaryColorChange={(value) =>
              updateSettings("primaryColor", value)
            }
            onAccentColorChange={(value) =>
              updateSettings("accentColor", value)
            }
          />

          <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
                SYSTEM
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
                System Preferences
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
                Control common platform behaviors and presentation preferences.
              </p>
            </div>

            <div className="divide-y divide-[#B4C2D1]/50">
              <PreferenceRow
                title="Confirm Before Deleting"
                description="Require confirmation before destructive actions are completed."
                enabled={settings.confirmBeforeDeleting}
                onChange={(value) =>
                  updateSettings("confirmBeforeDeleting", value)
                }
              />

              <PreferenceRow
                title="Show Helpful Tips"
                description="Display helpful guidance throughout the platform."
                enabled={settings.showHelpfulTips}
                onChange={(value) => updateSettings("showHelpfulTips", value)}
              />

              <PreferenceRow
                title="Compact Data Tables"
                description="Use a denser table presentation where supported."
                enabled={settings.compactDataTables}
                onChange={(value) =>
                  updateSettings("compactDataTables", value)
                }
              />
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-xl border border-[#B4C2D1]/70 bg-[#E9F4F8] p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082550] text-sm font-black text-white">
              i
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#082550]">
                PLATFORM SETTINGS
              </p>

              <p className="mt-1 text-sm leading-6 text-[#272D2C]/70">
                These settings apply at the CascadEffects platform level.
                Organization-specific configuration will be managed separately
                within the Organization Admin workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-5 right-5 z-40 w-[min(360px,calc(100vw-2.5rem))] rounded-xl border border-white/10 bg-[#082550] p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E26D5C] text-sm font-black text-white">
              ?
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#B4C2D1]">
                PLATFORM SETTINGS
              </p>

              <h3 className="mt-1 text-sm font-black uppercase text-white">
                NEED HELP CONFIGURING CASCADEFFECTS?
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/75">
                Need help understanding a platform setting or deciding how
                CascadEffects should be configured? Contact your CascadEffects
                Admin for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
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
        <p className="text-sm font-bold text-[#272D2C]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2 ${
          enabled ? "bg-[#082550]" : "bg-[#B4C2D1]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}