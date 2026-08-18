"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import * as api from "@/lib/apiClient";
import type {
  ChatMessage,
  DocEntry,
  DocType,
  MessageRole,
  Provider,
} from "@/lib/types";
import { docLabel, downstreamOf, docTypeFromBackendKey } from "@/lib/types";

interface SessionContextValue {
  sessionId: string | null;
  sessionName: string | null;
  renameSession: (name: string) => Promise<void>;
  provider: Provider;
  setProvider: (provider: Provider) => void;
  messages: ChatMessage[];
  docs: Record<DocType, DocEntry>;
  activeDoc: DocType | null;
  openDoc: (type: DocType) => void;
  closeDoc: () => void;
  clearFeedbackConfirmation: (type: DocType) => void;
  resetSession: () => void;
  isBusy: boolean;
  ingestAndStart: (text: string, files: File[]) => Promise<void>;
  generateDiscovery: () => Promise<void>;
  approveDocA: (action: "approve" | "regenerate", feedback?: string) => Promise<void>;
  generateDocB: (feedback?: string) => Promise<void>;
  generateDocC: (feedback?: string) => Promise<void>;
  generatePoc: (feedback?: string) => Promise<void>;
  chatEdit: (message: string) => Promise<void>;
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
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("deepseek");
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

  const markDownstreamStale = useCallback((type: DocType, explicitTargets?: DocType[]) => {
    setDocs((prev) => {
      const next = { ...prev };
      const targets = explicitTargets ?? downstreamOf[type];
      for (const downstreamType of targets) {
        if (next[downstreamType].status !== "not_generated") {
          next[downstreamType] = { ...next[downstreamType], staleDueTo: type };
        }
      }
      return next;
    });
  }, []);

