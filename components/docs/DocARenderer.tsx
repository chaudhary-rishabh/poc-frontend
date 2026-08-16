import type { DocA } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h3>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-zinc-400 italic">None noted</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-800">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function DocARenderer({ doc }: { doc: DocA }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Goal">
        <p className="text-sm leading-relaxed text-zinc-800">{doc.goal}</p>
      </Field>
      <Field label="Current Process">
        <p className="text-sm leading-relaxed text-zinc-800">{doc.current_process}</p>
      </Field>
      <Field label="Pain Points">
        <List items={doc.pain_points} />
      </Field>
      <Field label="Missing Information">
        <List items={doc.missing_info} />
      </Field>
      <Field label="Proposed Process">
        <p className="text-sm leading-relaxed text-zinc-800">{doc.proposed_process}</p>
      </Field>
    </div>
  );
}
