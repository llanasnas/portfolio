"use client";

import { useMemo } from "react";
import type { ClientProfile } from "@/lib/intelligence/types";
import styles from "./SignalGraph.module.css";

interface Props {
  profile: ClientProfile;
  selectedKey: string | null;
  highlightedKeys: Set<string>;
  onSelect: (key: string | null) => void;
}

interface Layout {
  skillPositions: Map<string, { x: number; y: number; angle: number }>;
  projectPositions: Map<string, { x: number; y: number; angle: number }>;
  width: number;
  height: number;
}

const W = 560;
const H = 560;
const CX = W / 2;
const CY = H / 2;
const R_SKILL = 220;
const R_PROJ = 110;

function computeLayout(profile: ClientProfile): Layout {
  const skillPositions = new Map<string, { x: number; y: number; angle: number }>();
  const n = profile.skills.length;
  profile.skills.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    skillPositions.set(s.name, {
      x: CX + Math.cos(angle) * R_SKILL,
      y: CY + Math.sin(angle) * R_SKILL,
      angle,
    });
  });

  const projectPositions = new Map<string, { x: number; y: number; angle: number }>();
  const m = profile.projects.length;
  profile.projects.forEach((p, i) => {
    const angle = (i / m) * Math.PI * 2 - Math.PI / 2;
    projectPositions.set(p.name, {
      x: CX + Math.cos(angle) * R_PROJ,
      y: CY + Math.sin(angle) * R_PROJ,
      angle,
    });
  });

  return { skillPositions, projectPositions, width: W, height: H };
}

