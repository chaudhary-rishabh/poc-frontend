import type { BuildPrompts } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h3>
      {children}
    </section>
  );
}

export default function BuildPromptsRenderer({ doc }: { doc: BuildPrompts }) {
  const decision = doc.architecture_decision;

  return (
    <div className="flex flex-col gap-6">
      <Field label="Architecture Decision">
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
              <span className="font-medium text-zinc-900">Repo strategy:</span> {decision.repo_strategy}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
              <span className="font-medium text-zinc-900">Service strategy:</span> {decision.service_strategy}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-700">{decision.reasoning}</p>
        </div>
      </Field>

      <Field label="Prompt Documents">
        <p className="text-sm leading-relaxed text-zinc-600">
          The Frontend, Backend, Deployment, and Build Sequence prompts are available as PDFs in the
          Artifacts panel.
        </p>
      </Field>
    </div>
  );
}
