"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

function SessionLabel() {
  const { sessionId, sessionName, renameSession } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const label = sessionId ? (sessionName ?? "Untitled session") : "Discovery Session";

  const startEditing = () => {
    if (!sessionId) return;
    setDraft(sessionName ?? "");
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== sessionName) {
      void renameSession(trimmed);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        placeholder="Untitled session"
        className="rounded-md border border-zinc-700 bg-[#141414] px-2 py-0.5 text-sm text-zinc-100 outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={!sessionId}
      title={sessionId ? "Click to rename" : undefined}
      className="rounded-md px-1.5 py-0.5 text-sm font-medium text-zinc-300 hover:bg-[#1a1a1a] hover:text-zinc-100 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-zinc-300"
    >
      {label}
    </button>
  );
}

export default function ChatPanel() {
  const { messages, isBusy } = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0a0a0a]">
      <div className="flex items-center gap-1 px-4 py-3">
        <SessionLabel />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg text-zinc-400">Start by describing your business, or upload files</p>
            <p className="max-w-sm text-sm text-zinc-600">
              Paste text, upload documents, or drop screenshots to kick off the discovery process.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-2">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isBusy && <p className="text-sm text-zinc-500">Thinking…</p>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
