import axios from "axios";
import type {
  BuildPromptsResponse,
  ChatEditResponse,
  DiscoveryResponse,
  DocBResponse,
  DocCResponse,
  DocType,
  Effort,
  IngestResponse,
  ModelRegistry,
  PocResponse,
  Provider,
  SessionState,
  SessionSummary,
} from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;
const GENERATION_TIMEOUT_MS = 900_000; // 15 minutes — matches the backend's ceiling for LLM generation calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
});

export interface IngestPayload {
  text: string;
  files: File[];
}

export async function ingest({ text, files }: IngestPayload): Promise<IngestResponse> {
  const form = new FormData();
  form.append("text", text);
  files.forEach((file) => form.append("files", file));

  const { data } = await apiClient.post<IngestResponse>("/ingest", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export interface ModelSelection {
  model?: string;
  effort?: Effort;
}

export async function generateDiscovery(
  sessionId: string,
  provider: Provider,
  selection?: ModelSelection
): Promise<DiscoveryResponse> {
  const { data } = await apiClient.post<DiscoveryResponse>(
    "/discovery",
    {
      session_id: sessionId,
      provider,
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function approveDocA(
  sessionId: string,
  action: "approve" | "regenerate",
  provider: Provider,
  feedback?: string,
  selection?: ModelSelection
): Promise<DiscoveryResponse> {
  const { data } = await apiClient.post<DiscoveryResponse>(
    "/approve/doc-a",
    {
      session_id: sessionId,
      action,
      provider,
      ...(feedback ? { feedback } : {}),
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function generateDocB(
  sessionId: string,
  provider: Provider,
  feedback?: string,
  selection?: ModelSelection
): Promise<DocBResponse> {
  const { data } = await apiClient.post<DocBResponse>(
    "/generate/doc-b",
    {
      session_id: sessionId,
      provider,
      ...(feedback ? { feedback } : {}),
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function generateDocC(
  sessionId: string,
  provider: Provider,
  feedback?: string,
  selection?: ModelSelection
): Promise<DocCResponse> {
  const { data } = await apiClient.post<DocCResponse>(
    "/generate/doc-c",
    {
      session_id: sessionId,
      provider,
      ...(feedback ? { feedback } : {}),
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function generatePoc(
  sessionId: string,
  provider: Provider,
  feedback?: string,
  selection?: ModelSelection
): Promise<PocResponse> {
  const { data } = await apiClient.post<PocResponse>(
    "/generate/poc",
    {
      session_id: sessionId,
      provider,
      ...(feedback ? { feedback } : {}),
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function generateBuildPrompts(
  sessionId: string,
  provider: Provider,
  feedback?: string,
  selection?: ModelSelection
): Promise<BuildPromptsResponse> {
  const { data } = await apiClient.post<BuildPromptsResponse>(
    "/generate/build-prompts",
    {
      session_id: sessionId,
      provider,
      ...(feedback ? { feedback } : {}),
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export type BuildPromptDocType = "frontend" | "backend" | "deployment" | "sequence";

export function buildPromptsPdfUrl(sessionId: string, docType: BuildPromptDocType): string {
  return `${API_BASE_URL}/session/${sessionId}/build-prompts/${docType}.pdf`;
}

const targetDocParam: Record<DocType, "doc_a" | "doc_b" | "doc_c" | "poc" | "build_prompts"> = {
  docA: "doc_a",
  docB: "doc_b",
  docC: "doc_c",
  poc: "poc",
  buildPrompts: "build_prompts",
};

export async function chatEdit(
  sessionId: string,
  message: string,
  targetDoc: DocType,
  provider: Provider,
  selection?: ModelSelection
): Promise<ChatEditResponse> {
  const { data } = await apiClient.post<ChatEditResponse>(
    `/session/${sessionId}/chat`,
    {
      message,
      target_doc: targetDocParam[targetDoc],
      provider,
      ...(selection?.model ? { model: selection.model } : {}),
      ...(selection?.effort ? { effort: selection.effort } : {}),
    },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return data;
}

export async function getSession(sessionId: string): Promise<SessionState> {
  const { data } = await apiClient.get<SessionState>(`/session/${sessionId}`);
  return data;
}

export async function listSessions(): Promise<SessionSummary[]> {
  const { data } = await apiClient.get<SessionSummary[]>("/sessions");
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/session/${sessionId}`);
}

export async function renameSession(sessionId: string, name: string): Promise<SessionState> {
  const { data } = await apiClient.patch<SessionState>(`/session/${sessionId}`, { name });
  return data;
}

interface ModelsApiResponse {
  models: ModelRegistry;
  effort_levels: Effort[];
}

export async function getModels(): Promise<ModelRegistry> {
  const { data } = await apiClient.get<ModelsApiResponse>("/models");
  return data.models;
}

export default apiClient;
