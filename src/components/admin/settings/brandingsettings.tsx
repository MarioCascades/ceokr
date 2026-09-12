"use client";

import { ChangeEvent, useRef } from "react";

type BrandingSettingsProps = {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  onLogoChange: (logoUrl: string) => void;
  onRestoreDefaultLogo: () => void;
  onPrimaryColorChange: (value: string) => void;
  onAccentColorChange: (value: string) => void;
};

const DEFAULT_LOGO = "/logos/CECleanlogo.png";

export default function BrandingSettings({
  logoUrl,
  primaryColor,
  accentColor,
  onLogoChange,
  onRestoreDefaultLogo,
  onPrimaryColorChange,
  onAccentColorChange,
}: BrandingSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onLogoChange(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleChangeLogo = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreDefault = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onRestoreDefaultLogo();
  };

  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          BRANDING
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          CascadEffects Branding
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
          Manage the default CascadEffects platform identity used throughout
          the application.
        </p>
      </div>

      <div className="space-y-8">
        {/* PLATFORM LOGO */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
              Platform Logo
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Select the logo used as the default CascadEffects platform
              identity.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-lg border border-[#B4C2D1]/70 bg-[#F7F9FB] p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#272D2C]/55">
                Current Logo
              </p>

              <div className="flex min-h-[150px] items-center justify-center rounded-md border border-[#B4C2D1]/50 bg-white p-6">
                <img
                  src={logoUrl || DEFAULT_LOGO}
                  alt="CascadEffects platform logo"
                  className="max-h-28 max-w-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleChangeLogo}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#082550] px-4 text-sm font-bold text-white transition hover:bg-[#0b356d] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2"
              >
                Change / Upload Logo
              </button>

              <button
                type="button"
                onClick={handleRestoreDefault}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#B4C2D1] bg-white px-4 text-sm font-bold text-[#082550] transition hover:bg-[#F7F9FB] focus:outline-none focus:ring-2 focus:ring-[#E26D5C] focus:ring-offset-2"
              >
                Restore Default
              </button>

              <p className="text-center text-[11px] leading-4 text-[#272D2C]/50">
                PNG, JPG, WEBP, or SVG
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-[#B4C2D1]/50 bg-[#E9F4F8] px-4 py-3">
            <p className="text-xs leading-5 text-[#272D2C]/70">
              The CascadEffects default logo is currently{" "}
              <span className="font-bold">CECleanlogo.png</span>. A selected
              image is previewed locally for this development stage. Permanent
              platform storage will be connected when the platform persistence
              and authentication layers are implemented.
            </p>
          </div>
        </div>

        {/* PLATFORM COLORS */}
        <div className="border-t border-[#B4C2D1]/50 pt-8">
          <div className="mb-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
              Platform Colors
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Define the default CascadEffects colors used by the platform
              interface.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ColorSetting
              label="Primary Color"
              description="Main platform color used for navigation, headings, and primary actions."
              value={primaryColor}
              onChange={onPrimaryColorChange}
            />

            <ColorSetting
              label="Accent Color"
              description="Supporting accent used for highlights, labels, and emphasis."
              value={accentColor}
              onChange={onAccentColorChange}
            />
          </div>
        </div>

        {/* BRANDING PREVIEW */}
        <div className="border-t border-[#B4C2D1]/50 pt-8">
          <div className="mb-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-[#082550]">
              Branding Preview
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Preview how the current platform branding will appear together.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-lg border border-[#B4C2D1]/70"
            style={{ borderTopColor: primaryColor }}
          >
            <div
              className="flex items-center justify-between gap-4 px-5 py-4"
              style={{ backgroundColor: primaryColor }}
            >
              <img
                src={logoUrl || DEFAULT_LOGO}
                alt="CascadEffects branding preview"
                className="max-h-10 max-w-[180px] object-contain"
              />

              <span
                className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
                style={{
                  backgroundColor: accentColor,
                  color: "#FFFFFF",
                }}
              >
                Platform
              </span>
            </div>

            <div className="bg-white px-5 py-5">
              <p className="text-sm font-bold text-[#082550]">
                CascadEffects Performance Platform
              </p>

              <p className="mt-1 text-xs text-[#272D2C]/60">
                Default platform branding preview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
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
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="h-12 w-12 shrink-0 cursor-pointer rounded-md border border-[#B4C2D1] bg-white p-1"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#272D2C]">{label}</p>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            {description}
          </p>

          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-3 h-9 w-full rounded-md border border-[#B4C2D1] bg-white px-3 text-xs font-mono uppercase text-[#272D2C] outline-none focus:border-[#082550] focus:ring-1 focus:ring-[#082550]"
            aria-label={`${label} hex value`}
          />
        </div>
      </div>
    </div>
  );
}