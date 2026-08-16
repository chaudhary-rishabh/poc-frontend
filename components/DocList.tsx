"use client";

import { useSession } from "@/context/SessionContext";
import type { DocStatus, DocType } from "@/lib/types";

const order: DocType[] = ["docA", "docB", "docC", "poc"];

const shortLabel: Record<DocType, string> = {
  docA: "Doc A",
  docB: "Doc B",
  docC: "Doc C",
  poc: "POC",
};

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

export default function DocList() {
  const { docs, activeDoc, openDoc } = useSession();

  return (
    <div className="flex items-center gap-2 border-b border-zinc-900 px-4 py-2.5">
      {order.map((type) => {
        const entry = docs[type];
        const disabled = entry.status === "not_generated";
        const isActive = activeDoc === type;
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => openDoc(type)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed ${
              isActive ? "border-zinc-600 bg-[#1a1a1a]" : "border-zinc-800 hover:bg-[#151515]"
            }`}
          >
            <span className={disabled ? "text-zinc-600" : "text-zinc-200"}>{shortLabel[type]}</span>
            <span className={`rounded-full border px-2 py-0.5 ${statusStyle[entry.status]}`}>
              {statusLabel[entry.status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
