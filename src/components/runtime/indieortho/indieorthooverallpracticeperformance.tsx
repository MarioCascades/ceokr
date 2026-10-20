"use client";

import Image from "next/image";

export interface PracticePerformanceMetric {
  key: "production" | "collections" | "starts" | "same-day-starts";
  title: string;
  lastMonth: string;
  target: string;
  thisMonth: string;
  score?: number | null;
}

interface IndieOrthoOverallPracticePerformanceProps {
  organizationId: string;
  performanceMonth: string;
  indieOrthoLogoUrl: string | null;
  metrics: PracticePerformanceMetric[];
}

function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}

function monthHref(organizationId: string, month: string): string {
  return `/runtime?organizationId=${encodeURIComponent(organizationId)}&runtimeTab=overall-practice-performance&performanceMonth=${encodeURIComponent(month)}`;
}

function scoreBoxClassName(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return "border-gray-200 bg-gray-100 text-gray-500";
  }

  const roundedScore = Math.round(score);
  if (roundedScore >= 90) {
    return "border-green-200 bg-green-100 text-green-700";
  }
  if (roundedScore >= 50) {
    return "border-yellow-200 bg-yellow-100 text-yellow-800";
  }
  return "border-orange-200 bg-orange-100 text-orange-700";
}

function scoreStatus(score: number | null | undefined): string | null {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return null;
  }
  const roundedScore = Math.round(score);
  if (roundedScore >= 90) return "Passed";
  if (roundedScore >= 50) return "Reaching";
  return "Below Target";
}

function displayScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return null;
  }
  return `${Math.round(score)}%`;
}

export default function IndieOrthoOverallPracticePerformance({
  organizationId,
  performanceMonth,
  indieOrthoLogoUrl,
  metrics,
}: IndieOrthoOverallPracticePerformanceProps) {
  function renderValueBox(
    value: string,
    variant: "lastMonth" | "target" | "thisMonth"
  ) {
    const baseClass =
      "flex min-h-[58px] items-center justify-center break-words rounded-md border-2 px-2 py-3 text-center tabular-nums";
    const variantClass = {
      lastMonth: "border-[#B4C2D1] bg-[#E7F3F8] text-[#272D2C] font-semibold",
      target: "border-[#9BAEC2] bg-[#B4C2D1] text-[#272D2C] font-semibold",
      thisMonth: "border-slate-200 bg-white text-[#272D2C] font-semibold",
    }[variant];

    return (
      <dd className={`${baseClass} ${variantClass}`}>
        <span className="text-sm sm:text-base">{value || "—"}</span>
      </dd>
    );
  }

  function renderScoreBox(score: number | null | undefined) {
    const scoreText = displayScore(score);
    const status = scoreStatus(score);

    return (
      <dd
        className={`flex min-h-[58px] flex-col items-center justify-center gap-1 break-words rounded-md border-2 border-black px-2 py-2 text-center tabular-nums ${scoreBoxClassName(score)}`}
      >
        {scoreText ? (
          <>
            <span className="text-sm font-bold sm:text-base">{scoreText}</span>
            <span className="text-[10px] font-medium leading-tight sm:text-[11px]">
              {status}
            </span>
          </>
        ) : (
          <span className="text-sm font-semibold sm:text-base">—</span>
        )}
      </dd>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E5E8] text-[#080808]">
      <header className="sticky top-0 z-40 border-b border-white/15 bg-[#080808] text-white shadow-md">
        <div className="mx-auto flex min-h-[100px] w-full max-w-[1800px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center">
            {indieOrthoLogoUrl ? (
              <Image
                src={indieOrthoLogoUrl}
                alt="Indie Ortho"
                width={180}
                height={56}
                unoptimized
                className="max-h-14 w-auto max-w-[180px] object-contain object-left"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight">INDIE ORTHO</span>
            )}
          </div>

          <div className="flex min-w-0 flex-[2] flex-col items-center gap-3 text-center">
            <h1 className="text-lg font-bold uppercase tracking-wide sm:text-2xl">
              Overall Practice
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <label htmlFor="practice-performance-month" className="font-medium text-white/75">
                Month
              </label>
              <select
                id="practice-performance-month"
                value={performanceMonth}
                onChange={(event) => {
                  window.location.href = monthHref(organizationId, event.target.value);
                }}
                className="max-w-[175px] rounded-md border border-white/20 bg-[#202020] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E17E2D]"
              >
                {Array.from({ length: 13 }, (_, index) => {
                  const [year, month] = performanceMonth.split("-").map(Number);
                  const date = new Date(Date.UTC(year, month - 1 - index, 1));
                  const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
                  return <option key={value} value={value}>{monthLabel(value)}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end">
            <Image
              src="/logos/CECleanlogo.png"
              alt="CascadEffects"
              width={150}
              height={48}
              className="max-h-12 w-auto max-w-[150px] object-contain object-right"
            />
          </div>
        </div>
        <div className="h-1 bg-[#E17E2D]" />
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-black/70">
            Practice Metrics
          </h2>
          <p className="text-sm text-black/65">{monthLabel(performanceMonth)}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {metrics.map((metric) => (
            <section
              key={metric.key}
              className="overflow-hidden rounded-xl border border-black/15 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_7px_18px_rgba(0,0,0,0.16)]"
            >
              <div className="h-1.5 bg-[#E17E2D]" />
              <div className="p-4 sm:p-5">
                <h3 className="text-center text-base font-bold leading-snug sm:text-lg">
                  {metric.title}
                </h3>
                <div className="my-4 border-t border-[#E17E2D]/60" />
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  <div className="min-w-0">
                    <dt className="mb-2 text-center text-xs font-semibold text-black/75 sm:text-sm">
                      Last Month
                    </dt>
                    {renderValueBox(metric.lastMonth, "lastMonth")}
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-center text-xs font-semibold text-black/75 sm:text-sm">
                      Target
                    </dt>
                    {renderValueBox(metric.target, "target")}
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-center text-xs font-semibold text-black/75 sm:text-sm">
                      This Month
                    </dt>
                    {renderValueBox(metric.thisMonth, "thisMonth")}
                  </div>
                  <div className="min-w-0">
                    <dt className="mb-2 text-center text-xs font-semibold text-black/75 sm:text-sm">
                      Score
                    </dt>
                    {renderScoreBox(metric.score)}
                  </div>
                </dl>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
