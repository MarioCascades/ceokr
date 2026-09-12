"use client";

type GeneralSettingsProps = {
  timezone: string;
  dateFormat: string;
  onTimezoneChange: (value: string) => void;
  onDateFormatChange: (value: string) => void;
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

export default function GeneralSettings({
  timezone,
  dateFormat,
  onTimezoneChange,
  onDateFormatChange,
}: GeneralSettingsProps) {
  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          PLATFORM DEFAULTS
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          General Settings
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
          Configure the default regional and display preferences used by the
          CascadEffects platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TIMEZONE */}
        <div>
          <label
            htmlFor="platform-timezone"
            className="block text-sm font-bold text-[#272D2C]"
          >
            Default Timezone
          </label>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            Used as the platform default when a timezone has not been
            specifically configured.
          </p>

          <select
            id="platform-timezone"
            value={timezone}
            onChange={(event) => onTimezoneChange(event.target.value)}
            className="mt-3 h-10 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-sm text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
          >
            {timezoneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* DATE FORMAT */}
        <div>
          <label
            htmlFor="platform-date-format"
            className="block text-sm font-bold text-[#272D2C]"
          >
            Date Format
          </label>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            Controls how dates are displayed throughout the platform.
          </p>

          <select
            id="platform-date-format"
            value={dateFormat}
            onChange={(event) => onDateFormatChange(event.target.value)}
            className="mt-3 h-10 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-sm text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
          >
            {dateFormatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.example}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="mt-6 border-t border-[#B4C2D1]/50 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#272D2C]">Platform Language</p>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              CascadEffects currently uses English as the platform language.
            </p>
          </div>

          <div className="inline-flex h-10 items-center rounded-md border border-[#B4C2D1] bg-[#F7F9FB] px-4 text-sm font-bold text-[#082550]">
            English
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="mt-6 rounded-md border border-[#B4C2D1]/50 bg-[#F7F9FB] px-4 py-3">
        <p className="text-xs leading-5 text-[#272D2C]/65">
          These values establish platform-level defaults. Individual
          organizations may have their own configuration where supported.
        </p>
      </div>
    </section>
  );
}