import type { Level, Skill, Milestone } from "@/types/progression";

export const progressionData: {
    profile: { name: string; role: string };
    levels: Level[];
    skills: Skill[];
    milestones: Milestone[];
} = {
    profile: {
        name: "Gerard Llanas Conesa",
        role: "Full Stack Developer · AI",
    },

    levels: [
        { level: 1, xpRequired: 0, title: "Apprentice" },
        { level: 2, xpRequired: 400, title: "Junior" },
        { level: 3, xpRequired: 1000, title: "Mid Developer" },
        { level: 4, xpRequired: 2000, title: "Full Stack Developer" },
        { level: 5, xpRequired: 3500, title: "Full Stack Engineer" },
        { level: 6, xpRequired: 5500, title: "AI-Integrated Engineer" },
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
            title: "Web Dev Degree",
            role: "Foundations",
            dateRange: "2016 – 2018",
            type: "education",
            description: "Software fundamentals, backend systems and database design.",
            xp: 500,
            skillsUnlocked: ["HTML", "CSS", "JavaScript", "SQL", "PHP", "Git"],
        },

        {
            title: "Telanto",
            role: "Vue · Laravel Developer",
            dateRange: "2018 – 2020",
            type: "work",
            description: "Shipped production features on a Vue + Laravel SaaS deployed on AWS.",
            xp: 800,
            skillsUnlocked: ["JavaScript", "SQL", "PHP", "WordPress", "Vue.js", "AWS", "Laravel"],
        },

        {
            title: "ITnube",
            role: "Full-Stack Engineer",
            dateRange: "2020 – 2025",
            type: "work",
            description: "Five years shipping full-stack web, mobile and real-time systems.",
            xp: 2000,
            skillsUnlocked: ["React", "Node.js", "TypeScript", "React Native", "Docker", "Tailwind CSS", "Bootstrap", "GitHub Copilot"],
        },

        {
            title: "MERN Stack",
            role: "Advanced Training",
            dateRange: "2025 – 2026",
            type: "education",
            description: "Production-grade MongoDB, Express, React and Node integration.",
            xp: 700,
            skillsUnlocked: ["React", "Node.js", "MongoDB", "Express", "Docker", "Cursor"],
        },

        {
            title: "Airgun Store",
            role: "WooCommerce · +18 Plugin",
            dateRange: "2025",
            type: "freelance",
            description: "Custom PHP plugin for age verification at checkout on WooCommerce.",
            xp: 500,
            skillsUnlocked: ["WordPress", "WooCommerce", "PHP", "JavaScript"],
        },

        {
            title: "Travel Agency",
            role: "Custom CMS",
            dateRange: "2025",
            type: "freelance",
            description: "Custom site + admin panel: itineraries, countries and copy without devs.",
            xp: 700,
            skillsUnlocked: ["React", "Next.js", "MongoDB", "Tailwind CSS"],
        },

        {
            title: "Groupio",
            role: "Shared-Homes SaaS",
            dateRange: "2026",
            type: "project",
            description: "End-to-end SaaS to split bills, manage chores and settle balances. <a href='https://groupio.llanasdev.com' target='_blank' rel='noopener noreferrer'>Live demo →</a>",
            xp: 1200,
            skillsUnlocked: ["React", "Node.js", "MongoDB", "Express", "shadcn/ui", "Tailwind CSS", "Cursor", "GitHub Copilot", "Claude Code", "ChatGPT"],
        },

        {
            title: "Recipe AI",
            role: "AI Recipe Pipeline",
            dateRange: "2026",
            type: "project",
            description: "Extracts recipes from text, images and links — auto-calculates macros.",
            xp: 1300,
            skillsUnlocked: ["React", "Next.js", "shadcn/ui", "Tailwind CSS", "AI Integration", "Ollama", "Anthropic API", "OpenAI API"],
        },
    ],
};