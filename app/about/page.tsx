import type { Metadata } from "next";
import AboutContent from "./components/AboutContent";
import { NeuralInterpreter } from "@/components/intelligence/NeuralInterpreter";

export const metadata: Metadata = {
  title: "About — Gerard Llanas Conesa",
  description:
    "Full Stack AI Engineer & LLM Application Developer based in Barcelona. 7+ years building production AI-native web and mobile applications.",
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <NeuralInterpreter />
    </>
  );
}
