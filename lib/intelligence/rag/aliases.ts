/**
 * Alias table for query expansion.
 * Each entry: input token (already tokenized/stemmed) → list of additional tokens
 * to inject with a weight of 0.6 during retrieval.
 */
export const ALIASES: Record<string, string[]> = {
  // React / Next.js cluster
  react: ["next", "frontend", "ui", "component", "jsx", "tsx"],
  next: ["nextj", "react", "app", "router", "frontend"],
  nextj: ["next", "react", "frontend"],
  frontend: ["react", "next", "ui", "component"],
  ui: ["frontend", "react", "component"],
  component: ["react", "ui", "frontend"],

  // TypeScript / language
  typescript: ["ts", "language", "type"],
  ts: ["typescript", "type"],
  javascript: ["js", "node", "typescript"],
  js: ["javascript", "node"],

  // AI / LLM cluster
  llm: ["ai", "anthropic", "openai", "claude", "gpt", "ollama", "model", "rag", "prompt"],
  ai: ["llm", "ml", "model", "claude", "gpt", "anthropic", "openai"],
  rag: ["llm", "retrieval", "embedd", "vector", "search"],
  prompt: ["llm", "engineering", "instruct"],
  embedd: ["vector", "rag", "search", "llm"],
  vector: ["embedd", "rag", "store"],
  claude: ["anthropic", "llm", "ai"],
  openai: ["gpt", "llm", "ai"],
  gpt: ["openai", "llm", "ai"],
  anthropic: ["claude", "llm", "ai"],
  ollama: ["local", "llm", "model"],
  mcp: ["agent", "context", "tool", "llm"],
  agent: ["mcp", "llm", "agentic"],

  // Backend
  api: ["backend", "route", "endpoint", "rest", "express"],
  rest: ["api", "backend", "endpoint"],
  backend: ["api", "server", "node", "route"],
  node: ["backend", "javascript", "server"],
  express: ["node", "backend", "api"],
  server: ["backend", "node"],
  socket: ["realtime", "socketio", "websocket"],
  websocket: ["socket", "realtime"],
  realtime: ["socket", "websocket", "live"],

  // Auth / Security
  auth: ["oauth", "login", "session", "security", "user"],
  oauth: ["auth", "login", "google", "token"],
  security: ["auth", "validation", "trust", "input", "secure"],
  validation: ["zod", "input", "trust", "schema"],
  zod: ["validation", "schema"],

  // Database cluster
  database: ["db", "sql", "postgres", "mongo", "supabase", "neon"],
  db: ["database", "sql", "postgres", "mongo"],
  postgres: ["sql", "neon", "database", "db"],
  postgresql: ["postgres", "sql", "neon", "database"],
  neon: ["postgres", "database", "sql"],
  mongo: ["mongodb", "database", "db"],
  mongodb: ["mongo", "database", "db"],
  sql: ["database", "postgres", "mysql"],
  mysql: ["sql", "database"],
  supabase: ["database", "auth", "postgres", "ssr"],

  // Vue / Laravel / PHP
  vue: ["vuej", "frontend"],
  vuej: ["vue", "frontend"],
  laravel: ["php", "backend"],
  php: ["laravel", "wordpress", "backend"],
  wordpress: ["wp", "woocommerce", "php", "plugin"],
  wp: ["wordpress", "woocommerce", "php"],
  woocommerce: ["wordpress", "checkout", "plugin", "wp"],
  plugin: ["wordpress", "woocommerce"],

  // Mobile
  android: ["mobile", "java", "kotlin"],
  mobile: ["android", "ios", "reactnative"],
  reactnative: ["mobile", "react", "native"],
  native: ["reactnative", "mobile"],

  // DevOps
  docker: ["devop", "container", "linux"],
  aws: ["cloud", "devop", "infrastructure"],
  cloud: ["aws", "devop"],
  devop: ["docker", "aws", "cloud", "linux", "ci"],
  linux: ["docker", "devop"],
  ci: ["cd", "devop", "pipeline"],

  // CV / identity
  cv: ["bio", "experience", "background", "resume"],
  resume: ["cv", "bio"],
  experience: ["bio", "career", "year"],
  bio: ["cv", "background", "about", "identity"],
  about: ["bio", "identity", "background"],
  who: ["bio", "identity"],
  identity: ["bio", "who", "about"],

  // Product
  product: ["fullstack", "build", "ship"],
  fullstack: ["product", "frontend", "backend"],
  build: ["ship", "product"],

  // Project names → canonical
  mincelly: ["recipe", "intelligence", "llm"],
  recetarium: ["recipe", "supabase"],
  groupio: ["realtime", "socket", "saas", "pwa"],
  portfolio: ["this", "site", "hud", "simulation"],
  recipe: ["mincelly", "recetarium"],
  pwa: ["groupio", "web"],
};

export function expandTokens(tokens: string[]): { token: string; weight: number }[] {
  const out: { token: string; weight: number }[] = [];
  const seen = new Set<string>();
  for (const t of tokens) {
    if (!seen.has(t)) {
      out.push({ token: t, weight: 1 });
      seen.add(t);
    }
    const exp = ALIASES[t];
    if (!exp) continue;
    for (const a of exp) {
      if (seen.has(a)) continue;
      out.push({ token: a, weight: 0.6 });
      seen.add(a);
    }
  }
  return out;
}
