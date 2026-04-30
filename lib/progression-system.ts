import type { LevelResult, Skill } from "@/types/progression";
import { progressionData } from "./progression-data";

export function computeLevel(xp: number): LevelResult {
    const levels = progressionData.levels;
    let current = levels[0];
    let next: (typeof levels)[number] | null = levels[1] ?? null;

    for (let i = 0; i < levels.length; i++) {
        if (xp >= levels[i].xpRequired) {
            current = levels[i];
            next = levels[i + 1] ?? null;
        }
    }

    return { current, next };
}

export function skillBySlug(slug: string): Skill | undefined {
    return progressionData.skills.find(
        (s) => s.name.toLowerCase() === slug.toLowerCase()
    );
}

export function iconUrl(slug: string): string {
    return `/icons/simple-icons/${slug}.svg`;
}

export function milestoneRarity(xp: number): "common" | "rare" | "epic" | "legendary" {
    if (xp <= 600) return "common";
    if (xp <= 900) return "rare";
    if (xp <= 1400) return "epic";
    return "legendary";
}
