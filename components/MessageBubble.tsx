"use client";

import { useSession } from "@/context/SessionContext";
import type { ChatMessage, MessageAction } from "@/lib/types";

const actionLabels: Record<MessageAction["kind"], string> = {
  generate_discovery: "Generate Discovery Report",
  approve_doc_a: "Approve",
  regenerate_doc_a: "Regenerate",
  generate_doc_b: "Generate UX & Flow Doc",
  generate_doc_c: "Generate Architecture Doc",
  generate_poc: "Generate POC",
  open_doc: "Open Document",
};

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const { generateDiscovery, generateDocB, generateDocC, generatePoc, openDoc, isBusy } =
    useSession();

  const runAction = (action: MessageAction) => {
    switch (action.kind) {
      case "generate_discovery":
        return generateDiscovery();
      case "generate_doc_b":
        return generateDocB();
      case "generate_doc_c":
        return generateDocC();
      case "generate_poc":
        return generatePoc();
      case "open_doc":
        return openDoc(action.docType);
      default:
        return undefined;
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#1a1a1a] px-4 py-2.5 text-[15px] leading-relaxed text-zinc-100">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="max-w-[90%] text-[15px] leading-relaxed text-zinc-300">{message.text}</p>
      {message.actions && message.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.actions.map((action, i) => (
            <button
              key={i}
              type="button"
              disabled={isBusy}
              onClick={() => runAction(action)}
              className="rounded-full border border-zinc-700 bg-transparent px-3.5 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLabels[action.kind]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
