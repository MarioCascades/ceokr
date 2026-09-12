export default function AIPrompts() {
  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          AI PROMPTS
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          Prompt Library
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
          A future centralized library for managing reusable prompts that
          support CascadEffects AI-assisted workflows.
        </p>
      </div>

      <div className="space-y-3">
        <PromptRow
          title="Performance Summary"
          description="Summarize current organizational performance and highlight important trends."
        />

        <PromptRow
          title="Objective Risk Review"
          description="Identify objectives that may be at risk based on their current performance."
        />

        <PromptRow
          title="KPI Recommendation"
          description="Suggest measurable KPIs or Key Results that align with a defined objective."
        />

        <PromptRow
          title="Initiative Recommendation"
          description="Suggest initiatives that may help improve performance against a Key Result."
        />
      </div>

      <button
        type="button"
        disabled
        className="mt-5 rounded-lg border border-[#B4C2D1] bg-[#F7F9FB] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#082550]/50"
      >
        Add Prompt — Coming Later
      </button>

      <div className="mt-5 rounded-lg border border-dashed border-[#B4C2D1] bg-[#F7F9FB] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#082550]">
          PREVIEW CONFIGURATION
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          These prompts are examples of the future prompt-management
          capability. They are not submitted to an AI provider.
        </p>
      </div>
    </section>
  );
}

function PromptRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase text-[#082550]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/65">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-[#B4C2D1] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
          Sample
        </span>
      </div>
    </div>
  );
}