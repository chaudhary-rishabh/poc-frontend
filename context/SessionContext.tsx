"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/apiClient";
import type {
  ChatMessage,
  DocA,
  DocEntry,
  DocType,
  MessageRole,
  Provider,
} from "@/lib/types";

interface SessionContextValue {
  sessionId: string | null;
  provider: Provider;
  setProvider: (provider: Provider) => void;
  messages: ChatMessage[];
  docs: Record<DocType, DocEntry>;
  activeDoc: DocType | null;
  openDoc: (type: DocType) => void;
  closeDoc: () => void;
  isBusy: boolean;
  ingestAndStart: (text: string, files: File[]) => Promise<void>;
  generateDiscovery: () => Promise<void>;
  approveDocA: (action: "approve" | "regenerate") => Promise<void>;
  generateDocB: () => Promise<void>;
  generateDocC: () => Promise<void>;
  generatePoc: () => Promise<void>;
}

const initialDocs: Record<DocType, DocEntry> = {
  docA: { type: "docA", label: "Discovery Report · Doc A", status: "not_generated", data: null },
  docB: { type: "docB", label: "UX & Flow Doc · Doc B", status: "not_generated", data: null },
  docC: { type: "docC", label: "Architecture Doc · Doc C", status: "not_generated", data: null },
  poc: { type: "poc", label: "POC", status: "not_generated", data: null },
};

const SessionContext = createContext<SessionContextValue | null>(null);

function makeMessage(role: MessageRole, text: string, actions?: ChatMessage["actions"]): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
    actions,
    createdAt: new Date().toISOString(),
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [docs, setDocs] = useState<Record<DocType, DocEntry>>(initialDocs);
  const [activeDoc, setActiveDoc] = useState<DocType | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const appendMessage = useCallback((role: MessageRole, text: string, actions?: ChatMessage["actions"]) => {
    setMessages((prev) => [...prev, makeMessage(role, text, actions)]);
  }, []);

  const setDoc = useCallback((type: DocType, patch: Partial<DocEntry>) => {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  }, []);

  const openDoc = useCallback((type: DocType) => setActiveDoc(type), []);
  const closeDoc = useCallback(() => setActiveDoc(null), []);

  const ingestAndStart = useCallback(
    async (text: string, files: File[]) => {
      if (!text.trim() && files.length === 0) return;
      setIsBusy(true);
      appendMessage("user", text || `Uploaded ${files.length} file(s)`);
      try {
        const res = await api.ingest({ text, files });
        setSessionId(res.session_id);
        appendMessage("assistant", "Got it — I've ingested your input.", [
          { kind: "generate_discovery" },
        ]);
      } catch {
        appendMessage("assistant", "Something went wrong while ingesting your input. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [appendMessage]
  );

  const generateDiscovery = useCallback(async () => {
    if (!sessionId) return;
    setIsBusy(true);
    try {
      const docA = await api.generateDiscovery(sessionId, provider);
      setDoc("docA", { status: "draft", data: docA });
      setActiveDoc("docA");
      appendMessage("assistant", "Here's the Discovery Report (Doc A). Review it and approve or regenerate.");
    } catch {
      appendMessage("assistant", "Failed to generate the Discovery Report. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }, [sessionId, provider, appendMessage, setDoc]);

  const approveDocA = useCallback(
    async (action: "approve" | "regenerate") => {
      if (!sessionId) return;
      setIsBusy(true);
      try {
        const docA: DocA = await api.approveDocA(sessionId, action, provider);
        if (action === "approve") {
          setDoc("docA", { status: "locked", data: docA });
          appendMessage("assistant", "Doc A is locked in. Ready for the next step?", [
            { kind: "generate_doc_b" },
          ]);
        } else {
          setDoc("docA", { status: "draft", data: docA });
          appendMessage("assistant", "Regenerated the Discovery Report. Take another look.");
        }
      } catch {
        appendMessage("assistant", "Failed to update Doc A. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, provider, appendMessage, setDoc]
  );

  const generateDocB = useCallback(async () => {
    if (!sessionId) return;
    setIsBusy(true);
    try {
      const docB = await api.generateDocB(sessionId, provider);
      setDoc("docB", { status: "draft", data: docB });
      setActiveDoc("docB");
      appendMessage("assistant", "Here's the UX & Flow Doc (Doc B). Ready to move on?", [
        { kind: "generate_doc_c" },
      ]);
    } catch {
      appendMessage("assistant", "Failed to generate the UX & Flow Doc. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }, [sessionId, provider, appendMessage, setDoc]);

  const generateDocC = useCallback(async () => {
    if (!sessionId) return;
    setIsBusy(true);
    try {
      const docC = await api.generateDocC(sessionId, provider);
      setDoc("docC", { status: "draft", data: docC });
      setActiveDoc("docC");
      appendMessage("assistant", "Here's the Architecture Doc (Doc C). Ready for the POC?", [
        { kind: "generate_poc" },
      ]);
    } catch {
      appendMessage("assistant", "Failed to generate the Architecture Doc. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }, [sessionId, provider, appendMessage, setDoc]);

  const generatePoc = useCallback(async () => {
    if (!sessionId) return;
    setIsBusy(true);
    try {
      const poc = await api.generatePoc(sessionId, provider);
      setDoc("poc", { status: "locked", data: poc });
      setActiveDoc("poc");
      appendMessage("assistant", "Here's your interactive POC.");
    } catch {
      appendMessage("assistant", "Failed to generate the POC. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }, [sessionId, provider, appendMessage, setDoc]);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessionId,
      provider,
      setProvider,
      messages,
      docs,
      activeDoc,
      openDoc,
      closeDoc,
      isBusy,
      ingestAndStart,
      generateDiscovery,
      approveDocA,
      generateDocB,
      generateDocC,
      generatePoc,
    }),
    [
      sessionId,
      provider,
      messages,
      docs,
      activeDoc,
      openDoc,
      closeDoc,
      isBusy,
      ingestAndStart,
      generateDiscovery,
      approveDocA,
      generateDocB,
      generateDocC,
      generatePoc,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
