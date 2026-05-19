export type SignalType = "evidence" | "indicator" | "cv";

export interface Signal {
  type: SignalType;
  value: string;
  source: string;
}

export type SkillCategory =
  | "frontend"
  | "backend"
  | "ai-llm"
  | "database"
  | "devops"
  | "mobile"
  | "language"
  | "security"
  | "product";

export interface Skill {
  name: string;
  category: SkillCategory;
  confidence: number;
  signals: Signal[];
  gaps: string[];
}

export interface ProjectEntry {
  name: string;
  blurb: string;
  signals: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface Relation {
  skill: string;
  supported_by: string[];
  confidence: number;
}

export interface TimelineEntry {
  org: string;
  role: string;
  from: string;
  to: string;
  notes: string[];
}

export interface EducationEntry {
  title: string;
  org: string;
  year: number;
}

export interface LanguageEntry {
  name: string;
  level: "native" | "professional" | "basic";
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

export interface ProfileDataset {
  bio: string;
  contact: ContactInfo;
  timeline: TimelineEntry[];
  education: EducationEntry[];
  languages: LanguageEntry[];
  skills: Skill[];
  projects: ProjectEntry[];
  relations: Relation[];
}

export interface ClientSkill {
  name: string;
  category: SkillCategory;
  confidence: number;
}

export interface ClientProject {
  name: string;
}

export interface ClientEdge {
  skill: string;
  project: string;
  weight: number;
}

export interface ClientProfile {
  skills: ClientSkill[];
  projects: ClientProject[];
  edges: ClientEdge[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RetrievedDoc {
  id: string;
  kind: "skill" | "project" | "relation" | "bio";
  label: string;
  text: string;
  score: number;
}

export interface InterpreterApiOk {
  ok: true;
  text: string;
  citations: string[];
  retrieved: { id: string; kind: RetrievedDoc["kind"]; label: string }[];
}

export interface InterpreterApiErr {
  ok: false;
  error:
    | "INVALID_PAYLOAD"
    | "RATE_LIMITED"
    | "PROVIDER_UNAVAILABLE"
    | "MISSING_KEY"
    | "INTERNAL";
  retryAfter?: number;
  fallbackText?: string;
}

export type InterpreterApiResponse = InterpreterApiOk | InterpreterApiErr;
