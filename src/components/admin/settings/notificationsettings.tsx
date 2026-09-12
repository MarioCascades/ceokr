"use client";

type NotificationSettingsProps = {
  enabled: boolean;
  administrativeNotifications: boolean;
  systemNotifications: boolean;
  performanceNotifications: boolean;
  onEnabledChange: (value: boolean) => void;
  onAdministrativeChange: (value: boolean) => void;
  onSystemChange: (value: boolean) => void;
  onPerformanceChange: (value: boolean) => void;
};

export default function NotificationSettings({
  enabled,
  administrativeNotifications,
  systemNotifications,
  performanceNotifications,
  onEnabledChange,
  onAdministrativeChange,
  onSystemChange,
  onPerformanceChange,
}: NotificationSettingsProps) {
  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          PLATFORM NOTIFICATIONS
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          Notification Settings
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
          Control whether platform-level administrative and system
          notifications are enabled.
        </p>
      </div>

      {/* MASTER SETTING */}
      <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#F7F9FB] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-[#082550]">
              Enable Platform Notifications
            </p>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Turn this on to allow CascadEffects platform notifications.
              Notifications are off by default.
            </p>
          </div>

          <Toggle
            enabled={enabled}
            onChange={onEnabledChange}
            label="Enable platform notifications"
          />
        </div>
      </div>

      {/* NOTIFICATION TYPES */}
      <div className="mt-6">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#272D2C]/50">
            Notification Types
          </p>
        </div>

        <div
          className={`divide-y divide-[#B4C2D1]/50 rounded-lg border border-[#B4C2D1]/60 ${
            enabled ? "bg-white" : "bg-[#F7F9FB]"
          }`}
        >
          <NotificationRow
            title="Administrative Notifications"
            description="Important platform administration and configuration notifications."
            enabled={administrativeNotifications}
            masterEnabled={enabled}
            onChange={onAdministrativeChange}
          />

          <NotificationRow
            title="System Notifications"
            description="Platform service, maintenance, and system-related notifications."
            enabled={systemNotifications}
            masterEnabled={enabled}
            onChange={onSystemChange}
          />

          <NotificationRow
            title="Performance Notifications"
            description="Platform-level notifications related to performance management activity."
            enabled={performanceNotifications}
            masterEnabled={enabled}
            onChange={onPerformanceChange}
          />
        </div>
      </div>

      {/* DISABLED STATE MESSAGE */}
      {!enabled && (
        <div className="mt-4 rounded-md border border-[#B4C2D1]/50 bg-[#F7F9FB] px-4 py-3">
          <p className="text-xs leading-5 text-[#272D2C]/60">
            Platform notifications are currently disabled. Turn on the master
            setting above to configure individual notification types.
          </p>
        </div>
      )}
    </section>
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
        !masterEnabled ? "opacity-55" : ""
      }`}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-[#272D2C]">{title}</p>

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
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2 ${
        enabled ? "bg-[#082550]" : "bg-[#B4C2D1]"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:opacity-90"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}