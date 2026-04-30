<!-- BEGIN:nextjs-agent-rules -->

# Project: Developer Progression Portfolio

## Concept

This is not a traditional portfolio.

It is a gamified interactive experience where the user scrolls to explore the developer's career as a progression system.

The experience is based on:

- XP (experience points)
- Levels
- Skill unlocking
- Timeline progression

## Core UX

- A central "Profile HUD Card" is always visible (sticky)
- As the user scrolls:
  - XP increases
  - Levels increase
  - Skills are unlocked
  - Career milestones appear
  - Repeated skills move to the right in the profile card, and if they are repeated again, they move to the right again, and so on, creating a dynamic skill badge system that visually represents the developer's expertise and experience in each skill.

The scroll acts as a progression mechanic.
All content needs to be responsive and mobile-friendly, ensuring a seamless experience across devices. The design should adapt gracefully to different screen sizes, maintaining readability and usability on both desktop and mobile platforms.

## Visual Style

- Dark mode
- Clean, modern, high-tech
- Inspired by:
  - Game UI systems
  - SaaS dashboards
- Subtle glow, glassmorphism, soft shadows
- Avoid hacker cliché visuals

## Technical Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- GSAP + ScrollTrigger for animations
- Lenis for smooth scrolling

## Core Components

### 1. ProfileHUD

- Name: Gerard Llanas Conesa
- Role: Full Stack Developer
- Level indicator
- XP progress bar
- Skill badges (dynamic)

### 2. XP System

- XP increases based on scroll position
- Level thresholds
- Smooth animated progress bar

### 3. Timeline

- Vertical scroll-based milestones
- Each milestone:
  - title
  - description
  - XP reward
  - skills unlocked

### 4. Skills

- React
- Node.js
- TypeScript
- JavaScript
- PHP
- SQL
- MongoDB
- React Native

## Behavior Rules

- XP must be tied to scroll progress
- Level must update dynamically
- Skills must appear progressively
- Animations must be smooth and minimal (no clutter)

## Goal

Create a premium interactive experience that feels like a product, not a CV.
