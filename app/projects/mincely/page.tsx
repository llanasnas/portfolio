import type { Metadata } from "next";
import MincelyStory from "@/components/projects/mincely/MincelyStory";

export const metadata: Metadata = {
  title: "Mincely — Recipe Intelligence Engine",
  description:
    "Mincely converts any recipe — text, .docx, photos, YouTube — into structured data with macros, in seconds. Multi-provider AI (Anthropic, OpenAI, Ollama).",
  openGraph: {
    title: "Mincely — Recipe Intelligence Engine",
    description:
      "AI-powered recipe parser with multi-format import, USDA nutrition, and live editing.",
    type: "website",
  },
};

export default function MincelyPage() {
  return <MincelyStory />;
}
