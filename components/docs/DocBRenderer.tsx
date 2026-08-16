import type { DocB } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h3>
      {children}
    </section>
  );
}

export default function DocBRenderer({ doc }: { doc: DocB }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Roles">
        <div className="flex flex-col gap-3">
          {doc.roles.map((role, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-zinc-900">{role.name}</p>
              <p className="text-sm text-zinc-700">{role.description}</p>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Screens">
        <div className="flex flex-col gap-4">
          {doc.screens.map((screen, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-3">
              <p className="text-sm font-medium text-zinc-900">{screen.name}</p>
              <p className="mt-1 text-sm text-zinc-700">{screen.description}</p>
              {screen.features.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-zinc-700">
                  {screen.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Field>

      <Field label="Flow">
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">{doc.flow}</p>
      </Field>

      <Field label="Features">
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-800">
          {doc.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Field>
    </div>
  );
}
