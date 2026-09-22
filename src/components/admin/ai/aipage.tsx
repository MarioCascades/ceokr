"use client";

import Link from "next/link";

import AIAssistants from "./aiassistants";
import AIModels from "./aimodels";
import AIPrompts from "./aiprompts";
import AIUsage from "./aiusage";

export default function AIPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#082550] hover:underline"
            >
              ← Back to Administration
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
              PLATFORM AI
            </p>

            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-[#082550]">
              AI Configuration
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#272D2C]/65">
              Configure the future AI-assisted capabilities of the
              CascadEffects Performance Platform.
            </p>
          </div>

          <div className="rounded-lg border border-[#B4C2D1]/70 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#272D2C]/55">
              SERVICE STATUS
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E26D5C]" />
              <span className="text-sm font-bold text-[#082550]">
                Preview Mode
              </span>
            </div>
          </div>
        </div>

        {/* PREVIEW NOTICE */}
        <section className="mb-8 overflow-hidden rounded-xl border border-[#B4C2D1]/70 bg-white shadow-sm">
          <div className="border-l-4 border-[#E26D5C] bg-[#E9F4F8] p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082550] text-sm font-black text-white">
                AI
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E26D5C]">
                  AI PREVIEW
                </p>

                <h2 className="mt-1 text-lg font-black uppercase text-[#082550]">
                  AI Services Are Not Connected
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]/70">
                  This page demonstrates the planned CascadEffects AI
                  configuration experience. AI provider connections,
                  credentials, API usage, and generated responses are not
                  enabled in this preview.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI CAPABILITIES */}
        <section className="mb-8 rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
              AI CAPABILITIES
            </p>

            <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
              Planned Intelligence
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]/65">
              These capabilities represent areas where AI may eventually
              assist administrators and performance-management workflows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CapabilityCard
              title="Goal & Objective Suggestions"
              description="Assist administrators with drafting meaningful objectives aligned to organizational priorities."
              status="Planned"
            />

            <CapabilityCard
              title="KPI Recommendations"
              description="Recommend measurable Key Results and performance indicators based on organizational goals."
              status="Planned"
            />

            <CapabilityCard
              title="Performance Analysis"
              description="Identify trends, performance gaps, risks, and areas that may require management attention."
              status="Planned"
            />

            <CapabilityCard
              title="Initiative Suggestions"
              description="Suggest practical initiatives that may help teams improve performance against Key Results."
              status="Planned"
            />

            <CapabilityCard
              title="Automated Summaries"
              description="Generate concise performance summaries for administrators, managers, and organizational reporting."
              status="Planned"
            />

            <CapabilityCard
              title="Organizational Insights"
              description="Surface patterns across organizational performance data to support better decision-making."
              status="Future"
            />
          </div>
        </section>

        {/* CONFIGURATION AREAS */}
        <div className="grid gap-8 xl:grid-cols-2">
          <AIAssistants />
          <AIModels />
          <AIPrompts />
          <AIUsage />
        </div>

        {/* SAMPLE QUESTIONS */}
        <section className="mt-8 rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
              SAMPLE AI QUESTIONS
            </p>

            <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
              Future AI Assistance
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#272D2C]/65">
              Examples of questions CascadEffects may eventually answer using
              organization performance data.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <QuestionCard>
              What objectives are currently most at risk?
            </QuestionCard>

            <QuestionCard>
              Which Key Results show the largest performance gaps?
            </QuestionCard>

            <QuestionCard>
              Summarize our organization&apos;s performance this month.
            </QuestionCard>

            <QuestionCard>
              Suggest KPIs for improving customer retention.
            </QuestionCard>

            <QuestionCard>
              Which teams may need management attention?
            </QuestionCard>

            <QuestionCard>
              What initiatives could help address these performance gaps?
            </QuestionCard>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-[#B4C2D1] bg-[#F7F9FB] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#082550]">
              Preview Only
            </p>

            <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
              Sample questions are presented for product demonstration only.
              They do not submit requests to an AI provider.
            </p>
          </div>
        </section>

        {/* PLATFORM CONTEXT */}
        <div className="mt-8 rounded-xl border border-[#B4C2D1]/70 bg-[#E9F4F8] p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082550] text-sm font-black text-white">
              i
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#082550]">
                PLATFORM AI
              </p>

              <p className="mt-1 text-sm leading-6 text-[#272D2C]/70">
                AI is intended to augment the CascadEffects performance
                platform rather than replace its underlying performance
                engine. Future AI capabilities will operate against the
                platform&apos;s existing organizations, Performance Sheets,
                Runtime data, reporting, and configuration models.
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
                AI CONFIGURATION
              </p>

              <h3 className="mt-1 text-sm font-black uppercase text-white">
                NEED HELP CONFIGURING AI?
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/75">
                Need help understanding the planned AI capabilities or
                deciding how AI may eventually support your organization?
                Contact your CascadEffects administrator for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CapabilityCardProps = {
  title: string;
  description: string;
  status: "Planned" | "Future";
};

function CapabilityCard({
  title,
  description,
  status,
}: CapabilityCardProps) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-black uppercase text-[#082550]">
          {title}
        </h3>

        <span className="shrink-0 rounded-full border border-[#B4C2D1] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
          {status}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#272D2C]/65">
        {description}
      </p>
    </div>
  );
}

function QuestionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#082550] text-[10px] font-black text-white">
          AI
        </div>

        <p className="text-sm leading-5 text-[#272D2C]">{children}</p>
      </div>
    </div>
  );
}