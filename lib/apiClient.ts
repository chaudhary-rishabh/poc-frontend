import axios from "axios";
import type {
  DiscoveryResponse,
  DocBResponse,
  DocCResponse,
  IngestResponse,
  PocResponse,
  Provider,
  SessionState,
  SessionSummary,
} from "./types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
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

export async function generateDiscovery(
  sessionId: string,
  provider: Provider
): Promise<DiscoveryResponse> {
  const { data } = await apiClient.post<DiscoveryResponse>("/discovery", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function approveDocA(
  sessionId: string,
  action: "approve" | "regenerate",
  provider: Provider
): Promise<DiscoveryResponse> {
  const { data } = await apiClient.post<DiscoveryResponse>("/approve/doc-a", {
    session_id: sessionId,
    action,
    provider,
  });
  return data;
}

export async function generateDocB(
  sessionId: string,
  provider: Provider
): Promise<DocBResponse> {
  const { data } = await apiClient.post<DocBResponse>("/generate/doc-b", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function generateDocC(
  sessionId: string,
  provider: Provider
): Promise<DocCResponse> {
  const { data } = await apiClient.post<DocCResponse>("/generate/doc-c", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function generatePoc(
  sessionId: string,
  provider: Provider
): Promise<PocResponse> {
  const { data } = await apiClient.post<PocResponse>("/generate/poc", {
    session_id: sessionId,
    provider,
  });
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

export default apiClient;
