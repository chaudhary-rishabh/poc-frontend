import type { DocC } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h3>
      {children}
    </section>
  );
}

export default function DocCRenderer({ doc }: { doc: DocC }) {
  const techStack = doc.tech_stack ?? [];
  const apiRoutes = doc.api_routes ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Field label="Database Schema">
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-800">
          {doc.db_schema}
        </pre>
      </Field>

      <Field label="Tech Stack">
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, i) => (
            <span key={i} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
              {tech}
            </span>
          ))}
        </div>
      </Field>

      <Field label="API Routes">
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {apiRoutes.map((route, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 text-sm">
              <span className="shrink-0 rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-white">
                {route.method}
              </span>
              <div>
                <p className="font-mono text-xs text-zinc-900">{route.path}</p>
                <p className="text-xs text-zinc-600">{route.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Folder Structure">
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-800">
          {doc.folder_structure}
        </pre>
      </Field>
    </div>
  );
}
