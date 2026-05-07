import type { Metadata } from "next";
import AboutContent from "./components/AboutContent";

export const metadata: Metadata = {
  title: "About — Gerard Llanas Conesa",
  description:
    "Full Stack Developer & AI-Integrated Engineer. Learn more about Gerard Llanas Conesa, his background, values, and approach to software development.",
};

export default function AboutPage() {
  return <AboutContent />;
}
