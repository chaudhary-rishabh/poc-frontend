import axios from "axios";
import type {
  DocA,
  DocB,
  DocC,
  IngestResponse,
  PocDoc,
  Provider,
  SessionState,
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
): Promise<DocA> {
  const { data } = await apiClient.post<DocA>("/discovery", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function approveDocA(
  sessionId: string,
  action: "approve" | "regenerate",
  provider: Provider
): Promise<DocA> {
  const { data } = await apiClient.post<DocA>("/approve/doc-a", {
    session_id: sessionId,
    action,
    provider,
  });
  return data;
}

export async function generateDocB(
  sessionId: string,
  provider: Provider
): Promise<DocB> {
  const { data } = await apiClient.post<DocB>("/generate/doc-b", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function generateDocC(
  sessionId: string,
  provider: Provider
): Promise<DocC> {
  const { data } = await apiClient.post<DocC>("/generate/doc-c", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function generatePoc(
  sessionId: string,
  provider: Provider
): Promise<PocDoc> {
  const { data } = await apiClient.post<PocDoc>("/generate/poc", {
    session_id: sessionId,
    provider,
  });
  return data;
}

export async function getSession(sessionId: string): Promise<SessionState> {
  const { data } = await apiClient.get<SessionState>(`/session/${sessionId}`);
  return data;
}

export default apiClient;
