"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSession, listSessions } from "@/lib/apiClient";
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

const trashIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.87 12.14A2 2 0 0 1 15.15 21H8.85a2 2 0 0 1-1.98-1.86L6 7h12ZM10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ProjectsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async (session: SessionSummary) => {
    setDeleteError(null);
    setDeletingId(session.id);
    const previous = sessions;
    setSessions((prev) => prev?.filter((s) => s.id !== session.id) ?? prev);

    try {
      await deleteSession(session.id);
    } catch {
      setSessions(previous ?? null);
      setDeleteError("Failed to delete the session. The backend may not support this yet.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-500">All discovery sessions on this instance.</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-[#1a1a1a]"
        >
          Home
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {deleteError && <p className="mb-3 text-sm text-red-400">{deleteError}</p>}

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
              <div
                key={session.id}
                className="group flex flex-col gap-2 rounded-xl border border-zinc-900 bg-[#111] p-4 transition-colors hover:border-zinc-700 hover:bg-[#151515]"
              >
                <button
                  type="button"
                  onClick={() => router.push(`/generation/${session.id}`)}
                  className="flex flex-col gap-2 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-zinc-100">
                      {session.name ?? "Untitled session"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600">{formatDate(session.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill label="Doc A" status={session.doc_a_status ?? "not_generated"} />
                    <StatusPill label="Doc B" status={session.has_doc_b ? "locked" : "not_generated"} />
                    <StatusPill label="Doc C" status={session.has_doc_c ? "locked" : "not_generated"} />
                    <StatusPill label="POC" status={session.has_poc ? "locked" : "not_generated"} />
                  </div>
                </button>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
                    disabled={deletingId === session.id}
                    aria-label={`Delete ${session.name ?? "Untitled session"}`}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-600 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 group-hover:opacity-100"
                  >
                    {trashIcon}
                    {deletingId === session.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
