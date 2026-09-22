export default function OrganizationAIPage() {
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E26D5C]">
            ORGANIZATION AI
          </p>

          <h1 className="mt-1 text-3xl font-black uppercase text-[#082550]">
            AI Assistant
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
            Use future AI capabilities to support performance planning,
            recommendations, analysis, and reporting for your organization.
          </p>
        </div>

        <span className="w-fit rounded-full border border-[#B4C2D1] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
          Preview
        </span>
      </div>

      {/* AI STATUS */}
      <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E26D5C]">
              AI STATUS
            </p>

            <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
              Organization AI is not connected
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
              This workspace previews the future AI experience. AI services
              will be connected after platform AI approval and configuration.
            </p>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-[#B4C2D1] bg-[#F7F9FB] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-[#082550]">
            Coming Later
          </span>
        </div>
      </section>

      {/* AI CAPABILITIES */}
      <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E26D5C]">
            ORGANIZATION CAPABILITIES
          </p>

          <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
            What AI Could Help With
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
            Future AI assistance will work from the performance information
            available within your organization.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CapabilityCard
            title="Performance Insights"
            description="Identify trends, performance gaps, and areas that may require management attention."
          />

          <CapabilityCard
            title="Objective Assistance"
            description="Help managers develop clearer objectives and measurable Key Results."
          />

          <CapabilityCard
            title="Initiative Suggestions"
            description="Suggest initiatives that may help teams improve performance against their Key Results."
          />

          <CapabilityCard
            title="Performance Summaries"
            description="Generate concise summaries of organizational performance for management review."
          />
        </div>
      </section>

      {/* SAMPLE QUESTIONS */}
      <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E26D5C]">
            EXAMPLE QUESTIONS
          </p>

          <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
            Ask About Your Organization
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
            These examples illustrate how an organization could eventually
            interact with the AI assistant.
          </p>
        </div>

        <div className="space-y-3">
          <QuestionRow text="Which objectives are currently at risk?" />
          <QuestionRow text="What are the biggest performance gaps this period?" />
          <QuestionRow text="Which teams are performing ahead of expectations?" />
          <QuestionRow text="What initiatives could improve our lowest-performing Key Results?" />
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-[#B4C2D1] bg-[#F7F9FB] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#082550]">
            AI PREVIEW ONLY
          </p>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
            These questions are examples only. No AI request will be submitted
            and no external AI service is currently connected.
          </p>
        </div>
      </section>

      {/* FLOATING HELP */}
      <div className="fixed bottom-5 right-5 z-50 w-[280px] rounded-xl border border-[#B4C2D1]/70 bg-[#082550] p-4 shadow-xl">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E26D5C] text-xs font-black text-white">
            ?
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/70">
              ORGANIZATION AI
            </p>

            <h3 className="mt-1 text-xs font-black uppercase leading-4 text-white">
              NEED HELP USING AI?
            </h3>

            <p className="mt-1 text-[11px] leading-4 text-white/70">
              AI assistance is being prepared for your organization. Contact
              your organization administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <h3 className="text-sm font-black uppercase text-[#082550]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#272D2C]/65">
        {description}
      </p>

      <span className="mt-4 inline-block rounded-full border border-[#B4C2D1] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
        Planned
      </span>
    </div>
  );
}

function QuestionRow({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] px-4 py-3">
      <p className="text-sm font-medium text-[#082550]">{text}</p>
    </div>
  );
}