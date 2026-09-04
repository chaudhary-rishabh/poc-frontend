"use client";

import { buildPromptsPdfUrl } from "@/lib/apiClient";
import type { BuildPromptDocType } from "@/lib/apiClient";
import { downloadArtifact } from "@/lib/downloadArtifact";
import type { DocType, SessionState } from "@/lib/types";

interface ArtifactRow {
  type: DocType;
  title: string;
  typeLabel: string;
  data: unknown;
}

interface PdfRow {
  title: string;
  typeLabel: string;
  docType: BuildPromptDocType;
}

const buildPromptsPdfRows: PdfRow[] = [
  { title: "Frontend Build Prompt", typeLabel: "Document · PDF", docType: "frontend" },
  { title: "Backend Build Prompt", typeLabel: "Document · PDF", docType: "backend" },
  { title: "Deployment Prompt", typeLabel: "Document · PDF", docType: "deployment" },
  { title: "Build Sequence Guide", typeLabel: "Document · PDF", docType: "sequence" },
];

const docIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-zinc-400">
    <path
      d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const downloadIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ArtifactsPanelProps {
  session: SessionState;
  activeArtifact: DocType | null;
  onSelect: (type: DocType) => void;
}

export default function ArtifactsPanel({ session, activeArtifact, onSelect }: ArtifactsPanelProps) {
  const rows: ArtifactRow[] = [];

  if (session.doc_a) {
    rows.push({ type: "docA", title: "Discovery Report", typeLabel: "Document · JSON", data: session.doc_a });
  }
  if (session.doc_b) {
    rows.push({ type: "docB", title: "UX & Flow Doc", typeLabel: "Document · JSON", data: session.doc_b });
  }
  if (session.doc_c) {
    rows.push({ type: "docC", title: "Architecture Doc", typeLabel: "Document · JSON", data: session.doc_c });
  }
  if (session.poc_html) {
    rows.push({ type: "poc", title: "Proof of Concept", typeLabel: "HTML · Interactive", data: session.poc_html });
  }
  if (session.build_prompts) {
    rows.push({
      type: "buildPrompts",
      title: "Build Prompts",
      typeLabel: "Document · JSON",
      data: session.build_prompts,
    });
  }

  const filenamePrefix = session.name ?? session.id.slice(0, 8);

  const handleDownloadAll = () => {
    rows.forEach((row) => downloadArtifact(row.type, row.data, filenamePrefix));
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-zinc-900 bg-[#0e0e0e]">
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <span className="text-sm font-medium text-zinc-200">Artifacts</span>
        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={rows.length === 0}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {downloadIcon}
          Download all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {rows.length === 0 && (
          <p className="px-2 py-3 text-sm text-zinc-600">No artifacts generated yet.</p>
        )}
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div
              key={row.type}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                activeArtifact === row.type
                  ? "border-zinc-600 bg-[#1a1a1a]"
                  : "border-transparent hover:bg-[#151515]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(row.type)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                {docIcon}
                <span className="flex flex-col">
                  <span className="text-sm text-zinc-100">{row.title}</span>
                  <span className="text-xs text-zinc-500">{row.typeLabel}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => downloadArtifact(row.type, row.data, filenamePrefix)}
                aria-label={`Download ${row.title}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-[#242424] hover:text-zinc-100"
              >
                {downloadIcon}
              </button>
            </div>
          ))}
          {session.build_prompts &&
            buildPromptsPdfRows.map((row) => (
              <div
                key={row.docType}
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-[#151515]"
              >
                <span className="flex flex-1 items-center gap-3 text-left">
                  {docIcon}
                  <span className="flex flex-col">
                    <span className="text-sm text-zinc-100">{row.title}</span>
                    <span className="text-xs text-zinc-500">{row.typeLabel}</span>
                  </span>
                </span>
                <a
                  href={buildPromptsPdfUrl(session.id, row.docType)}
                  download
                  aria-label={`Download ${row.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-[#242424] hover:text-zinc-100"
                >
                  {downloadIcon}
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
