"use client";

import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import type { DocA, DocB, DocC } from "@/lib/types";
import DocARenderer from "./docs/DocARenderer";
import DocBRenderer from "./docs/DocBRenderer";
import DocCRenderer from "./docs/DocCRenderer";

const badgeLabel = {
  docA: "Discovery Report · Doc A",
  docB: "UX & Flow Doc · Doc B",
  docC: "Architecture Doc · Doc C",
  poc: "Proof of Concept",
} as const;

// Pin unpinned CDN script URLs to known-working major versions. The POC
// template can reference "@babel/standalone" (no version), which resolves to
// whatever unpkg currently serves as latest — babel-standalone 8 dropped
// support for auto-executing plain `<script type="text/babel">` tags the way
// this template expects, leaving the mount point empty. Pinning to major 7
// keeps the classic script-tag transform working.
function pinPocCdnVersions(html: string): string {
  return html
    .replace(
      /https:\/\/unpkg\.com\/@babel\/standalone(?:@[^/"'\s]+)?\/babel(?:\.min)?\.js/g,
      "https://unpkg.com/@babel/standalone@7/babel.min.js"
    )
    .replace(
      /https:\/\/unpkg\.com\/react(?:@[^/"'\s]+)?\/umd\/react\.development\.js/g,
      "https://unpkg.com/react@18/umd/react.development.js"
    )
    .replace(
      /https:\/\/unpkg\.com\/react-dom(?:@[^/"'\s]+)?\/umd\/react-dom\.development\.js/g,
      "https://unpkg.com/react-dom@18/umd/react-dom.development.js"
    );
}

export default function DocViewer() {
  const { activeDoc, docs, closeDoc, approveDocA, isBusy } = useSession();
  const [expanded, setExpanded] = useState(false);

  if (!activeDoc) return null;
  const entry = docs[activeDoc];
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

      {activeDoc === "docA" && entry.status === "draft" && (
        <div className="flex items-center gap-2 border-b border-zinc-900 bg-[#141414] px-4 py-2.5">
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
      )}

      <div className={activeDoc === "poc" ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
        {activeDoc === "poc" ? (
          <iframe
            key={(entry.data as string).length}
            srcDoc={pinPocCdnVersions(entry.data as string)}
            title="POC preview"
            className="block h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          />
        ) : (
          <div className="flex justify-center px-6 py-8">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
              {activeDoc === "docA" && <DocARenderer doc={entry.data as DocA} />}
              {activeDoc === "docB" && <DocBRenderer doc={entry.data as DocB} />}
              {activeDoc === "docC" && <DocCRenderer doc={entry.data as DocC} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
