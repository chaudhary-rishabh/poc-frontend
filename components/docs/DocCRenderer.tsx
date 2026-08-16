import type { DocC } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h3>
      {children}
    </section>
  );
}

const techStackLabel: Record<keyof DocC["tech_stack"], string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
};

export default function DocCRenderer({ doc }: { doc: DocC }) {
  const techStack = doc.tech_stack;
  const dbSchema = doc.db_schema ?? [];
  const apiRoutes = doc.api_routes ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Field label="Tech Stack">
        <div className="flex flex-wrap gap-2">
          {techStack &&
            (Object.keys(techStackLabel) as (keyof DocC["tech_stack"])[])
              .filter((key) => techStack[key])
              .map((key) => (
                <span
                  key={key}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                >
                  <span className="font-medium text-zinc-900">{techStackLabel[key]}:</span>{" "}
                  {techStack[key]}
                </span>
              ))}
        </div>
      </Field>

      <Field label="Database Schema">
        <div className="flex flex-col gap-4">
          {dbSchema.map((table, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-zinc-200">
              <div className="bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white">
                {table.table}
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {(table.fields ?? []).map((field, j) => (
                    <tr key={j} className="border-t border-zinc-100 first:border-t-0">
                      <td className="px-3 py-1.5 font-mono text-zinc-900">{field.name}</td>
                      <td className="px-3 py-1.5 font-mono text-zinc-500">{field.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <p className="text-xs text-zinc-600">{route.purpose}</p>
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
