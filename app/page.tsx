"use client";

import { useSession } from "@/context/SessionContext";
import ChatPanel from "@/components/ChatPanel";
import DocViewer from "@/components/DocViewer";
import DocList from "@/components/DocList";

export default function Home() {
  const { activeDoc } = useSession();

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      <DocList />
      <div className="flex min-h-0 flex-1">
        <div className={activeDoc ? "flex w-[38%] min-w-[340px]" : "flex w-full"}>
          <ChatPanel />
        </div>
        {activeDoc && <DocViewer />}
      </div>
    </div>
  );
}
