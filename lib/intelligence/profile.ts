import type { ProfileDataset } from "./types";

export const profile: ProfileDataset = {
  bio: "Gerard Llanas Conesa is a Full Stack AI Engineer and LLM Application Developer with 7+ years of professional experience shipping production web and mobile software. Based in Vilanova i la Geltrú, Barcelona. Currently independent, building AI-native products that turn unstructured data (text, images, PDFs, video transcripts) into reliable product features via LLM pipelines, structured outputs and tool use. Hands-on with modern AI engineering workflows: spec-driven development, agentic coding (Claude Code, OpenAI Codex, OpenCode), prompt engineering, evaluations and Model Context Protocol (MCP) integrations.",

  contact: {
    email: "gerard_llanas@outlook.com",
    phone: "+34 689 233 136",
    location: "Vilanova i la Geltrú, Barcelona, Spain",
  },

  timeline: [
    {
      org: "Independent",
      role: "AI Engineer & Full Stack Developer",
      from: "2025-02",
      to: "present",
      notes: [
        "Designing AI-native full-stack apps integrating LLMs as a core product capability.",
        "LLM pipelines that extract structured data from text, images, documents and YouTube transcripts.",
        "Spec-driven and agentic coding workflows using Claude Code, Codex, OpenCode and MCP.",
        "Reusable skills, agents and prompt frameworks for engineering pipelines.",
        "Completed Master in Full Stack Development (MERN) at Nuclio Digital School in parallel.",
        "Selected projects: Mincelly (Recipe Intelligence App) and Groupio.",
      ],
    },
    {
      org: "ITnube",
      role: "Full Stack Developer",
      from: "2020-06",
      to: "2025-01",
      notes: [
        "Custom B2B web apps using Node.js, Vue.js and PHP.",
        "Real-time features and collaborative tools with Socket.IO.",
        "Cross-platform mobile apps with React Native.",
        "REST APIs integrating SQL Server and MySQL.",
        "Containerised dev/deploy with Docker on Linux.",
        "Maintained legacy WordPress platforms and internal custom tools.",
        "Production incident response in agile cross-functional teams.",
      ],
    },
    {
      org: "Telanto",
      role: "Full Stack Developer",
      from: "2018-01",
      to: "2019-12",
      notes: [
        "Web apps using Vue.js and Laravel.",
        "Cloud infrastructure on AWS.",
        "SQL query optimisation and performance work.",
        "Collaborative Git workflows.",
      ],
    },
  ],

  education: [
    { title: "Master in Full Stack Development (MERN)", org: "Nuclio Digital School", year: 2025 },
    {
      title: "Higher Technician in Multi-platform Application Development",
      org: "La Salle Gràcia",
      year: 2018,
    },
    {
      title: "Technician in Telecommunications Installations",
      org: "Salesians de Sarrià",
      year: 2016,
    },
  ],

  languages: [
    { name: "Spanish", level: "native" },
    { name: "Catalan", level: "native" },
    { name: "English", level: "professional" },
  ],

  skills: [
    {
      name: "React / Next.js",
      category: "frontend",
      confidence: 0.9,
      signals: [
        {
          type: "evidence",
          value: "useReducer state machine + useMemo + useEffect in DebtOptimizer simulation",
          source: "portfolio",
        },
        {
          type: "evidence",
          value: "Next.js App Router architecture with server/client component split",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "AuthContext provider with subscription-based session sync",
          source: "recetarium",
        },
        {
          type: "indicator",
          value: "Interactive simulations and custom scroll-driven HUD on portfolio site",
          source: "portfolio",
        },
      ],
      gaps: [
        "No large-scale frontend system or design-system evidence inspected",
        "No performance profiling artefacts surfaced",
      ],
    },
    {
      name: "TypeScript",
      category: "language",
      confidence: 0.88,
      signals: [
        {
          type: "evidence",
          value: "Strict TypeScript across portfolio, Mincelly and recetarium",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Explicit typing across routes, DB layer and LLM pipeline",
          source: "Mincelly",
        },
        {
          type: "cv",
          value: "TypeScript and Node.js listed as primary languages with 7+ years of delivery",
          source: "CV",
        },
      ],
      gaps: ["No advanced generic-heavy library code inspected"],
    },
    {
      name: "LLM application engineering",
      category: "ai-llm",
      confidence: 0.92,
      signals: [
        {
          type: "evidence",
          value: "Pipeline with input cleaning, provider call, JSON extraction, Zod validation and nutrition enrichment in lib/process-recipe.ts",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Multi-provider abstraction over Anthropic, OpenAI and Ollama in lib/llm/provider.ts",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Unit tests on parsing and normalisation helpers",
          source: "Mincelly",
        },
        {
          type: "cv",
          value: "Prompt engineering, structured outputs, function calling, tool use, agentic workflows, multimodal pipelines",
          source: "CV",
        },
      ],
      gaps: [
        "No formal eval harness or scored benchmark observed",
        "No production traffic / cost telemetry inspected",
      ],
    },
    {
      name: "Backend API engineering",
      category: "backend",
      confidence: 0.87,
      signals: [
        {
          type: "evidence",
          value: "Process, recipes, categories, providers, upload-image and auth routes in app/api/",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Auth-aware routes for recipes, favorites, upload and keep-alive",
          source: "recetarium",
        },
        {
          type: "cv",
          value: "REST APIs against SQL Server and MySQL at ITnube, Express + Node.js stack",
          source: "CV",
        },
        {
          type: "evidence",
          value: "Express backend structured by routes/controllers/services handling users, stores, products, cart, orders, chats, analytics and notifications",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Transactional order workflow with stock mutation, notification dispatch, email sending and delivery creation",
          source: "TFM-verde-backend",
        },

      ],
      gaps: ["No high-RPS load testing or SLO definition surfaced"],
    },
    {
      name: "Input validation and trust-boundary handling",
      category: "security",
      confidence: 0.92,
      signals: [
        {
          type: "evidence",
          value: "Length limits on text and URLs, file size and MIME validation in app/api/process/route.ts",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Zod schema validation of LLM output with explicit thrown errors when ingredients/steps are empty",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "File size and MIME validation in WooCommerce plugin verification class",
          source: "woocommerce-verification",
        },
      ],
      gaps: ["No full threat-model document inspected"],
    },
    {
      name: "Database access layer",
      category: "database",
      confidence: 0.8,
      signals: [
        {
          type: "evidence",
          value: "Direct Neon/Postgres access via parametrised queries with filters in lib/db.ts",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "MongoDB/Mongoose access layer using populate, aggregation pipelines and date-filtered analytics queries",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Server-side Supabase client for authenticated data access",
          source: "recetarium",
        },
        {
          type: "cv",
          value: "Hands-on with MongoDB, MySQL, SQL Server, PostgreSQL and vector stores",
          source: "CV",
        },
      ],
      gaps: ["No query plan / index tuning evidence in the inspected snapshot"],
    },
    {
      name: "Supabase integration",
      category: "database",
      confidence: 0.86,
      signals: [
        {
          type: "evidence",
          value: "Supabase SSR client in lib/supabase-server.ts",
          source: "recetarium",
        },
        {
          type: "evidence",
          value: "Middleware refreshing session and protecting routes via Supabase SSR",
          source: "recetarium",
        },
        {
          type: "evidence",
          value: "Authenticated API routes calling Supabase for recipes and favorites",
          source: "recetarium",
        },
      ],
      gaps: ["No Row Level Security policy authorship inspected"],
    },
    {
      name: "Authentication and OAuth flows",
      category: "security",
      confidence: 0.84,
      signals: [
        {
          type: "evidence",
          value: "Google OAuth with state, token exchange and userinfo in app/api/auth/google/{route,callback}.ts",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Middleware-based route protection with authenticated user resolution",
          source: "recetarium",
        },
        {
          type: "evidence",
          value: "JWT auth with httpOnly cookies, secure/sameSite handling, Google OAuth login and password reset token flow",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Frontend AuthContext wiring login, logout, persisted user session and Google sign-in UX",
          source: "TFM-verde-frontend",
        },
        {
          type: "evidence",
          value: "Admin actions protected by WordPress capabilities and nonces",
          source: "woocommerce-verification",
        },
      ],
      gaps: ["No multi-factor or step-up auth implementation surfaced"],
    },
    {
      name: "WordPress and WooCommerce plugin development",
      category: "backend",
      confidence: 0.9,
      signals: [
        {
          type: "evidence",
          value: "Plugin bootstrap with activation hooks, HPOS compatibility and checkout blocks support",
          source: "woocommerce-verification",
        },
        {
          type: "evidence",
          value: "Non-trivial implementation across core, DNI verification and admin classes",
          source: "woocommerce-verification",
        },
        {
          type: "evidence",
          value: "Frontend, admin, AJAX, metaboxes and protected file serving inside one order flow",
          source: "woocommerce-verification",
        },
      ],
      gaps: ["No multi-plugin or large-codebase WordPress refactor inspected"],
    },
    {
      name: "Interactive UI state modeling",
      category: "frontend",
      confidence: 0.75,
      signals: [
        {
          type: "evidence",
          value: "Reducer modelling actions, phases, selection, reset and completion in DebtOptimizer",
          source: "portfolio",
        },
        {
          type: "evidence",
          value: "Derived data via useMemo across simulation components",
          source: "portfolio",
        },
        {
          type: "indicator",
          value: "Stateful HUD and timeline orchestrator in HomeClient",
          source: "portfolio",
        },
      ],
      gaps: ["Single-module evidence; cross-project breadth not measured"],
    },
    {
      name: "Full-stack product building",
      category: "product",
      confidence: 0.8,
      signals: [
        {
          type: "evidence",
          value: "UI, API, DB, auth, uploads and AI processing wired together",
          source: "Mincelly",
        },
        {
          type: "evidence",
          value: "Full-stack marketplace application combining React frontend, Express API, MongoDB, auth, uploads, analytics, chat and delivery tracking",
          source: "Meraki Marketplace (TFM)",
        },
        {
          type: "evidence",
          value: "UI, auth, Supabase and CRUD flows in one application",
          source: "recetarium",
        },
        {
          type: "evidence",
          value: "Checkout, admin tooling and protected file persistence in one plugin",
          source: "woocommerce-verification",
        },
        {
          type: "cv",
          value: "7+ years shipping production B2B and consumer applications across multiple stacks",
          source: "CV",
        },
      ],
      gaps: ["Per-layer exhaustiveness not measured across every repo"],
    },
    {
      name: "Vue.js and Laravel stack",
      category: "backend",
      confidence: 0.65,
      signals: [
        {
          type: "cv",
          value: "Built and maintained Vue.js + Laravel apps at Telanto (2018-2019)",
          source: "Telanto",
        },
        {
          type: "cv",
          value: "Vue.js components and PHP services for B2B clients at ITnube (2020-2025)",
          source: "ITnube",
        },
      ],
      gaps: ["No public Vue/Laravel repo inspected at depth"],
    },
    {
      name: "React Native and mobile delivery",
      category: "mobile",
      confidence: 0.55,
      signals: [
        {
          type: "cv",
          value: "Cross-platform mobile applications shipped at ITnube",
          source: "ITnube",
        },
        {
          type: "indicator",
          value: "Basic Android multi-module setup with library module",
          source: "SalleLibrary",
        },
      ],
      gaps: ["No recent React Native repository inspected in detail"],
    },
    {
      name: "Real-time apps with Socket.IO",
      category: "backend",
      confidence: 0.78,
      signals: [
        {
          type: "cv",
          value: "Real-time features and collaborative tools with Socket.IO at ITnube",
          source: "ITnube",
        },
        {
          type: "cv",
          value: "Groupio PWA built on Socket.IO real-time architecture",
          source: "Groupio",
        },
        {
          type: "evidence",
          value: "Socket.IO backend with authenticated chat rooms, typing indicators, presence checks, unread counters and seller notifications",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Frontend SocketContext coordinating chat events, unread counts, order updates and delivery tracking subscriptions",
          source: "TFM-verde-frontend",
        },
      ],
      gaps: ["No distributed multi-node socket scaling or Redis adapter setup inspected"],
    },
    {
      name: "MongoDB / Mongoose",
      category: "database",
      confidence: 0.84,
      signals: [
        {
          type: "evidence",
          value: "MongoDB + Mongoose backend with models, populate flows and transactional session handling in order creation",
          source: "Meraki Marketplace (TFM)",
        },
        {
          type: "evidence",
          value: "Aggregation pipelines for store analytics, top-selling products, daily revenue and conversion metrics in services/analyticsService.js",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "ObjectId-aware chat, order and presence logic across controllers and Socket.IO service layer",
          source: "TFM-verde-backend",
        },
      ],
      gaps: ["No sharding, replication or production-scale database operations inspected"],
    },
    {
      name: "E-commerce platform engineering",
      category: "product",
      confidence: 0.88,
      signals: [
        {
          type: "evidence",
          value: "Marketplace-style product spanning stores, products, categories, cart, checkout, orders, reviews and seller administration",
          source: "Meraki Marketplace (TFM)",
        },
        {
          type: "evidence",
          value: "Order creation flow with stock updates, address handling, notifications, emails and delivery generation",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Seller dashboard with product management, store appearance controls, order views and analytics charts",
          source: "TFM-verde-frontend",
        },
      ],
      gaps: ["No payment gateway integration depth inspected in the reviewed snapshot"],
    },
    {
      name: "Analytics dashboards and product metrics",
      category: "backend",
      confidence: 0.83,
      signals: [
        {
          type: "evidence",
          value: "Backend analytics service computing conversion rate, add-to-cart rate, device/browser stats, daily revenue and top products",
          source: "TFM-verde-backend",
        },
        {
          type: "evidence",
          value: "Frontend dashboard visualisation with Recharts for revenue, orders and browser metrics",
          source: "TFM-verde-frontend",
        },
        {
          type: "indicator",
          value: "Joined backend aggregation layer with admin-facing dashboard UX rather than isolated chart components",
          source: "Meraki Marketplace (TFM)",
        },
      ],
      gaps: ["No warehouse/BI pipeline or event-stream analytics infrastructure inspected"],
    },
    {
      name: "Maps and geospatial UX",
      category: "frontend",
      confidence: 0.72,
      signals: [
        {
          type: "evidence",
          value: "Mapbox GL delivery tracking UI with live route rendering, courier marker updates and 3D map setup",
          source: "TFM-verde-frontend",
        },
        {
          type: "evidence",
          value: "Backend geocoding/route integration and delivery simulation flow coordinated with order lifecycle",
          source: "TFM-verde-backend",
        },
        {
          type: "indicator",
          value: "Real-time order tracking experience combining socket events with route visualisation",
          source: "Meraki Marketplace (TFM)",
        },
      ],
      gaps: ["No advanced geospatial indexing or routing optimisation engine inspected"],
    },
    {
      name: "AI dev tooling and agentic workflows",
      category: "ai-llm",
      confidence: 0.78,
      signals: [
        {
          type: "cv",
          value: "Daily use of Claude Code, OpenAI Codex, OpenCode and Cursor for agentic delivery",
          source: "CV",
        },
        {
          type: "cv",
          value: "Custom skills, agents and MCP server integrations for engineering pipelines",
          source: "CV",
        },
        {
          type: "indicator",
          value: "Project AGENTS.md and agentic coding conventions present in portfolio repo",
          source: "portfolio",
        },
      ],
      gaps: ["No published MCP server or agent repo surfaced for inspection"],
    },
    {
      name: "DevOps fundamentals (Docker, AWS, Linux, CI/CD)",
      category: "devops",
      confidence: 0.55,
      signals: [
        {
          type: "cv",
          value: "Containerised development and deployment workflows with Docker on Linux at ITnube",
          source: "ITnube",
        },
        {
          type: "cv",
          value: "AWS cloud infrastructure management at Telanto",
          source: "Telanto",
        },
        {
          type: "cv",
          value: "Git-based CI/CD listed under cloud and DevOps skills",
          source: "CV",
        },
      ],
      gaps: ["No Terraform / IaC artefacts inspected", "No production cluster runbook surfaced"],
    },
    {
      name: "Android engineering",
      category: "mobile",
      confidence: 0.25,
      signals: [
        {
          type: "evidence",
          value: "Basic Android project setup integrating Google Maps, Firebase and Facebook SDK",
          source: "PartyMaps",
        },
        {
          type: "evidence",
          value: "Multi-module Android project with library module",
          source: "SalleLibrary",
        },
      ],
      gaps: [
        "Not enough functional Android application code inspected to classify depth",
        "Older student-era projects, not recent production work",
      ],
    },
  ],

  projects: [
    {
      name: "Mincelly",
      blurb:
        "Recipe Intelligence App — multi-source LLM pipeline (text, images, PDFs, YouTube) extracting structured recipe data with nutrition enrichment.",
      signals: {
        strengths: [
          "LLM pipeline with explicit validation layer (Zod) and explicit error throwing when output is empty",
          "Multi-provider abstraction across Anthropic, OpenAI and Ollama",
          "Direct SQL persistence to Neon with parametrised queries and filters",
          "OAuth (Google) flow with state, token exchange and userinfo handling",
          "Input validation and trust-boundary handling at the route layer",
          "Unit tests on parsing and normalisation helpers",
        ],
        weaknesses: [
          "No production load metrics or throughput targets observed",
          "No async job system or queue for long-running pipelines",
          "Scalability of the architecture cannot be evaluated from the repo alone",
        ],
      },
    },
    {
      name: "recetarium",
      blurb:
        "Supabase-backed recipe app with authenticated CRUD, favorites, image upload and protected dashboard.",
      signals: {
        strengths: [
          "SSR Supabase client and middleware-driven session refresh",
          "Auth-aware route handlers for recipes and favorites",
          "Client AuthContext with session subscription and signOut",
        ],
        weaknesses: [
          "Search performance characteristics not measured under realistic scale",
          "Overall architecture not inspected in full breadth",
        ],
      },
    },
    {
      name: "portfolio",
      blurb:
        "This site. Gamified developer-progression experience with scroll-driven XP, levels and unlockable skills, plus interactive simulations.",
      signals: {
        strengths: [
          "Reducer-driven simulation modules (DebtOptimizer) with non-trivial state, scoring and canvas rendering",
          "Custom HUD, timeline orchestrator and tactical cursor system",
          "Reusable cyberpunk UI primitives (HoloPanel, GlowButton, TerminalLine)",
        ],
        weaknesses: [
          "Frontend performance / profiling artefacts not surfaced",
          "Full architectural review of every route not performed",
        ],
      },
    },
    {
      name: "woocommerce-verification",
      blurb:
        "WordPress / WooCommerce plugin adding DNI/NIE document verification across checkout, admin and order lifecycle.",
      signals: {
        strengths: [
          "Hooks for classic checkout, checkout blocks, order creation, thankyou and admin",
          "Admin tooling with submenu, AJAX search/preload, metaboxes and stats",
          "Protected file persistence with nonce + capability serving",
        ],
        weaknesses: [
          "Maintainability at larger codebase scale not measurable from a single plugin",
          "Performance implications of the checkout blocks integration not measured",
        ],
      },
    },
    {
      name: "Groupio",
      blurb:
        "Real-time group management SaaS PWA with AI-assisted automation flows. Live demo at https://groupio.llanasdev.com.",
      signals: {
        strengths: [
          "Real-time architecture on Socket.IO with multi-user collaboration",
          "AI-assisted automation flows folded into product UX",
          "Built as a PWA with scalability and a clear product vision",
        ],
        weaknesses: [
          "Public repo not inspected at code level in this sweep",
          "Production telemetry not surfaced",
        ],
      },
    },
    {
      name: "Meraki Marketplace (TFM)",
      blurb:
        "Master’s final project — sustainable marketplace/e-commerce platform with React frontend and Node.js/Express backend, including seller dashboards, analytics, real-time chat, delivery tracking and media uploads.",
      signals: {
        strengths: [
          "Full-stack marketplace architecture spanning users, stores, products, cart, checkout, orders, reviews and seller administration",
          "Real-time layer with Socket.IO for chat, unread counters, presence, seller notifications and order/delivery updates",
          "MongoDB/Mongoose backend with aggregate analytics for conversion, revenue, top products, device/browser metrics and dashboard reporting",
          "Google OAuth and JWT authentication with httpOnly cookies, plus password reset flow",
          "Cloudinary + multer media upload pipeline for product and profile images",
          "Mapbox-based delivery tracking UI with live route updates and backend delivery simulation",
          "Admin dashboard with product management, store appearance controls and analytics visualisation via Recharts",
          "Automated tests present in backend with Jest and mongodb-memory-server",
        ],
        weaknesses: [
          "No clear payment-provider integration depth confirmed from the inspected snapshot",
          "No production-scale infrastructure, observability or deployment setup reviewed in depth",
          "Security hardening and formal test coverage breadth were not exhaustively inspected",
        ],
      },
    },
    {
      name: "SalleLibrary",
      blurb: "Android multi-module exploration with a custom buttonedittext library module.",
      signals: {
        strengths: ["Multi-module Android project structure with library module"],
        weaknesses: [
          "Student-era project; minimal functional code surveyed",
        ],
      },
    },
  ],

  relations: [
    { skill: "React / Next.js", supported_by: ["portfolio", "Mincelly", "recetarium"], confidence: 0.9 },
    { skill: "TypeScript", supported_by: ["portfolio", "Mincelly", "recetarium"], confidence: 0.88 },
    { skill: "LLM application engineering", supported_by: ["Mincelly"], confidence: 0.92 },
    { skill: "Backend API engineering", supported_by: ["Mincelly", "recetarium"], confidence: 0.87 },
    {
      skill: "Input validation and trust-boundary handling",
      supported_by: ["Mincelly", "woocommerce-verification"],
      confidence: 0.92,
    },
    { skill: "Database access layer", supported_by: ["Mincelly", "recetarium"], confidence: 0.8 },
    { skill: "Supabase integration", supported_by: ["recetarium"], confidence: 0.86 },
    {
      skill: "Authentication and OAuth flows",
      supported_by: ["Mincelly", "recetarium", "woocommerce-verification"],
      confidence: 0.84,
    },
    {
      skill: "WordPress and WooCommerce plugin development",
      supported_by: ["woocommerce-verification"],
      confidence: 0.9,
    },
    { skill: "Interactive UI state modeling", supported_by: ["portfolio"], confidence: 0.75 },
    {
      skill: "Full-stack product building",
      supported_by: ["Mincelly", "recetarium", "woocommerce-verification", "Groupio"],
      confidence: 0.8,
    },
    { skill: "Real-time apps with Socket.IO", supported_by: ["Groupio"], confidence: 0.6 },
    { skill: "AI dev tooling and agentic workflows", supported_by: ["portfolio"], confidence: 0.78 },
    { skill: "Android engineering", supported_by: ["SalleLibrary"], confidence: 0.25 },
    { skill: "Backend API engineering", supported_by: ["Mincelly", "recetarium", "Meraki Marketplace (TFM)"], confidence: 0.87 },
    { skill: "Database access layer", supported_by: ["Mincelly", "recetarium", "Meraki Marketplace (TFM)"], confidence: 0.8 },
    { skill: "Authentication and OAuth flows", supported_by: ["Mincelly", "recetarium", "woocommerce-verification", "Meraki Marketplace (TFM)"], confidence: 0.84 },
    { skill: "Full-stack product building", supported_by: ["Mincelly", "recetarium", "woocommerce-verification", "Groupio", "Meraki Marketplace (TFM)"], confidence: 0.8 },
    { skill: "Real-time apps with Socket.IO", supported_by: ["Groupio", "Meraki Marketplace (TFM)"], confidence: 0.78 },
    { skill: "MongoDB / Mongoose", supported_by: ["Meraki Marketplace (TFM)"], confidence: 0.84 },
    { skill: "E-commerce platform engineering", supported_by: ["Meraki Marketplace (TFM)"], confidence: 0.88 },
    { skill: "Analytics dashboards and product metrics", supported_by: ["Meraki Marketplace (TFM)"], confidence: 0.83 },
    { skill: "Maps and geospatial UX", supported_by: ["Meraki Marketplace (TFM)"], confidence: 0.72 },
  ],
};
