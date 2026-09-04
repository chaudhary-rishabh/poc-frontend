"use client";

import { useSession } from "@/context/SessionContext";
import type { ChatMessage, DocType, MessageAction } from "@/lib/types";

const actionLabels: Record<MessageAction["kind"], string> = {
  generate_discovery: "Generate Discovery Report",
  approve_doc_a: "Approve",
  regenerate_doc_a: "Regenerate",
  generate_doc_b: "Generate UX & Flow Doc",
  generate_doc_c: "Generate Architecture Doc",
  generate_poc: "Generate POC",
  generate_build_prompts: "Generate Build Prompts",
  open_doc: "Open Document",
};

const openLabels: Partial<Record<MessageAction["kind"], string>> = {
  generate_discovery: "Open Discovery Report",
  generate_doc_b: "Open UX & Flow Doc",
  generate_doc_c: "Open Architecture Doc",
  generate_poc: "Open POC",
  generate_build_prompts: "Open Build Prompts",
};

const docTypeForAction: Partial<Record<MessageAction["kind"], DocType>> = {
  generate_discovery: "docA",
  generate_doc_b: "docB",
  generate_doc_c: "docC",
  generate_poc: "poc",
  generate_build_prompts: "buildPrompts",
};

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const {
    docs,
    generateDiscovery,
    generateDocB,
    generateDocC,
    generatePoc,
    generateBuildPrompts,
    openDoc,
    isBusy,
  } = useSession();

  const runAction = (action: MessageAction) => {
    const docType = docTypeForAction[action.kind];
    const alreadyGenerated = docType && docs[docType].status !== "not_generated";

    if (alreadyGenerated) {
      return openDoc(docType);
    }

    switch (action.kind) {
      case "generate_discovery":
        return generateDiscovery();
      case "generate_doc_b":
        return generateDocB();
      case "generate_doc_c":
        return generateDocC();
      case "generate_poc":
        return generatePoc();
      case "generate_build_prompts":
        return generateBuildPrompts();
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
          {message.actions.map((action, i) => {
            const docType = docTypeForAction[action.kind];
            const alreadyGenerated = docType && docs[docType].status !== "not_generated";
            const label = alreadyGenerated
              ? (openLabels[action.kind] ?? actionLabels[action.kind])
              : actionLabels[action.kind];

            return (
              <button
                key={i}
                type="button"
                disabled={isBusy}
                onClick={() => runAction(action)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  alreadyGenerated
                    ? "border-zinc-800 bg-[#151515] text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                    : "border-zinc-700 bg-transparent text-zinc-200 hover:bg-[#1a1a1a]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
