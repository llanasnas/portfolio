# Interaction Model

## Scroll system

Scroll drives all progression:

scrollProgress (0 → 1) controls:

- XP accumulation
- Level progression
- Milestone unlocking
- Skill unlocking

## Behavior rules

- Profile HUD is always visible (sticky)
- Milestones appear sequentially on scroll
- XP bar animates smoothly
- Level updates when thresholds are reached
- Skills unlock progressively

## Animation rules

- All transitions must be smooth (300–800ms)
- Use easing (no linear animations)
- XP updates must feel continuous, not discrete
