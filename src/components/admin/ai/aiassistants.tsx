export default function AIAssistants() {
  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          AI ASSISTANTS
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          Intelligent Assistance
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
          Define the types of AI assistance that may eventually be available
          throughout the CascadEffects platform.
        </p>
      </div>

      <div className="space-y-3">
        <AssistantRow
          name="Performance Planning Assistant"
          description="Help administrators and managers develop objectives, Key Results, and initiatives."
        />

        <AssistantRow
          name="Performance Analysis Assistant"
          description="Analyze performance information and highlight trends, gaps, and potential risks."
        />

        <AssistantRow
          name="Reporting Assistant"
          description="Prepare concise summaries and insights from organizational performance data."
        />

        <AssistantRow
          name="Management Insight Assistant"
          description="Surface areas that may require attention and suggest questions for managers to consider."
        />
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-[#B4C2D1] bg-[#F7F9FB] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#082550]">
          PREVIEW CONFIGURATION
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          Assistant configuration is currently for presentation purposes.
          No AI assistant is connected or executing requests.
        </p>
      </div>
    </section>
  );
}

function AssistantRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <div>
        <h3 className="text-sm font-black uppercase text-[#082550]">
          {name}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/65">
          {description}
        </p>
      </div>

      <span className="shrink-0 rounded-full border border-[#B4C2D1] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
        Planned
      </span>
    </div>
  );
}