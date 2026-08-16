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
  description: string;
  features: string[];
}

export interface DocB {
  roles: DocBRole[];
  screens: DocBScreen[];
  flow: string;
  features: string[];
}

export interface DocCApiRoute {
  method: string;
  path: string;
  description: string;
}

export interface DocC {
  db_schema: string;
  tech_stack: string[];
  api_routes: DocCApiRoute[];
  folder_structure: string;
}

export interface PocDoc {
  html: string;
}

export interface DocEntry {
  type: DocType;
  label: string;
  status: DocStatus;
  data: DocA | DocB | DocC | PocDoc | null;
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

export interface SessionState {
  session_id: string | null;
  combined_text: string | null;
  docA: DocA | null;
  docAStatus: DocStatus;
  docB: DocB | null;
  docBStatus: DocStatus;
  docC: DocC | null;
  docCStatus: DocStatus;
  poc: PocDoc | null;
  pocStatus: DocStatus;
  messages: ChatMessage[];
}
