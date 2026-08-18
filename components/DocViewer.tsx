"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { docLabel } from "@/lib/types";
import type { DocType } from "@/lib/types";
import ArtifactContent, { pinPocCdnVersions } from "./ArtifactContent";
import RegenerateWithFeedback from "./RegenerateWithFeedback";

const badgeLabel = {
  docA: "Discovery Report · Doc A",
  docB: "UX & Flow Doc · Doc B",
  docC: "Architecture Doc · Doc C",
  poc: "Proof of Concept",
} as const;

export default function DocViewer() {
  const {
    activeDoc,
    docs,
    closeDoc,
    approveDocA,
    generateDocB,
    generateDocC,
    generatePoc,
    clearFeedbackConfirmation,
    isBusy,
  } = useSession();
  const [expanded, setExpanded] = useState(false);

  const entry = activeDoc ? docs[activeDoc] : null;

  useEffect(() => {
    if (!activeDoc || !entry?.justRegeneratedWithFeedback) return;
    const timer = setTimeout(() => clearFeedbackConfirmation(activeDoc), 4000);
    return () => clearTimeout(timer);
  }, [activeDoc, entry?.justRegeneratedWithFeedback, clearFeedbackConfirmation]);

  if (!activeDoc || !entry) return null;
  if (!entry.data) return null;

  const handleDownload = () => {
    const isPoc = activeDoc === "poc";
    const content = isPoc
      ? pinPocCdnVersions(entry.data as string)
      : JSON.stringify(entry.data, null, 2);
    const blob = new Blob([content], { type: isPoc ? "text/html" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDoc}.${isPoc ? "html" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regenerateHandlers: Record<DocType, (feedback?: string) => void> = {
    docA: (feedback) => approveDocA("regenerate", feedback),
    docB: (feedback) => generateDocB(feedback),
    docC: (feedback) => generateDocC(feedback),
    poc: (feedback) => generatePoc(feedback),
  };

  return (
    <div
      className={`flex h-full flex-col border-l border-zinc-900 bg-[#0e0e0e] ${
        expanded ? "fixed inset-0 z-50" : "min-w-0 flex-1"
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">{badgeLabel[activeDoc]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download document"
            title="Download"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
          >
            ⬇
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Toggle fullscreen"
            title="Expand"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
          >
            ⤢
          </button>
          <button
            type="button"
            onClick={closeDoc}
            aria-label="Close document"
            title="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
      </div>

      {entry.staleDueTo && (
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-2">
          <span className="text-xs text-amber-400">
            This may be out of date — {docLabel[entry.staleDueTo]} was updated since this was generated.
          </span>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => regenerateHandlers[activeDoc]()}
            className="shrink-0 rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Regenerate this too
          </button>
        </div>
      )}

      {entry.justRegeneratedWithFeedback && (
        <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2">
          <span className="text-xs text-emerald-400">✓ Regenerated based on your feedback</span>
        </div>
      )}

      {activeDoc === "docA" && entry.status === "draft" && (
        <div className="flex flex-col gap-2 border-b border-zinc-900 bg-[#141414] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Review the draft, then:</span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => approveDocA("approve")}
              className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-40"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => approveDocA("regenerate")}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-[#1e1e1e] disabled:opacity-40"
            >
              Regenerate
            </button>
          </div>
          <RegenerateWithFeedback
            disabled={isBusy}
            onSubmit={(feedback) => approveDocA("regenerate", feedback)}
          />
        </div>
      )}

      {(activeDoc === "docB" || activeDoc === "docC") && entry.status === "locked" && (
        <div className="flex flex-col gap-2 border-b border-zinc-900 bg-[#141414] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Not happy with this?</span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => regenerateHandlers[activeDoc]()}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-[#1e1e1e] disabled:opacity-40"
            >
              Regenerate
            </button>
          </div>
          <RegenerateWithFeedback disabled={isBusy} onSubmit={(feedback) => regenerateHandlers[activeDoc](feedback)} />
        </div>
      )}

      {activeDoc === "poc" && (
        <div className="flex flex-col gap-2 border-b border-zinc-900 bg-[#141414] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Not happy with this layout?</span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => generatePoc()}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-[#1e1e1e] disabled:opacity-40"
            >
              Regenerate POC
            </button>
          </div>
          <RegenerateWithFeedback disabled={isBusy} onSubmit={(feedback) => generatePoc(feedback)} />
        </div>
      )}

      <div className={activeDoc === "poc" ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
        <ArtifactContent type={activeDoc} data={entry.data} />
      </div>
    </div>
  );
}
