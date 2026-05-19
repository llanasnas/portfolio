import type { Metadata } from "next";
import { ProjectsSection } from "@/components/home_page/projects";
import { NeuralInterpreter } from "@/components/intelligence/NeuralInterpreter";

export const metadata: Metadata = {
  title: "Projects — Gerard Llanas Conesa",
  description:
    "Selected projects from Gerard Llanas Conesa — SaaS platforms, AI apps, freelance builds and open-source work.",
};

export default function ProjectsPage() {
  return (
    <main style={{ background: "var(--bg-0)", minHeight: "100vh" }}>
      <ProjectsSection />
      <NeuralInterpreter />
    </main>
  );
}
