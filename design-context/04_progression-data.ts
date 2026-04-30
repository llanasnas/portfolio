export type MilestoneType = "education" | "work" | "freelance" | "project";

export type Skill = {
    name: string;
    icon: string;
    category: string;
    rarity?: "common" | "rare" | "epic";
};

export type Milestone = {
    title: string;
    dateRange: string;
    type: MilestoneType;
    description: string;
    xp: number;
    skillsUnlocked: string[];
};