function edgeColor(weight: number): string {
  // cyan → violet interpolation
  const c1 = [90, 215, 255];
  const c2 = [184, 123, 255];
  const t = Math.min(1, Math.max(0, weight));
  const r = Math.round(c1[0]! + (c2[0]! - c1[0]!) * t);
  const g = Math.round(c1[1]! + (c2[1]! - c1[1]!) * t);
  const b = Math.round(c1[2]! + (c2[2]! - c1[2]!) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function skillNodeRadius(confidence: number): number {
  return 7 + confidence * 6;
}

function shortLabel(s: string, max = 14): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export function SignalGraph({ profile, selectedKey, highlightedKeys, onSelect }: Props) {
  const layout = useMemo(() => computeLayout(profile), [profile]);

  const relatedKeys = useMemo(() => {
    if (!selectedKey) return null;
    const out = new Set<string>();
    out.add(selectedKey);
    for (const e of profile.edges) {
      const skillKey = `skill:${e.skill}`;
      const projKey = `project:${e.project}`;
      if (skillKey === selectedKey) out.add(projKey);
      if (projKey === selectedKey) out.add(skillKey);
    }
    return out;
  }, [profile.edges, selectedKey]);

  function isEdgeActive(skill: string, project: string): "active" | "dim" | "default" {
    if (!relatedKeys) {
      const hl = highlightedKeys.size > 0;
      if (!hl) return "default";
      const skillKey = `skill:${skill}`;
      const projKey = `project:${project}`;
      if (highlightedKeys.has(skillKey) || highlightedKeys.has(projKey)) return "active";
      return "dim";
    }
    const skillKey = `skill:${skill}`;
    const projKey = `project:${project}`;
    if (relatedKeys.has(skillKey) && relatedKeys.has(projKey)) return "active";
    return "dim";
  }

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Signal graph: skills connected to projects"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(90,215,255,0.18)" />
            <stop offset="60%" stopColor="rgba(90,215,255,0.04)" />
            <stop offset="100%" stopColor="rgba(90,215,255,0)" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={70} fill="url(#centerGlow)" />
        <circle
          cx={CX}
          cy={CY}
          r={R_PROJ - 30}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 4"
        />
        <text x={CX} y={CY - 6} className={styles.centerLabel + " " + styles.bold}>
          NEURAL CORE
        </text>
        <text x={CX} y={CY + 10} className={styles.centerLabel}>
          v2.6 · scanning
        </text>

        {profile.edges.map((e, i) => {
          const sp = layout.skillPositions.get(e.skill);
          const pp = layout.projectPositions.get(e.project);
          if (!sp || !pp) return null;
          const state = isEdgeActive(e.skill, e.project);
          const mx = (sp.x + pp.x) / 2 + (CY - (sp.y + pp.y) / 2) * 0.05;
          const my = (sp.y + pp.y) / 2 + ((sp.x + pp.x) / 2 - CX) * 0.05;
          return (
            <path
              key={i}
              className={
                styles.edge +
                (state === "active" ? " " + styles.active : "") +
                (state === "dim" ? " " + styles.dim : "")
              }
              d={`M ${sp.x} ${sp.y} Q ${mx} ${my} ${pp.x} ${pp.y}`}
              stroke={edgeColor(e.weight)}
              strokeWidth={0.8 + e.weight * 2.2}
            />
          );
        })}

        {profile.skills.map((s) => {
          const p = layout.skillPositions.get(s.name);
          if (!p) return null;
          const key = `skill:${s.name}`;
          const isSelected = selectedKey === key;
          const isDim =
            relatedKeys != null && !relatedKeys.has(key);
          const label = shortLabel(s.name, 16);
          const labelOffset = p.y > CY ? 22 : -14;
          return (
            <g
              key={key}
              className={styles.nodeGroup + (isSelected ? " " + styles.selected : "")}
              role="button"
              tabIndex={0}
              aria-label={s.name}
              onClick={() => onSelect(isSelected ? null : key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(isSelected ? null : key);
                }
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={skillNodeRadius(s.confidence)}
                className={styles.nodeCircle + (isDim ? " " + styles.dim : "")}
              />
              <text
                x={p.x}
                y={p.y + labelOffset}
                className={styles.nodeLabel}
              >
                {label}
              </text>
            </g>
          );
        })}

        {profile.projects.map((pr) => {
          const p = layout.projectPositions.get(pr.name);
          if (!p) return null;
          const key = `project:${pr.name}`;
          const isSelected = selectedKey === key;
          const isDim = relatedKeys != null && !relatedKeys.has(key);
          const label = shortLabel(pr.name, 12);
          const labelOffset = p.y > CY ? 18 : -12;
          return (
            <g
              key={key}
              className={styles.nodeGroup + (isSelected ? " " + styles.selected : "")}
              role="button"
              tabIndex={0}
              aria-label={pr.name}
              onClick={() => onSelect(isSelected ? null : key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(isSelected ? null : key);
                }
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                className={
                  styles.nodeCircle +
                  " " +
                  styles.project +
                  (isDim ? " " + styles.dim : "")
                }
              />
              <text x={p.x} y={p.y + labelOffset} className={styles.nodeLabel}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.legend} aria-hidden="true">
        <span>
          <span className={styles.legendDotSkill} /> skill
        </span>
        <span>
          <span className={styles.legendDotProj} /> project
        </span>
      </div>

      <div className={styles.listView} role="list">
        <div className={styles.listHeader}>// skills</div>
        {profile.skills.map((s) => {
          const key = `skill:${s.name}`;
          const sel = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              className={styles.listItem + (sel ? " " + styles.selected : "")}
              onClick={() => onSelect(sel ? null : key)}
              role="listitem"
            >
              <span>{s.name}</span>
              <span className={styles.listConf}>{(s.confidence * 100).toFixed(0)}%</span>
            </button>
          );
        })}
        <div className={styles.listHeader}>// projects</div>
        {profile.projects.map((pr) => {
          const key = `project:${pr.name}`;
          const sel = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              className={styles.listItem + (sel ? " " + styles.selected : "")}
              onClick={() => onSelect(sel ? null : key)}
              role="listitem"
            >
              <span>{pr.name}</span>
              <span className={styles.listConf}>&gt;</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
