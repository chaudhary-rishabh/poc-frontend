export type Provider = "deepseek" | "anthropic";

export type DocStatus = "not_generated" | "draft" | "locked";

export type DocType = "docA" | "docB" | "docC" | "poc";

export interface DocA {
  goal: string;
  current_process: string;
  pain_points: string[];
  missing_info: string[];
  proposed_process: string;
}

export interface DocBRole {
  name: string;
  description: string;
}

export interface DocBScreen {
  name: string;
  purpose: string;
  key_elements: string[];
}

export interface DocB {
  roles: DocBRole[];
  screens: DocBScreen[];
  flow: string[];
  features: string[];
}

export interface DocCTechStack {
  frontend: string;
  backend: string;
  database: string;
}

export interface DocCSchemaField {
  name: string;
  type: string;
}

export interface DocCSchemaTable {
  table: string;
  fields: DocCSchemaField[];
}

export interface DocCApiRoute {
  method: string;
  path: string;
  purpose: string;
}

export interface DocC {
  tech_stack: DocCTechStack;
  db_schema: DocCSchemaTable[];
  api_routes: DocCApiRoute[];
  folder_structure: string;
}

export interface DocEntry {
  type: DocType;
  label: string;
  status: DocStatus;
  data: DocA | DocB | DocC | string | null;
}

export type MessageRole = "user" | "assistant" | "system";

export type MessageAction =
  | { kind: "generate_discovery" }
  | { kind: "approve_doc_a" }
  | { kind: "regenerate_doc_a" }
  | { kind: "generate_doc_b" }
  | { kind: "generate_doc_c" }
  | { kind: "generate_poc" }
  | { kind: "open_doc"; docType: DocType };

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  actions?: MessageAction[];
  createdAt: string;
}

export interface IngestResponse {
  session_id: string;
  combined_text: string;
}

export interface DiscoveryResponse {
  session_id: string;
  doc_a: DocA;
  doc_a_status: DocStatus;
}

export interface DocBResponse {
  session_id: string;
  doc_b: DocB;
}

export interface DocCResponse {
  session_id: string;
  doc_c: DocC;
}

export interface PocResponse {
  html: string;
}

export interface SessionState {
  id: string;
  name: string | null;
  combined_text: string | null;
  provider: Provider;
  doc_a: DocA | null;
  doc_a_status: DocStatus;
  doc_b: DocB | null;
  doc_c: DocC | null;
  poc_html: string | null;
  created_at: string;
  updated_at: string;
}
