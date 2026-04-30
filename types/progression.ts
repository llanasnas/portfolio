export interface Level {
    level: number;
    xpRequired: number;
    title: string;
}

export interface Skill {
    name: string;
    icon: string;
    category: string;
    rarity: "common" | "rare" | "epic";
}

export interface Milestone {
    title: string;
    dateRange: string;
    type: "education" | "work" | "freelance" | "project";
    description: string;
    xp: number;
    skillsUnlocked: string[];
}

export interface EquippedSkill {
    name: string;
    count: number;
}

export interface LevelResult {
    current: Level;
    next: Level | null;
}

export interface BurstParticle {
    id: number;
    dx: number;
    dy: number;
}
