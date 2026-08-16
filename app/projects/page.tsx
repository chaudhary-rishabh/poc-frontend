"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listSessions } from "@/lib/apiClient";
import type { DocStatus, SessionSummary } from "@/lib/types";

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

export default function ProjectsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSessions()
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load sessions. Is the backend running?");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="border-b border-zinc-900 px-6 py-4">
        <h1 className="text-lg font-medium text-zinc-100">Projects</h1>
        <p className="text-sm text-zinc-500">All discovery sessions on this instance.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!error && sessions === null && (
          <p className="text-sm text-zinc-500">Loading sessions…</p>
        )}

        {sessions !== null && sessions.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-zinc-400">No sessions yet</p>
            <p className="text-sm text-zinc-600">Start a new discovery session from the home page.</p>
          </div>
        )}

        {sessions !== null && sessions.length > 0 && (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => router.push(`/generation/${session.id}`)}
                className="flex flex-col gap-2 rounded-xl border border-zinc-900 bg-[#111] p-4 text-left transition-colors hover:border-zinc-700 hover:bg-[#151515]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-zinc-100">
                    {session.name ?? "Untitled session"}
                  </span>
                  <span className="text-xs text-zinc-600">{formatDate(session.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill label="Doc A" status={session.doc_a_status ?? "not_generated"} />
                  <StatusPill label="Doc B" status={session.has_doc_b ? "locked" : "not_generated"} />
                  <StatusPill label="Doc C" status={session.has_doc_c ? "locked" : "not_generated"} />
                  <StatusPill label="POC" status={session.has_poc ? "locked" : "not_generated"} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
