import type { Metadata } from "next";
import GroupioStory from "@/components/projects/groupio/GroupioStory";

export const metadata: Metadata = {
  title: "Groupio — Collaborative Living System",
  description:
    "Groupio: AI receipt scanning, custom dashboards, rotating tasks and shared finance for modern shared living. An immersive product documentary.",
  openGraph: {
    title: "Groupio — Collaborative Living System",
    description:
      "AI-powered organization for shared living. Receipts, expenses, tasks and dashboards — reimagined.",
    type: "website",
  },
};

export default function GroupioPage() {
  return <GroupioStory />;
}
