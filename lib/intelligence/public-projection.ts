import type {
  ClientEdge,
  ClientProfile,
  ClientProject,
  ClientSkill,
  ProfileDataset,
} from "./types";

export function toClientProfile(p: ProfileDataset): ClientProfile {
  const skills: ClientSkill[] = p.skills.map((s) => ({
    name: s.name,
    category: s.category,
    confidence: s.confidence,
  }));

  const projects: ClientProject[] = p.projects.map((pr) => ({ name: pr.name }));

  const edges: ClientEdge[] = [];
  for (const rel of p.relations) {
    for (const proj of rel.supported_by) {
      edges.push({ skill: rel.skill, project: proj, weight: rel.confidence });
    }
  }

  return { skills, projects, edges };
}
