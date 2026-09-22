export default function AIModels() {
  return (
    <section className="rounded-xl border border-[#B4C2D1]/70 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E26D5C]">
          AI MODELS
        </p>

        <h2 className="mt-1 text-xl font-black uppercase text-[#082550]">
          Model Configuration
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
          The future location for configuring AI model providers and model
          behavior within the CascadEffects platform.
        </p>
      </div>

      <div className="space-y-3">
        <ModelRow
          name="Primary AI Model"
          value="Not configured"
          description="The primary model that future CascadEffects AI capabilities may use."
        />

        <ModelRow
          name="Analysis Model"
          value="Not configured"
          description="A future model configuration intended for performance analysis and organizational insights."
        />

        <ModelRow
          name="Recommendation Model"
          value="Not configured"
          description="A future model configuration intended for goal, KPI, and initiative recommendations."
        />
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-[#B4C2D1] bg-[#F7F9FB] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#082550]">
          PROVIDER INTEGRATION
        </p>

        <p className="mt-1 text-xs leading-5 text-[#272D2C]/60">
          AI provider selection and credentials will be added when AI
          integration is approved. No provider connection is active in this
          preview.
        </p>
      </div>
    </section>
  );
}

function ModelRow({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[#B4C2D1]/60 bg-[#F7F9FB] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-black uppercase text-[#082550]">
            {name}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#272D2C]/65">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-[#B4C2D1] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#082550]">
          {value}
        </span>
      </div>
    </div>
  );
}