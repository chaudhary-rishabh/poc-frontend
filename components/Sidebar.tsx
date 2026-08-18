"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { listSessions } from "@/lib/apiClient";
import type { SessionSummary } from "@/lib/types";

const chevronIcon = (flipped: boolean) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`h-4 w-4 transition-transform ${flipped ? "rotate-180" : ""}`}
  >
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const newProjectIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const projectsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
    <path d="M3 9h18M8 4v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const historyIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
    <path
      d="M3 12a9 9 0 1 0 3-6.7M3 12V6m0 6h6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const { sessionId, sessionName, resetSession } = useSession();
  const [expanded, setExpanded] = useState(true);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  const activeSessionId = pathname === "/" ? sessionId : (params?.id ?? null);

  useEffect(() => {
    let cancelled = false;
    listSessions()
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch(() => {
        // sidebar list is a convenience — fail silently, /projects still works
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, sessionId]);

  const handleNewProject = () => {
    resetSession();
    router.push("/");
  };

  // The in-progress session on "/" may not exist in the last-fetched list yet
  // (it was just created), and a live rename hasn't necessarily been refetched
  // yet either — so for the active row, prefer the name from context.
  const visibleSessions: SessionSummary[] =
    pathname === "/" && sessionId && !sessions.some((s) => s.id === sessionId)
      ? [
          {
            id: sessionId,
            name: sessionName,
            created_at: new Date().toISOString(),
            doc_a_status: null,
            has_doc_b: false,
            has_doc_c: false,
            has_poc: false,
          },
          ...sessions,
        ]
      : sessions;

  return (
    <div
      className={`flex h-full shrink-0 flex-col border-r border-zinc-900 bg-[#0a0a0a] transition-[width] duration-150 ${
        expanded ? "w-[264px]" : "w-[52px]"
      }`}
    >
      <div className={`flex items-center px-3 py-3 ${expanded ? "justify-between" : "justify-center"}`}>
        {expanded && <span className="text-sm font-medium text-zinc-300">AI Discovery</span>}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-[#1a1a1a] hover:text-zinc-200"
        >
          {chevronIcon(!expanded)}
        </button>
      </div>

      <div className="flex flex-col gap-0.5 px-2">
        <button
          type="button"
          onClick={handleNewProject}
          aria-label="New Project"
          title="New Project"
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-200 hover:bg-[#1a1a1a] ${
            expanded ? "" : "justify-center"
          }`}
        >
          {newProjectIcon}
          {expanded && <span>New Project</span>}
        </button>

        <button
          type="button"
          onClick={() => router.push("/projects")}
          aria-label="Projects"
          title="Projects"
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-200 hover:bg-[#1a1a1a] ${
            expanded ? "" : "justify-center"
          }`}
        >
          {projectsIcon}
          {expanded && <span>Projects</span>}
        </button>
      </div>

      {!expanded && (
        <div className="px-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Show past generations"
            title="Show past generations"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
          >
            {historyIcon}
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <span className="px-4 pb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-600">
            Past Generations
          </span>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {visibleSessions.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-zinc-600">No sessions yet</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {visibleSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const displayName = isActive && sessionName ? sessionName : session.name;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => router.push(`/generation/${session.id}`)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        isActive ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"
                      }`}
                    >
                      <span className="w-full truncate text-sm text-zinc-200">
                        {displayName ?? "Untitled session"}
                      </span>
                      <span className="text-xs text-zinc-600">{formatRelativeTime(session.created_at)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
