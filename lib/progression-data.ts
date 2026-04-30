export const progressionData = {
  profile: {
    name: "Gerard Llanas Conesa",
    role: "Full Stack Developer",
  },

  levels: [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 400 },
    { level: 3, xpRequired: 1000 },
    { level: 4, xpRequired: 2000 },
    { level: 5, xpRequired: 3500 },
    { level: 6, xpRequired: 5500 },
  ],

  skills: [
    { name: "HTML", icon: "html5", category: "frontend", rarity: "common" },
    { name: "CSS", icon: "css3", category: "frontend", rarity: "common" },
    { name: "JavaScript", icon: "javascript", category: "frontend", rarity: "common" },
    { name: "TypeScript", icon: "typescript", category: "frontend", rarity: "rare" },

    { name: "React", icon: "react", category: "frontend", rarity: "rare" },
    { name: "Next.js", icon: "nextdotjs", category: "frontend", rarity: "epic" },
    { name: "Vue.js", icon: "vuedotjs", category: "frontend", rarity: "common" },

    { name: "React Native", icon: "react", category: "mobile", rarity: "rare" },

    { name: "Node.js", icon: "nodedotjs", category: "backend", rarity: "rare" },
    { name: "Express", icon: "express", category: "backend", rarity: "rare" },
    { name: "PHP", icon: "php", category: "backend", rarity: "common" },
    { name: "Laravel", icon: "laravel", category: "backend", rarity: "common" },

    { name: "SQL", icon: "mysql", category: "database", rarity: "common" },
    { name: "MongoDB", icon: "mongodb", category: "database", rarity: "rare" },

    { name: "Docker", icon: "docker", category: "devops", rarity: "rare" },
    { name: "AWS", icon: "amazonaws", category: "devops", rarity: "rare" },

    { name: "Tailwind CSS", icon: "tailwindcss", category: "frontend", rarity: "common" },
    { name: "Bootstrap", icon: "bootstrap", category: "frontend", rarity: "common" },
    { name: "shadcn/ui", icon: "shadcnui", category: "frontend", rarity: "epic" },

    { name: "WordPress", icon: "wordpress", category: "cms", rarity: "common" },
    { name: "WooCommerce", icon: "woocommerce", category: "cms", rarity: "common" },

    { name: "Git", icon: "git", category: "tools", rarity: "common" },

    // 🔥 IA / herramientas modernas
    { name: "OpenAI API", icon: "openai", category: "ai", rarity: "epic" },
    { name: "Anthropic API", icon: "anthropic", category: "ai", rarity: "epic" },
    { name: "Ollama", icon: "ollama", category: "ai", rarity: "rare" },

    { name: "ChatGPT", icon: "openai", category: "ai", rarity: "common" },
    { name: "Claude Code", icon: "anthropic", category: "ai", rarity: "rare" },
    { name: "Cursor", icon: "cursor", category: "ai", rarity: "rare" },
    { name: "GitHub Copilot", icon: "githubcopilot", category: "ai", rarity: "common" },

    { name: "AI Integration", icon: "openai", category: "ai", rarity: "epic" },
  ],

  milestones: [
    {
      title: "Higher Degree in Web Development (DAM)",
      dateRange: "2016-2018",
      type: "education",
      impact: "medium",
      description: "Studied software development fundamentals and backend systems",
      xp: 500,
      skillsUnlocked: ["HTML", "CSS", "JavaScript", "SQL", "PHP", "Git"],
    },

    {
      title: "First Work Experience",
      dateRange: "2018-2020",
      type: "work",
      impact: "medium",
      description: "Gained practical experience in software development",
      xp: 800,
      skillsUnlocked: ["JavaScript", "SQL", "PHP", "WordPress", "Vue.js", "AWS", "Laravel"],
    },

    {
      title: "Second Work Experience",
      dateRange: "2020-2025",
      type: "work",
      impact: "high",
      description: "Expanded knowledge in frontend development and modern frameworks",
      xp: 2000,
      skillsUnlocked: ["React", "Node.js", "TypeScript", "React Native", "Docker", "Tailwind CSS", "Bootstrap", "GitHub Copilot"],
    },

    {
      title: "MERN Stack Master",
      dateRange: "2025-2026",
      type: "education",
      impact: "high",
      description: "Advanced full stack development with MongoDB, Express, React, Node",
      xp: 700,
      skillsUnlocked: ["React", "Node.js", "MongoDB", "Express", "Docker", "Cursor"],
    },

    {
      title: "First Freelance Project",
      dateRange: "2025",
      type: "freelance",
      impact: "medium",
      description: "Ecommerce website for a local business",
      xp: 500,
      skillsUnlocked: ["WordPress", "WooCommerce", "PHP", "JavaScript"],
    },

    {
      title: "Second Freelance Project",
      dateRange: "2025",
      type: "freelance",
      impact: "medium",
      description: "Custom web application for a travel agency",
      xp: 700,
      skillsUnlocked: ["React", "Next.js", "MongoDB", "Tailwind CSS"],
    },

    {
      title: "First SaaS Project",
      dateRange: "2026",
      type: "project",
      impact: "high",
      description: "Developed a Software as a Service application",
      xp: 1200,
      skillsUnlocked: ["React", "Node.js", "MongoDB", "Express", "shadcn/ui", "Tailwind CSS", "Cursor", "GitHub Copilot", "Claude Code", "ChatGPT"],
    },

    {
      title: "Recipe Extraction App (AI-powered)",
      dateRange: "2026",
      type: "project",
      impact: "high",
      description: "Next.js app extracting recipes & macros using AI",
      xp: 1300,
      skillsUnlocked: ["React", "Next.js", "shadcn/ui", "Tailwind CSS", "AI Integration", "Ollama", "Anthropic API", "OpenAI API"],
    },
  ],
};