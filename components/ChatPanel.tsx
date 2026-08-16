"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/context/SessionContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatPanel() {
  const { messages, isBusy } = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0a0a0a]">
      <div className="flex items-center gap-1 px-4 py-3">
        <span className="text-sm font-medium text-zinc-300">Discovery Session</span>
        <span className="text-xs text-zinc-600">⌄</span>
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
