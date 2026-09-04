export type Provider = "deepseek" | "anthropic";

export type Effort = "low" | "medium" | "high";

export interface ModelInfo {
  id: string;
  label: string;
  deprecated: boolean;
  supports_effort: boolean;
}

export type ModelRegistry = Record<Provider, ModelInfo[]>;

export type DocStatus = "not_generated" | "draft" | "locked";

export type DocType = "docA" | "docB" | "docC" | "poc" | "buildPrompts";

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

export interface ArchitectureDecision {
  repo_strategy: string;
  service_strategy: string;
  reasoning: string;
}

export interface BuildPrompts {
  architecture_decision: ArchitectureDecision;
  frontend_prompt: string;
  backend_prompt: string;
  deployment_prompt: string;
  sequence_guide: string;
}

export interface DocEntry {
  type: DocType;
  label: string;
  status: DocStatus;
  data: DocA | DocB | DocC | BuildPrompts | string | null;
  staleDueTo?: DocType;
  justRegeneratedWithFeedback?: boolean;
}

// Doc C and POC are both terminal steps that build on Doc C; Build Prompts
// is a sibling terminal step off Doc C too, not sequential to POC.
export const downstreamOf: Record<DocType, DocType[]> = {
  docA: ["docB", "docC", "poc", "buildPrompts"],
  docB: ["docC", "poc", "buildPrompts"],
  docC: ["poc", "buildPrompts"],
  poc: [],
  buildPrompts: [],
};

export const docLabel: Record<DocType, string> = {
  docA: "Doc A",
  docB: "Doc B",
  docC: "Doc C",
  poc: "POC",
  buildPrompts: "Build Prompts",
};

// The backend's chat endpoint uses snake_case doc identifiers
// (doc_a/doc_b/doc_c/poc/build_prompts) distinct from the frontend's DocType.
export type BackendDocKey = "doc_a" | "doc_b" | "doc_c" | "poc" | "build_prompts";

export const docTypeFromBackendKey: Record<BackendDocKey, DocType> = {
  doc_a: "docA",
  doc_b: "docB",
  doc_c: "docC",
  poc: "poc",
  build_prompts: "buildPrompts",
};

export type MessageRole = "user" | "assistant" | "system";

export type MessageAction =
  | { kind: "generate_discovery" }
  | { kind: "approve_doc_a" }
  | { kind: "regenerate_doc_a" }
  | { kind: "generate_doc_b" }
  | { kind: "generate_doc_c" }
  | { kind: "generate_poc" }
  | { kind: "generate_build_prompts" }
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
  name?: string | null;
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

export interface BuildPromptsResponse {
  session_id: string;
  build_prompts: BuildPrompts;
}

export interface ChatEditResponse {
  session_id: string;
  target_doc?: BackendDocKey;
  doc_a?: DocA;
  doc_a_status?: DocStatus;
  doc_b?: DocB;
  doc_c?: DocC;
  html?: string;
  build_prompts?: BuildPrompts;
  stale_downstream?: BackendDocKey[];
}

export interface SessionState {
  id: string;
  name: string | null;
  combined_text: string | null;
  provider: Provider;
  doc_a: DocA | null;
  doc_a_status: DocStatus | null;
  doc_b: DocB | null;
  doc_c: DocC | null;
  poc_html: string | null;
  build_prompts: BuildPrompts | null;
  created_at: string;
  updated_at: string;
}

export interface SessionSummary {
  id: string;
  name: string | null;
  created_at: string;
  doc_a_status: DocStatus | null;
  has_doc_b: boolean;
  has_doc_c: boolean;
  has_poc: boolean;
  has_build_prompts: boolean;
}
