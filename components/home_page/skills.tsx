"use client";

import Image from "next/image";
import { skillBySlug, iconUrl } from "@/lib/progression-system";

interface SkillBadgeProps {
  name: string;
  count?: number;
  delay?: number;
}

export function SkillBadge({ name, count = 1, delay = 0 }: SkillBadgeProps) {
  const skill = skillBySlug(name);
  if (!skill) return null;

  return (
    <span
      className={`skill-badge rarity-${skill.rarity}`}
      title={`${skill.name} · ${skill.rarity}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Image
        src={iconUrl(skill.icon)}
        alt=""
        width={11}
        height={11}
        unoptimized
      />
      <span>{skill.name}</span>
      {count > 1 && <span className="skill-badge__x">×{count}</span>}
    </span>
  );
}