  const openDoc = useCallback((type: DocType) => setActiveDoc(type), []);
  const closeDoc = useCallback(() => setActiveDoc(null), []);
  const clearFeedbackConfirmation = useCallback((type: DocType) => {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], justRegeneratedWithFeedback: false } }));
  }, []);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setSessionName(null);
    setMessages([]);
    setDocs(initialDocs);
    setActiveDoc(null);
  }, []);

  const ingestAndStart = useCallback(
    async (text: string, files: File[]) => {
      if (!text.trim() && files.length === 0) return;
      setIsBusy(true);
      appendMessage("user", text || `Uploaded ${files.length} file(s)`);
      try {
        const res = await api.ingest({ text, files });
        setSessionId(res.session_id);
        if (res.name) setSessionName(res.name);
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

  const renameSession = useCallback(
    async (name: string) => {
      if (!sessionId) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const previous = sessionName;
      setSessionName(trimmed);
      try {
        await api.renameSession(sessionId, trimmed);
      } catch {
        setSessionName(previous);
        appendMessage("assistant", "Failed to rename the session. Please try again.");
      }
    },
    [sessionId, sessionName, appendMessage]
  );

  const generateDiscovery = useCallback(async () => {
    if (!sessionId) return;
    setIsBusy(true);
    try {
      const res = await api.generateDiscovery(sessionId, provider);
      setDoc("docA", { status: res.doc_a_status, data: res.doc_a });
      setActiveDoc("docA");
      appendMessage("assistant", "Here's the Discovery Report (Doc A). Review it and approve or regenerate.");
    } catch {
      appendMessage("assistant", "Failed to generate the Discovery Report. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }, [sessionId, provider, appendMessage, setDoc]);

  const approveDocA = useCallback(
    async (action: "approve" | "regenerate", feedback?: string) => {
      if (!sessionId) return;
      setIsBusy(true);
      try {
        const res = await api.approveDocA(sessionId, action, provider, feedback);
        setDoc("docA", {
          status: res.doc_a_status,
          data: res.doc_a,
          staleDueTo: undefined,
          justRegeneratedWithFeedback: action === "regenerate" && !!feedback,
        });
        if (action === "approve") {
          appendMessage("assistant", "Doc A is locked in. Ready for the next step?", [
            { kind: "generate_doc_b" },
          ]);
        } else {
          markDownstreamStale("docA");
          appendMessage("assistant", "Regenerated the Discovery Report. Take another look.");
        }
      } catch {
        appendMessage("assistant", "Failed to update Doc A. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, provider, appendMessage, setDoc, markDownstreamStale]
  );

  const generateDocB = useCallback(
    async (feedback?: string) => {
      if (!sessionId) return;
      setIsBusy(true);
      try {
        const res = await api.generateDocB(sessionId, provider, feedback);
        setDoc("docB", {
          status: "locked",
          data: res.doc_b,
          staleDueTo: undefined,
          justRegeneratedWithFeedback: !!feedback,
        });
        markDownstreamStale("docB");
        setActiveDoc("docB");
        appendMessage("assistant", "Here's the UX & Flow Doc (Doc B). Ready to move on?", [
          { kind: "generate_doc_c" },
        ]);
      } catch {
        appendMessage("assistant", "Failed to generate the UX & Flow Doc. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, provider, appendMessage, setDoc, markDownstreamStale]
  );

  const generateDocC = useCallback(
    async (feedback?: string) => {
      if (!sessionId) return;
      setIsBusy(true);
      try {
        const res = await api.generateDocC(sessionId, provider, feedback);
        setDoc("docC", {
          status: "locked",
          data: res.doc_c,
          staleDueTo: undefined,
          justRegeneratedWithFeedback: !!feedback,
        });
        markDownstreamStale("docC");
        setActiveDoc("docC");
        appendMessage("assistant", "Here's the Architecture Doc (Doc C). Ready for the POC?", [
          { kind: "generate_poc" },
        ]);
      } catch {
        appendMessage("assistant", "Failed to generate the Architecture Doc. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, provider, appendMessage, setDoc, markDownstreamStale]
  );

  const generatePoc = useCallback(
    async (feedback?: string) => {
      if (!sessionId) return;
      setIsBusy(true);
      try {
        const res = await api.generatePoc(sessionId, provider, feedback);
        setDoc("poc", {
          status: "locked",
          data: res.html,
          staleDueTo: undefined,
          justRegeneratedWithFeedback: !!feedback,
        });
        setActiveDoc("poc");
        appendMessage("assistant", "Here's your interactive POC.");
      } catch {
        appendMessage("assistant", "Failed to generate the POC. Please try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, provider, appendMessage, setDoc]
  );

  const chatEdit = useCallback(
    async (message: string) => {
      if (!sessionId || !activeDoc) return;
      setIsBusy(true);
      appendMessage("user", message);
      try {
        const res = await api.chatEdit(sessionId, message, activeDoc, provider);
        const docData =
          activeDoc === "docA"
            ? res.doc_a
            : activeDoc === "docB"
              ? res.doc_b
              : activeDoc === "docC"
                ? res.doc_c
                : res.html;

        if (docData) {
          setDoc(activeDoc, {
            data: docData,
            ...(activeDoc === "docA" && res.doc_a_status ? { status: res.doc_a_status } : {}),
            staleDueTo: undefined,
          });
        }

        markDownstreamStale(
          activeDoc,
          res.stale_downstream?.map((key) => docTypeFromBackendKey[key])
        );
        appendMessage("assistant", `Updated ${docLabel[activeDoc]} based on your feedback.`);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 400) {
          const detail =
            typeof err.response.data === "object" && err.response.data && "detail" in err.response.data
              ? String((err.response.data as { detail: unknown }).detail)
              : `${docLabel[activeDoc]} doesn't exist yet — generate it first before requesting changes.`;
          appendMessage("assistant", detail);
        } else {
          appendMessage("assistant", `Failed to update ${docLabel[activeDoc]}. Please try again.`);
        }
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, activeDoc, provider, appendMessage, setDoc, markDownstreamStale]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      sessionId,
      sessionName,
      renameSession,
      provider,
      setProvider,
      messages,
      docs,
      activeDoc,
      openDoc,
      closeDoc,
      clearFeedbackConfirmation,
      resetSession,
      isBusy,
      ingestAndStart,
      generateDiscovery,
      approveDocA,
      generateDocB,
      generateDocC,
      generatePoc,
      chatEdit,
    }),
    [
      sessionId,
      sessionName,
      renameSession,
      provider,
      messages,
      docs,
      activeDoc,
      openDoc,
      closeDoc,
      clearFeedbackConfirmation,
      resetSession,
      isBusy,
      ingestAndStart,
      generateDiscovery,
      approveDocA,
      generateDocB,
      generateDocC,
      generatePoc,
      chatEdit,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
