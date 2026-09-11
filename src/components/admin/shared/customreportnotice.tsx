export default function CustomReportNotice() {
  return (
    <aside
      className="
        fixed bottom-5 right-5 z-50
        w-[min(360px,calc(100vw-2rem))]
        rounded-2xl
        border border-slate-200
        bg-slate-900
        p-5
        text-white
        shadow-2xl
        ring-1 ring-black/5
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full bg-white/10 text-lg
          "
          aria-hidden="true"
        >
          ✦
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            Custom Reporting
          </p>

          <h2 className="mt-1 text-base font-semibold">
            Need a custom dashboard or report?
          </h2>

          <p className="mt-2 text-sm leading-5 text-slate-300">
            Need specific KPIs, charts, tables, or historical reporting?
            Contact your CascadEffects Admin for assistance.
          </p>

          <a
            href="mailto:mario@cascadeffects.com"
            className="
              mt-3 inline-flex
              font-semibold
              text-white
              underline decoration-white/40 underline-offset-4
              transition-colors
              hover:text-slate-200
              hover:decoration-white
            "
          >
            mario@cascadeffects.com
          </a>
        </div>
      </div>
    </aside>
  );
}