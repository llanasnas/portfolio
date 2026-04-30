# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite configured.

## Architecture

### Data Flow

```
scroll position (0..1)
  → mPos (0..8 continuous milestone index)
  → cumulative XP (interpolated between milestones)
  → useAnimatedNumber → animatedXp (smooth)
  → computeLevel(xp) → current level + next level
  → equipped skills (all skills from milestones 0..activeIdx)
  → HUD + Timeline render
```

### Key Files

| File | Role |
|------|------|
| `lib/progression-data.ts` | All static data: 6 levels, 8 milestones, 65 skills |
| `lib/progression-system.ts` | Pure functions: `computeLevel(xp)`, `skillBySlug()`, `iconUrl()` |
| `types/progression.ts` | Shared interfaces: `Level`, `Skill`, `Milestone`, `EquippedSkill` |
| `components/home_page/HomeClient.tsx` | Main orchestrator — all scroll/XP/level state lives here |
| `hooks/useScrollProgress.ts` | Returns scroll 0..1 via rAF |
| `hooks/useAnimatedNumber.ts` | Cubic-out easing, 700ms duration |
| `hooks/useMouseParallax.ts` | Sets `--mx`/`--my` CSS vars; `.blob` elements respond |

### Milestone Progression

8 milestones, constants in `HomeClient.tsx`:
- `INTRO = 0.1` — intro overlay disappears at 10% scroll
- `OUTRO = 0.92` — outro overlay appears at 92% scroll
- Each milestone covers `1/8` of scroll range
- XP is linearly interpolated between milestones as user scrolls through each segment

### Skills System

Skills have rarity: `common | rare | epic`. Same skill can appear in multiple milestones — `EquippedSkill.count` tracks repetitions. The HUD badge shows ×N overlay when count > 1. Icon source: `/public/icons/simple-icons/{slug}.svg` (Simple Icons library).

### Styling

Tailwind CSS v4 (`@tailwindcss/postcss`). All design tokens defined as CSS custom properties in `app/globals.css`:
- `--bg-0..4` — dark backgrounds
- `--fg-1..4` — text
- `--grad-xp` — cyan→blue→indigo (XP bar)
- `--grad-level` — violet→blue (level badge)
- Rarity colors: common (gray), rare (cyan), epic (violet)
- Milestone type colors: education (cyan), work (blue), freelance (violet), project (green)

Path alias `@/*` resolves to project root.
