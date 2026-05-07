"use client";
import { useSectionParallax } from "@/hooks/useSectionParallax";

const PROJECTS = [
  {
    id: "groupio",
    title: "Groupio",
    image: "/groupio.png",
    type: "SaaS Platform",
    rarity: "legendary" as const,
    description:
      "Full-stack group management SaaS. Auth, billing, real-time collaboration — built from scratch end to end.",
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "shadcn/ui",
      "Tailwind CSS",
    ],
    url: "https://groupio.llanasdev.com",
    year: "2026",
  },
  {
    id: "recipe-ai",
    title: "Recipe AI (In Development)",
    type: "AI App",
    rarity: "epic" as const,
    description:
      "Next.js app that extracts recipes & macros from any URL or image using Anthropic, OpenAI and local Ollama models.",
    tech: ["Next.js", "Anthropic API", "OpenAI API", "Ollama", "Tailwind CSS"],
    url: "https://github.com/llanasnas/Mincelly",
    year: "2026",
  },
  {
    id: "travel-agency",
    title: "Travel Agency",
    type: "Freelance",
    rarity: "rare" as const,
    description:
      "Custom booking platform for a travel agency — React frontend, MongoDB backend, full admin panel.",
    tech: ["React", "Next.js", "MongoDB", "Tailwind CSS"],
    url: null,
    year: "2025",
  },
  {
    id: "ecommerce",
    title: "Local Business Store",
    type: "Freelance",
    rarity: "common" as const,
    description:
      "End-to-end ecommerce solution for a local business with custom WooCommerce theme and integrations.",
    tech: ["WordPress", "WooCommerce", "PHP"],
    url: "https://zeroshot.es",
    year: "2025",
  },
];

const RARITY_LABELS = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

export function ProjectsSection() {
  const { ref, y, blobStyle } = useSectionParallax(0.2);

  return (
    <section
      id="projects"
      ref={ref as React.RefObject<HTMLElement>}
      className="page-section projects-section"
    >
      {/* Parallax decorative blobs */}
      <div
        aria-hidden="true"
        className="section-blob section-blob--blue"
        style={{
          width: 600,
          height: 600,
          top: "-10%",
          right: "-15%",
          ...blobStyle,
        }}
      />
      <div
        aria-hidden="true"
        className="section-blob section-blob--violet"
        style={{
          width: 500,
          height: 500,
          bottom: "-5%",
          left: "-12%",
          transform: `translateY(${-y * 0.6}px)`,
        }}
      />
      <div
        aria-hidden="true"
        className="section-blob section-blob--cyan"
        style={{
          width: 320,
          height: 320,
          top: "40%",
          left: "50%",
          transform: `translateY(${y * 1.3}px)`,
        }}
      />
      <div className="section-inner">
        <div className="section-eyebrow">
          <span className="eyebrow-line" />
          <span className="eyebrow-text">Side Quests Completed</span>
          <span className="eyebrow-line" />
        </div>
        <h2 className="section-title">Projects</h2>
        <p className="section-sub">Selected work from missions completed</p>

        <div className="projects-grid">
          {PROJECTS.map((p) => (
            <article key={p.id} className={`proj-card proj-card--${p.rarity}`}>
              <div className="proj-card__rarity-bar" aria-hidden="true" />
              <div className="proj-card__head">
                <div className="proj-card__meta">
                  <span className="proj-type-chip">{p.type}</span>
                  <span className="proj-year">{p.year}</span>
                </div>
                <span className={`proj-rarity rarity-${p.rarity}`}>
                  {RARITY_LABELS[p.rarity]}
                </span>
              </div>
              <h3 className="proj-card__title flex items-center gap-2">
                {" "}
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="proj-card__image w-10 h-auto object-cover rounded"
                  />
                )}
                {p.title}
              </h3>

              <p className="proj-card__desc">{p.description}</p>
              <div className="proj-card__tech">
                {p.tech.map((t) => (
                  <span key={t} className="proj-tech-chip">
                    {t}
                  </span>
                ))}
              </div>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-card__link"
                >
                  View Project ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
