"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/apiClient";
import { docLabel, downstreamOf } from "@/lib/types";
import type { DocStatus, DocType, SessionState } from "@/lib/types";
import ArtifactContent, { pinPocCdnVersions } from "./ArtifactContent";
import ArtifactsPanel from "./ArtifactsPanel";
import RegenerateWithFeedback from "./RegenerateWithFeedback";

const statusLabel: Record<DocStatus, string> = {
  not_generated: "not generated yet",
  draft: "draft",
  locked: "locked",
};

const statusStyle: Record<DocStatus, string> = {
  not_generated: "bg-transparent text-zinc-600 border-zinc-800",
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  locked: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

function StatusPill({ label, status }: { label: string; status: DocStatus }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${statusStyle[status]}`}>
      <span className="font-medium">{label}</span>
      <span className="text-[11px] opacity-80">{statusLabel[status]}</span>
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function GenerationView({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<DocType | null>(null);
  const [pocFullscreen, setPocFullscreen] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [staleDueTo, setStaleDueTo] = useState<Partial<Record<DocType, DocType>>>({});
  const [justRegenerated, setJustRegenerated] = useState<DocType | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  useEffect(() => {
    if (!pocFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPocFullscreen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pocFullscreen]);

  useEffect(() => {
    if (activeArtifact === "poc") setSummaryCollapsed(true);
  }, [activeArtifact]);

  useEffect(() => {
    if (!justRegenerated) return;
    const timer = setTimeout(() => setJustRegenerated(null), 4000);
    return () => clearTimeout(timer);
  }, [justRegenerated]);

  useEffect(() => {
    let cancelled = false;
    api
      .getSession(sessionId)
      .then((data) => {
        if (cancelled) return;
        setSession(data);
        if (data.doc_a) setActiveArtifact("docA");
      })
      .catch(() => {
        if (!cancelled) setError("Session not found, or the backend is unreachable.");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const existsFor = (type: DocType, s: SessionState): boolean => {
    if (type === "docA") return !!s.doc_a;
    if (type === "docB") return !!s.doc_b;
    if (type === "docC") return !!s.doc_c;
    return !!s.poc_html;
  };

  const markDownstreamStale = (type: DocType, s: SessionState) => {
    setStaleDueTo((prev) => {
      const next = { ...prev };
      for (const downstreamType of downstreamOf[type]) {
        if (existsFor(downstreamType, s)) next[downstreamType] = type;
      }
      return next;
    });
  };

  const regenerate = async (type: DocType, feedback?: string) => {
    if (!session) return;
    setIsBusy(true);
    setActionError(null);
    try {
      if (type === "docA") {
        const res = await api.approveDocA(session.id, "regenerate", session.provider, feedback);
        setSession((prev) => (prev ? { ...prev, doc_a: res.doc_a, doc_a_status: res.doc_a_status } : prev));
      } else if (type === "docB") {
        const res = await api.generateDocB(session.id, session.provider, feedback);
        setSession((prev) => (prev ? { ...prev, doc_b: res.doc_b } : prev));
      } else if (type === "docC") {
        const res = await api.generateDocC(session.id, session.provider, feedback);
        setSession((prev) => (prev ? { ...prev, doc_c: res.doc_c } : prev));
      } else {
        const res = await api.generatePoc(session.id, session.provider, feedback);
        setSession((prev) => (prev ? { ...prev, poc_html: res.html } : prev));
      }
      setStaleDueTo((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      if (session) markDownstreamStale(type, session);
      if (feedback) setJustRegenerated(type);
    } catch {
      setActionError("Failed to regenerate. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const startEditingName = () => {
    if (!session) return;
    setNameDraft(session.name ?? "");
    setEditingName(true);
  };

  const commitName = async () => {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (!session || !trimmed || trimmed === session.name) return;
    const previous = session.name;
    setSession((prev) => (prev ? { ...prev, name: trimmed } : prev));
    try {
      await api.renameSession(session.id, trimmed);
    } catch {
      setSession((prev) => (prev ? { ...prev, name: previous } : prev));
      setActionError("Failed to rename the session. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0a0a0a] text-center">
        <p className="text-zinc-300">{error}</p>
        <Link href="/projects" className="text-sm text-zinc-500 underline hover:text-zinc-300">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0a0a]">
        <p className="text-sm text-zinc-500">Loading session…</p>
      </div>
    );
  }

  const activeData =
    activeArtifact === "docA"
      ? session.doc_a
      : activeArtifact === "docB"
        ? session.doc_b
        : activeArtifact === "docC"
          ? session.doc_c
          : activeArtifact === "poc"
            ? session.poc_html
            : null;

  const activeStaleDueTo = activeArtifact ? staleDueTo[activeArtifact] : undefined;

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 px-4 py-3">
        <Link href="/projects" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← Projects
        </Link>
        {!summaryCollapsed && (
          <button
            type="button"
            onClick={() => setSummaryCollapsed(true)}
            className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-[#1a1a1a]"
          >
            Hide session info
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {!summaryCollapsed && (
          <div className="flex w-[32%] min-w-[300px] flex-col gap-5 overflow-y-auto border-r border-zinc-900 px-5 py-5">
            <div>
              {editingName ? (
                <input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void commitName();
                    } else if (e.key === "Escape") {
                      setEditingName(false);
                    }
                  }}
                  placeholder="Untitled session"
                  className="w-full rounded-md border border-zinc-700 bg-[#141414] px-2 py-1 text-base text-zinc-100 outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditingName}
                  title="Click to rename"
                  className="rounded-md px-1.5 py-0.5 text-left text-base font-medium text-zinc-100 hover:bg-[#1a1a1a]"
                >
                  {session.name ?? "Untitled session"}
                </button>
              )}
              <p className="mt-1 px-1.5 text-xs text-zinc-600">{session.id}</p>
            </div>

            <div className="flex flex-col gap-1 text-xs text-zinc-500">
              <span>Created {formatDate(session.created_at)}</span>
              <span>Updated {formatDate(session.updated_at)}</span>
              <span>Provider: {session.provider}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill label="Doc A" status={session.doc_a_status ?? "not_generated"} />
              <StatusPill label="Doc B" status={session.doc_b ? "locked" : "not_generated"} />
              <StatusPill label="Doc C" status={session.doc_c ? "locked" : "not_generated"} />
              <StatusPill label="POC" status={session.poc_html ? "locked" : "not_generated"} />
            </div>

            {session.combined_text && (
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Original Input
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                  {session.combined_text}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {activeArtifact && activeData ? (
            <>
              <div className="flex flex-col gap-2 border-b border-zinc-900 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">
                    {docLabel[activeArtifact]}
                  </span>
                  <div className="flex items-center gap-1">
                    {activeArtifact === "poc" && summaryCollapsed && (
                      <button
                        type="button"
                        onClick={() => setSummaryCollapsed(false)}
                        aria-label="Show session info and original input"
                        title="Show session info"
                        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
                      >
                        <span className="text-[13px] leading-none">☰</span>
                        Session info
                      </button>
                    )}
                    {activeArtifact === "poc" && (
                      <button
                        type="button"
                        onClick={() => setPocFullscreen(true)}
                        aria-label="View POC fullscreen"
                        title="Expand"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
                      >
                        ⤢
                      </button>
                    )}
                  </div>
                </div>

                {activeStaleDueTo && (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
                    <span className="text-xs text-amber-400">
                      This may be out of date — {docLabel[activeStaleDueTo]} was updated since this was generated.
                    </span>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => regenerate(activeArtifact)}
                      className="shrink-0 rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Regenerate this too
                    </button>
                  </div>
                )}

                {justRegenerated === activeArtifact && (
                  <span className="text-xs text-emerald-400">✓ Regenerated based on your feedback</span>
                )}

                {actionError && <span className="text-xs text-red-400">{actionError}</span>}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Not happy with this?</span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => regenerate(activeArtifact)}
                    className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-[#1e1e1e] disabled:opacity-40"
                  >
                    Regenerate
                  </button>
                </div>
                <RegenerateWithFeedback
                  disabled={isBusy}
                  onSubmit={(feedback) => regenerate(activeArtifact, feedback)}
                />
              </div>

              <div className={activeArtifact === "poc" ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
                <ArtifactContent type={activeArtifact} data={activeData} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-600">Select an artifact to preview it here.</p>
            </div>
          )}
        </div>

        <div className="w-[300px] shrink-0">
          <ArtifactsPanel session={session} activeArtifact={activeArtifact} onSelect={setActiveArtifact} />
        </div>
      </div>

      {pocFullscreen && activeArtifact === "poc" && typeof activeData === "string" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between bg-[#0e0e0e] px-4 py-3">
            <span className="text-sm font-medium text-zinc-200">Proof of Concept — Fullscreen</span>
            <button
              type="button"
              onClick={() => setPocFullscreen(false)}
              aria-label="Exit fullscreen"
              title="Close (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1e1e1e] hover:text-zinc-100"
            >
              ✕
            </button>
          </div>
          <iframe
            srcDoc={pinPocCdnVersions(activeData)}
            title="Generated POC preview (fullscreen)"
            className="block h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
